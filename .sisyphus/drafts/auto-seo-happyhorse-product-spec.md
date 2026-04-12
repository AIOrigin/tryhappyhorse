# Auto SEO / HappyHorse 首站产品需求 Spec

## 1. 文档定位

本文件将 `README.md` 重构为一份可执行、可评审、决策完整的产品需求 Spec。

文档覆盖两层范围：

1. **[MVP] HappyHorse 首站**：围绕 `tryhappyhorse.xyz` 的首个趋势捕获站点。
2. **[Framework] 可复用 Auto SEO 框架**：未来复用到下一个热点模型的规则、模板与运营流程。

### 本文默认决策

为避免执行时出现空白判断，本文采用以下默认决策：

1. **站点内容语言**：站点面向全球英文搜索市场；本 spec 以中文撰写。
2. **主转化目标**：MVP 站点的首要业务转化为 **in-site video generation activation**，即用户在站内启动生成并成功拿到结果。
3. **备选转化目标**：邮箱收集 / waitlist 提交可以作为次级承接，但不得再次把 lead capture 写成唯一主路径。
4. **首发范围**：采用 `Must Launch / Should Launch / Backlog` 三级范围，不按 README 中的 12 路由一次性全部上线。
5. **框架边界**：本次只定义规则、模板、评分、工作流与验收标准，不定义 CMS、数据库或自动化实现架构。

---

## 2. 背景与机会

`HappyHorse` 已进入早期 breakout 阶段，搜索意图开始从品牌词扩展到 explainer、comparison、open-source、repo、prompt、alternative、try it now 等长尾方向。当前窗口适合用一个轻量、非官方、以转化为导向的趋势站点快速抢占流量，并把高意图流量直接承接到站内生成动作。

本项目的核心逻辑不是“做一个单页站”，而是验证一套可复制的方法论：

`趋势信号 -> 意图聚类 -> 页面生产 -> SEO 抢位 -> 站内生成 / CTA 转化 -> 复盘扩张`

HappyHorse 只是第一轮验证对象，不是长期唯一主题。

---

## 3. 产品目标

### 3.1 核心目标

1. 用一个非官方、SEO-first 的 HappyHorse 站点捕获相关高意图搜索流量。
2. 把搜索流量导向明确的主转化动作，优先承接到站内视频生成，而不是停留在纯阅读。
3. 验证一套可以迁移到下一个 AI 热点模型的 Auto SEO 运营框架。

### 3.2 业务成功定义

1. 首个页面在确认热点后 `24 小时` 内上线。
2. Must Launch 页面在 `7 天` 内完成发布、索引申请与初轮复盘。
3. 站点的主要页面都具备明确 CTA、免责声明，以及导向 `/try-happyhorse/` 的清晰产品动作。
4. 至少有一类页面（explainer 或 comparison）成为后续可放大的流量基座。

### 3.3 非目标

以下内容明确 **不属于本次需求范围**：

1. 构建完整 CMS、数据库、自动化内容流水线。
2. 支持多语言站点、多域名、多热点并行管理。
3. 把站点包装成 `HappyHorse` 官方站、官方 API、官方入口或官方合作页。
4. 围绕尚未验证的功能写出“像已存在一样”的产品承诺。
5. 以广告浏览量为主要目标而忽略站内生成或其他主转化动作。

---

## 4. 用户角色

### 4.1 访客用户

1. **AI 初学者创作者**：看到新闻后搜索 “what is happyhorse / try happyhorse / happyhorse prompts”，并希望直接在站内试一次。
2. **内容/社媒操作者**：希望判断模型是否值得尝试，尤其关注比较与替代方案。
3. **学生或轻量实验者**：希望快速理解模型、找入口、试生成、找开源状态或相似工具。

### 4.2 运营用户

1. **站点运营者**：每天捕捉趋势、判断是否值得建页、安排发布节奏。
2. **内容生产者**：基于统一页面模型生成页面、补 FAQ、补 CTA、补内链。
3. **增长负责人**：复盘索引、点击、生成启动、生成成功/失败、CTA、转化，决定扩张还是停止投入。

