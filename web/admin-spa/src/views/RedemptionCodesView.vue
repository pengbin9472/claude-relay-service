<template>
  <div class="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
    <!-- 页面标题 -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">兑换码管理</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          创建和管理兑换码，用户可通过兑换码增加 API Key 额度
        </p>
      </div>
      <button
        class="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        @click="showCreateModal = true"
      >
        <i class="fas fa-plus"></i>
        创建兑换码
      </button>
    </div>

    <!-- 查询条件 -->
    <div class="mb-4 rounded-xl bg-white p-4 shadow dark:bg-gray-800">
      <form class="flex flex-wrap items-end gap-3" @submit.prevent="searchCodes">
        <div class="flex min-w-[220px] flex-1 flex-col">
          <label class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            兑换码号（精确匹配）
          </label>
          <input
            v-model="filterCode"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="输入兑换码号"
            type="text"
          />
        </div>
        <button
          class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading"
          type="submit"
        >
          查询
        </button>
        <button
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          :disabled="loading || !filterCode"
          type="button"
          @click="resetFilter"
        >
          重置
        </button>
      </form>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
    </div>

    <!-- 空状态 -->
    <div
      v-else-if="codes.length === 0"
      class="rounded-xl bg-white p-12 text-center shadow dark:bg-gray-800"
    >
      <i class="fas fa-ticket-alt mb-4 text-5xl text-gray-300 dark:text-gray-600"></i>
      <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
        {{ isFiltering ? '未找到匹配兑换码' : '暂无兑换码' }}
      </h3>
      <p class="mb-4 text-gray-500 dark:text-gray-400">
        {{ isFiltering ? '请检查兑换码号是否正确' : '点击上方按钮创建第一个兑换码' }}
      </p>
      <button
        v-if="isFiltering"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        type="button"
        @click="resetFilter"
      >
        清除筛选
      </button>
    </div>

    <!-- 兑换码列表 -->
    <div v-else class="rounded-xl bg-white shadow dark:bg-gray-800">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead
            class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50"
          >
            <tr>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                名称
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                兑换码号
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                额度
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                使用情况
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                状态
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                过期时间
              </th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                创建时间
              </th>
              <th class="px-6 py-4 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="code in codes"
              :key="code.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/30"
            >
              <!-- 名称 -->
              <td class="px-6 py-4">
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ code.name }}
                </span>
              </td>

              <!-- 兑换码号 -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm text-gray-700 dark:text-gray-300">
                    {{ code.code || '-' }}
                  </span>
                  <button
                    class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700"
                    :disabled="!code.code"
                    title="Copy code"
                    @click="copyCode(code.code)"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </td>

              <!-- 额度 -->
              <td class="px-6 py-4">
                <span class="font-mono text-green-600 dark:text-green-400">
                  ${{ code.amount.toFixed(2) }}
                </span>
              </td>

              <!-- 使用情况 -->
              <td class="px-6 py-4">
                <span class="text-gray-700 dark:text-gray-300">
                  {{ code.usedCount }} / {{ code.maxUses === 0 ? '∞' : code.maxUses }}
                </span>
              </td>

              <!-- 状态 -->
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                    getStatusClass(code)
                  ]"
                >
                  {{ getStatusText(code) }}
                </span>
              </td>

              <!-- 过期时间 -->
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ code.expiresAt ? formatDate(code.expiresAt) : '永不过期' }}
              </td>

              <!-- 创建时间 -->
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(code.createdAt) }}
              </td>

              <!-- 操作 -->
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-500 dark:hover:bg-gray-700"
                    title="查看记录"
                    @click="viewRecords(code)"
                  >
                    <i class="fas fa-history"></i>
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-yellow-500 dark:hover:bg-gray-700"
                    :title="code.isActive ? '禁用' : '启用'"
                    @click="toggleStatus(code)"
                  >
                    <i :class="code.isActive ? 'fas fa-pause' : 'fas fa-play'"></i>
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700"
                    title="删除"
                    @click="confirmDelete(code)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 创建弹窗 -->
    <CreateRedemptionCodeModal
      v-if="showCreateModal"
      @batch-success="handleBatchCreateSuccess"
      @close="showCreateModal = false"
      @created="handleCreated"
    />

    <!-- 记录弹窗 -->
    <RedemptionRecordsModal
      v-if="showRecordsModal"
      :code-id="selectedCode?.id"
      :code-name="selectedCode?.name"
      @close="showRecordsModal = false"
    />

    <!-- 确认删除弹窗 -->
    <ConfirmModal
      :message="`确定要删除兑换码「${selectedCode?.name}」吗？此操作不可恢复。`"
      :show="showDeleteConfirm"
      title="确认删除"
      @cancel="showDeleteConfirm = false"
      @confirm="handleDelete"
    />

    <BatchRedemptionCodeModal
      v-if="showBatchModal"
      :codes="batchCodes"
      @close="showBatchModal = false"
    />

    <NewRedemptionCodeModal
      v-if="showNewCodeModal"
      :code="newCodeData"
      @close="showNewCodeModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRedemptionCodesStore } from '@/stores/redemptionCodes'
