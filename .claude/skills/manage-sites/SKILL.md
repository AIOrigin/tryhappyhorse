# Manage Sites — 多站点运维管理

## Purpose

管理所有通过 `/launch-site` 部署的热点 SEO 站点。查看状态、运行健康检查、更新内容、生成报告。

---

## Usage

```bash
# 列出所有站点
/manage-sites list

# 查看单个站点状态
/manage-sites status tryhappyhorse.xyz

# 运行健康检查
/manage-sites health-check tryhappyhorse.xyz

# 更新站点内容并重新部署
/manage-sites update tryhappyhorse.xyz

# 生成跨站点汇总报告
/manage-sites report

# 重新提交搜索引擎
/manage-sites resubmit tryhappyhorse.xyz
```

---

## Commands

### list

列出 `sites-registry.json` 中所有已注册站点：

```
Domain                  Topic        Pages  Deployed     Status
tryhappyhorse.xyz       happyhorse   33     2026-04-12   ✅ healthy
trydeepseek.com         deepseek     28     2026-04-15   ⚠️ 2 warnings
```

### status \<domain\>

查看单个站点详情：
- 域名和 Vercel 项目信息
- 页面数量和 URL 列表
- 最近部署时间
- 搜索引擎提交状态
- 流量概况（如果有 GA4 集成）

### health-check \<domain\>

对站点执行全面 SEO 健康检查：
- 所有页面返回 HTTP 200
- sitemap.xml 可抓取且 URL 数量匹配
- robots.txt 配置正确
- 每页 canonical、OG tags、JSON-LD 完整
- 所有 hero 图片 CDN URL 可访问
- 所有内部链接不是 404

输出 JSON 报告到 `reports/{domain}-health-{date}.json`

### update \<domain\>

更新站点并重新部署：
1. 更新所有 MDX 的 `last_updated_at` 为今天
2. 重新构建 `TOPIC={topic} npm run build`
3. 部署到 Vercel `npx vercel --prod --yes`
4. 重新提交 IndexNow
5. 运行健康检查

### resubmit \<domain\>

重新向搜索引擎提交所有 URL：
- IndexNow（Bing/Yandex/Naver/Seznam）
- 百度推送 API
- Google Search Console API

### report

生成跨站点汇总报告，输出到 `reports/summary-{date}.json`：
- 总站点数、总页面数
- 各站点健康状态
- 搜索引擎收录情况
- 建议操作项

---

## Sites Registry

站点信息存储在项目根目录 `sites-registry.json`：

```json
[
  {
    "domain": "tryhappyhorse.xyz",
    "topic": "happyhorse",
    "description": "AI video generation model that topped benchmarks",
    "pageCount": 33,
    "deployedAt": "2026-04-12T09:36:00Z",
    "lastChecked": "2026-04-12T10:00:00Z",
    "lastUpdated": "2026-04-12T09:36:00Z",
    "vercelProject": "tryhappyhorse",
    "vercelTeam": "elser-team",
    "status": "healthy",
    "searchEngines": {
      "indexNow": "2026-04-12T09:40:00Z",
      "baidu": "2026-04-12T09:41:00Z",
      "google": "2026-04-12T09:42:00Z"
    }
  }
]
```

---

## Key Files

| File | Purpose |
|------|---------|
| `sites-registry.json` | 站点注册表 |
| `scripts/sites.mjs` | CLI 管理工具 |
| `scripts/health-check.mjs` | 健康检查脚本 |
| `scripts/submit-to-search-engines.mjs` | 搜索引擎提交 |
| `reports/` | 健康检查和汇总报告输出目录 |