---

## 5. 产品原则与硬性约束

1. **非官方原则**：站点必须始终以独立信息/比较资源定位出现。
2. **一页一意图原则**：每个页面只有一个 primary intent，不允许多个核心搜索意图混写。
3. **一页一主 CTA 原则**：每个页面只能有一个主 CTA 类型，避免转化目标漂移。
4. **先回答再转化原则**：页面首屏必须先回答搜索问题，再给出 CTA。
5. **事实透明原则**：对未知、未公开、未验证信息，必须明确标记“当前无法验证”或“截至最近更新暂无公开证据”。
6. **反 AI 废话原则**：禁止堆砌泛泛文案、空洞定义或无信息增量的改写。
7. **最小可发布原则**：优先上线少量高意图、高区分度页面，不追求一次铺满所有路由。
8. **最小架构变更原则**：保留 Astro 为站点框架，新增能力优先通过 `/try-happyhorse/` 页面内的前端生成流完成，不额外引入完整后端平台。

---

## 6. 范围定义

### 6.1 [MVP] HappyHorse 首站 Must / Should / Backlog

#### Must

1. 上线首页 + 5 个核心意图页。
2. 所有 Must 页面具备统一页面模型：标题、H1、above-the-fold answer、key facts、why it matters、主 CTA、related links、FAQ、免责声明、结构化数据。
3. 全站具备统一免责声明与品牌使用限制。
4. 全站主转化路径明确，且 `/try-happyhorse/` 作为 canonical app/access 入口可被统计。
5. Must 页面之间形成最小内链网，避免孤页。
6. 站内生成流程支持每位用户最多 2 次免费生成，并具备成功、失败、限额三种明确状态。

#### Should

1. 上线辅助信任页与 supporting intent 页。
2. 补充分发动作：X 帖子、短社媒文案、prompt 样例、邮件提及。
3. 补充复盘机制：Day 3 / 7 / 14 / 30 定期复查。

#### Backlog

1. 扩展 news hub、model hub、更多 compare 页面。
2. 为后续热点复制整套页面与运营模板。
3. 自动化趋势发现或自动化建页流程。

### 6.2 [Framework] 可复用 Auto SEO 框架 Must / Should / Won’t

#### Must

1. 定义趋势筛选评分机制。
2. 定义统一页面 schema 与 CTA taxonomy。
3. 定义发布、分发、复盘、扩张、归档的流程门槛。
4. 定义事实不确定、品牌风险、内容重叠时的处理规则。

#### Should

1. 允许未来把模型名、竞争对手、prompt 样例替换后复用。
2. 提供标准页面类型：explainer、comparison、repo/access、prompt、alternatives。

#### Won’t

1. 不在本次 spec 中定义自动化生成系统架构。
2. 不在本次 spec 中定义跨多个热点的内容排期系统。

---

## 7. MVP 页面清单（唯一版本）

### 7.1 Must Launch

| Path | Page Type | Primary Intent | Primary CTA Type | Business Goal | Why Included |
| --- | --- | --- | --- | --- | --- |
| `/` | Hub / Homepage | brand explainer + navigation hub | `try_now` | generation activation | 全站入口，承接品牌词、核心说明与站内产品动作 |
| `/what-is-happyhorse/` | Explainer | what is / model explainer | `try_now` | generation activation | 最核心的 explainer intent，并导流到站内试用 |
| `/happyhorse-vs-seedance/` | Comparison | comparison intent | `compare_now` | alternative evaluation | 对比意图强，商业价值高 |
| `/try-happyhorse/` | App / Access | can I try it now | `try_now` | generation activation | canonical app/access 入口，承接站内生成、额度说明与 API 接入事实 |
| `/happyhorse-alternatives/` | Alternatives | alternative intent | `see_alternatives` | commercial redirection | 适合转化到替代方案或相关产品 |
| `/happyhorse-prompts/` | Prompt library | prompt / template intent | `get_prompts` | creator activation | 强行动意图，适合把 prompt 使用导向生成流程 |

