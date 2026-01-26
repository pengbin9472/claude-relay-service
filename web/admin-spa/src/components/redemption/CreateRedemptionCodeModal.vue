<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        <!-- 标题 -->
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ isBatch ? '批量创建兑换码' : '创建兑换码' }}
          </h3>
          <button
            class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            @click="$emit('close')"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleSubmit">
          <!-- 创建模式切换 -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              创建模式
            </label>
            <div class="flex gap-4">
              <label class="flex cursor-pointer items-center gap-2">
                <input v-model="isBatch" class="text-blue-500" type="radio" :value="false" />
                <span class="text-sm text-gray-700 dark:text-gray-300">单个创建</span>
              </label>
              <label class="flex cursor-pointer items-center gap-2">
                <input v-model="isBatch" class="text-blue-500" type="radio" :value="true" />
                <span class="text-sm text-gray-700 dark:text-gray-300">批量创建</span>
              </label>
            </div>
          </div>

          <!-- 批量数量 -->
          <div v-if="isBatch" class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              创建数量
            </label>
            <input
              v-model.number="form.count"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              max="100"
              min="1"
              type="number"
            />
          </div>

          <!-- 名称 -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              名称
            </label>
            <input
              v-model="form.name"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="例如：新年促销码"
              type="text"
            />
          </div>

          <!-- 额度 -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              额度（美元）<span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.amount"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              min="0.01"
              placeholder="例如：10.00"
              required
              step="0.01"
              type="number"
            />
          </div>

          <!-- 最大使用次数 -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              最大使用次数
            </label>
            <input
              v-model.number="form.maxUses"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              min="0"
              placeholder="0 表示无限制"
              type="number"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              0 表示无限制，每个 API Key 只能使用一次
            </p>
          </div>

          <!-- 过期时间 -->
          <div class="mb-6">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              过期时间（可选）
            </label>
            <input
              v-model="form.expiresAt"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              type="datetime-local"
            />
          </div>

          <!-- 按钮 -->
          <div class="flex justify-end gap-3">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              type="button"
              @click="$emit('close')"
            >
              取消
            </button>
            <button
              class="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loading"
              type="submit"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ isBatch ? '批量创建' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRedemptionCodesStore } from '@/stores/redemptionCodes'
import { showToast } from '@/utils/toast'

const emit = defineEmits(['close', 'created', 'batch-success'])

const store = useRedemptionCodesStore()
const loading = ref(false)
const isBatch = ref(false)

const form = reactive({
  name: '',
  amount: null,
  maxUses: 1,
  expiresAt: '',
  count: 10
})

const handleSubmit = async () => {
  if (!form.amount || form.amount <= 0) {
    showToast('请输入有效的额度', 'error')
    return
  }

  loading.value = true
  try {
    const data = {
      name: form.name || '兑换码',
      amount: form.amount,
      maxUses: form.maxUses || 0,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null
    }

    let result
    if (isBatch.value) {
      result = await store.batchCreateCodes({ ...data, count: form.count })
      showToast(`成功创建 ${result.length} 个兑换码`, 'success')
      emit('batch-success', result)
    } else {
      result = await store.createCode(data)
      showToast(`兑换码创建成功: ${result.code}`, 'success')
    }

    emit('created', result)
    emit('close')
  } catch (error) {
    showToast('创建失败: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}
</script>
