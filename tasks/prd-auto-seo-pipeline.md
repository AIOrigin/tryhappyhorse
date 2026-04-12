# PRD: Auto-SEO Pipeline — 自动化热点捕获建站系统

## Self-Clarification

1. **Problem/Goal:** 当前从发现热点到站点上线需要一整天的手动操作（写内容、生成图片、配置域名、部署、提交搜索引擎）。目标是将这个流程压缩到 1 小时内，输入一个热点话题名即可输出一个完整的 SEO 站点。核心价值是抢占热点窗口期——AI 领域的热点衰减周期通常只有 7-14 天。

2. **Core Functionality:**
   - **一键建站**：输入话题名 → 自动生成关键词矩阵 → 批量生成 30+ 页面内容 → 生成配套图片 → 构建部署
   - **域名自动化**：自动检查域名可用性 → 购买 → 配置 DNS → 绑定 Vercel
   - **搜索引擎全自动提交**：IndexNow + GSC API + 百度 API 一次性推送

3. **Scope/Boundaries:**
   - NOT：不做实时热点自动发现（第一版由人工决定话题，后续迭代加入）
   - NOT：不做多语言（第一版仅英文）
   - NOT：不做内容质量自动审核（依赖人工抽检）
   - NOT：不做自动化 A/B 测试

4. **Success Criteria:**
   - 输入话题名后，1 小时内站点上线并可被搜索引擎抓取
   - 每个新站点自动包含 25+ 页面（对比页、教程页、Prompt 库、场景页）
   - 所有页面自动通过 SEO 校验（JSON-LD、OG tags、canonical、sitemap）
   - 域名购买到 DNS 生效不超过 15 分钟

5. **Constraints:**
   - 必须基于现有 auto-seo Next.js 模板，不能从零重写
   - 域名注册商 API 限制（GoDaddy 需要生产环境 API key）
   - 图片生成 API 有速率限制（串行生成，每张约 30 秒）
   - Vercel 免费版项目数限制

---

## Introduction

Auto-SEO Pipeline 是一个端到端的热点 SEO 站点自动化系统。它将现有的手动建站流程（关键词研究 → 内容生成 → 图片生成 → 部署 → 搜索引擎提交）封装成一条可重复执行的自动化流水线。

**当前状态：** HappyHorse 站点（tryhappyhorse.xyz）证明了这套模板系统的可行性——33 个页面在一个 session 内完成。但整个过程依赖大量手动操作和临时决策。

**目标状态：** 运行一条命令 `npm run launch -- --topic="NewTopic" --domain="trynewtopic.com"`，等 1 小时，站点自动上线。

---

## Goals