### 7.2 Should Launch

| Path | Page Type | Primary Intent | Primary CTA Type | Business Goal | Why Included |
| --- | --- | --- | --- | --- | --- |
| `/happyhorse-github/` | Repo status | repo / github intent | `try_now` | generation activation | 强搜索意图，可把“找源码的人”安全导向已上线产品动作 |
| `/happyhorse-open-source/` | Open-source status | open-source intent | `see_alternatives` | expectation reset | 可承接“是否开源”的高频疑问 |
| `/best-ai-video-models/` | Category comparison | category intent | `see_alternatives` | multi-option discovery | 作为扩展 hub 与后续热点入口 |

### 7.3 Backlog / Not in MVP

| Path | Decision | Reason |
| --- | --- | --- |
| `/seedance-vs-happyhorse/` | Not in MVP | 与 `/happyhorse-vs-seedance/` 高度重复，容易内容蚕食 |
| `/happyhorse-api/` | Merge into `/try-happyhorse/` first | 官方 API 状态可能不明确，先并入 access 页面避免碎片化 |
| `/happyhorse-hugging-face/` | Backlog | 只有在确有公开资产时再单独拆页 |
| `/happyhorse-alibaba/` | Backlog | 属于品牌背景说明，可在 explainer 中先覆盖 |
| `/news/` | Backlog | 首期不做持续新闻频道，避免把 MVP 做成媒体站 |

### 7.4 页面边界规则

1. 比较意图只保留 **一个 canonical comparison page**，即 `/happyhorse-vs-seedance/`。
2. 访问/试用/API/入口/站内生成相关问题在 MVP 阶段合并到 `/try-happyhorse/`，避免多个低信息差页面互相竞争。
3. 若某类信息无公开可靠来源，不得为占位而强行单独建页。
4. 新页面只能在满足“独立 primary intent + 独立 CTA + 独立信息增量”三项条件时创建。

---

## 8. 核心需求

### 8.1 [MVP] 站点与页面需求

#### MUST-01 站点定位

站点必须被定义为 **独立的 HappyHorse 信息、比较、prompt 与站内生成入口资源**，不得出现任何官方暗示。

#### MUST-02 首页职责

首页必须同时承担以下职责：

1. 用一句话解释 HappyHorse 是什么。
2. 说明站点为何值得访问。
3. 提供导向 `/try-happyhorse/` 的主 CTA。
4. 将访客分发到 explainer、comparison、access、alternatives 四类核心页面。
5. 在首屏或首屏后第一视区明确给出非官方免责声明。

#### MUST-03 统一页面模型

所有 Must Launch 页面必须包含以下固定组件：

1. SEO title
2. H1
3. above-the-fold one-sentence answer
4. key facts
5. why it matters
6. 单一主 CTA
7. related links
8. FAQ
9. disclaimer
10. structured data

#### MUST-04 主转化逻辑

站点级 primary conversion 为：**站内视频生成启动与成功完成**。

要求：

1. `/try-happyhorse/` 必须承接站内生成动作，并明确说明每位用户最多可免费生成 2 次视频。
2. 其他页面的主 CTA 可以导流到生成页、比较页、替代方案页或 prompts 页，但站点级主产品动作仍以生成相关事件为口径。
3. lead capture 可以作为 secondary conversion 或失败/超额后的补充承接，不得再次被定义为唯一 primary conversion。
4. analytics 中必须区分 `CTA click`、`generation_start`、`generation_success`、`generation_failure`、`generation_limit_reached`，若存在表单也必须区分 `lead_submit`。

#### MUST-05 CTA 分类

只允许使用以下 CTA 类型：

1. `try_now`
2. `compare_now`
3. `get_prompts`
4. `join_waitlist`
5. `see_alternatives`

每个页面只能声明一种主 CTA 类型。

