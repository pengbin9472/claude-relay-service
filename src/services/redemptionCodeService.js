// 兑换码服务
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')
const config = require('../../config/config')
const redis = require('../models/redis')
const logger = require('../utils/logger')
const apiKeyService = require('./apiKeyService')

class RedemptionCodeService {
  constructor() {
    this.codePrefix = 'RC_'
    this.maxAttempts = 5
    this.attemptWindowSeconds = 3600
  }

  // 生成安全的兑换码
  _generateSecureCode() {
    const randomPart = crypto.randomBytes(6).toString('hex').toUpperCase()
    return `${this.codePrefix}${randomPart}`
  }

  // 哈希兑换码
  _hashCode(code) {
    return crypto
      .createHash('sha256')
      .update(code + config.security.encryptionKey)
      .digest('hex')
  }

  // 检查速率限制
  async _checkRateLimit(ip) {
    const client = redis.getClientSafe()
    const key = `redemption_attempt:${ip}`
    const attempts = parseInt(await client.get(key)) || 0
    if (attempts >= this.maxAttempts) {
      throw new Error('RATE_LIMITED')
    }
  }

  // 记录失败尝试
  async _recordFailedAttempt(ip) {
    const client = redis.getClientSafe()
    const key = `redemption_attempt:${ip}`
    await client.incr(key)
    await client.expire(key, this.attemptWindowSeconds)
  }

  // 检查是否已兑换过
  async _checkAlreadyRedeemed(codeId, apiKeyId) {
    const client = redis.getClientSafe()
    const records = await client.lrange(`redemption_records:by_apikey:${apiKeyId}`, 0, -1)
    for (const recordId of records) {
      const record = await client.hgetall(`redemption_record:${recordId}`)
      if (record && record.codeId === codeId) {
        return true
      }
    }
    return false
  }

  // 生成兑换码
  async generateCode(options = {}) {
    const {
      name = '未命名兑换码',
      amount = 0,
      maxUses = 1,
      expiresAt = null,
      tags = [],
      createdBy = 'admin'
    } = options

    if (amount <= 0) {
      throw new Error('额度必须大于0')
    }

    const codeId = uuidv4()
    const plainCode = this._generateSecureCode()
    const hashedCode = this._hashCode(plainCode)

    const codeData = {
      id: codeId,
      code: hashedCode,
      plainCode,
      name,
      amount: String(amount),
      maxUses: String(maxUses),
      usedCount: '0',
      expiresAt: expiresAt || '',
      isActive: 'true',
      createdAt: new Date().toISOString(),
      createdBy,
      tags: JSON.stringify(tags)
    }

    const client = redis.getClientSafe()
    await client.hset(`redemption_code:${codeId}`, codeData)
    await client.hset('redemption_code:hash_map', hashedCode, codeId)

    logger.success(`🎫 Generated redemption code: ${name} (${codeId})`)

    return {
      id: codeId,
      code: plainCode,
      name,
      amount: parseFloat(amount),
      maxUses: parseInt(maxUses),
      usedCount: 0,
      expiresAt: expiresAt || null,
      isActive: true,
      createdAt: codeData.createdAt,
      createdBy,
      tags
    }
  }

  // 批量生成兑换码
  async batchGenerateCodes(options = {}, count = 1) {
    const results = []
    for (let i = 0; i < count; i++) {
      const code = await this.generateCode({
        ...options,
        name: count > 1 ? `${options.name || '兑换码'} #${i + 1}` : options.name
      })
      results.push(code)
    }
    return results
  }

