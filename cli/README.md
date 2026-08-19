# novel-cli · 网文创作命令行工具

在 **Cursor / Qoder / 任意终端** 用命令生成灵感、书名、简介、大纲、章纲、角色、续写、拆书。
复用 `web` 版的 AI 能力（OpenAI 兼容接口），零依赖，纯 Node.js（≥18）。

## 安装

```bash
cd D:\xushr\小说\cli
npm link          # 全局注册 novel 命令
```

之后在任意目录直接用 `novel <命令>`。

## 配置 AI

配置存于 `~/.novel-cli.json`，首次使用需设置 apiKey：

```bash
novel config set provider=glm
novel config set apiKey=你的KEY
novel config set model=glm-4-flash      # 可选，留空用 provider 默认
novel config set baseURL=               # 可选，自定义接口地址
novel config set style=番茄              # 番茄/起点/严肃文学，影响续写语气
novel config set temperature=0.85
novel config show                       # 查看配置（key 已脱敏）
novel config providers                   # 列出可选 provider
```

| provider | 平台 | 默认模型 |
|----------|------|----------|
| openai | OpenAI | gpt-4o-mini |
| glm | 智谱 GLM | glm-4-flash |
| dashscope | 通义千问 | qwen-turbo |
| deepseek | DeepSeek | deepseek-chat |
| custom | 自定义 | 需手动填 baseURL/model |

## 命令一览

```bash
novel inspiration [题材] [--idea "..." --platform 番茄]      # 灵感卡
novel titles [题材] [--idea "..." --platform 番茄]            # 书名
novel synopsis --title "书名" [--genre 都市 --platform 番茄 --idea "..."]
novel outline [--genre 都市 --selling "..."]                  # 总纲
novel volumes [--genre 都市 --count 3]                        # 卷纲
novel chapters [--volume '{"index":1,...}' | --file vol.json] # 章纲
novel character [--name 主角 --role 主角 --genre 都市]        # 角色卡
novel relationships --chars '[{"name":"...","role":"..."}]'   # 关系网
novel continue [--book-file novels.json --book-id xxx --summary "本章梗概"]
novel volume-draft --chapters chapters.json [--book-file novels.json --book-id xxx]
novel teardown <file.txt> | --text "..."                      # 拆书
novel list --book-file novels.json                            # 列出作品
```

通用选项：
- `--out <file>` 输出到文件
- `--json` 输出紧凑 JSON

## 与 web 数据联动

CLI 可读取 web 版导出的作品 JSON 作为续写/整卷的上下文（角色卡 + 总纲 + 前 3 章梗概），保持人设与剧情连贯。

1. 在 web 书架点「导出」得到 JSON 文件（或用 `novel list` 确认 id）
2. 续写时带上 `--book-file` 和 `--book-id`：

```bash
novel continue --book-file novels.json --book-id msy82wg9cc6rgu --summary "主角觉醒异能，首次反杀"
```

## 在 Cursor / Qoder 中使用

- 直接在集成终端运行上述命令，生成结果可 `--out` 写入文件后用编辑器打开。
- 也可把常用命令存为 `.vscode/tasks.json` 或 Qoder 的任务/快捷指令，一键执行。
- 续写草稿写入 `.txt` 后，可直接在编辑器里润色，再粘贴回 web 作品库。

## 示例

```bash
# 1. 末世题材灵感
novel inspiration 末世 --idea "重生回末世前一天"

# 2. 生成 6 个书名
novel titles 末世 --platform 起点 --out titles.json

# 3. 拆解一段正文
novel teardown sample/book.txt --out report.json

# 4. 带上下文续写
novel continue --book-file sample/novels.json --summary "平安扣再次发光" --out ch2.txt
```