#### MUST-06 内链要求

1. 每个 Must 页面至少链接到 2 个相关页面。
2. 首页必须链接到全部 Must 页面。
3. alternatives 与 comparison 页面之间必须互链。
4. 页面不得成为孤立入口页。

#### MUST-07 页面事实要求

1. 页面中所有事实性描述都必须可追溯到公开来源或明确标记为“当前未知”。
2. 对尚无公开证据的 GitHub、API、权重、Hugging Face 信息，不得写成已开放或已确认。
3. 每页必须保留 `last updated` 信息。

#### SHOULD-01 支撑内容

`/happyhorse-github/` 与 `/happyhorse-open-source/` 应在确认有足够独立意图时上线；否则应在已有页面中以小节形式覆盖。

#### SHOULD-02 分发配套

每个重要页面应配 1 条 X 帖子、1 条短社媒文案、1 个 prompt 样例、1 次邮件/Newsletter 提及。

### 8.2 [Framework] 可复用规则需求

#### MUST-08 趋势输入模型

每个新热点必须采集并记录：

1. trend name
2. first seen date
3. source URLs
4. likely search intent
5. commercial relevance
6. template fit

#### MUST-09 趋势评分模型

趋势必须按以下维度进行 100 分制评分：

1. audience relevance = 30
2. search intent strength = 25
3. templating ability = 20
4. speed window = 15
5. monetization fit = 10

决策门槛：

1. `80+`：24 小时内上线
2. `60-79`：进入本周排期
3. `<60`：只监控，不建页

#### MUST-10 页面类型模板

框架必须定义标准页面类型，并允许未来热点按同一结构复用：

1. explainer
2. comparison
3. access / repo status
4. prompts
5. alternatives

#### MUST-11 内容复用边界

未来热点只允许替换以下变量：

1. model name
2. competitor set
3. prompt examples
4. comparison logic
5. trend-specific language

其余结构（页面模型、CTA taxonomy、评分卡、review cadence、disclaimer policy）必须保持一致。

#### MUST-12 发布与复盘机制

框架必须定义固定节奏：

1. publish
2. distribute
3. submit / monitor index
4. review at Day 3 / 7 / 14 / 30
5. expand / revise / archive

#### MUST-13 退出与归档机制

若某趋势满足任一条件，应停止扩写并进入归档或低维护状态：

1. 14 天后仍无索引或无显著 impressions
2. 品牌/合规风险显著上升
3. 核心事实长期不明确导致页面无法提供可靠信息增量
4. CTA 无法承接，页面仅剩低质量信息价值

#### MUST-14 内容重叠控制

框架必须禁止以下情况：

1. 正反向同义 comparison 双建页
2. repo / API / open-source 三页内容高度重合
3. 仅改标题、不改 intent 的重复建页

---

## 9. 内容与数据模型

### 9.1 页面记录必填字段

每个页面在规划层面必须具备以下字段：

| Field | Required | Meaning |
| --- | --- | --- |
| `topic` | Yes | 当前趋势主题，如 `HappyHorse` |
| `page_type` | Yes | explainer / comparison / access / prompts / alternatives |
| `intent_cluster` | Yes | 页面承接的核心搜索意图 |
| `keyword_primary` | Yes | 主关键词 |
| `keyword_secondary` | Yes | 次关键词 |
| `model_name` | Yes | 当前模型名 |
| `competitor_name` | Conditional | comparison 或 alternatives 页时必填 |
| `cta_type` | Yes | 主 CTA 类型 |
| `conversion_target` | Yes | 该 CTA 归属的业务目标 |
| `generation_entry_mode` | Conditional | 若页面导向站内生成，则标记 direct / indirect / none |
| `trend_score` | Yes | 该主题评分 |
| `publish_priority` | Yes | Must / Should / Backlog |
| `source_urls` | Yes | 支撑事实的来源列表 |
| `fact_status` | Yes | verified / mixed / unknown |
| `last_updated_at` | Yes | 最近更新日期 |
| `disclaimer_text` | Yes | 页面免责声明文案 |
| `canonical_path` | Yes | 唯一路径 |
| `related_pages` | Yes | 至少 2 个内链目标 |

