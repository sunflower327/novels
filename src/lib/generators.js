// 把 novel-trend-writing skill 的模板/公式移植为本地生成函数（模板生成，非真实 AI）

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const range = (n) => Array.from({ length: n }, (_, i) => i)

// 题材库（来自 reference.md）
export const GENRES = [
  '都市', '玄幻', '仙侠', '科幻', '末世', '历史', '悬疑', '灵异',
  '游戏', '网游', '女频', '言情', '年代', '种田', '系统', '重生',
]
export const PLATFORMS = ['番茄', '起点', '通用']

const GOLDEN_FINGERS = {
  都市: ['签到系统', '神医传承', '战神归来', '赘婿隐藏身份', '学霸系统', '直播系统'],
  末世: ['空间囤货', '重生预知', '异能觉醒', '签到末世', '模拟器'],
  玄幻: ['血脉觉醒', '签到系统', '随身老爷爷', '概念级能力', '吞噬进化'],
  悬疑: ['规则怪谈', '预知碎片', '读心', '时间回溯', '阴阳眼'],
  重生: ['重生预知', '重来一次', '记忆回溯'],
  系统: ['签到系统', '任务系统', '面板流', '模拟器'],
}
const gf = (g) => pick(GOLDEN_FINGERS[g] || ['签到系统', '异能觉醒', '重生预知'])

// 一、灵感卡
export function genInspiration(idea, genre, platform) {
  if (!idea) idea = '一个普通人获得某种特殊能力'
  const finger = gf(genre || '都市')
  return {
    core: idea,
    genre: genre || '都市',
    platform: platform || '番茄',
    finger,
    cost: pick(['使用会剧烈头痛', '每次冷却 24 小时', '消耗精神力，过度会昏迷', '会听到不想听的真话']),
    skeleton: [
      `起：${idea}——开篇即抛钩子，金手指「${finger}」亮相`,
      `承：靠金手指试炼升级，每 10 章一个小爽点`,
      `转：真相/挫折降临，金手指代价显现`,
      `合：决战收束，主题点题`,
    ],
    selling: [
      `金手指「${finger}」带来的差异化爽点`,
      `反差打脸：被低估到逆袭`,
      `情感/亲情线增加代入`,
    ],
    risk: ['能力易开挂，需加代价与局限', '题材同质化，前 3 章须打出差异', '节奏拖沓风险'],
    directions: ['A 职场/都市逆袭', 'B 情感悬疑', 'C 悬疑破案/解谜'],
  }
}

// 二、书名取名
export function genTitles(idea, genre, platform) {
  const g = genre || '都市'
  const kw = (idea || '').slice(0, 6) || pick(['末世', '重生', '都市', '玄幻'])
  const out = []
  out.push(`《${kw}之${pick(['我有一个' + gf(g), '从零开始', '隐藏大佬', '满级开局'])}》`)
  out.push(`《我在${kw || pick(['末世', '都市'])}找${pick(['闺蜜', '真相', '回家路'])}》`)
  out.push(`《${pick(['满级', '重生', '神医'])}大佬${pick(['从摆摊开始', '回归都市', '重生后'])}》`)
  out.push(`《${kw || g}：${pick(['签到开局', '系统降临', '我无敌了', '从今天开始'])}》`)
  out.push(`《${pick(['谁动', '我在', '别拦'])}了我的${pick(['命运线', '金手指', '主角光环'])}》`)
  out.push(`《${g}之${pick(['最强', '无敌', '签到', '崛起'])}》`)
  return out.slice(0, 6)
}

// 三、简介
export function genSynopsis(title, genre, platform, idea) {
  const g = genre || '都市'
  const finger = gf(g)
  const hook = pick([
    `这一次，我不会再输。`,
    `所有人都以为我完了。`,
    `重活一世，我要把失去的都拿回来。`,
    `那道裂缝打开的时候，世界变了。`,
  ])
  if (platform === '起点') {
    return `${hook}\n\n背景：${g}世界，${idea || '一个被低估的普通人'}。\n金手指：「${finger}」——${pick(['认主', '签到', '觉醒'])}，代价：${pick(['头痛欲裂', '冷却 24 小时', '消耗精神力'])}。\n主线：从被低估到逆袭，一路打脸升级，揭开背后真相。\n卖点：差异化金手指 / 反差打脸 / 情感代入 / 体系严谨。\n钩子：当真相浮出水面，他才发现，这一切才刚刚开始。`
  }
  return `${hook}\n${idea || '一个被低估的普通人'}，意外获得「${finger}」。\n这辈子，我先动手。`
}

// 四、总纲
export function genOutline(genre, selling) {
  const g = genre || '都市'
  return `【总纲】题材：${g}\n核心卖点：${selling || '差异化金手指 + 反差打脸 + 情感代入'}\n主线：主角获得「${gf(g)}」，从被低估到逆袭，揭开真相，决战收束。\n结构：单线升级流，每 10 章一爽点，卷末必留钩子。\n主题：不是找到了对方，而是都找到了自己。`
}

// 五、卷纲
export function genVolumeOutline(genre, volCount) {
  const n = Math.max(1, Math.min(5, volCount || 3))
  const volNames = ['暴雨之夜', '去雾海找你', '天坠前夜', '深雾之下', '回家']
  return range(n).map((i) => ({
    index: i + 1,
    name: volNames[i] || `第${i + 1}卷`,
    goal: `本卷目标：阶段升级 + 一次大转折，卷末留钩子衔接下卷`,
    stages: ['入局（1-6章）', '扎根（7-18章）', '试炼（19-32章）', '高潮（33-48章）', '收束（49-67章）'],
    hook: pick(['申请单拍在台面上', '白光吞没一切', '门外传来一声叹息', '他回头，笑了']),
  }))
}

