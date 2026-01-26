<template>
  <Teleport to="body">
    <div class="modal fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="modal-content custom-scrollbar mx-auto max-h-[90vh] w-full max-w-lg overflow-y-auto p-8"
      >
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600"
            >
              <i class="fas fa-ticket-alt text-lg text-white" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">兑换码创建成功</h3>
              <p class="text-sm text-gray-600">请及时复制并保存</p>
            </div>
          </div>
          <button
            class="text-gray-400 transition-colors hover:text-gray-600"
            title="Close"
            @click="emit('close')"
          >
            <i class="fas fa-times text-xl" />
          </button>
        </div>

        <div class="mb-6 space-y-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">名称</label>
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span class="font-medium text-gray-900">{{ code.name || '-' }}</span>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">兑换码号</label>
            <div class="relative">
              <div
                class="flex min-h-[52px] items-center break-all rounded-lg border border-gray-700 bg-gray-900 p-4 pr-14 font-mono text-sm text-white"
              >
                {{ code.code || '-' }}
              </div>
              <div class="absolute right-3 top-3">
                <button
                  class="btn-icon-sm bg-gray-700 hover:bg-gray-800"
                  :disabled="!code.code"
                  title="Copy code"
                  type="button"
                  @click="copyCode"
                >
                  <i class="fas fa-copy text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-semibold text-gray-700">额度</label>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <span class="font-mono text-gray-900">${{ amountText }}</span>
              </div>
            </div>
            <div>
              <label class="mb-2 block text-sm font-semibold text-gray-700">最大使用次数</label>
              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <span class="text-gray-900">{{ maxUsesText }}</span>
              </div>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">过期时间</label>
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span class="text-gray-900">{{ expiryText }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <button
            class="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 sm:flex-1 sm:text-base"
            :disabled="!code.code"
            type="button"
            @click="copyCode"
          >
            <i class="fas fa-copy" />
            复制兑换码
          </button>
          <button
            class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-200 px-5 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-300 sm:flex-1 sm:text-base"
            type="button"
            @click="emit('close')"
          >
            <i class="fas fa-check-circle" />
            我已保存
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { showToast } from '@/utils/toast'

const props = defineProps({
  code: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const amountText = computed(() => {
  if (typeof props.code.amount !== 'number') return '-'
  return props.code.amount.toFixed(2)
})

const maxUsesText = computed(() => {
  if (props.code.maxUses === 0) return '无限制'
  if (typeof props.code.maxUses === 'number') return String(props.code.maxUses)
  return '-'
})

const expiryText = computed(() => {
  if (!props.code.expiresAt) return '永不过期'
  const date = new Date(props.code.expiresAt)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN')
})

const copyTextWithFallback = async (text, successMessage) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast(successMessage, 'success')
  } catch (error) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      showToast(successMessage, 'success')
    } catch (fallbackError) {
      showToast('复制失败，请手动复制', 'error')
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

const copyCode = async () => {
  if (!props.code.code) return
  await copyTextWithFallback(props.code.code, '兑换码已复制')
}
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
