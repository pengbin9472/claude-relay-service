'use strict'

const { injectPromptCaching } = require('../src/utils/promptCacheInjector')

/**
 * 统计 body 中所有 cache_control 断点数量
 */
function countBreakpoints(body) {
  let count = 0
  if (Array.isArray(body.system)) {
    for (const block of body.system) {
      if (block?.cache_control) count++
    }
  }
  if (Array.isArray(body.tools)) {
    for (const tool of body.tools) {
      if (tool?.cache_control) count++
    }
  }
  if (Array.isArray(body.messages)) {
    for (const msg of body.messages) {
      if (Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if (block?.cache_control) count++
        }
      }
    }
  }
  return count
}

describe('promptCacheInjector', () => {
  test('完整注入：system + tools + messages → 4 个断点', () => {
    const body = {
      system: [
        { type: 'text', text: 'You are a helpful assistant.' },
        { type: 'text', text: 'Be concise.' }
      ],
      tools: [
        { name: 'tool1', description: 'desc1', input_schema: {} },
        { name: 'tool2', description: 'desc2', input_schema: {} }
      ],
      messages: [
        { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
        { role: 'assistant', content: [{ type: 'text', text: 'Hi' }] },
        { role: 'user', content: [{ type: 'text', text: 'How are you?' }] },
        { role: 'assistant', content: [{ type: 'text', text: 'Good' }] },
        { role: 'user', content: [{ type: 'text', text: 'Great' }] }
      ]
    }

    injectPromptCaching(body)

    expect(countBreakpoints(body)).toBe(4)
    // system 最后一个 block
    expect(body.system[1].cache_control).toEqual({ type: 'ephemeral' })
    expect(body.system[0].cache_control).toBeUndefined()
    // tools 最后一个
    expect(body.tools[1].cache_control).toEqual({ type: 'ephemeral' })
    expect(body.tools[0].cache_control).toBeUndefined()
  })

  test('仅 system → 1 个断点在最后 system block', () => {
    const body = {
      system: [
        { type: 'text', text: 'System prompt 1' },
        { type: 'text', text: 'System prompt 2' }
      ]
    }

    injectPromptCaching(body)

    expect(countBreakpoints(body)).toBe(1)
    expect(body.system[1].cache_control).toEqual({ type: 'ephemeral' })
  })

  test('仅 messages (少量) → 对齐后去重可能少于 4 个断点', () => {
    const body = {
      messages: [
        { role: 'user', content: [{ type: 'text', text: 'msg1' }] },
        { role: 'assistant', content: [{ type: 'text', text: 'msg2' }] },
        { role: 'user', content: [{ type: 'text', text: 'msg3' }] },
        { role: 'assistant', content: [{ type: 'text', text: 'msg4' }] },
        { role: 'user', content: [{ type: 'text', text: 'msg5' }] },
        { role: 'assistant', content: [{ type: 'text', text: 'msg6' }] },
        { role: 'user', content: [{ type: 'text', text: 'msg7' }] },
        { role: 'assistant', content: [{ type: 'text', text: 'msg8' }] }
      ]
    }

    injectPromptCaching(body)

    // 8 条 messages, step=4 对齐：rawIdx 1,3 都对齐到 0，去重后 3 个断点
    expect(countBreakpoints(body)).toBeLessThanOrEqual(4)
    expect(countBreakpoints(body)).toBeGreaterThanOrEqual(3)
    // 最后一条一定有
    expect(body.messages[7].content[0].cache_control).toEqual({ type: 'ephemeral' })
  })

  test('仅 messages (大量) → 对齐后 4 个断点且位置稳定', () => {
    const body = {
      messages: Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: [{ type: 'text', text: `msg${i + 1}` }]
      }))
    }

    injectPromptCaching(body)

    expect(countBreakpoints(body)).toBe(4)
    // 最后一条一定有
    expect(body.messages[19].content[0].cache_control).toEqual({ type: 'ephemeral' })

    // 验证非末尾断点对齐到 step=4 的倍数
    const breakpointIndices = []
    body.messages.forEach((msg, i) => {
      if (Array.isArray(msg.content) && msg.content[0]?.cache_control) {
        breakpointIndices.push(i)
      }
    })
    // 非末尾的断点应该对齐到 4 的倍数
    breakpointIndices.slice(0, -1).forEach((idx) => {
      expect(idx % 4).toBe(0)
    })
  })

  test('string system → 转换为 array 后注入', () => {
    const body = {
      system: 'You are helpful.',
      messages: [{ role: 'user', content: [{ type: 'text', text: 'Hello' }] }]
    }

    injectPromptCaching(body)

    expect(Array.isArray(body.system)).toBe(true)
    expect(body.system[0].type).toBe('text')
    expect(body.system[0].text).toBe('You are helpful.')
    expect(body.system[0].cache_control).toEqual({ type: 'ephemeral' })
  })

  test('已有 cache_control → 全部清除后重新注入', () => {
    const body = {
      system: [
        { type: 'text', text: 'sys1', cache_control: { type: 'ephemeral' } },
        { type: 'text', text: 'sys2', cache_control: { type: 'ephemeral' } }
      ],
      tools: [
        {
          name: 'tool1',
          description: 'desc',
          input_schema: {},
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: 'hi', cache_control: { type: 'ephemeral' } }]
        },
        {
          role: 'assistant',
          content: [{ type: 'text', text: 'hello', cache_control: { type: 'ephemeral' } }]
        }
      ]
    }

    // 原来有 5 个断点
    expect(countBreakpoints(body)).toBe(5)

    injectPromptCaching(body)

    // 注入后最多 4 个
    expect(countBreakpoints(body)).toBeLessThanOrEqual(4)
    // system 第一个的原有标记应被清除
    expect(body.system[0].cache_control).toBeUndefined()
    // system 最后一个应有新标记
    expect(body.system[1].cache_control).toEqual({ type: 'ephemeral' })
  })

  test('空 body → 不崩溃', () => {
    expect(() => injectPromptCaching(null)).not.toThrow()
    expect(() => injectPromptCaching(undefined)).not.toThrow()
    expect(() => injectPromptCaching({})).not.toThrow()
    expect(() => injectPromptCaching(42)).not.toThrow()
  })

  test('string content messages → 跳过', () => {
    const body = {
      system: [{ type: 'text', text: 'sys' }],
      messages: [
        { role: 'user', content: 'plain string message' },
        { role: 'assistant', content: 'another string' }
      ]
    }

    injectPromptCaching(body)

    // system 有 1 个断点，messages 中的 string content 被跳过
    expect(countBreakpoints(body)).toBe(1)
    expect(body.system[0].cache_control).toEqual({ type: 'ephemeral' })
  })

  test('断点数不超过 4', () => {
    const messages = []
    for (let i = 0; i < 100; i++) {
      messages.push({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: [{ type: 'text', text: `message ${i}` }]
      })
    }
    const body = {
      system: [{ type: 'text', text: 'sys' }],
      tools: [{ name: 'tool1', description: 'desc', input_schema: {} }],
      messages
    }

    injectPromptCaching(body)

    expect(countBreakpoints(body)).toBeLessThanOrEqual(4)
  })

  test('messages 少于 slot 数 → 有几条注入几条', () => {
    const body = {
      messages: [{ role: 'user', content: [{ type: 'text', text: 'only one' }] }]
    }

    injectPromptCaching(body)

    // 无 system/tools, 4 slots 给 messages, 但只有 1 条
    expect(countBreakpoints(body)).toBe(1)
    expect(body.messages[0].content[0].cache_control).toEqual({ type: 'ephemeral' })
  })

  test('system + tools 无 messages → 2 个断点', () => {
    const body = {
      system: [{ type: 'text', text: 'sys' }],
      tools: [{ name: 'tool1', description: 'desc', input_schema: {} }]
    }

    injectPromptCaching(body)

    expect(countBreakpoints(body)).toBe(2)
    expect(body.system[0].cache_control).toEqual({ type: 'ephemeral' })
    expect(body.tools[0].cache_control).toEqual({ type: 'ephemeral' })
  })

  test('messages 中混合 string 和 array content → 只注入 array 的', () => {
    const body = {
      messages: [
        { role: 'user', content: 'string content' },
        { role: 'assistant', content: [{ type: 'text', text: 'array content' }] },
        { role: 'user', content: 'another string' },
        { role: 'assistant', content: [{ type: 'text', text: 'last array' }] }
      ]
    }

    injectPromptCaching(body)

    // 只有 2 条 eligible (index 1 和 3)，4 slots 全给 messages
    expect(countBreakpoints(body)).toBe(2)
    expect(body.messages[1].content[0].cache_control).toEqual({ type: 'ephemeral' })
    expect(body.messages[3].content[0].cache_control).toEqual({ type: 'ephemeral' })
  })
})
