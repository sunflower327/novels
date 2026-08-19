#!/usr/bin/env node
// novel-cli - 网文创作命令行工具
// 在 Cursor/Qoder 终端用命令生成灵感/书名/简介/大纲/章纲/角色/续写/拆书
import { loadConfig, saveConfig, configPath, toSettings, parseKv, printProviders } from './src/config.mjs'
import { loadBook, buildCtx, listBooks } from './src/data.mjs'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import * as ai from '../src/lib/ai.js'

const argv = process.argv.slice(2)
const cmd = argv[0]
const rest = argv.slice(1)

// 解析选项：--flag value / --flag=value / 位置参数
function parseArgs(args) {
  const opts = { _: [], flags: {} }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      if (a.includes('=')) { const [k, v] = key.split('='); opts.flags[k] = v }
      else if (args[i + 1] && !args[i + 1].startsWith('--')) { opts.flags[key] = args[i + 1]; i++ }
      else opts.flags[key] = true
    } else opts._.push(a)
  }
  return opts
}

function out(result, opts) {
  const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
  if (opts.flags.out) {
    writeFileSync(opts.flags.out, text + '\n', 'utf-8')
    console.log(`已写入 ${opts.flags.out}`)
  } else if (opts.flags.json && typeof result !== 'string') {
    console.log(JSON.stringify(result))
  } else {
    console.log(text)
  }
}

async function run(fn, settings, ...args) {
  try { return await fn(settings, ...args) }
  catch (e) { console.error('生成失败：' + (e.message || e)); process.exit(1) }
}

function requireConfig() {
  const cfg = loadConfig()
  if (!cfg.apiKey) {
    console.error('未配置 apiKey。请先运行: novel config set apiKey=你的KEY')
    process.exit(1)
  }
  return toSettings(cfg)
}

const HELP = `novel-cli - 网文创作命令行工具

用法:
  novel config show                          查看配置
  novel config set <key>=<value>             设置配置（provider/apiKey/model/baseURL/style/temperature）
  novel config providers                     列出可选 provider

  novel inspiration [题材] [--idea "..." --platform 番茄]      生成灵感卡
  novel titles [题材] [--idea "..." --platform 番茄]          生成书名
  novel synopsis --title "书名" [--genre 都市 --platform 番茄 --idea "..."]
  novel outline [--genre 都市 --selling "..."]
  novel volumes [--genre 都市 --count 3]
  novel chapters [--volume '{"index":1,...}' | --file vol.json]
  novel character [--name 主角 --role 主角 --genre 都市]
  novel relationships --chars '[{"name":"...","role":"..."}]'
  novel continue [--book-file novels.json --book-id xxx --summary "本章梗概"]
  novel volume-draft --chapters chapters.json [--book-file novels.json --book-id xxx]
  novel teardown <file.txt> | --text "..."
  novel list --book-file novels.json                          列出作品

通用选项:
  --out <file>     输出到文件
  --json           输出紧凑 JSON
  --help           显示帮助

示例:
  novel config set apiKey=sk-xxx
  novel config set provider=glm
  novel inspiration 末世 --idea "重生回末世前一天"
  novel titles 末世 --platform 起点
  novel continue --book-file novels.json --summary "主角觉醒异能"
`