  // 执行兑换
  async redeemCode(code, apiKey, clientInfo = {}) {
    const client = redis.getClientSafe()
    const { ip = 'unknown' } = clientInfo

    // 1. 检查速率限制
    await this._checkRateLimit(ip)

    // 2. 验证兑换码
    const hashedCode = this._hashCode(code)
    const codeId = await client.hget('redemption_code:hash_map', hashedCode)

    if (!codeId) {
      await this._recordFailedAttempt(ip)
      throw new Error('INVALID_CODE')
    }

    const codeData = await client.hgetall(`redemption_code:${codeId}`)
    if (!codeData || Object.keys(codeData).length === 0) {
      await this._recordFailedAttempt(ip)
      throw new Error('INVALID_CODE')
    }

    // 3. 检查兑换码状态
    if (codeData.isActive !== 'true') {
      throw new Error('CODE_DISABLED')
    }

    if (codeData.expiresAt && new Date() > new Date(codeData.expiresAt)) {
      throw new Error('CODE_EXPIRED')
    }

    const maxUses = parseInt(codeData.maxUses)
    const usedCount = parseInt(codeData.usedCount)
    if (maxUses > 0 && usedCount >= maxUses) {
      throw new Error('CODE_EXHAUSTED')
    }

    // 4. 验证API Key
    const keyValidation = await apiKeyService.validateApiKeyForStats(apiKey)
    if (!keyValidation.valid) {
      throw new Error('INVALID_API_KEY')
    }

    const { keyData } = keyValidation

    // 5. 检查是否已兑换过
    const alreadyRedeemed = await this._checkAlreadyRedeemed(codeId, keyData.id)
    if (alreadyRedeemed) {
      throw new Error('ALREADY_REDEEMED')
    }

    // 6. 执行兑换 - 更新API Key总额度
    const amount = parseFloat(codeData.amount) || 0
    const previousTotalLimit = parseFloat(keyData.totalCostLimit) || 0
    const newTotalLimit = previousTotalLimit + amount

    await apiKeyService.updateApiKey(keyData.id, {
      totalCostLimit: newTotalLimit
    })

    // 7. 更新兑换码使用次数
    await client.hincrby(`redemption_code:${codeId}`, 'usedCount', 1)

    // 8. 记录兑换记录
    const recordId = uuidv4()
    const recordData = {
      id: recordId,
      codeId,
      codeName: codeData.name,
      apiKeyId: keyData.id,
      apiKeyName: keyData.name,
      amount: String(amount),
      redeemedAt: new Date().toISOString(),
      redeemedBy: ip,
      previousTotalLimit: String(previousTotalLimit),
      newTotalLimit: String(newTotalLimit)
    }

    await client.hset(`redemption_record:${recordId}`, recordData)
    await client.lpush(`redemption_records:by_code:${codeId}`, recordId)
    await client.lpush(`redemption_records:by_apikey:${keyData.id}`, recordId)

    logger.success(
      `🎉 Redemption successful: Code ${codeData.name} -> API Key ${keyData.name}, amount: $${amount}`
    )

    return {
      amount,
      newTotalLimit
    }
  }

  // 获取所有兑换码
  async getAllCodes(options = {}) {
    const { includeDeleted = false, code } = options
    const client = redis.getClientSafe()

    if (code) {
      const matched = await this.getCodeByPlainCode(code)
      return matched ? [matched] : []
    }

    const keys = await client.keys('redemption_code:*')
    const codes = []

    for (const key of keys) {
      if (key === 'redemption_code:hash_map') {
        continue
      }
      const codeData = await client.hgetall(key)
      if (!codeData || Object.keys(codeData).length === 0) {
        continue
      }
      if (!includeDeleted && codeData.isDeleted === 'true') {
        continue
      }

      codes.push({
        id: codeData.id,
        code: codeData.plainCode || '',
        name: codeData.name,
        amount: parseFloat(codeData.amount) || 0,
        maxUses: parseInt(codeData.maxUses) || 0,
        usedCount: parseInt(codeData.usedCount) || 0,
        expiresAt: codeData.expiresAt || null,
        isActive: codeData.isActive === 'true',
        createdAt: codeData.createdAt,
        createdBy: codeData.createdBy,
        tags: JSON.parse(codeData.tags || '[]')
      })
    }

    // 按创建时间倒序
    codes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return codes
  }

  // 获取单个兑换码详情
  async getCodeById(codeId) {
    const client = redis.getClientSafe()
    const codeData = await client.hgetall(`redemption_code:${codeId}`)
    if (!codeData || Object.keys(codeData).length === 0) {
      return null
    }

    return {
      id: codeData.id,
      code: codeData.plainCode || '',
      name: codeData.name,
      amount: parseFloat(codeData.amount) || 0,
      maxUses: parseInt(codeData.maxUses) || 0,
      usedCount: parseInt(codeData.usedCount) || 0,
      expiresAt: codeData.expiresAt || null,
      isActive: codeData.isActive === 'true',
      createdAt: codeData.createdAt,
      createdBy: codeData.createdBy,
      tags: JSON.parse(codeData.tags || '[]')
    }
  }