### 9.2 页面内容组件定义

每个页面必须能回答以下问题：

1. 这页解决什么搜索问题？
2. 第一段是否已经直接回答该问题？
3. 这页的唯一主 CTA 是什么？
4. 这页与哪两页强相关？
5. 这页涉及的事实有哪些是已验证、哪些是未知？
6. 若这页导向站内生成，它把用户送到哪一个生成入口或状态？

---

## 10. 运营工作流与决策门槛

### 10.1 Signal Capture

每天必须检查以下来源：

1. Google Trends
2. Google Suggest
3. Google News
4. Search Console rising queries
5. X trending posts
6. Reddit mentions
7. product leaderboards / benchmark sites
8. competitor landing pages and newly indexed pages

### 10.2 Google Trends 不可用时的 fallback

若 Google Trends 不可用或被限流：

1. 使用 Google News 密集报道作为 breakout proxy
2. 使用 Google Suggest 的长尾扩散情况作为 intent signal
3. 使用公开新闻/社媒/竞品页面变化作为二级验证
4. 若仅有单一信号，不得进入 Must Launch

### 10.3 Page Selection 流程

1. 先确认主题评分。
2. 再确定意图簇。
3. 再从标准页面类型中挑选最小集合。
4. 优先建 explainer、comparison、action、alternatives。
5. supporting pages 仅在信息有独立增量时创建。

### 10.4 发布与复盘节奏

1. Day 1：首页 + explainer + comparison
2. Day 2-4：access / alternatives / prompts
3. Day 5-7：补 supporting pages、提交索引、第一轮复盘
4. Day 3 / 7 / 14 / 30：统一复盘

### 10.5 扩张规则

只有当以下至少两项成立时，才允许扩页：

1. 现有页面已有 impressions 或点击增长
2. 出现新的独立 search intent
3. 当前页面已无法完整承接该 intent
4. 新页面拥有独立主 CTA 或商业价值

---

## 11. 品牌、合规与免责声明规范

### 11.1 允许的定位表达

允许使用的站点/页面定位包括：

1. `independent informational resource`
2. `comparison guide`
3. `explainer`
4. `alternatives guide`
5. `prompt resource`

### 11.2 禁止表达

以下说法必须禁止：

1. `official HappyHorse site`
2. `official API`
3. `official signup`
4. `launch with HappyHorse now`（若无官方合作或产品事实支撑）
5. 任何暗示本网站代表、拥有、托管、提供官方服务的表达

### 11.3 免责声明要求

1. 首页必须在首屏或第一视区出现可见免责声明。
2. 每个页面正文底部必须出现免责声明。
3. comparison、access、repo/open-source 类页面必须在正文中段再次强调“非官方、基于公开信息”。
4. 推荐统一文案：  
   `Disclaimer: This website is an independent informational and comparison resource and is not the official HappyHorse website or service.`
5. 若页面包含站内生成功能或生成入口，必须同时说明该功能由本站提供，不代表 HappyHorse 官方产品入口。

### 11.4 事实不确定时的写法

当事实未验证时，只允许使用如下语义：

1. `As of the latest update, we have not found public evidence that ...`
2. `There is no verified public access page at the time of writing.`
3. `Public information remains limited / mixed.`
4. `This site currently routes generation through an existing API that the product owner says can be called directly from the frontend.`

不得使用：

1. `HappyHorse is available now`（若无验证）
2. `HappyHorse is open source`（若无验证）
3. `Official GitHub`（若无验证）

---

## 12. 指标定义与成功阈值

### 12.1 站点级指标

