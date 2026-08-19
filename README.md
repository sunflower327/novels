<div align="center">

# 📖 网文创作与阅读

**一站式网文创作工作台 · 灵感 → 大纲 → 续写 → 润色 → 投稿评估**

基于 `novel-trend-writing` skill 打造 · Vue 3 + Vite · 纯前端 · 数据本地存储

</div>

<br>

> ✨ 把"番茄/起点网文写作方法论"装进一个网站：从一句脑洞到一本可读小说，全流程辅助创作，还能随时翻阅内置的网文知识库。

---

## 🌟 核心亮点

| 🎯 能力 | 💡 说明 |
|---|---|
| **🤖 AI 生成内容** | 接入智谱/通义/DeepSeek/OpenAI，灵感/书名/简介/大纲/角色/续写/拆书全流程 AI 生成 |
| **🧠 灵感脑洞扩展** | 一句话脑洞 → 灵感卡（核心/金手指/主线骨架/卖点/风险/走向） |
| **🏷️ 书名取名** | 按平台规律生成直白/悬念/反差/系列/梗型多款备选 |
| **📝 简介生成** | 番茄短简介 / 起点长简介，按公式含钩子与卖点 |
| **🗂️ 分层大纲** | 总纲 → 卷纲 → 章纲，自动铺爽点密度与卷末钩子 |
| **👥 角色与关系** | 角色卡（性格/能力/动机/弧光/标志动作）+ 关系描述 |
| **✍️ 续写正文** | 给梗概即可生成草稿，存为章节，自动入库 |
| **⚡ 一键整卷** | 按章纲批量 AI 生成多章正文草稿并入库 |
| **🔗 章纲→续写联动** | 章纲一键带入续写梗概，续写完一键送去除 AI 痕迹 |
| **🧹 去 AI 痕迹** | 诊断 AI 高频词 + 一键真人化润色 |
| **🔍 拆书分析** | 粘贴/上传正文 → 结构化拆解报告，可一键转为新作品模板 |
| **📊 投稿评估** | 按番茄/起点标准逐项打分（✅/⚠️/❌）+ 修改建议 |
| **📚 技能知识库** | 内置 skill 全文（题材库/读者画像/节奏公式/套路库/硬伤清单）随时查阅 |
| **📖 书架阅读** | 浏览/阅读/删除作品，阅读器含目录、字号调节、上下章导航、阅读进度记忆 |
| **🗃️ 书架管理** | 按题材/状态筛选、置顶、搜索、排序 |
| **📊 字数统计** | 书架显示总字数，创作页显示本章/累计字数与目标进度条 |
| **💾 保存状态可见** | 创作页顶部实时显示「已保存于 HH:MM」 |
| **📤 导出 txt** | 阅读器一键导出整本纯文本 |
| **🖥️ 命令行工具** | novel-cli，在 Cursor/Qoder 终端用命令驱动 AI 生成 |

---

## 🖼️ 功能预览

- **书架**：作品卡片墙，按题材/状态筛选、置顶、搜索、排序，卡片显示总字数，一键阅读/编辑/删除
- **创作工作台**：分步流程，步步生成、可手动编辑、自动存盘，顶部显示保存时间，续写区显示字数与目标进度条
- **拆书**：粘贴或上传 txt → 结构化拆解报告，一键转为新作品模板
- **阅读器**：左侧目录 + 右侧正文，沉浸式阅读，字号调节，上下章导航，记忆阅读进度，一键导出 txt
- **知识库**：三标签页渲染 SKILL / 参考 / 示例全文

---

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# → 打开 http://localhost:5173