async function main() {
  if (!cmd || cmd === '--help' || cmd === '-h') { console.log(HELP); return }

  if (cmd === 'config') {
    const sub = rest[0]
    if (sub === 'show') {
      const cfg = loadConfig()
      const masked = { ...cfg, apiKey: cfg.apiKey ? cfg.apiKey.slice(0, 6) + '***' : '(未设置)' }
      console.log(JSON.stringify(masked, null, 2))
      console.log('配置文件：' + configPath())
    } else if (sub === 'providers') {
      printProviders()
    } else if (sub === 'set') {
      const kv = parseKv(rest.slice(1))
      if (!Object.keys(kv).length) { console.error('用法: novel config set key=value'); process.exit(1) }
      const cfg = loadConfig()
      for (const [k, v] of Object.entries(kv)) {
        if (k === 'temperature') cfg[k] = Number(v)
        else cfg[k] = v
        // 切换 provider 时自动带出默认 baseURL/model
        if (k === 'provider') {
          const p = ai.providers.find((x) => x.v === v)
          if (p && !cfg.baseURL) cfg.baseURL = ''
          if (p && !cfg.model) cfg.model = ''
        }
      }
      const p = saveConfig(cfg)
      console.log('已保存到 ' + p)
    } else { console.log('用法: novel config show | set key=value | providers') }
    return
  }

  const opts = parseArgs(rest)
  const f = (k) => opts.flags[k]
  const pos = (i) => opts._[i]

  // 不需要 AI 的命令
  if (cmd === 'list') {
    if (!f('book-file')) { console.error('需要 --book-file <file>'); process.exit(1) }
    const arr = listBooks(f('book-file'))
    console.log('共 ' + arr.length + ' 本：')
    for (const b of arr) {
      const pin = b.pinned ? '📌 ' : '  '
      console.log(`${pin}${b.id}\t《${b.title}》\t${b.genre || '-'}\t${b.chapters}章/${b.words}字\t${b.status || ''}`)
    }
    return
  }

  // 以下命令需要 AI 配置
  const s = requireConfig()

  switch (cmd) {
    case 'inspiration': {
      const r = await run(ai.genInspirationAI, s, f('idea') || pos(0) || '', pos(0) || f('genre') || '都市', f('platform') || '番茄')
      out(r, opts); break
    }
    case 'titles': {
      const r = await run(ai.genTitlesAI, s, f('idea') || '', pos(0) || f('genre') || '都市', f('platform') || '番茄')
      out(r, opts); break
    }
    case 'synopsis': {
      const r = await run(ai.genSynopsisAI, s, f('title') || '未命名', f('genre') || '都市', f('platform') || '番茄', f('idea') || '')
      out(r, opts); break
    }
    case 'outline': {
      const r = await run(ai.genOutlineAI, s, f('genre') || '都市', f('selling') || '')
      out(r, opts); break
    }
    case 'volumes': {
      const r = await run(ai.genVolumesAI, s, f('genre') || '都市', Number(f('count') || 3))
      out(r, opts); break
    }
    case 'chapters': {
      let vol = f('volume')
      if (f('file')) vol = readFileSync(f('file'), 'utf-8')
      const r = await run(ai.genChaptersAI, s, vol ? JSON.parse(vol) : null)
      out(r, opts); break
    }
    case 'character': {
      const r = await run(ai.genCharacterAI, s, f('name') || '主角', f('role') || '主角', f('genre') || '都市')
      out(r, opts); break
    }
    case 'relationships': {
      const chars = f('chars') ? JSON.parse(f('chars')) : (f('file') ? JSON.parse(readFileSync(f('file'), 'utf-8')) : [])
      const r = await run(ai.genRelationshipsAI, s, chars)
      out(r, opts); break
    }
    case 'continue': {
      let ctx = {}, prevText = '', summary = f('summary') || '推进本章目标'
      if (f('book-file')) {
        const book = loadBook(f('book-file'), f('book-id'))
        ctx = buildCtx(book)
        prevText = ctx.prevText
      } else if (f('prev')) {
        prevText = f('prev')
      }
      const r = await run(ai.continueWritingAI, s, prevText, summary, ctx)
      out(r, opts); break
    }
    case 'volume-draft': {
      let chapters = f('chapters') ? JSON.parse(readFileSync(f('chapters'), 'utf-8')) : null
      if (!chapters) { console.error('需要 --chapters <file>（章纲 JSON）'); process.exit(1) }
      let ctx = {}
      if (f('book-file')) {
        const book = loadBook(f('book-file'), f('book-id'))
        ctx = buildCtx(book)
      }
      const r = await run(ai.genVolumeDraftAI, s, chapters, ctx)
      out(r, opts); break
    }
    case 'teardown': {
      let text = f('text') || ''
      const file = pos(0)
      if (!text && file && existsSync(file)) text = readFileSync(file, 'utf-8')
      if (!text) { console.error('需要正文：novel teardown <file.txt> 或 --text "..."'); process.exit(1) }
      const r = await run(ai.teardownBookAI, s, text)
      out(r, opts); break
    }
    default:
      console.error('未知命令: ' + cmd + '\n运行 novel --help 查看用法')
      process.exit(1)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
