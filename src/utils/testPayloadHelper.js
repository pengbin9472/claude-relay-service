const crypto = require('crypto')

/**
 * 生成随机十六进制字符串
 * @param {number} bytes - 字节数
 * @returns {string} 十六进制字符串
 */
function randomHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex')
}

/**
 * 生成 Claude Code 风格的会话字符串
 * @returns {string} 会话字符串，格式: user_{64位hex}_account__session_{uuid}
 */
function generateSessionString() {
  const hex64 = randomHex(32) // 32 bytes => 64 hex characters
  const uuid = crypto.randomUUID()
  return `user_${hex64}_account__session_${uuid}`
}

/**
 * 生成 Claude 测试请求体
 * @param {string} model - 模型名称
 * @param {object} options - 可选配置
 * @param {boolean} options.stream - 是否流式（默认false）
 * @param {string} options.prompt - 自定义提示词（默认 'hi'）
 * @param {number} options.maxTokens - 最大输出 token（默认 1000）
 * @returns {object} 测试请求体
 */
function createClaudeTestPayload(model = 'claude-sonnet-4-5-20250929', options = {}) {
  const { stream, prompt = 'hi', maxTokens = 1000 } = options
  const payload = {
    model,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
            cache_control: {
              type: 'ephemeral'
            }
          }
        ]
      }
    ],
    system: [
      {
        type: 'text',
        text: "You are Claude Code, Anthropic's official CLI for Claude.",
        cache_control: {
          type: 'ephemeral'
        }
      }
    ],
    metadata: {
      user_id: generateSessionString()
    },
    max_tokens: maxTokens,
    temperature: 1
  }

  if (stream) {
    payload.stream = true
  }

  return payload
}

/**
 * 发送流式测试请求并处理SSE响应
 * @param {object} options - 配置选项
 * @param {string} options.apiUrl - API URL
 * @param {string} options.authorization - Authorization header值
 * @param {object} options.responseStream - Express响应流
 * @param {object} [options.payload] - 请求体（默认使用createClaudeTestPayload）
 * @param {object} [options.proxyAgent] - 代理agent
 * @param {number} [options.timeout] - 超时时间（默认30000）
 * @param {object} [options.extraHeaders] - 额外的请求头
 * @returns {Promise<void>}
 */
