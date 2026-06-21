# 评论区功能

评论区采用**两级开关**控制：管理员全局开关 + 文章独立开关，两级均开启时用户才能评论。

## 管理员总开关

在系统配置页面中控制，管理员可以开启或关闭整个系统的评论功能。

![评论区总开关](../../images/comment_section_toggle_switch.png)

| 属性 | 说明 |
|------|------|
| 配置项 | `enable_comment` |
| 接口 | `GET /api/site/enable-comment` → `{"enableComment": true/false}` |
| 默认值 | 开启（`null` 视为开启） |

关闭后，所有文章均无法评论，添加评论时返回：`站点评论区已关闭`。

## 评论管理与审核

拥有 `system:comments:review` 权限的管理员可在后台查看和管理所有评论。

![评论区管理](../../images/comment_section_management.png)

### 人工审核

当 `comment_status` 配置为 `3`（待审核）时，用户提交的评论不会直接展示，需审核员在后台手动处理：

![评论区审核](../../images/comment_section_review.png)

**审核操作：**

- **通过**：将评论状态从 `3` 改为 `1`，评论公开展示，同时通知评论作者和文章作者
- **违规**：将评论状态从 `3` 改为 `4`，评论不展示，仅通知评论作者审核结果

### 审核接口

| 接口 | 说明 |
|------|------|
| `GET /api/commentreview/pending?page=&size=` | 待审核评论列表（status=3） |
| `GET /api/commentreview/all?page=&size=` | 全部评论列表（status≠0） |
| `PUT /api/commentreview/{id}/status` | 更新状态：`{"status": 1}` 通过 / `{"status": 4}` 违规 |

### 评论状态

| 状态值 | 含义 |
|--------|------|
| `0` | 已删除（软删除） |
| `1` | 已发布（前台可见） |
| `3` | 待审核 |
| `4` | 违规 |

## 文章子开关

每篇文章有独立的评论开关（`enable_comment` 字段），作者可控制单篇文章是否允许评论。

![评论区子开关1](../../images/comment_section_toggles_switch.png)

![评论区子开关2](../../images/comment_section_toggles_switch.png)

| 属性 | 说明 |
|------|------|
| 字段 | 文章 `enable_comment`（`1` 开启 / `0` 关闭） |

关闭后，该文章无法评论，添加评论时返回：`该文章评论区已关闭`。

> 子开关仅在管理员总开关开启时生效。

## 校验逻辑

添加评论时，后端校验顺序：

1. 文章是否存在
2. 站点总开关是否开启（`siteConfigUtil.isCommentEnabled()`）
3. 当前文章是否开启评论（`article.enable_comment != 0`）

全部通过后，评论状态由 `comment_status` 配置决定（`1` 直接发布 / `3` 待审核）。

## 相关功能

- [大模型审核与生成](llm_generation_and_review.md#评论区审核模块) — 评论大模型自动审核