# 打包构建
npm run build
# → 产物输出至 dist/
```

> 无需后端、无需数据库 —— 打开即用，数据保存在浏览器 localStorage。可选接入 AI 后，生成质量大幅提升。

---

## 🤖 AI 生成内容

创作工作台顶部「🤖 AI 未开启/已开启」按钮打开设置，开启后各生成环节全部走真实 AI；未开启或未配置时自动回退到本地模板（原逻辑不变）。

### 支持的 AI 生成环节

| 环节 | AI 生成内容 |
|------|------------|
| 灵感 | 灵感卡（金手指/代价/起承转合/卖点/风险/方向） |
| 书名 | 6 个符合平台调性的书名备选 |
| 简介 | 番茄短简介 / 起点长简介 |
| 总纲 | 题材/卖点/主线/结构/主题 |
| 卷纲 | 多卷卷纲（目标/阶段/钩子） |
| 章纲 | 10 章章纲（标题/梗概/钩子） |
| 角色 | 角色卡（身份/性格/能力/动机/弧光/弱点） |
| 关系 | 角色关系网络 |
| 续写 | 400-800 字正文（带入角色卡/总纲/前章梗概，保持人设连贯，章末钩子） |
| 整卷 | 按章纲批量生成多章正文草稿 |
| 拆书 | 结构化拆解报告（题材/金手指/开篇/节奏/钩子/套路/借鉴点/硬伤） |

### AI 服务配置

支持 OpenAI 兼容接口，预置 5 个服务商：

| 服务商 | Base URL | 推荐模型 | 备注 |
|--------|---------|---------|------|
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4` | `glm-4-flash` | 🇨🇳 有免费额度，推荐国内使用 |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-turbo` | 🇨🇳 阿里云 |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` | 性价比高 |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` | 需科学上网 |
| 自定义 | 任意 OpenAI 兼容端点 | — | 支持私有部署 |

可配置：服务商、Base URL、API Key、模型、温度、续写风格（番茄风/起点风/严肃文学风）。**API Key 仅保存在本地浏览器，不会上传。**

### 平台调性适配

AI prompt 内置平台调性提示，生成内容更贴合目标平台：
- **番茄风** — 快节奏、爽点前置、口语化
- **起点风** — 体系严谨、世界观扎实、爽点密集
- **严肃文学风** — 文笔细腻、节奏沉稳

---

## 🖥️ 命令行工具 novel-cli

除了网页端，还提供 `novel-cli`，可在 **Cursor / Qoder / 任意终端** 用命令驱动 AI 生成，复用 web 版同一套 AI 逻辑。

### 安装

```bash
cd web/cli
npm link          # 全局注册 novel 命令
```

### 配置

```bash
novel config set provider=glm
novel config set apiKey=你的KEY
novel config show
```

### 命令

```bash
novel inspiration 末世 --idea "重生回末世前一天"   # 灵感卡
novel titles 末世 --platform 起点                  # 书名
novel synopsis --title "书名"                      # 简介
novel outline --genre 都市                         # 总纲
novel volumes --count 3                            # 卷纲
novel chapters --file vol.json                     # 章纲
novel character --name 主角                        # 角色卡
novel continue --book-file novels.json --book-id xxx --summary "本章梗概"  # 带上下文续写
novel volume-draft --chapters ch.json              # 一键整卷
novel teardown book.txt                            # 拆书
novel list --book-file novels.json                 # 列出作品
```

通用选项 `--out <file>` 输出到文件、`--json` 紧凑 JSON 输出。

**与 web 数据联动**：`continue` / `volume-draft` 支持 `--book-file` 读取 web 导出的作品 JSON，自动带入角色卡 + 总纲 + 前 3 章梗概作为上下文，保持人设剧情连贯。详见 `cli/README.md`。

---

## 📁 项目结构

```
web/
├─ index.html
├─ package.json
├─ cli/                  # novel-cli 命令行工具（Cursor/Qoder 终端用命令驱动 AI）
│  ├─ bin.mjs            # 入口（命令分发）
│  ├─ package.json
│  ├─ README.md
│  └─ src/
│     ├─ config.mjs       # 配置管理（~/.novel-cli.json）
│     └─ data.mjs        # 读取导出作品 JSON 作为续写上下文
└─ src/
   ├─ main.js              # 入口 + 路由
   ├─ router.js            # 路由（书架/阅读/创作/拆书/知识库）
   ├─ store.js             # localStorage 存储层（含字数统计/置顶/导出txt）
   ├─ style.css            # 深色主题样式
   ├─ App.vue              # 导航 + 布局
   ├─ lib/
   │  ├─ generators.js     # skill 模板移植：灵感/书名/简介/大纲/角色/续写/拆书/去AI/评估（本地回退）
   │  └─ ai.js             # AI 生成服务（多 provider / prompt / JSON 解析 / 上下文续写 / 整卷 / 拆书 / 智能回退）
   ├─ skills/              # 内置 skill 原文（SKILL/reference/examples）
   └─ views/
      ├─ Home.vue          # 书架（筛选/置顶/搜索/字数）
      ├─ Reader.vue        # 阅读器（进度记忆/导出txt）
      ├─ Writer.vue        # 创作工作台（分步/字数进度/章纲联动/续写流转/一键整卷）
      ├─ Teardown.vue      # 拆书（粘贴/上传txt/转新作品）
      └─ SkillKB.vue       # 技能知识库
```

---

## 🧩 技术栈

- **Vue 3** + **Vite** — 现代前端框架与构建工具
- **Vue Router 4** — hash 路由
- **marked** — Markdown 渲染（知识库页）
- **OpenAI 兼容 API** — AI 内容生成（智谱/通义/DeepSeek/OpenAI）
- **localStorage** — 本地持久化，零后端依赖
- **Node.js CLI** — novel-cli 命令行工具，复用 web 版 AI 逻辑

---

## 🔧 定制与扩展

生成逻辑集中在 `src/lib/`：
- `generators.js` — 本地模板生成（按 skill 公式产出结构化草稿），无需联网即可用
- `ai.js` — AI 生成服务，开启 AI 模式后优先调用，失败/未配置时自动回退到 `generators.js`。续写支持上下文（角色卡/总纲/前章梗概），另含一键整卷、拆书等能力

命令行工具在 `cli/`，复用 `ai.js` 的全部生成函数，配置存 `~/.novel-cli.json`。

**新增 AI 服务商**：在 `ai.js` 的 `providers` 数组追加 `{ v, label, baseURL, model }` 即可（CLI 会自动同步）。

**内置知识库更新**：替换 `src/skills/` 下的 `SKILL.md` / `reference.md` / `examples.md` 即可刷新知识库页内容。

---

## 📌 适用场景

- 📚 网文新手系统学习选题/大纲/套路方法论
- ✍️ 快速产出小说骨架与续写草稿
- ⚡ 按章纲一键批量生成整卷正文
- 🔍 拆解他人作品，提炼可借鉴点并转为创作模板
- 🧹 给已有正文做"去 AI 味"润色
- 📊 评估作品是否符合番茄/起点投稿标准
- 📖 个人轻量写作管理与阅读
- 🖥️ 在 Cursor/Qoder 终端用命令驱动 AI 生成，融入编辑器工作流

---

<div align="center">

**基于 [novel-trend-writing](.) skill · 本地模板 + AI 双模式 · 网页端 + 命令行 · 数据存于浏览器**

⭐ 如果这个项目对你有帮助，欢迎 Star 支持！

</div>