async function sendStreamTestRequest(options) {
  const axios = require('axios')
  const logger = require('./logger')

  const {
    apiUrl,
    authorization,
    responseStream,
    payload,
    model = 'claude-sonnet-4-5-20250929',
    proxyAgent = null,
    timeout = 30000,
    extraHeaders = {}
  } = options

  // 如果没有传入 payload，则使用 model 参数生成
  const requestPayload = payload || createClaudeTestPayload(model, { stream: true })

  const sendSSE = (type, data = {}) => {
    if (!responseStream.destroyed && !responseStream.writableEnded) {
      try {
        responseStream.write(`data: ${JSON.stringify({ type, ...data })}\n\n`)
      } catch {
        // ignore
      }
    }
  }

  const endTest = (success, errorMsg = null, responseModelName = null) => {
    if (!responseStream.destroyed && !responseStream.writableEnded) {
      try {
        const endPayload = { type: 'test_complete', success }
        if (errorMsg) {
          endPayload.error = errorMsg
        }
        if (responseModelName) {
          endPayload.model = responseModelName
        }
        responseStream.write(`data: ${JSON.stringify(endPayload)}\n\n`)
        responseStream.end()
      } catch {
        // ignore
      }
    }
  }

  // 设置响应头
  if (!responseStream.headersSent) {
    responseStream.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    })
  }

  sendSSE('test_start', { message: 'Test started' })

  const requestConfig = {
    method: 'POST',
    url: apiUrl,
    data: requestPayload,
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'User-Agent': 'claude-cli/2.0.52 (external, cli)',
      authorization,
      ...extraHeaders
    },
    timeout,
    responseType: 'stream',
    validateStatus: () => true
  }

  if (proxyAgent) {
    requestConfig.httpAgent = proxyAgent
    requestConfig.httpsAgent = proxyAgent
    requestConfig.proxy = false
  }

  try {
    const response = await axios(requestConfig)
    logger.debug(`🌊 Test response status: ${response.status}`)

    // 处理非200响应
    if (response.status !== 200) {
      return new Promise((resolve) => {
        const chunks = []
        response.data.on('data', (chunk) => chunks.push(chunk))
        response.data.on('end', () => {
          const errorData = Buffer.concat(chunks).toString()
          let errorMsg = `API Error: ${response.status}`
          try {
            const json = JSON.parse(errorData)
            errorMsg = json.message || json.error?.message || json.error || errorMsg
          } catch {
            if (errorData.length < 200) {
              errorMsg = errorData || errorMsg
            }
          }
          endTest(false, errorMsg)
          resolve()
        })
        response.data.on('error', (err) => {
          endTest(false, err.message)
          resolve()
        })
      })
    }

    // 处理成功的流式响应
    return new Promise((resolve) => {
      let buffer = ''
      let responseModel = null

      response.data.on('data', (chunk) => {
        buffer += chunk.toString()
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data:')) {
            continue
          }
          const jsonStr = line.substring(5).trim()
          if (!jsonStr || jsonStr === '[DONE]') {
            continue
          }

          // 打印原始 SSE 数据
          logger.info(`🔍 [Test] Raw SSE data: ${jsonStr.substring(0, 500)}`)

          try {
            const data = JSON.parse(jsonStr)

            // 打印解析后的事件类型
            logger.info(`🔍 [Test] Event type: ${data.type}`)

            // 捕获 message_start 中的模型信息
            if (data.type === 'message_start') {
              logger.info(`🔍 [Test] message_start full data: ${JSON.stringify(data)}`)
              if (data.message?.model) {
                responseModel = data.message.model
                logger.info(`📡 [Test] Response model: ${responseModel}`)
                sendSSE('model_info', { model: responseModel })
              } else {
                logger.warn(`⚠️ [Test] message_start has no model field`)
              }
            }

            if (data.type === 'content_block_delta' && data.delta?.text) {
              sendSSE('content', { text: data.delta.text })
            }
            if (data.type === 'message_stop') {
              sendSSE('message_stop', { model: responseModel })
            }
            if (data.type === 'error' || data.error) {
              const errMsg = data.error?.message || data.message || data.error || 'Unknown error'
              sendSSE('error', { error: errMsg })
            }
          } catch {
            // ignore parse errors
          }
        }
      })

      response.data.on('end', () => {
        logger.info(`🔍 [Test] Stream ended, responseModel: ${responseModel}`)
        if (!responseStream.destroyed && !responseStream.writableEnded) {
          endTest(true, null, responseModel)
        }
        resolve()
      })

      response.data.on('error', (err) => {
        endTest(false, err.message)
        resolve()
      })
    })
  } catch (error) {
    logger.error('❌ Stream test request failed:', error.message)
    endTest(false, error.message)
  }
}

/**
 * 生成 Gemini 测试请求体
 * @param {string} model - 模型名称
 * @param {object} options - 可选配置
 * @param {string} options.prompt - 自定义提示词（默认 'hi'）
 * @param {number} options.maxTokens - 最大输出 token（默认 100）
 * @returns {object} 测试请求体
 */
function createGeminiTestPayload(_model = 'gemini-2.5-pro', options = {}) {
  const { prompt = 'hi', maxTokens = 100 } = options
  return {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 1
    }
  }
}

/**
 * 生成 OpenAI Responses 测试请求体
 * @param {string} model - 模型名称
 * @param {object} options - 可选配置
 * @param {string} options.prompt - 自定义提示词（默认 'hi'）
 * @param {number} options.maxTokens - 最大输出 token（默认 100）
 * @returns {object} 测试请求体
 */
function createOpenAITestPayload(model = 'gpt-5', options = {}) {
  const { prompt = 'hi', maxTokens = 100 } = options
  return {
    model,
    input: [
      {
        role: 'user',
        content: prompt
      }
    ],
    max_output_tokens: maxTokens,
    stream: true
  }
}

module.exports = {
  randomHex,
  generateSessionString,
  createClaudeTestPayload,
  createGeminiTestPayload,
  createOpenAITestPayload,
  sendStreamTestRequest
}
