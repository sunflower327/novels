// 配置管理：读写 ~/.novel-cli.json
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { providers } from '../../src/lib/ai.js'

const CONFIG_PATH = join(homedir(), '.novel-cli.json')

export function defaultConfig() {
  return {
    provider: 'glm',
    baseURL: '',
    apiKey: '',
    model: '',
    temperature: 0.85,
    style: '番茄',
  }
}

export function loadConfig() {
  try {
    if (!existsSync(CONFIG_PATH)) return defaultConfig()
    const raw = readFileSync(CONFIG_PATH, 'utf-8')
    return { ...defaultConfig(), ...JSON.parse(raw) }
  } catch (e) {
    return defaultConfig()
  }
}

export function saveConfig(cfg) {
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf-8')
  return CONFIG_PATH
}

export function configPath() { return CONFIG_PATH }

// 构造 ai.js 期望的 settings（enabled=true，强制走 AI）
export function toSettings(cfg) {
  return { ...cfg, enabled: true }
}

// 解析 "key=value" 形式的参数
export function parseKv(args) {
  const out = {}
  for (const a of args) {
    const m = a.match(/^([a-zA-Z_]+)=(.*)$/)
    if (m) out[m[1]] = m[2]
  }
  return out
}

export function printProviders() {
  console.log('可选 provider：')
  for (const p of providers) {
    console.log(`  ${p.v}\t${p.label}\t${p.baseURL || '(自定义)'}\t默认模型: ${p.model || '-'}`)
  }
}
