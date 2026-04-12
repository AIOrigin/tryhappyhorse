# Launch Site — Auto-SEO 一键建站（Claude Code 交互式）

## Purpose

输入一个热点话题名和域名，Claude Code 全程编排执行建站全流程。
每个阶段由 Claude 自己完成（联网搜索、AI 内容生成、文件操作、部署）。

---

## Usage

```
/launch-site TopicName --domain=trytopic.com --description="Brief topic description"
```

### Required arguments

- `TopicName` — 热点话题名称（如 HappyHorse, DeepSeek, Sora 等）
- `--domain=` — 目标域名
- `--description=` — 一句话描述

### Optional arguments

- `--niche=` — 所在赛道（如 "AI video generation"）用于推断竞品
- `--handoff-url=` — 引流目标 URL（默认 https://www.elser.ai/zh/ai-image-animator）
- `--skip-domain` — 跳过域名购买和 DNS 配置
- `--skip-images` — 跳过图片生成
- `--resume-from=<phase>` — 从指定阶段恢复（phase1-phase8）

---

## 执行流程（Claude Code 自己做每一步）

### Phase 1: 热点调研 + Topic Config（5 min）

**Claude 执行：**
1. 用 WebSearch 搜索话题最新信息：
   - "{topic} latest news 2026"
   - "{topic} what is"
   - "{topic} features capabilities"
   - "{topic} vs competitors"
2. 总结 5-10 个关键事实（verified/mixed/unknown 标注）
3. 识别核心竞品（至少 5 个）
4. 在 `src/config/topic-config.ts` 的 TOPIC_CONFIGS 中新增话题配置
5. 生成 IndexNow key 文件到 `public/`

**输出：** topic-config 已更新，竞品列表已确定

### Phase 2: 关键词矩阵（5 min）

**Claude 执行：**
1. 运行 `node scripts/generate-keyword-matrix.mjs --topic=X --description=Y --niche=Z --competitors=A,B,C`
2. WebSearch 验证高优先级关键词的真实搜索热度
3. 调整优先级和补充遗漏的长尾关键词
4. 更新 `keyword-matrix.json`

**输出：** keyword-matrix.json（30+ 关键词，6 个类别）

### Phase 3: 内容生成（20-30 min）★核心阶段

**Claude 执行：**
1. 读取 keyword-matrix.json
2. **按 P0 → P1 → P2 顺序，为每个关键词生成完整的 MDX 页面：**

   对每个页面，Claude 需要：
   a. WebSearch 搜索 "{keyword}" 获取最新事实和数据
   b. 生成高质量 YAML frontmatter（完整 Zod schema 字段）
   c. 生成 500-1000 字的 MDX 正文内容，包含：
      - 直接回答搜索意图的开头段落
      - 2-4 个有实质内容的 ## 章节
      - 事实标注（verified vs unverified）
      - 内部链接到其他页面
      - 自然植入 Elser.ai 推荐
   d. 生成 3-5 个真实的 FAQ 问答
   e. 生成 3-4 个有价值的 key facts（带准确的 status 标注）

3. **使用 Agent 工具并行生成**：
   - 启动 3 个 Agent 分别处理对比页、教程页、其他页
   - 每个 Agent 写入 MDX 文件到 `src/content/pages/`

4. 生成完毕后运行 `npm run build` 验证 schema

**内容质量标准：**
- 不能是模板化的通用文案（"An independent guide to..."）
- 必须包含从 WebSearch 获取的真实、最新信息
- 对比页必须有具体的对比维度和差异分析
- 教程页必须有可操作的步骤
- Prompt 页必须有可复制使用的真实 prompt

**输出：** 25-40 个高质量 MDX 文件

### Phase 4: 图片生成（15 min）

**Claude 执行：**
1. 为每个没有图片的页面生成定制化的 image prompt
   （不使用通用模板，而是根据页面实际内容定制）
2. 运行 `npm run generate:assets -- --concurrency=3`
3. 运行 `node scripts/upload-to-s3.mjs`（需要 AWS credentials）
4. 更新所有 MDX 的 image path 为 CDN URL
5. 用 `sed` 批量替换：
   ```bash
   for f in src/content/pages/*.mdx; do
     sed -i '' "s|/generated/|https://assets.dev.tool.elser.ai/generated/|g" "$f"
   done
   ```

**输出：** 所有页面有 CDN 托管的 hero 图片

### Phase 5: 域名配置（10 min）

**Claude 执行（如果不 --skip-domain）：**
1. `npm run domain:setup -- --check --domain=X` 检查可用性
2. 如果需要购买：`npm run domain:setup -- --full --domain=X --confirm`
3. 如果已有域名：`npm run domain:setup -- --configure-dns --domain=X`

**输出：** DNS A + CNAME 配置完成

### Phase 6: 构建部署（5 min）

**Claude 执行：**
1. `TOPIC=topicslug npm run build`
2. `npm run vercel:setup -- --project=X --domain=X.com --team=elser-team`
3. 验证 `curl -sI https://domain/` 返回 200

