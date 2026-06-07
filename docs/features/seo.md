# SEO 优化与大模型读取

## 首页、文章页 SSR

- 针对搜索引擎 User-Agent 自动返回服务器渲染的 HTML
- SSR 页面包含：
  - `<title>`：文章标题
  - `<meta name="description">`：文章摘要
  - `<meta name="keywords">`：文章标签
  - 文章内容和发布时间等
- 普通用户访问则返回 SPA 首页，保持 React 的交互体验
- 支持主流搜索引擎爬虫：Googlebot、Bingbot、Baiduspider、DuckDuckBot、Sogou、360Spider 等

## Sitemap 与 Robots

支持动态生成 Sitemap 和 Robots.txt，智能处理反向代理头。

针对 Google、Bing 等主流搜索引擎的爬虫进行了独立优化（未覆盖百度，百度爬虫仅能获取基础信息）。

![SEO优化支持](../../images/seo_optimization_support.png)

## 大模型读取

文章内容可以被大部分网页 AI 直接读取（密码保护的文章无法读取）。

![大模型文章内容读取支持](../../images/llm_article_content_reading_support.png)