- 将热点站点从发现到上线的时间从 1 天压缩到 **1 小时**
- 实现 **零手动配置** 的站点部署（域名 → DNS → Vercel → 搜索引擎）
- 每个新站点自动生成 **25+ SEO 优化页面**，覆盖 6 大关键词类别
- 建立 **可复用的话题配置系统**，支持同时运营 10+ 个热点站点
- 所有外链自动携带 **UTM 追踪参数**，支持跨站点转化归因

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Launch Command                        │
│  npm run launch -- --topic="X" --domain="tryX.com"      │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────┐
│  Phase 1: Topic Config   │  ← topic-config.json 生成
│  (< 1 min)              │     域名、品牌名、颜色、CTA 目标
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│  Phase 2: Keyword Matrix │  ← keyword-research skill
│  (< 5 min)              │     输出 keyword-matrix.json
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│  Phase 3: Content Gen    │  ← Claude API 批量生成 MDX
│  (< 15 min)             │     25-40 个页面 + frontmatter
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│  Phase 4: Image Gen      │  ← task-api-image-generation
│  (< 15 min)             │     每页一张 hero image → S3
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│  Phase 5: Domain Setup   │  ← GoDaddy API + Vercel API
│  (< 10 min)             │     购买 → DNS → SSL
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│  Phase 6: Build & Deploy │  ← Next.js build + Vercel CLI
│  (< 5 min)              │     静态导出 → 部署
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│  Phase 7: SEO Submit     │  ← IndexNow + GSC API + Baidu
│  (< 5 min)              │     sitemap + URL 批量推送
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│  Phase 8: Verify          │  ← 自动化检查
│  (< 5 min)               │     页面可访问 + SEO 元素完整
└─────────────────────────┘
```

---

## Tasks

### T-001: 创建 Topic Config 系统

**Description:** 将所有硬编码的 HappyHorse 特定值抽取到一个 `topic-config.ts` 配置文件中。每个话题拥有独立配置，构建时根据环境变量 `TOPIC` 加载对应配置。

**当前硬编码位置：**
- `src/lib/content.ts:9` — SITE_ORIGIN
- `src/lib/seo.ts:36` — SITE_NAME
- `src/lib/page-shell.ts:68-75` — NAV_ROUTES
- `src/lib/page-shell.ts:115-127` — ELSER_HANDOFFS + UTM
- `app/layout.tsx:8` — GTM container ID
- `app/layout.tsx:18` — Baidu verification
- `src/lib/site-copy.ts` — Lead magnet copy + form action
- `scripts/generate-assets.mjs:15` — IndexNow key
- `scripts/postbuild.mjs:5` — siteOrigin

**Acceptance Criteria:**
- [ ] 创建 `src/config/topic-config.ts`，导出 `TopicConfig` 类型和 `getTopicConfig()` 函数
- [ ] 配置包含：domain, siteName, topicName, gtmId, baiduVerification, indexNowKey, leadMagnetFormAction, handoffUrls, utmSource, primaryColor
- [ ] 所有上述硬编码位置改为从 topic config 读取
- [ ] 环境变量 `TOPIC=happyhorse` 控制加载哪个配置
- [ ] 现有 HappyHorse 站点功能不受影响（`npm run build` 通过）
- [ ] 新增话题只需添加一个配置对象 + 内容文件，零代码修改

---

### T-002: 创建关键词矩阵自动生成器

**Description:** 基于 keyword-research skill，创建一个脚本将话题名转换为标准化的关键词矩阵 JSON，供后续内容生成消费。

**输入：** 话题名（如 "HappyHorse"）+ 话题描述（1-2 句话）
**输出：** `keyword-matrix.json`，包含 6 个类别的关键词列表 + 推荐的页面 slug 和 page_type

**Acceptance Criteria:**
- [ ] 创建 `scripts/generate-keyword-matrix.mjs`
- [ ] 输入：`--topic="HappyHorse" --description="AI video generation model that topped benchmarks"`
- [ ] 输出 JSON 包含：品牌认知类、功能类、对比类、场景类、技术类、争议类 6 个类别
- [ ] 每个关键词条目包含：keyword, intent, suggested_slug, suggested_page_type, priority (P0/P1/P2)
- [ ] 对比类自动识别竞品列表（从话题领域推断）
- [ ] JSON schema 有 TypeScript 类型定义

---

### T-003: 创建 MDX 页面批量生成器

**Description:** 读取 keyword-matrix.json，调用 Claude API 为每个关键词生成完整的 MDX 页面（frontmatter + 正文内容）。

**Acceptance Criteria:**
- [ ] 创建 `scripts/generate-pages.mjs`
- [ ] 读取 `keyword-matrix.json` 和 `topic-config.ts` 作为输入
- [ ] 为每个关键词生成符合 Zod schema 的完整 MDX 文件
- [ ] frontmatter 自动填充：title, h1, description, keyword_primary, keyword_secondary, page_type, cta_type, conversion_target, related_pages, key_facts, faq_items
- [ ] 正文内容使用 Claude API 生成，每页 300-800 字
- [ ] related_pages 自动建立交叉链接图（每页至少 3 个关联页）
- [ ] 支持 `--dry-run` 模式预览将生成的文件列表
- [ ] 支持 `--pages=comparison` 只生成特定类别
- [ ] 生成后自动运行 `npm run build` 验证 schema

---

### T-004: 图片生成流水线优化

**Description:** 优化现有 generate-assets.mjs，支持从 frontmatter 读取 image prompt、并行生成、以及自动上传到 S3。

**Acceptance Criteria:**
- [ ] 在 content-schema.ts 中新增可选字段 `image_prompt`
- [ ] generate-assets.mjs 优先使用 frontmatter 中的 `image_prompt`，其次使用 PROMPT_OVERRIDES，最后使用自动生成的 prompt
- [ ] 支持 `--concurrency=3` 参数并行生成（默认串行）
- [ ] 生成完成后自动上传到 S3（当 AWS 环境变量存在时）
- [ ] 生成完成后自动更新 MDX frontmatter 中的 image path 为 CDN URL
- [ ] 支持 `--skip-existing` 跳过已有图片（默认行为）

---

### T-005: GoDaddy 域名自动购买与 DNS 配置

**Description:** 集成 GoDaddy API，自动检查域名可用性、购买、配置 DNS 指向 Vercel。

**Acceptance Criteria:**
- [ ] 创建 `scripts/domain-setup.mjs`
- [ ] 支持 `--check` 模式只检查可用性不购买
- [ ] 域名可用时自动购买（需要 `--confirm` flag 确认）
- [ ] 购买后自动设置 DNS：A 记录 → 76.76.21.21, CNAME www → cname.vercel-dns.com
- [ ] 环境变量：`GODADDY_API_KEY`, `GODADDY_API_SECRET`
- [ ] 支持 `--registrar=godaddy|namecheap` 扩展
- [ ] 输出域名状态报告（注册成功/DNS 已配置/SSL 状态）
- [ ] 错误处理：域名已被注册、余额不足、API 限流

---

### T-006: Vercel 项目自动创建与域名绑定

**Description:** 自动创建 Vercel 项目、绑定域名、配置环境变量、执行首次部署。

**Acceptance Criteria:**
- [ ] 创建 `scripts/vercel-setup.mjs`
- [ ] 自动在指定 Vercel team 下创建新项目
- [ ] 自动绑定自定义域名
- [ ] 自动设置必要的环境变量（GTM ID、topic name 等）
- [ ] 执行首次 production 部署
- [ ] 等待部署完成并验证页面可访问
- [ ] 输出部署 URL 和项目 dashboard 链接

---

### T-007: 搜索引擎全自动提交

**Description:** 整合现有 IndexNow 提交 + 新增 Google Search Console API 和百度推送 API 的自动化。

**Acceptance Criteria:**
- [ ] 升级 `scripts/submit-to-search-engines.mjs` 为统一入口
- [ ] IndexNow 批量提交（已有，保持）
- [ ] 新增 Google Search Console API 集成：自动提交 sitemap URL
- [ ] 新增百度推送 API 集成：批量推送所有 URL（需要 `BAIDU_PUSH_TOKEN` 环境变量）
- [ ] 新增 Bing Webmaster Tools API 集成：提交 sitemap
- [ ] 每个引擎的提交结果输出为结构化日志
- [ ] 支持 `--engines=google,bing,baidu,indexnow` 选择性提交

---

### T-008: 创建端到端 Launch 命令

**Description:** 将 T-001 到 T-007 串联成一条 `npm run launch` 命令，实现一键建站。

**Acceptance Criteria:**
- [ ] 创建 `scripts/launch.mjs` 作为主编排器
- [ ] 命令格式：`npm run launch -- --topic="TopicName" --domain="trytopic.com" --description="..."`
- [ ] 按顺序执行：topic config → keyword matrix → content gen → image gen → domain setup → vercel deploy → search submit → verify
- [ ] 每个阶段输出进度和耗时
- [ ] 任何阶段失败时暂停并输出错误，支持 `--resume-from=phase4` 断点续跑
- [ ] 最终输出站点上线报告：URL、页面数、sitemap URL、搜索引擎提交状态
- [ ] 总耗时不超过 60 分钟

---

### T-009: 站点健康检查与监测

**Description:** 创建自动化检查脚本，验证新站点的 SEO 完整性和可访问性。

**Acceptance Criteria:**
- [ ] 创建 `scripts/health-check.mjs`
- [ ] 检查所有页面 HTTP 200
- [ ] 检查每页的 canonical、OG tags、JSON-LD、description 完整性
- [ ] 检查 sitemap.xml 可抓取且 URL 数量匹配
- [ ] 检查 robots.txt 配置正确
- [ ] 检查所有内部链接不是 404
- [ ] 检查所有 hero 图片 CDN URL 可访问
- [ ] 输出健康报告（通过/警告/失败）

---

### T-010: 多站点管理面板

**Description:** 创建一个本地 CLI 工具管理所有已部署的热点站点。

**Acceptance Criteria:**
- [ ] 创建 `scripts/sites.mjs`
- [ ] `npm run sites list` — 列出所有站点（域名、话题、页面数、部署时间、状态）
- [ ] `npm run sites status <domain>` — 查看单个站点的健康状态
- [ ] `npm run sites update <domain>` — 重新生成内容并部署
- [ ] `npm run sites report` — 生成跨站点汇总报告
- [ ] 站点注册信息存储在 `sites-registry.json`

---

## Functional Requirements

- FR-1: 系统必须支持通过单一命令创建一个完整的 SEO 站点，包含 25+ 页面
- FR-2: 每个站点必须自动生成有效的 sitemap.xml（含 lastmod、changefreq、priority）
- FR-3: 每个页面必须自动包含 JSON-LD 结构化数据（WebSite、WebPage、BreadcrumbList、FAQPage）
- FR-4: 所有外链必须自动携带 UTM 参数（utm_source=域名、utm_medium=referral、utm_campaign=页面类型）
- FR-5: 域名购买后 DNS 必须自动配置为指向 Vercel
- FR-6: 部署完成后必须自动向 Bing、Yandex、Naver（via IndexNow）+ 百度提交所有 URL
- FR-7: 每个新站点必须自动配置 Google Tag Manager 用于流量追踪
- FR-8: 每个站点必须包含邮箱收集功能（Lead Magnet → Google Sheets）
- FR-9: 建站流程中任何阶段失败必须支持断点续跑，不需要从头重来
- FR-10: 多个话题站点可以共享同一个 Elser.ai 引流目标，但 UTM 参数必须区分来源站

---

## Non-Goals (Out of Scope)

- **自动热点发现**：第一版不做自动监测 Google Trends / Twitter。话题由人工决定后输入
- **多语言内容**：第一版仅英文。i18n 框架已就绪但不在本期实现
- **内容自动审核**：生成的内容需要人工抽检，系统不做事实核查
- **自动化 A/B 测试**：不做页面变体测试
- **付费广告投放**：不集成 Google Ads 或 Meta Ads API
- **自定义模板设计**：所有站点共享同一套模板，不支持按话题定制 UI
- **数据库**：所有数据存储为文件（JSON/MDX），不引入数据库

---

## Technical Considerations

### 依赖的外部 API

| API | 用途 | 认证方式 | 限制 |
|-----|------|---------|------|
| Claude API | 内容生成 | API Key | 速率限制 |
| Task Service (Gemini) | 图片生成 | API Key | ~30s/张 |
| GoDaddy API | 域名购买 + DNS | API Key + Secret | 生产环境需要审批 |
| Vercel API | 项目创建 + 部署 | OAuth Token | 免费版 3 个项目 |
| IndexNow API | 搜索引擎通知 | Key File | 无限制 |
| Google Search Console API | Sitemap 提交 | OAuth2 | 需要 GSC 属性验证 |
| 百度推送 API | URL 提交 | Token | 每日配额 |
| AWS S3 | 图片 CDN | IAM Session | 无限制 |
| Google Apps Script | 邮箱收集 | 公开 endpoint | 无限制 |

### 文件系统结构（目标状态）

```
auto-seo/
├── src/
│   ├── config/
│   │   └── topic-config.ts          ← NEW: 话题配置中心
│   ├── content/
│   │   └── pages/                   ← 按话题生成的 MDX 文件
│   ├── components/                  ← 共享组件（不变）
│   ├── layouts/                     ← 共享布局（不变）
│   └── lib/                         ← 核心逻辑（改为从 config 读取）
├── scripts/
│   ├── launch.mjs                   ← NEW: 主编排器
│   ├── generate-keyword-matrix.mjs  ← NEW: 关键词矩阵生成
│   ├── generate-pages.mjs           ← NEW: MDX 批量生成
│   ├── generate-assets.mjs          ← UPGRADE: 支持并行 + 自动上传
│   ├── domain-setup.mjs             ← NEW: 域名购买 + DNS
│   ├── vercel-setup.mjs             ← NEW: Vercel 项目配置
│   ├── submit-to-search-engines.mjs ← UPGRADE: 新增 GSC + 百度 API
│   ├── health-check.mjs             ← NEW: 站点健康检查
│   └── sites.mjs                    ← NEW: 多站点管理
├── sites-registry.json              ← NEW: 已部署站点注册表
└── topic-configs/                   ← NEW: 每个话题的独立配置
    ├── happyhorse.json
    └── [new-topic].json
