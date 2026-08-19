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
  都市: ['签到系统', '神医传承', '战神归来', '赘婿隐藏身份', '学霸系统', '直播系统', '读心术', '鉴宝眼'],
  末世: ['空间囤货', '重生预知', '异能觉醒', '签到末世', '模拟器', '物资合成', '时间静止一小时'],
  玄幻: ['血脉觉醒', '签到系统', '随身老爷爷', '概念级能力', '吞噬进化', '万界商城', '剑灵共生'],
  仙侠: ['功法推演', '丹田种田', '雷劫淬体', '道心通明'],
  悬疑: ['规则怪谈', '预知碎片', '读心', '时间回溯', '阴阳眼', '现场重建'],
  重生: ['重生预知', '重来一次', '记忆回溯', '前世梦境'],
  系统: ['签到系统', '任务系统', '面板流', '模拟器', '成就解锁', '每日抽奖'],
  历史: ['史实预知', '随身粮仓', '工坊图纸', '人才雷达'],
  游戏: ['全息登录', '副本预知', '掉落倍增', 'NPC好感面板'],
  言情: ['心声读取', '情缘红线', '前世记忆', '甜度面板'],
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
    `我死后第三年，他们才发现我没错。`,
    `电话响起的时候，我正站在天台边。`,
  ])
  if (platform === '起点') {
    return `${hook}\n\n背景：${g}世界，${idea || '一个被低估的普通人'}。\n金手指：「${finger}」——${pick(['认主', '签到', '觉醒'])}，代价：${pick(['头痛欲裂', '冷却 24 小时', '消耗精神力'])}。\n主线：从被低估到逆袭，一路打脸升级，揭开背后真相。\n卖点：差异化金手指 / 反差打脸 / 情感代入 / 体系严谨。\n钩子：当真相浮出水面，他才发现，这一切才刚刚开始。`
  }
  // 番茄短简介：钩子 + 处境 + 金手指 + 爽点承诺 + 留白
  const closer = pick(['这辈子，我先动手。', '这一次，谁也别想再让我低头。', '我倒要看看，谁还敢动我的人。', '从今天起，规矩我来定。'])
  return `${hook}\n${idea || '一个被低估的普通人'}，意外获得「${finger}」。\n${pick(['被人踩在脚下的日子，到头了。', '那些看不起我的人，都要后悔。', '我手里攥着的，是他们的命门。'])}\n${closer}`
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
    '雨还没停。', '他推开门。', '她攥紧了手里的东西。', '电话在桌上震了起来。',
    '风从窗缝里灌进来。', '走廊尽头亮着一盏灯。', '钥匙在锁孔里转了半圈，停住了。',
  ])
  // 若有前文，尝试接续其最后一句的语气
  let bridge = ''
  if (prevText && prevText.trim()) {
    const last = prevText.trim().split(/[。\n！？]/).filter((x) => x.trim()).pop()
    if (last) bridge = `${last.trim()}。`
  }
  const mid = pick([
    '他没有说话，只是看着窗外。', '她咬了咬牙，没回头。', '空气安静得能听见心跳。',
    '他把手插进口袋，指节发白。', '她低头，盯着自己的鞋尖。', '他笑了一下，没出声。',
  ])
  const tail = pick([
    '脚步声从远处传来。', '门缝里漏进一道光。', '手机亮了。',
    '有人在敲门。三下，停一停，又三下。', '窗外传来一声尖叫，又断了。', '他听见自己的名字，从很远的地方飘过来。',
  ])
  return `${opener}\n\n${bridge}${s}。\n\n${mid}\n\n${tail}`
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

