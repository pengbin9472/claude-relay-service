import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/config/api'

export const useRedemptionCodesStore = defineStore('redemptionCodes', () => {
  const codes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 获取所有兑换码
  const fetchCodes = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/admin/redemption-codes', { params })
      if (response.success) {
        codes.value = response.data || []
      } else {
        throw new Error(response.message || '获取兑换码列表失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建兑换码
  const createCode = async (data) => {
    loading.value = true
    try {
      const response = await apiClient.post('/admin/redemption-codes', data)
      if (response.success) {
        await fetchCodes()
        return response.data
      } else {
        throw new Error(response.message || '创建兑换码失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 批量创建兑换码
  const batchCreateCodes = async (data) => {
    loading.value = true
    try {
      const response = await apiClient.post('/admin/redemption-codes/batch', data)
      if (response.success) {
        await fetchCodes()
        return response.data
      } else {
        throw new Error(response.message || '批量创建兑换码失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新兑换码
  const updateCode = async (codeId, data) => {
    loading.value = true
    try {
      const response = await apiClient.put(`/admin/redemption-codes/${codeId}`, data)
      if (response.success) {
        await fetchCodes()
        return response.data
      } else {
        throw new Error(response.message || '更新兑换码失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除兑换码
  const deleteCode = async (codeId) => {
    loading.value = true
    try {
      const response = await apiClient.delete(`/admin/redemption-codes/${codeId}`)
      if (response.success) {
        await fetchCodes()
        return response
      } else {
        throw new Error(response.message || '删除兑换码失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取兑换记录
  const fetchRecords = async (codeId) => {
    try {
      const response = await apiClient.get(`/admin/redemption-codes/${codeId}/records`)
      if (response.success) {
        return response.data || []
      } else {
        throw new Error(response.message || '获取兑换记录失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    codes,
    loading,
    error,
    fetchCodes,
    createCode,
    batchCreateCodes,
    updateCode,
    deleteCode,
    fetchRecords
  }
})
