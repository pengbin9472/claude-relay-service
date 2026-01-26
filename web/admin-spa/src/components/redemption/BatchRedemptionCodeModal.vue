<template>
  <Teleport to="body">
    <div class="modal fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="modal-content custom-scrollbar mx-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto p-8"
      >
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600"
            >
              <i class="fas fa-ticket-alt text-lg text-white" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">批量创建成功</h3>
              <p class="text-sm text-gray-600">成功创建 {{ codes.length }} 个兑换码</p>
            </div>
          </div>
          <button
            class="text-gray-400 transition-colors hover:text-gray-600"
            title="关闭"
            @click="emit('close')"
          >
            <i class="fas fa-times text-xl" />
          </button>
        </div>

        <div class="mb-6 border-l-4 border-blue-400 bg-blue-50 p-4">
          <div class="flex items-start">
            <div
              class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-blue-400"
            >
              <i class="fas fa-info-circle text-sm text-white" />
            </div>
            <div class="ml-3">
              <h5 class="mb-1 font-semibold text-blue-900">提示</h5>
              <p class="text-sm text-blue-800">建议立即下载并保存兑换码清单，便于分发和管理。</p>
            </div>
          </div>
        </div>

        <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div
            class="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-blue-600">创建数量</p>
                <p class="mt-1 text-2xl font-bold text-blue-900">
                  {{ codes.length }}
                </p>
              </div>
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 bg-opacity-20"
              >
                <i class="fas fa-ticket-alt text-blue-600" />
              </div>
            </div>
          </div>

          <div
            class="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-green-600">额度</p>
                <p class="mt-1 text-lg font-bold text-green-900">${{ amountText }}</p>
              </div>
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 bg-opacity-20"
              >
                <i class="fas fa-coins text-green-600" />
              </div>
            </div>
          </div>

          <div
            class="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-purple-600">最大使用次数</p>
                <p class="mt-1 text-lg font-bold text-purple-900">
                  {{ maxUsesText }}
                </p>
              </div>
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 bg-opacity-20"
              >
                <i class="fas fa-sync-alt text-purple-600" />
              </div>
            </div>
          </div>

          <div
            class="rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-orange-600">过期时间</p>
                <p class="mt-1 text-lg font-bold text-orange-900">
                  {{ expiryText }}
                </p>
              </div>
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 bg-opacity-20"
              >
                <i class="fas fa-clock text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <div class="mb-3 flex items-center justify-between">
            <label class="text-sm font-semibold text-gray-700">兑换码预览</label>
            <div class="flex items-center gap-2">
              <button
                class="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                type="button"
                @click="togglePreview"
              >
                <i :class="['fas', showPreview ? 'fa-eye-slash' : 'fa-eye']" />
                {{ showPreview ? '隐藏' : '显示' }}预览
              </button>
              <span class="text-xs text-gray-500">（最多显示前10个）</span>
            </div>
          </div>

          <div
            v-if="showPreview"
            class="custom-scrollbar max-h-48 overflow-y-auto rounded-lg bg-gray-900 p-4"
          >
            <pre class="font-mono text-xs text-gray-300">{{ previewText }}</pre>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="btn btn-primary flex flex-1 items-center justify-center gap-2 px-6 py-3 font-semibold"
            @click="downloadCodes"
          >
            <i class="fas fa-download" />
            下载兑换码
          </button>
          <button
            class="rounded-xl border border-gray-300 bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-300"
            @click="emit('close')"
          >
            关闭
          </button>
        </div>

        <div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p class="flex items-start text-xs text-blue-700">
            <i class="fas fa-info-circle mr-2 mt-0.5 flex-shrink-0" />
            <span>下载的文件为文本文件（.txt），每行包含一个兑换码。</span>
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast } from '@/utils/toast'

const props = defineProps({
  codes: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close'])

const showPreview = ref(false)

const firstCode = computed(() => (props.codes.length > 0 ? props.codes[0] : null))

const amountText = computed(() => {
  if (!firstCode.value || typeof firstCode.value.amount !== 'number') return '-'
  return firstCode.value.amount.toFixed(2)
})

const maxUsesText = computed(() => {
  if (!firstCode.value) return '-'
  const value = firstCode.value.maxUses
  return value === 0 ? '无限制' : String(value || '-')
})

const expiryText = computed(() => {
  if (!firstCode.value || !firstCode.value.expiresAt) return '永不过期'
  const date = new Date(firstCode.value.expiresAt)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('zh-CN')
})

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const previewText = computed(() => {
  const previewCodes = props.codes.slice(0, 10)
  const lines = previewCodes.map((code) => `${code.name || '兑换码'}: ${code.code}`)
  if (props.codes.length > 10) {
    lines.push(`... 还有 ${props.codes.length - 10} 个兑换码`)
  }
  return lines.join('\n')
})

const downloadCodes = () => {
  const content = props.codes.map((code) => code.code).join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  link.download = `redemption-codes-${timestamp}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  showToast('兑换码文件已下载', 'success')
}
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