import { showToast } from '@/utils/toast'
import CreateRedemptionCodeModal from '@/components/redemption/CreateRedemptionCodeModal.vue'
import RedemptionRecordsModal from '@/components/redemption/RedemptionRecordsModal.vue'
import BatchRedemptionCodeModal from '@/components/redemption/BatchRedemptionCodeModal.vue'
import NewRedemptionCodeModal from '@/components/redemption/NewRedemptionCodeModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const store = useRedemptionCodesStore()
const loading = computed(() => store.loading)
const codes = computed(() => store.codes)

const showCreateModal = ref(false)
const showRecordsModal = ref(false)
const showDeleteConfirm = ref(false)
const selectedCode = ref(null)
const showBatchModal = ref(false)
const batchCodes = ref([])
const showNewCodeModal = ref(false)
const newCodeData = ref(null)
const filterCode = ref('')
const isFiltering = computed(() => filterCode.value.trim().length > 0)

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const getStatusClass = (code) => {
  if (!code.isActive) {
    return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
  if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
    return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  }
  if (code.maxUses > 0 && code.usedCount >= code.maxUses) {
    return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
  }
  return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
}

const getStatusText = (code) => {
  if (!code.isActive) return '已禁用'
  if (code.expiresAt && new Date(code.expiresAt) < new Date()) return '已过期'
  if (code.maxUses > 0 && code.usedCount >= code.maxUses) return '已用完'
  return '可用'
}

const viewRecords = (code) => {
  selectedCode.value = code
  showRecordsModal.value = true
}

const toggleStatus = async (code) => {
  try {
    await store.updateCode(code.id, { isActive: !code.isActive })
    showToast(code.isActive ? '已禁用' : '已启用', 'success')
  } catch (error) {
    showToast('操作失败: ' + error.message, 'error')
  }
}

const confirmDelete = (code) => {
  selectedCode.value = code
  showDeleteConfirm.value = true
}

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

const copyCode = async (code) => {
  if (!code) return
  await copyTextWithFallback(code, '兑换码已复制')
}

const handleDelete = async () => {
  try {
    await store.deleteCode(selectedCode.value.id)
    showToast('删除成功', 'success')
  } catch (error) {
    showToast('删除失败: ' + error.message, 'error')
  } finally {
    showDeleteConfirm.value = false
    selectedCode.value = null
  }
}

const handleCreated = (result) => {
  // 如果是单个创建，显示兑换码
  if (!Array.isArray(result)) {
    newCodeData.value = result
    showNewCodeModal.value = true
  }
}

const handleBatchCreateSuccess = (result) => {
  if (!Array.isArray(result) || result.length === 0) return
  batchCodes.value = result
  showBatchModal.value = true
}

const searchCodes = async () => {
  const code = filterCode.value.trim()
  try {
    await store.fetchCodes(code ? { code } : {})
  } catch (error) {
    showToast('查询失败: ' + error.message, 'error')
  }
}

const resetFilter = async () => {
  filterCode.value = ''
  try {
    await store.fetchCodes()
  } catch (error) {
    showToast('查询失败: ' + error.message, 'error')
  }
}

onMounted(() => {
  store.fetchCodes()
})
</script>