// 十二、拆书（本地回退：关键词匹配粗分析）
const GENRE_KEYWORDS = {
  末世: ['丧尸', '末世', '异种', '幸存者', '避难所', '废墟', '变异'],
  玄幻: ['灵气', '修仙', '丹田', '功法', '宗门', '境界', '元婴', '渡劫'],
  仙侠: ['飞剑', '道祖', '仙', '天劫', '法宝', '洞府'],
  都市: ['公司', '总裁', '都市', '签到', '系统', '直播', '学霸'],
  科幻: ['星际', '飞船', '机甲', '文明', '宇宙', '虫族', '智脑'],
  悬疑: ['案件', '侦探', '凶手', '线索', '诡异', '规则怪谈', '解谜'],
  重生: ['重生', '上辈子', '前世', '重来一次'],
  系统: ['系统', '面板', '任务', '签到', '抽奖', '成就'],
  历史: ['穿越', '大唐', '大明', '朝堂', '皇帝', '藩镇'],
  游戏: ['副本', '玩家', 'NPC', '全息', '登录', '掉落'],
}

const FINGER_KEYWORDS = ['系统', '签到', '面板', '模拟器', '读心', '透视', '空间', '重生', '预知', '传承', '老爷爷', '血脉', '吞噬', '商城', '成就', '抽奖', '任务']

export function teardownBook(text) {
  const t = text || ''
  const len = t.length
  // 题材判断：统计关键词命中
  let genre = '都市', maxHit = 0
  for (const [g, kws] of Object.entries(GENRE_KEYWORDS)) {
    let hit = 0
    for (const kw of kws) { let idx = t.indexOf(kw); while (idx >= 0) { hit++; idx = t.indexOf(kw, idx + 1) } }
    if (hit > maxHit) { maxHit = hit; genre = g }
  }
  // 金手指
  const fingers = FINGER_KEYWORDS.filter(kw => t.includes(kw))
  const finger = fingers[0] || '未明显识别'
  // 句子节奏统计
  const sentences = t.split(/[。！？\n]/).filter(s => s.trim()).filter(s => s.length < 200)
  const avgLen = sentences.length ? Math.round(sentences.reduce((a, s) => a + s.length, 0) / sentences.length) : 0
  const shortRatio = sentences.length ? Math.round(sentences.filter(s => s.length <= 15).length / sentences.length * 100) : 0
  // 章末钩子：取每章末尾短句（按「第X章」或空行粗切）
  const chunks = t.split(/\n\s*第[一二三四五六七八九十百零\d]+章/).filter(s => s.trim())
  const hooks = chunks.slice(0, 5).map(c => c.trim().slice(-30)).filter(s => s)
  // 卖点关键词
  const selling = []
  if (finger !== '未明显识别') selling.push(`金手指「${finger}」带来的差异化爽点`)
  if (/打脸|逆袭|震惊|不敢相信|倒吸一口凉气/.test(t)) selling.push('反差打脸爽点')
  if (/重生|前世|上辈子/.test(t)) selling.push('重生预知信息差')
  if (selling.length === 0) selling.push('需结合正文进一步提炼')
  // 硬伤粗判
  const flaws = []
  if (avgLen > 60) flaws.push('长句偏多，节奏可能拖沓')
  if (shortRatio < 15) flaws.push('短句占比低，对话感可能不足')
  if (!fingers.length) flaws.push('前文未识别到明确金手指，开篇钩子可能偏弱')
  if (len < 500) flaws.push('样本过短，分析仅供参考')
  return {
    genre,
    subgenre: '需 AI 模式精确判断',
    finger,
    selling,
    protagonist: { identity: '需 AI 模式分析', personality: '—', motive: '—', mark: '—' },
    opening: len > 500 ? '本地模式仅做节奏统计，开篇结构分析请开启 AI 模式' : '样本过短',
    pace: `平均句长 ${avgLen} 字，短句占比 ${shortRatio}%（${shortRatio >= 30 ? '节奏快/对话多' : shortRatio >= 15 ? '节奏适中' : '偏叙述，节奏可能偏慢'}）`,
    hooks,
    tropes: fingers.length ? [`${genre}常见套路：${fingers.slice(0, 3).join('、')}`] : ['需 AI 模式识别'],
    takeaways: ['本地模式为粗分析，开启 AI 模式可获得深度拆解'],
    flaws,
    summary: `本地粗判：${genre}题材，金手指「${finger}」，${shortRatio >= 30 ? '快节奏' : '中慢节奏'}。开启 AI 模式可获完整拆书报告。`,
  }
}