// 六、章纲
export function genChapterOutline(volume) {
  const total = 10
  return range(total).map((i) => ({
    index: i + 1,
    title: `第${i + 1}章 ${pick(['雨夜信物', '雷霆之下', '落脚', '第一滴血', '约定', '夜话', '旧巷', '突破', '守城', '启程'])}`,
    summary: `推进本卷目标，安排一个${i % 3 === 2 ? '小高潮/打脸' : '铺垫'}节点。`,
    hook: pick(['身后传来脚步声', '她抬起头，没说话', '门缝里透出白光', '他还不知道，这一切才刚开始', '电话响了']),
  }))
}

// 七、角色卡
export function genCharacter(name, role, genre) {
  const g = genre || '都市'
  return {
    name: name || '主角',
    role: role || '主角',
    identity: pick(['普通人', '隐藏大佬', '落魄者', '归来者']),
    personality: pick(['沉稳内敛', '外冷内热', '话少心细', '嬉皮笑脸']) + '，' + pick(['重情义', '认死理', '不服输']),
    ability: `${gf(g)}（代价：${pick(['头痛', '冷却', '精神消耗'])}）`,
    motive: `外在：${pick(['找回亲人', '回家', '翻身'])}；内在：${pick(['被认可', '不再失去', '证明自己'])}`,
    arc: `起点：被低估 → 终点：${pick(['逆袭归来', '找到自己', '守护所爱'])}`,
    mark: pick(['习惯攥平安扣', '说话前先停一秒', '从不回头', '爱说"我没事"']),
    flaw: pick(['过度自责', '不信任他人', '冲动', '执念太深']),
  }
}

// 八、角色关系
export function genRelationships(chars) {
  if (!chars || chars.length < 2) return '至少需要 2 个角色才能生成关系。'
  const lines = []
  const rels = ['情感', '敌对', '师徒', '亲属', '利益', '利用']
  for (let i = 0; i < chars.length; i++) {
    for (let j = i + 1; j < chars.length; j++) {
      lines.push(`${chars[i].name} --${pick(rels)}--> ${chars[j].name}`)
    }
  }
  return lines.join('\n')
}

// 九、续写正文（模板生成草稿）
export function continueWriting(prevText, chapterSummary, style) {
  const s = chapterSummary || '推进当前章目标'
  const opener = pick([
    '雨还没停。',
    '他推开门。',
    '她攥紧了手里的东西。',
    '电话在桌上震了起来。',
  ])
  const body = `${opener}\n\n${s}。\n\n${pick(['他没有说话，只是看着窗外。', '她咬了咬牙，没回头。', '空气安静得能听见心跳。'])}\n\n${pick(['脚步声从远处传来。', '门缝里漏进一道光。', '手机亮了。'])}`
  return body
}

// 十、去 AI 痕迹
const AI_WORDS = ['宛如', '仿佛', '犹如', '恍若', '不禁', '缓缓', '淡淡地', '微微', '嘴角上扬', '嘴角勾起', '眼中闪过', '眸中掠过', '一抹', '一缕', '一丝', '此刻', '霎时间', '综上所述', '值得注意的是', '首先', '其次']

export function diagnoseAI(text) {
  const hits = []
  for (const w of AI_WORDS) {
    let idx = text.indexOf(w)
    while (idx >= 0) {
      hits.push({ word: w, index: idx })
      idx = text.indexOf(w, idx + 1)
    }
  }
  return hits
}

export function deAI(text) {
  let t = text
  const replace = [
    ['不禁缓缓', ''], ['不禁', ''], ['缓缓', ''], ['淡淡地', ''], ['微微', ''],
    ['宛如', '像'], ['仿佛', '像'], ['犹如', '像'], ['恍若', '像'],
    ['嘴角上扬', '笑了一下'], ['嘴角勾起一抹若有若无的笑意', '笑了一下'], ['嘴角勾起', '笑'],
    ['眼中闪过一丝', '眼里有'], ['眸中掠过', '眼里有'], ['眼中闪过', '眼里有'],
    ['一抹', '一点'], ['一缕', '一点'], ['此刻', '这时'], ['霎时间', '一下'],
    ['综上所述', ''], ['值得注意的是', ''], ['首先', ''], ['其次', ''],
  ]
  for (const [a, b] of replace) t = t.split(a).join(b)
  // 合并多余标点
  t = t.replace(/，{2,}/g, '，').replace(/。{2,}/g, '。').replace(/，。/g, '。').replace(/\s{2,}/g, ' ')
  return t
}

// 十一、投稿评估
export function evalSubmission({ title, synopsis, platform, opening }) {
  const checks = []
  const pass = (k, s, ok, tip) => checks.push({ item: k, standard: s, status: ok, tip })
  const titleLen = (title || '').length
  pass('书名', '4-12字含卖点词', titleLen >= 2 && titleLen <= 16 ? '✅' : '⚠️', titleLen < 2 ? '书名过短' : '建议含题材/卖点关键词')
  const synLen = (synopsis || '').length
  const want = platform === '起点' ? [200, 400] : [50, 150]
  pass('简介', `${want[0]}-${want[1]}字`, synLen >= want[0] && synLen <= want[1] ? '✅' : '⚠️', `当前 ${synLen} 字，建议 ${want[0]}-${want[1]}`)
  pass('黄金三章', '金手指+首爽+冲突+钩子', opening && opening.length > 50 ? '✅' : '⚠️', '开篇前3章须亮相金手指、首个爽点、核心冲突、章末钩子')
  pass('平台匹配', '题材契合调性', '✅', `${platform}向`)
  pass('合规', '无敏感词/违规', /暴力|色情|政治/.test(synopsis || '') ? '❌' : '✅', '避免低俗/血腥/政治敏感/导流')
  return checks
}