  // 更新兑换码
  async updateCode(codeId, updates) {
    const client = redis.getClientSafe()
    const existing = await client.hgetall(`redemption_code:${codeId}`)
    if (!existing || Object.keys(existing).length === 0) {
      throw new Error('兑换码不存在')
    }

    const allowedFields = ['name', 'amount', 'maxUses', 'expiresAt', 'isActive', 'tags']
    const updateData = {}

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (field === 'tags') {
          updateData[field] = JSON.stringify(updates[field])
        } else if (field === 'isActive') {
          updateData[field] = updates[field] ? 'true' : 'false'
        } else {
          updateData[field] = String(updates[field])
        }
      }
    }

    if (Object.keys(updateData).length > 0) {
      await client.hset(`redemption_code:${codeId}`, updateData)
    }

    return await this.getCodeById(codeId)
  }

  // 删除兑换码
  async deleteCode(codeId) {
    const client = redis.getClientSafe()
    const existing = await client.hgetall(`redemption_code:${codeId}`)
    if (!existing || Object.keys(existing).length === 0) {
      throw new Error('兑换码不存在')
    }

    // 从哈希映射中移除
    await client.hdel('redemption_code:hash_map', existing.code)
    // 删除兑换码数据
    await client.del(`redemption_code:${codeId}`)

    logger.info(`🗑️ Deleted redemption code: ${existing.name} (${codeId})`)
    return true
  }

  // 鑾峰彇鍏戞崲鐮佽鎯呯（閫氳繃鏄剧ず鐨勫厬鎹㈢爜锛
  async getCodeByPlainCode(plainCode) {
    const code = String(plainCode || '').trim()
    if (!code) {
      return null
    }

    const client = redis.getClientSafe()
    const hashedCode = this._hashCode(code)
    const codeId = await client.hget('redemption_code:hash_map', hashedCode)
    if (!codeId) {
      return null
    }
    return await this.getCodeById(codeId)
  }

  // 获取兑换码的使用记录
  async getCodeUsageRecords(codeId, limit = 50) {
    const client = redis.getClientSafe()
    const recordIds = await client.lrange(`redemption_records:by_code:${codeId}`, 0, limit - 1)
    const records = []

    for (const recordId of recordIds) {
      const record = await client.hgetall(`redemption_record:${recordId}`)
      if (record && Object.keys(record).length > 0) {
        records.push({
          id: record.id,
          apiKeyId: record.apiKeyId,
          apiKeyName: record.apiKeyName,
          amount: parseFloat(record.amount) || 0,
          redeemedAt: record.redeemedAt,
          redeemedBy: record.redeemedBy,
          previousTotalLimit: parseFloat(record.previousTotalLimit) || 0,
          newTotalLimit: parseFloat(record.newTotalLimit) || 0
        })
      }
    }

    return records
  }

  // 获取所有兑换记录
  async getAllRedemptionRecords(options = {}) {
    const { limit = 100 } = options
    const client = redis.getClientSafe()
    const keys = await client.keys('redemption_record:*')
    const records = []

    for (const key of keys) {
      const record = await client.hgetall(key)
      if (record && Object.keys(record).length > 0) {
        records.push({
          id: record.id,
          codeId: record.codeId,
          codeName: record.codeName,
          apiKeyId: record.apiKeyId,
          apiKeyName: record.apiKeyName,
          amount: parseFloat(record.amount) || 0,
          redeemedAt: record.redeemedAt,
          redeemedBy: record.redeemedBy,
          previousTotalLimit: parseFloat(record.previousTotalLimit) || 0,
          newTotalLimit: parseFloat(record.newTotalLimit) || 0
        })
      }
    }

    // 按兑换时间倒序
    records.sort((a, b) => new Date(b.redeemedAt) - new Date(a.redeemedAt))
    return records.slice(0, limit)
  }
}

module.exports = new RedemptionCodeService()
