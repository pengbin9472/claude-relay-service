// 兑换码管理路由
const express = require('express')
const router = express.Router()
const redemptionCodeService = require('../../services/redemptionCodeService')
const logger = require('../../utils/logger')

// 获取所有兑换码
router.get('/', async (req, res) => {
  try {
    const { code } = req.query
    const codes = await redemptionCodeService.getAllCodes({
      code: code ? String(code).trim() : ''
    })
    res.json({ success: true, data: codes })
  } catch (error) {
    logger.error('获取兑换码列表失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// 获取单个兑换码详情
router.get('/:codeId', async (req, res) => {
  try {
    const code = await redemptionCodeService.getCodeById(req.params.codeId)
    if (!code) {
      return res.status(404).json({ success: false, message: '兑换码不存在' })
    }
    res.json({ success: true, data: code })
  } catch (error) {
    logger.error('获取兑换码详情失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// 创建兑换码
router.post('/', async (req, res) => {
  try {
    const { name, amount, maxUses, expiresAt, tags } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: '额度必须大于0' })
    }

    const code = await redemptionCodeService.generateCode({
      name,
      amount: parseFloat(amount),
      maxUses: parseInt(maxUses) || 1,
      expiresAt,
      tags: tags || [],
      createdBy: req.admin?.username || 'admin'
    })

    res.json({ success: true, data: code })
  } catch (error) {
    logger.error('创建兑换码失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// 批量创建兑换码
router.post('/batch', async (req, res) => {
  try {
    const { name, amount, maxUses, expiresAt, tags, count } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: '额度必须大于0' })
    }

    if (!count || count < 1 || count > 100) {
      return res.status(400).json({ success: false, message: '批量数量必须在1-100之间' })
    }

    const codes = await redemptionCodeService.batchGenerateCodes(
      {
        name,
        amount: parseFloat(amount),
        maxUses: parseInt(maxUses) || 1,
        expiresAt,
        tags: tags || [],
        createdBy: req.admin?.username || 'admin'
      },
      parseInt(count)
    )

    res.json({ success: true, data: codes })
  } catch (error) {
    logger.error('批量创建兑换码失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// 更新兑换码
router.put('/:codeId', async (req, res) => {
  try {
    const { name, amount, maxUses, expiresAt, isActive, tags } = req.body
    const updates = {}

    if (name !== undefined) {
      updates.name = name
    }
    if (amount !== undefined) {
      updates.amount = parseFloat(amount)
    }
    if (maxUses !== undefined) {
      updates.maxUses = parseInt(maxUses)
    }
    if (expiresAt !== undefined) {
      updates.expiresAt = expiresAt
    }
    if (isActive !== undefined) {
      updates.isActive = isActive
    }
    if (tags !== undefined) {
      updates.tags = tags
    }

    const code = await redemptionCodeService.updateCode(req.params.codeId, updates)
    res.json({ success: true, data: code })
  } catch (error) {
    logger.error('更新兑换码失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// 删除兑换码
router.delete('/:codeId', async (req, res) => {
  try {
    await redemptionCodeService.deleteCode(req.params.codeId)
    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    logger.error('删除兑换码失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// 获取兑换码使用记录
router.get('/:codeId/records', async (req, res) => {
  try {
    const records = await redemptionCodeService.getCodeUsageRecords(req.params.codeId)
    res.json({ success: true, data: records })
  } catch (error) {
    logger.error('获取兑换记录失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// 获取所有兑换记录
router.get('/records/all', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100
    const records = await redemptionCodeService.getAllRedemptionRecords({ limit })
    res.json({ success: true, data: records })
  } catch (error) {
    logger.error('获取所有兑换记录失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