**输出：** 站点已上线

### Phase 7: 搜索引擎提交（5 min）

**Claude 执行：**
1. `npm run submit:search -- --domain=X`（IndexNow + Baidu）
2. 如果有 GSC access，用浏览器提交 sitemap

**输出：** 搜索引擎已通知

### Phase 8: 验证 + 注册（5 min）

**Claude 执行：**
1. `npm run health-check -- --domain=X`
2. `npm run sites -- add --domain=X --topic=Y --pages=N`
3. 输出最终上线报告

---

## 关键约定

### Frontmatter Schema（每个 MDX 必须包含）

```yaml
title: string                    # 页面标题
description: string              # Meta description（50-160字符）
h1: string                       # 页面 H1
topic: string                    # 话题名
page_type: string                # 页面类型 enum
intent_cluster: string           # 搜索意图分类
keyword_primary: string          # 主关键词
keyword_secondary: [string, ...] # 副关键词（3-4个）
model_name: string               # 模型/产品名
competitor_name: string          # 对比页必填
cta_type: string                 # CTA 类型 enum
conversion_target: string        # 转化目标 enum
generation_entry_mode: none      # 固定 none
trend_score: 0-100               # 热度评分
publish_priority: Must|Should|Backlog
route:
  path: /{slug}/
  slug: {slug}
  is_homepage: false
  is_canonical_app_entry: false  # 只有 try-{topic} 页面为 true
canonical_path: /{slug}/
answer_summary: string           # 一句话直接回答
source_urls: [url, ...]          # 至少 2 个来源 URL
fact_status: verified|mixed|unknown
fact_status_note: string
last_updated_at: YYYY-MM-DD
disclaimer_text: string
images:
  hero_path: /generated/{slug}.png
  hero_fit: cover
  hero_frame: balanced|wide
  alt: string
related_pages: [path, ...]       # >= 3 个关联页
key_facts: [{label, value, status}, ...]  # >= 3
faq_items: [{question, answer}, ...]      # >= 3
```

### 必须生成的 P0 核心页面

| 页面 | slug | page_type | 特殊要求 |
|------|------|-----------|---------|
| 首页 | home | homepage | is_homepage: true |
| 科普页 | what-is-{topic} | explainer | |
| 入口页 | try-{topic} | access | is_canonical_app_entry: true, generation_entry_mode: direct |
| 对比页 x3 | {topic}-vs-{competitor} | comparison | competitor_name 必填 |
| 教程页 | {topic}-how-to-use | tutorial | |
| Prompt页 | {topic}-prompts | prompts | |
| 替代品页 | {topic}-alternatives | alternatives | |

### Handoff URL 格式

所有 Elser.ai 引流链接从 topic config 读取，自动携带 UTM：
```
{handoff.baseUrl}{path}?utm_source={handoff.utmSource}&utm_medium=referral&utm_campaign={campaign}
```

### 内容中引用 Elser 的方式

- 首页 Hero CTA: "Try AI Image Animator — Free"
- 子页面 CTA: "Get the free guide"（锚点到 Lead Magnet）
- 页面底部 CtaBlock: "Ready to create?" + "Try AI Image Animator"
- 正文中自然提及: "tools like Elser.ai" 或 "recommended workflow"

---

## 辅助脚本（机械操作交给脚本）

| 操作 | 命令 |
|------|------|
| 关键词矩阵初始化 | `npm run generate:keywords -- --topic=X --description=Y` |
| 图片生成 | `npm run generate:assets -- --concurrency=3` |
| S3 上传 | `node scripts/upload-to-s3.mjs` |
| 域名购买 + DNS | `npm run domain:setup -- --full --domain=X --confirm` |
| Vercel 部署 | `npm run vercel:setup -- --project=X --domain=X` |
| 搜索引擎提交 | `npm run submit:search -- --domain=X` |
| 健康检查 | `npm run health-check -- --domain=X` |
| 站点注册 | `npm run sites -- add --domain=X --topic=Y` |

---

## 错误恢复

如果某个阶段中断，使用 `--resume-from=phaseN` 从该阶段重新开始。
Claude Code 会检查之前阶段的产物是否存在，跳过已完成的步骤。

---

## 预期时间

| 阶段 | 耗时 | 依赖 |
|------|------|------|
| Phase 1: 调研 + Config | 5 min | WebSearch |
| Phase 2: 关键词矩阵 | 5 min | 脚本 + WebSearch |
| Phase 3: 内容生成 | 20-30 min | Claude AI + WebSearch + Agent |
| Phase 4: 图片生成 | 15 min | Task API |
| Phase 5: 域名 | 10 min | GoDaddy API |
| Phase 6: 部署 | 5 min | Vercel CLI |
| Phase 7: SEO 提交 | 5 min | IndexNow |
| Phase 8: 验证 | 5 min | Health Check |
| **总计** | **~60 min** | |