```

---

## Success Metrics

| 指标 | 目标值 | 测量方式 |
|------|--------|---------|
| 建站总耗时 | < 60 分钟 | launch 脚本输出的总耗时 |
| 页面生成数量 | ≥ 25 页/站 | 构建后页面计数 |
| SEO 通过率 | 100% 页面 | health-check 脚本报告 |
| 搜索引擎提交覆盖 | Google + Bing + 百度 | submit 脚本日志 |
| 域名购买到可访问 | < 15 分钟 | domain-setup 到 health-check 通过的间隔 |
| 手动介入次数 | 0 次（正常流程） | 运维日志 |

---

## Implementation Priority

| 优先级 | 任务 | 原因 |
|--------|------|------|
| **P0** | T-001 Topic Config | 所有后续任务的基础，阻塞其他一切 |
| **P0** | T-003 MDX 批量生成 | 核心价值——内容自动化 |
| **P0** | T-008 Launch 命令 | 串联所有环节的编排器 |
| **P1** | T-002 关键词矩阵 | 提升内容质量和覆盖度 |
| **P1** | T-004 图片优化 | 减少手动操作 |
| **P1** | T-007 搜索引擎提交 | 加速收录 |
| **P1** | T-009 健康检查 | 质量保证 |
| **P2** | T-005 域名自动购买 | 减少手动操作，但频率低 |
| **P2** | T-006 Vercel 自动化 | 减少手动操作，但频率低 |
| **P2** | T-010 多站点管理 | 运营效率，站点数量多了才需要 |

---

## Open Questions

1. **GoDaddy API 生产环境权限**：当前 GoDaddy 开发者 API 是否已经开通？生产环境是否需要额外审批？
2. **Claude API 额度**：批量生成 30+ 页面内容，每页 500-1000 tokens 输出，是否有额度限制？
3. **Vercel Team 项目限制**：Elser team 的 Vercel plan 支持多少个 project？是否需要升级？
4. **Google Search Console API**：是否已有 OAuth2 service account？需要哪些 scope？
5. **百度站长 API Token**：是否已获取？每日推送配额是多少？
6. **Elser.ai 引流目标**：不同话题站点是否都引流到同一个 Elser 入口？还是需要按话题定制？
7. **内容更新策略**：热点站点上线后，是否需要自动定期更新内容（如每周刷新 lastmod）？