1. validated breakout 到首页上线时间 `<= 24h`
2. Must Launch 页面数 `= 6`
3. 首轮索引观察窗口 `<= 7 days`
4. Must 页面主 CTA 覆盖率 `= 100%`
5. Must 页面免责声明覆盖率 `= 100%`
6. `/try-happyhorse/` 的站内生成入口可访问率 `= 100%`（在可验证环境中）

### 12.2 页面级指标

1. 每页仅绑定 1 个 primary intent
2. 每页仅绑定 1 个 primary CTA
3. 每页至少 2 个 related links
4. 每页必须有 `last updated`
5. 每页必须有 FAQ 与 disclaimer

### 12.3 商业指标

1. 记录 CTA click
2. 记录 `generation_start`
3. 记录 `generation_success`
4. 记录 `generation_failure`
5. 记录 `generation_limit_reached`
6. 若保留 lead form，记录 `lead_submit`
7. 区分 explainer、comparison、access/app、alternatives、prompts 五类页面的转化贡献
8. 至少保留一个“可扩张页面类型”的判定依据，即点击、生成成功、lead submit 或 impressions 明显高于站内中位数

---

## 13. 验收标准

### 13.1 文档级验收（本 spec 是否完整）

本 spec 完成时必须满足：

1. 明确区分 `[MVP]` 与 `[Framework]` 两层范围。
2. 包含唯一版 MVP 页面清单。
3. 明确站内生成为主转化，lead capture 为备选转化。
4. 明确品牌/免责声明/禁用话术规则。
5. 明确事实未知时的写法。
6. 明确扩张、停止扩写、归档条件。
7. 文档中不存在任何未决占位词或未完成标记。

### 13.2 产品级验收（未来实现必须满足）

未来站点实现完成后，必须满足以下可验证条件：

1. Must Launch 的 6 个路径全部可访问并返回成功页面：`/`、`/what-is-happyhorse/`、`/happyhorse-vs-seedance/`、`/try-happyhorse/`、`/happyhorse-alternatives/`、`/happyhorse-prompts/`。
2. 首页与每个 Must 页面都存在：1 个 H1、1 个主 CTA、FAQ、免责声明、至少 2 个内链。
3. 首页与所有 Must 页面都明确标识非官方定位。
4. 比较类页面只存在 `/happyhorse-vs-seedance/` 一个 canonical 版本，不存在重复对称页。
5. 所有关于 API / GitHub / open-source 的描述都能标记为 `verified / mixed / unknown` 之一。
6. `/try-happyhorse/` 提供站内生成入口，并明确展示 2 次免费生成规则。
7. 站点级 analytics 能区分 `CTA click`、`generation_start`、`generation_success`、`generation_failure`、`generation_limit_reached`，若存在表单也能区分 `lead_submit`。
8. sitemap 中包含全部 Must Launch 页面。

---

## 14. 需求优先级汇总

### Must

1. 非官方定位与免责声明
2. 英文搜索市场的 HappyHorse 趋势站 MVP
3. 6 个 Must Launch 页面
4. 统一页面模型
5. 单一主产品转化口径（站内生成）+ 可选次级留资承接
6. 趋势评分与发布/复盘流程
7. 内容重叠控制与归档规则

### Should

1. supporting intent 页
2. 分发模板与 prompt 样例
3. category page 扩展

### Could

1. 后续热点复制模板库
2. 进一步的 compare / news / model hubs

### Won’t

1. 自动化平台架构设计
2. 多语言 / 多域名扩张
3. 官方化包装

---

## 15. 最终定义

本产品不是一个“HappyHorse 官方站替代品”，而是一个 **围绕热点模型搜索意图进行解释、比较、站内生成与转化承接的独立趋势站模板**。

HappyHorse 首站的任务是：

1. 快速验证趋势 SEO 是否能带来高意图流量；
2. 用最小页面集合完成信息承接，并把高意图用户导向 `/try-happyhorse/` 内的站内生成动作；
3. 在保留 Astro 的前提下，用前端直连既有 API 的最小架构完成 2 次免费生成；
4. 把验证结果沉淀成下一个热点可直接复用的 Auto SEO 框架。
