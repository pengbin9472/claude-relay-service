'use strict'

const MAX_BREAKPOINTS = 4
const ALIGNMENT_STEP = 4 // message 断点对齐步长，减少跨轮次位移，提高缓存命中率

/**
 * 清除对象树中所有 cache_control 字段
 */
function stripAllCacheControl(body) {
  // system blocks
  if (Array.isArray(body.system)) {
    for (const block of body.system) {
      if (block && block.cache_control) {
        delete block.cache_control
      }
    }
  }

  // tools
  if (Array.isArray(body.tools)) {
    for (const tool of body.tools) {
      if (tool && tool.cache_control) {
        delete tool.cache_control
      }
    }
  }

  // messages
  if (Array.isArray(body.messages)) {
    for (const msg of body.messages) {
      if (Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if (block && block.cache_control) {
            delete block.cache_control
          }
        }
      }
    }
  }
}

/**
 * 收集 messages 中可以注入 cache_control 的候选位置
 * 只选取 content 为 array 且包含 object block 的 message
 * 返回 [{ message, blockIndex }] 数组
 */
function collectEligibleMessages(messages) {
  const eligible = []
  if (!Array.isArray(messages)) {
    return eligible
  }

  for (const msg of messages) {
    if (!Array.isArray(msg.content) || msg.content.length === 0) {
      continue
    }
    // 找到最后一个 object block 的索引
    let lastBlockIdx = -1
    for (let i = msg.content.length - 1; i >= 0; i--) {
      if (msg.content[i] && typeof msg.content[i] === 'object') {
        lastBlockIdx = i
        break
      }
    }
    if (lastBlockIdx >= 0) {
      eligible.push({ message: msg, blockIndex: lastBlockIdx })
    }
  }

  return eligible
}

/**
 * 从 eligible 列表中按均匀分布选取 count 个位置
 * 始终包含最后一个位置
 *
 * 对齐策略（提高跨轮次缓存命中率）：
 * - 最后一个 slot 始终放在末尾（100% 位置）
 * - 非末尾 slot 的索引对齐到 ALIGNMENT_STEP 的倍数
 *   使得连续多轮对话中断点位置保持稳定
 * - messages 数量 < ALIGNMENT_STEP * 2 时不对齐，避免过早截断
 */
function selectPositions(eligible, count) {
  if (eligible.length === 0 || count <= 0) {
    return []
  }
  if (count >= eligible.length) {
    return eligible.slice()
  }

  const total = eligible.length
  const shouldAlign = total >= ALIGNMENT_STEP * 2

  const indices = []

  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1
    // 原始均匀分布位置
    const rawIdx = Math.round((total * (i + 1)) / count) - 1

    if (isLast || !shouldAlign) {
      // 最后一个 slot 始终在末尾；消息太少时不对齐
      indices.push(rawIdx)
    } else {
      // 非末尾 slot：向下对齐到 step 的倍数
      const aligned = Math.floor(rawIdx / ALIGNMENT_STEP) * ALIGNMENT_STEP
      indices.push(Math.max(0, aligned))
    }
  }

  // 去重 + 保证单调递增
  const seen = new Set()
  const positions = []
  for (const idx of indices) {
    if (!seen.has(idx)) {
      seen.add(idx)
      positions.push(eligible[idx])
    }
  }

  return positions
}

/**
 * 在请求体中自动注入 prompt caching 断点（最多 4 个）
 *
 * 优先级：
 *   Slot 1: system 最后一个 block
 *   Slot 2: tools 最后一个 tool
 *   Slot 3-4: messages 中均匀分布的位置
 *
 * 如果某个区域不存在，slot 让给 messages
 */
function injectPromptCaching(body) {
  if (!body || typeof body !== 'object') {
    return body
  }

  // 1. 将 string 格式的 system 转换为 array 格式
  if (typeof body.system === 'string') {
    body.system = [{ type: 'text', text: body.system }]
  }

  // 2. 清除所有现有 cache_control
  stripAllCacheControl(body)

  // 3. 计算各区域可用性并分配 slot
  let slotsRemaining = MAX_BREAKPOINTS

  const hasSystem = Array.isArray(body.system) && body.system.length > 0
  const hasTools = Array.isArray(body.tools) && body.tools.length > 0

  // Slot 1: system 最后一个 block
  if (hasSystem) {
    const lastBlock = body.system[body.system.length - 1]
    if (lastBlock && typeof lastBlock === 'object') {
      lastBlock.cache_control = { type: 'ephemeral' }
      slotsRemaining--
    }
  }

  // Slot 2: tools 最后一个 tool
  if (hasTools) {
    const lastTool = body.tools[body.tools.length - 1]
    if (lastTool && typeof lastTool === 'object') {
      lastTool.cache_control = { type: 'ephemeral' }
      slotsRemaining--
    }
  }

  // Slot 3-4 (或更多如果 system/tools 不存在): messages
  if (slotsRemaining > 0) {
    const eligible = collectEligibleMessages(body.messages)
    const selected = selectPositions(eligible, slotsRemaining)
    for (const pos of selected) {
      pos.message.content[pos.blockIndex].cache_control = { type: 'ephemeral' }
    }
  }

  return body
}

module.exports = { injectPromptCaching }
