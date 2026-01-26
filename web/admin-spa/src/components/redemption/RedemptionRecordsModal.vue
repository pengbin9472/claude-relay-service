<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        <!-- 标题 -->
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            兑换记录 - {{ codeName }}
          </h3>
          <button
            class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            @click="$emit('close')"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="flex items-center justify-center py-8">
          <i class="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
        </div>

        <!-- 空状态 -->
        <div
          v-else-if="records.length === 0"
          class="py-8 text-center text-gray-500 dark:text-gray-400"
        >
          <i class="fas fa-inbox mb-2 text-4xl"></i>
          <p>暂无兑换记录</p>
        </div>

        <!-- 记录列表 -->
        <div v-else class="max-h-96 overflow-y-auto">
          <table class="w-full">
            <thead class="sticky top-0 bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300"
                >
                  API Key
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300"
                >
                  额度
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300"
                >
                  兑换时间
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
              <tr
                v-for="record in records"
                :key="record.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {{ record.apiKeyName }}
                </td>
                <td class="px-4 py-3 text-sm text-green-600 dark:text-green-400">
                  +${{ record.amount.toFixed(2) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(record.redeemedAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 关闭按钮 -->
        <div class="mt-6 flex justify-end">
          <button
            class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="$emit('close')"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRedemptionCodesStore } from '@/stores/redemptionCodes'

const props = defineProps({
  codeId: { type: String, required: true },
  codeName: { type: String, default: '' }
})

defineEmits(['close'])

const store = useRedemptionCodesStore()
const loading = ref(true)
const records = ref([])

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

onMounted(async () => {
  try {
    records.value = await store.fetchRecords(props.codeId)
  } catch (error) {
    console.error('获取兑换记录失败:', error)
  } finally {
    loading.value = false
  }
})
</script>
