# 次元栈 - DimStack

> 主题开发者接口文档

## RouterController - 路由控制器
**需要主题开发者适配的路由**
**描述**: 处理所有前端页面的路由请求，将所有匹配的请求转发到 index.html 文件，以便前端路由器（如 React Router 或 Vue Router）能够处理具体的路由逻辑。这些路由需要主题开发者进行适配和实现。

**路径**: 多个路径匹配

**方法类型**: GET

**内容类型**: application/x-www-form-urlencoded

**路径参数**:
| 路径            | 示例         |
|-----------------|--------------|
| `/`             | 无           |
| `/login`        | 登录页面     |
| `/register`     | 注册页面     |
| `/article/**`   | 文章相关路径 |
| `/category/**`  | 分类相关路径 |


## HomeController - 主页面控制器
### 获取首页文章列表
**地址:** /api/articles

**请求协议:** GET


**内容类型:** application/x-www-form-urlencoded

**描述:** 用于系统首页获取文章列表


**请求参数:**

| 参数| 类型 | 是否必须| 描述| 例子|
|-----------|------|----------|-------------|---------|
|page|int32|true|页码|1|
|size|int32|true|每页数量|10|

**请求示例:**
```bash
curl -X GET "https://apilinks.cn/api/articles?page=1&size=10"
```
**响应字段:**

| 字段       | 类型  | 描述                                         |
|------------|-------|----------------------------------------------|
| data       | 对象  | 存储实际数据的对象                           |
| ├─ data     | 数组  | 包含具体数据项的数组                         |
| │ ├─ id     | int32 | 数据项的唯一标识                             |
| │ ├─ article_id | 字符串| 文章的 UUID                              |
| │ ├─ title  | 字符串| 文章的标题                                 |
| │ ├─ excerpt| 字符串| 文章的摘要或简介                           |
| │ ├─ image  | 字符串| 文章的相关图片链接                           |
| │ ├─ date   | 字符串| 文章的发布日期和时间，格式为 yyyy-MM-dd HH:mm:ss |
| │ ├─ author | 字符串| 文章的作者名称或标识                         |
| │ ├─ category| 字符串| 文章所属的分类                         |
| │ ├─ tag    | 字符串| 文章所属的标签，不同标签使用英文逗号区分                         |
| │ └─ alias  | 字符串| 文章的别名或URL的一部分                      |
| ├─ total    | int32 | 数据库中符合条件的数据总数                   |
| ├─ page     | int32 | 当前返回的数据页码                           |
| ├─ size     | int32 | 每页返回的数据条目数量                       |
| └─ total_pages | int32 | 符合条件的数据总共有几页                   |

**响应示例：**
```json
{
    "data": [
        {
            "id": 2,
            "article_id": "3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1",
            "title": "致谢",
            "excerpt": "致谢",
            "image": "https://pan.apilinks.cn/f/Y5Sw/e5f2f1fe4bfceeb32e88217577732c04.jpg",
            "date": "2025-09-14 11:26:52",
            "author": "admin",
            "category": "默认分类",
            "tag": "默认标签,次元栈",
            "alias": "thanks"
        },
        {
            "id": 1,
            "article_id": "a1d3112d-fd8e-4484-9c3c-bad24a9e2019",
            "title": "关于",
            "excerpt": "关于",
            "image": "https://pan.apilinks.cn/f/29um/Image_2756849649102.jpg",
            "date": "2025-09-13 12:42:47",
            "author": "admin",
            "category": "默认分类",
            "tag": "默认标签,次元栈",
            "alias": "about"
        }
    ],
    "total": 2,
    "page": 1,
    "size": 10,
    "total_pages": 1
}
```



## CaptchaController - 验证码控制器
### 获取验证码
**地址:** /api/captcha

**类型:** GET


**内容类型:** application/x-www-form-urlencoded

**描述:** 验证码获取


**请求示例:**
```bash
curl -X GET -i "https://apilinks.cn/api/captcha"
```
**响应字段:**

| 字段      | 类型    | 描述                                    | 示例 |
|-----------|---------|-----------------------------------------|------|
| image     | 字符串  | 图像的 Base64 编码数据                    | `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."` |
| success   | 布尔值  | 标识请求是否成功                          | `true` |
| sessionId | 字符串  | 会话标识符                                | `"******"` |
| key       | 字符串  | 唯一标识                  | `"3d63f17fe65845e7"` |

**响应示例：**
```json
{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAoCAIAAAC6iKlyAAAB/0lEQVR4Xu3XPU4DMRCG4dRI1HTUSNwiFSWHoeICXMs3m0RZZZj9xn/x2F7vxq9cre2V88QK4kSzLp3wwaxNE7pTE7pTE7pTI0I75/DR/pvQnRoO+pDKNKG7NaE7NRb0UZXpANDuFj4dr2rQ5/cPPXCR6vfthcejXp9f38mBe1R/P68wcEWl0tDJK6N987k3hNbETa3T0EsLtxddy+oBW7jW0N4DU1S5kXUutAzQQ5o51hIa51Jl3lxSB6Y1tFwZem6vBFp2PfoVkT8ANAi07HrUuGZkypIVmtO3hkaClseT0PK0S/Gvobhq0DL+SD2h/yF9yY1ACcv2BM11g/YO3HAvQulSPyzFNYSWyufb77i8OEsF0PwSLVsADZqRKWOtoEEZZhkrCc0rOZ7SspnQpEBDA7cZqg8NxFpZJqFR9BZuEGWahtKseuAeQ5WhH1J26xud6csZoclnDQ9xg6Ga0HFl6ciaoZ8OWObNDu2thTJVhNbKEivkFYKWhV7SArrRdaZa0FoZV/hyGX8MIcltgfY6SmXvAksl0PKKufV/JZGBbymClkno0MA998BUD9xgLhdaysKUNvUO2LW8Z0xoXF2jXOhI2tQ7YNe20BSwxkX1qgBtyQK9r7aElsoTun7g+wzKNAg0rjhiG0Pj3HHbAPo5m9CdmtCdmtCdmtCdugCwGB3v/VPeXwAAAABJRU5ErkJggg==",
    "success": true,
    "sessionId": "******",
    "key": "3d63f17fe65845e7"
}
```


## RegisterController - 用户注册控制器
### 用户注册接口
**地址:** /api/register

**请求协议:** POST


**内容类型:** application/json

**描述:** 用户注册接口


**请求参数:**

| 参数| 类型| 是否必须| 描述| 例子|
|--------------|----------|----------|---------------------------------------------------------|-----------------------|
| username     | 字符串   | 是       | 用户名                                                  | `"dimstack"`            |
| email        | 字符串   | 否       | 电子邮件地址                                            | `"test@example.com"`    |
| phone        | 字符串   | 否       | 手机号码，格式需符合 `^1[3-9]\d{9}$`                    | `"13800000000"`         |
| password     | 字符串   | 是       | 密码                                                    | `"123456"`              |
| captcha      | 字符串   | 是       | 验证码                                                  | `"pjru"`                |
| captchaKey   | 字符串   | 是       | 验证码密钥                                              | `"8f2d1c2c4fc643dc"`    |

**请求示例:**
```bash
curl -X POST "https://apilinks.cn/api/register" -H "Content-Type: application/json" -d "{\"username\": \"dimstack\", \"email\": \"test@example.com\", \"phone\": \"13800000000\", \"password\": \"123456\", \"captcha\": \"pjru\", \"captchaKey\": \"8f2d1c2c4fc643dc\"}"
```
**响应字段:**

| 字段    | 类型    | 描述                                     | 示例          |
|---------|---------|------------------------------------------|---------------|
| data    | 对象    | 存储实际数据的对象                         | -             |
| ├─ success  | 布尔值  | 标识请求是否成功的布尔值                     | `true`        |
| ├─ message  | 字符串  | 详细的响应信息                           | `"注册成功！"`|

**响应示例：**
```json
{
    "data": {
        "success": true,
        "message": "注册成功！"
    }
}
```

## LoginController - 用户登录控制器
### 用户登录接口
**地址:** /api/login

**请求协议:** POST


**内容类型:** application/json

**描述:** 用户登录接口


**请求体:**

| 参数       | 类型     | 必填 | 描述                                     | 示例                 |
|------------|----------|------|------------------------------------------|----------------------|
| username   | 字符串   | 否   | 用户名                                   | `"dimstack"`           |
| password   | 字符串   | 否   | 密码                                     | `"123456"`             |
| captcha    | 字符串   | 否   | 验证码                                   | `"2mdn"`               |
| captchaKey | 字符串   | 否   | 验证码密钥                               | `"42ffa3da6b6c4df7"`     |

**请求示例:**
```bash
curl -X POST "https://apilinks.cn/api/login" -H "Content-Type: application/json" -H "Cookie: SESSION=ODJhOGNlYTYtMDk1Yy00M2RlLTk4ZDEtNDhjYTY4MWQ2ZTUy" -d "{ \"username\": \"dimstack\", \"password\": \"123456\", \"captcha\": \"2mdn\", \"captchaKey\": \"42ffa3da6b6c4df7\"}"
```
**响应字段:**

| 字段    | 类型    | 描述                                     | 示例          |
|---------|---------|------------------------------------------|---------------|
| data    | 对象    | 存储实际数据的对象                         | -             |
| ├─ success| 布尔值  | 标识请求是否成功的布尔值                     | `true`        |
| ├─ message| 字符串  | 详细的响应信息                           | `"登录成功"`    |

**响应示例：**
```json
{
    "data": {
        "success": true,
        "message": "登录成功"
    }
}
```

### 用户登出接口
**地址:** /api/logout

**请求协议:** POST


**内容类型:** application/x-www-form-urlencoded

**描述:** 用户登出接口


**请求示例:**
```bash
curl -X POST -i "https://apilinks.cn/api/logout" -H "Cookie: SESSION=ZTVmYWI2ZjctNTg3Yy00OTBlLWI5ZmItNjFmOTJjYzUzOTg4"
```
**响应字段:**

| 字段    | 类型    | 描述                                     | 示例          |
|---------|---------|------------------------------------------|---------------|
| data    | 对象    | 存储实际数据的对象                         | -             |
| ├─ success| 布尔值  | 标识请求是否成功的布尔值                     | `true`        |
| ├─ message| 字符串  | 详细的响应信息                           | `"登出成功"`    |

**响应示例：**
```json
{
    "data": {
        "success": true,
        "message": "登出成功"
    }
}
```



## ArticleSearchController - 文章搜索控制器
### 搜索文章
**地址:** /api/articlesearch/search

**请求协议:** GET

**内容类型:** application/x-www-form-urlencoded

**描述:** 文章搜索

**请求参数:**

| 参数    | 类型     | 必填 | 描述           | 示例                |
|---------|----------|------|----------------|---------------------|
| keyword | 字符串   | 否   | 搜索关键字     | `%E5%85%B3%E4%BA%8E` (即 URL 编码的 "关于") |

**请求示例:**
```bash
注：中文需要URL编码
curl -X GET -i "https://apilinks.cn/api/articlesearch/search?keyword=%E5%85%B3%E4%BA%8E"
```
**响应字段:**

| 字段      | 类型    | 描述                                     | 示例          |
|-----------|---------|------------------------------------------|---------------|
| data      | 对象    | 存储实际数据的对象                         | -             |
| ├─ data   | 数组    | 匹配的文章列表                             | -             |
| │ ├─ title| 字符串  | 文章标题                                 | `"关于"`      |
| │ ├─ alias| 字符串  | 文章别名                                 | `"help"`      |
| │ ├─ id   | int32   | 文章ID                                   | `1`           |
| │ └─ excerpt| 字符串| 文章摘要                                 | `"关于次元栈论坛"` |
| ├─ count  | int32   | 返回的文章总数                             | `1`           |
| success   | 布尔值  | 标识请求是否成功的布尔值                     | `true`        |

**响应示例：**
```json
{
    "count": 1,
    "data": [
        {
            "alias": "help",
            "id": 1,
            "title": "关于",
            "excerpt": "关于次元栈论坛"
        }
    ],
    "success": true
}
```

## TagAndCategoryController - 标签&分类控制器
### 获取启用的分类

**地址:** /api/categories
**类型:** GET
**内容类型:** application/x-www-form-urlencoded
**描述:**
**请求示例:**

```bash
curl -X GET -i "https://apilinks.cn/api/categories"
```
**响应字段:**

| 字段                  | 类型     | 描述                                     | 示例                      |
|-----------------------|----------|------------------------------------------|---------------------------|
| data                  | 数组     | 存储所有启用分类的信息数组                 | -                         |
| ├─ id                 | int32    | 分类ID                                   | `1`                       |
| ├─ article_categories | 字符串   | 分类名称                                 | `"默认分类"`              |
| ├─ categories_explain | 字符串   | 分类说明                                 | `"默认分类"`              |
| ├─ founder            | 字符串   | 创建者标识符                             | `"075eb86f721743e3940f35869154a140175689381296899805858"` |
| ├─ create_time        | 字符串   | 创建时间                                 | `"2025-09-13T13:35:57"` |
| ├─ status             | int32    | 状态（0 表示禁用，1 表示启用）             | `1`                       |

**响应示例：**
```json
[
    {
        "id": 1,
        "article_categories": "默认分类",
        "categories_explain": "默认分类",
        "founder": "075eb86f721743e3940f35869154a140175689381296899805858",
        "create_time": "2025-09-13T13:35:57",
        "status": 1
    }
]
```

### 获取所有已启用的分类
**地址:** /api/categoriesandcount

**请求协议:** GET


**内容类型:** application/x-www-form-urlencoded

**描述:**


**请求示例:**
```bash
curl -X GET -i "https://apilinks.cn/api/categoriesandcount"
```
**响应字段:**

| 字段                  | 类型     | 描述                                     | 示例                      |
|-----------------------|----------|------------------------------------------|---------------------------|
| data                  | 数组     | 存储所有启用分类及其文章数量的信息数组     | -                         |
| ├─ id                 | int32    | 分类ID                                   | `1`                       |
| ├─ article_categories | 字符串   | 分类名称                                 | `"默认分类"`              |
| ├─ categories_explain | 字符串   | 分类说明                                 | `"默认分类"`              |
| ├─ founder            | 字符串   | 创建者标识符                             | `"075eb86f721743e3940f35869154a140175689381296899805858"` |
| ├─ create_time        | 字符串   | 创建时间                                 | `"2025-09-13T13:35:57"` |
| ├─ status             | int32    | 状态（0 表示禁用，1 表示启用）             | `1`                       |
| ├─ articleCount       | int64    | 该分类下的文章数量                       | `2`                       |

**响应示例：**
```json
[
    {
        "id": 1,
        "article_categories": "默认分类",
        "categories_explain": "默认分类",
        "founder": "075eb86f721743e3940f35869154a140175689381296899805858",
        "create_time": "2025-09-13T13:35:57",
        "status": 1,
        "articleCount": 2
    }
]
```

### 获取该分类的所有文章
**地址:** /api/categories/{category}/articles

**请求协议:** GET


**内容类型:** application/x-www-form-urlencoded

**描述:**


**请求参数:**

| 参数 | 类型   | 必填 | 描述           | 示例 |
|------|--------|------|----------------|------|
| page | int32  | 是   | 当前页码       | `1`  |
| size | int32  | 是   | 每页显示的文章数 | `10` |

**请求示例:**
```bash
curl -X GET -i "https://apilinks.cn/api/categories/%E9%BB%98%E8%AE%A4%E5%88%86%E7%B1%BB/articles?page=1&size=10"
```
**响应字段:**

| 字段           | 类型   | 描述                                     | 示例                      |
|----------------|--------|------------------------------------------|---------------------------|
| data           | 对象   | 包含文章列表及分页信息的对象             | -                         |
| ├─ data         | 数组   | 文章列表                                 | -                         |
| │ ├─ id         | int32  | 文章ID                                   | `2`                       |
| │ ├─ article_id | 字符串 | 文章唯一标识符                           | `"3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1"` |
| │ ├─ title      | 字符串 | 文章标题                                 | `"致谢"`                  |
| │ ├─ excerpt    | 字符串 | 文章摘要                                 | `"致谢"`                  |
| │ ├─ image      | 字符串 | 文章封面图 URL                           | `"https://pan.apilinks.cn/f/Y5Sw/e5f2f1fe4bfceeb32e88217577732c04.jpg"` |
| │ ├─ date       | 字符串 | 发布日期                                 | `"2025-09-14 11:26:52"` |
| │ ├─ author     | 字符串 | 作者                                     | `"admin"`                 |
| │ ├─ category   | 字符串 | 文章所属分类                             | `"默认分类"`              |
| │ ├─ tag        | 字符串 | 文章所属标签                             | `"次元栈,默认标签"`              |
| │ └─ alias      | 字符串 | 文章别名                                 | `"thanks"`                |
| ├─ total        | int32  | 总文章数                                 | `3`                       |
| ├─ page         | int32  | 当前页码                                 | `1`                       |
| ├─ size         | int32  | 每页显示的文章数                         | `10`                      |
| └─ total_pages  | int32  | 总页数                                   | `1`                       |
**响应示例：**
```json
{
    "data": [
        {
            "id": 2,
            "article_id": "3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1",
            "title": "致谢",
            "excerpt": "致谢",
            "image": "https://pan.apilinks.cn/f/Y5Sw/e5f2f1fe4bfceeb32e88217577732c04.jpg",
            "date": "2025-09-14 11:26:52",
            "author": "admin",
            "category": "默认分类",
            "tag": "次元栈,默认标签",
            "alias": "thanks"
        },
        {
            "id": 1,
            "article_id": "a1d3112d-fd8e-4484-9c3c-bad24a9e2019",
            "title": "关于",
            "excerpt": "关于",
            "image": "https://pan.apilinks.cn/f/29um/Image_2756849649102.jpg",
            "date": "2025-09-13 12:42:47",
            "author": "admin",
            "category": "默认分类",
            "tag": "次元栈,默认标签",
            "alias": "about"
        }
    ],
    "total": 3,
    "page": 1,
    "size": 10,
    "total_pages": 1
}
```

## HotArticleController - 热门文章控制器
### 获取热门文章
**地址:** /api/hot/articles

**请求协议:** GET


**内容类型:** application/x-www-form-urlencoded

**描述:**

**请求示例:**
```bash
curl -X GET -i "https://apilinks.cn/api/hot/articles"
```
**响应字段:**

| 字段         | 类型     | 描述                             | 示例                          |
|--------------|----------|----------------------------------|-------------------------------|
| data         | 数组     | 存储热门文章的信息数组             | -                             |
| ├─ id         | int32    | 文章ID                           | `2`                           |
| ├─ article_id | 字符串   | 文章唯一标识符                   | `"3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1"` |
| ├─ title      | 字符串   | 文章标题                         | `"致谢"`                      |
| ├─ excerpt    | 字符串   | 文章摘要                         | `"参与次元栈论坛项目的朋友"`  |
| ├─ date       | 字符串   | 发布日期                         | `"2025-09-14 11:26:52"`       |
| ├─ author     | 字符串   | 作者                             | `"lingview"`                  |
| ├─ category   | 字符串   | 文章所属分类                     | `"默认分类"`                  |
| ├─ page_views | int32    | 浏览次数                         | `53`                          |
| └─ alias      | 字符串   | 文章别名                         | `"thanks"`                    |

**响应示例：**
```json
[
    {
        "id": 2,
        "article_id": "3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1",
        "title": "致谢",
        "excerpt": "参与次元栈论坛项目的朋友",
        "date": "2025-09-14 11:26:52",
        "author": "lingview",
        "category": "默认分类",
        "page_views": 53,
        "alias": "thanks"
    },
    {
        "id": 1,
        "article_id": "a1d3112d-fd8e-4484-9c3c-bad24a9e2019",
        "title": "关于",
        "excerpt": "关于次元栈论坛",
        "date": "2025-09-13 12:42:47",
        "author": "lingview",
        "category": "默认分类",
        "page_views": 44,
        "alias": "help"
    }
]
```


## CommentController - 评论控制器
### 获取该文章下所有评论
**地址:** /api/comments/article/{articleAlias}

**请求协议:** GET


**内容类型:** application/x-www-form-urlencoded

**描述:**


**请求示例:**
```bash
curl -X GET -i "https://apilinks.cn/api/comments/article/thanks"
```
**响应字段:**

| 字段                | 类型   | 描述                                | 示例                          |
|---------------------|--------|-------------------------------------|-------------------------------|
| data                | 数组   | 存储评论及子评论的信息数组          | -                             |
| ├─ comment_id        | 字符串 | 评论唯一标识符                    | `"ef5bc7a4-435c-4f0e-a9b3-dcbd678010a4"` |
| ├─ user_id           | 字符串 | 用户唯一标识符                    | `"5fd777d3290540ac8eca0ccc84ebb1eb175783255951989608445"` |
| ├─ username          | 字符串 | 用户名                              | `"hanbingniao"`               |
| ├─ avatar            | 字符串 | 用户头像 URL                        | `null` 或 `"/upload/admin/avatar/avatar-4b584fdb-38a7-4c27-8d56-ec72f4bab50c-1757829520.png"` |
| ├─ content           | 字符串 | 评论内容                            | `"\uD83D\uDC4D"`              |
| ├─ create_time       | 字符串 | 评论创建时间                        | `"2025-09-14T14:49:39"`       |
| ├─ comment_like_count| int64  | 评论点赞数                          | `0`                           |
| ├─ to_comment_id     | 字符串 | 回复评论的唯一标识符（如果存在）    | `null` 或 `"ef5bc7a4-435c-4f0e-a9b3-dcbd678010a4"` |
| ├─ to_comment_user_id| 字符串 | 回复用户的唯一标识符（如果存在）    | `null` 或 `"075eb86f721743e3940f35869154a140175689381296899805858"` |
| ├─ to_comment_username| 字符串 | 回复用户名（如果存在）              | `null` 或 `"lingview"`          |
| ├─ article_id        | 字符串 | 关联文章的唯一标识符              | `null`                        |
| ├─ article_title     | 字符串 | 关联文章的标题                    | `null`                        |
| ├─ status            | int32  | 评论状态（例如：0 表示禁用，1 表示启用） | `null`                        |
| ├─ children          | 数组   | 子评论列表                          | -                             |
| │ ├─ comment_id      | 字符串 | 子评论唯一标识符                  | `"ce07e85f-1c71-4ab4-a31c-f1b05531ee94"` |
| │ ├─ user_id         | 字符串 | 子评论用户的唯一标识符            | `"075eb86f721743e3940f35869154a140175689381296899805858"` |
| │ ├─ username        | 字符串 | 子评论用户名                      | `"lingview"`                  |
| │ ├─ avatar          | 字符串 | 子评论用户头像 URL                | `"/upload/lmt/avatar/avatar-cc57801d-cf81-4a0b-b7f6-eae0edbc131d-1758351584.jpg"` |
| │ ├─ content         | 字符串 | 子评论内容                        | `"好久不见hhh"`               |
| │ ├─ create_time     | 字符串 | 子评论创建时间                    | `"2025-09-14T14:57:24"`       |
| │ ├─ comment_like_count| int64 | 子评论点赞数                      | `0`                           |
| │ ├─ to_comment_id   | 字符串 | 子评论回复的评论唯一标识符（如果存在） | `null` 或 `"ef5bc7a4-435c-4f0e-a9b3-dcbd678010a4"` |
| │ ├─ to_comment_user_id| 字符串 | 子评论回复的用户唯一标识符（如果存在） | `null`                        |
| │ ├─ to_comment_username| 字符串 | 子评论回复的用户名（如果存在）    | `null`                        |
| │ ├─ article_id      | 字符串 | 关联子评论的文章唯一标识符        | `null`                        |
| │ ├─ article_title   | 字符串 | 关联子评论的文章标题              | `null`                        |
| │ ├─ status          | int32  | 子评论状态（例如：0 表示禁用，1 表示启用） | `null`                        |
| │ └─ is_liked        | 布尔值  | 当前用户是否点赞                 | `null`                        |

**响应示例：**
```json
[
    {
        "comment_id": "13448949-ec6d-4b0a-a6d1-cda606734d64",
        "user_id": "075eb86f721743e3940f35869154a140175689381296899805858",
        "username": "admin",
        "avatar": "/upload/admin/avatar/avatar-3e04e348-8bef-4abe-a164-572e0421f17e-1757579183.jpeg",
        "content": "Hello World",
        "create_time": "2025-09-25T21:44:33",
        "comment_like_count": 2,
        "to_comment_id": null,
        "to_comment_user_id": null,
        "to_comment_username": null,
        "article_id": null,
        "article_title": null,
        "status": null,
        "is_liked": true,
        "children": [
            {
                "comment_id": "f97090ef-7b31-4beb-aefd-5bab5c2bd07c",
                "user_id": "075eb86f721743e3940f35869154a140175689381296899805858",
                "username": "admin",
                "avatar": "/upload/admin/avatar/avatar-3e04e348-8bef-4abe-a164-572e0421f17e-1757579183.jpeg",
                "content": "你好世界",
                "create_time": "2025-09-25T21:44:46",
                "comment_like_count": 1,
                "to_comment_id": "13448949-ec6d-4b0a-a6d1-cda606734d64",
                "to_comment_user_id": null,
                "to_comment_username": null,
                "article_id": null,
                "article_title": null,
                "status": null,
                "is_liked": true,
                "children": [
                    {
                        "comment_id": "9685f56b-38f7-4493-b62a-c9abc93a481e",
                        "user_id": "d6fe60a7bfd64d86a547d8f335af2e94175880793855984296059",
                        "username": "test",
                        "avatar": null,
                        "content": "好久不见",
                        "create_time": "2025-09-25T21:46:18",
                        "comment_like_count": 0,
                        "to_comment_id": "f97090ef-7b31-4beb-aefd-5bab5c2bd07c",
                        "to_comment_user_id": null,
                        "to_comment_username": null,
                        "article_id": null,
                        "article_title": null,
                        "status": null,
                        "is_liked": false,
                        "children": []
                    }
                ]
            },
            {
                "comment_id": "2838e598-aa84-4456-8639-9347708539ff",
                "user_id": "d6fe60a7bfd64d86a547d8f335af2e94175880793855984296059",
                "username": "test",
                "avatar": null,
                "content": "hello",
                "create_time": "2025-09-25T21:46:30",
                "comment_like_count": 0,
                "to_comment_id": "13448949-ec6d-4b0a-a6d1-cda606734d64",
                "to_comment_user_id": null,
                "to_comment_username": null,
                "article_id": null,
                "article_title": null,
                "status": null,
                "is_liked": false,
                "children": []
            }
        ]
    },
    {
        "comment_id": "d38fd390-bdf4-4b22-bf90-4449d3f4137c",
        "user_id": "d6fe60a7bfd64d86a547d8f335af2e94175880793855984296059",
        "username": "test",
        "avatar": null,
        "content": "评论测试",
        "create_time": "2025-09-25T21:46:09",
        "comment_like_count": 0,
        "to_comment_id": null,
        "to_comment_user_id": null,
        "to_comment_username": null,
        "article_id": null,
        "article_title": null,
        "status": null,
        "is_liked": false,
        "children": []
    }
]
```

### 添加评论
**地址:** /api/comments

**请求协议:** POST


**内容类型:** application/json

**描述:**


**请求体:**

| 参数          | 类型   | 必填 | 描述                                | 示例                |
|---------------|--------|------|-------------------------------------|---------------------|
| article_alias | 字符串 | 是   | 文章别名                            | `thanks`            |
| content       | 字符串 | 是   | 评论内容                            | `"接口测试"`        |
| to_comment_id | 字符串 | 否   | 回复的评论唯一标识符（如果存在）    | `""` 或 `上级评论id` |

**请求示例:**
```bash
curl -X POST -H "Content-Type: application/json" -H "Cookie: SESSION=YTI2MDM3OWUtYThhNi00ZTEwLTg3MTMtYjU4Y2YyOTAyNGZj" -i "https://apilinks.cn/api/comments" --data "{\"article_alias\": \"thanks\", \"content\": \"接口测试\", \"to_comment_id\": \"\"}"
```
**响应字段:**

成功发送后返回空响应体，返回http状态码200

**响应示例：**
```json
无
```

### 点赞评论
**地址:** /api/comments/{commentId}/like

**请求协议:** POST


**内容类型:** application/x-www-form-urlencoded

**描述:**


**请求参数:**

| 参数     | 类型   | 必填 | 描述              | 示例                                   |
|----------|--------|------|-------------------|----------------------------------------|
| commentId| 字符串 | 是   | 评论唯一标识符    | `f7e8930a-becf-42ee-a3f4-6a09d6af837c` |

**请求示例:**
```bash
curl -X POST -H "Cookie: SESSION=YTI2MDM3OWUtYThhNi00ZTEwLTg3MTMtYjU4Y2YyOTAyNGZj" -i "https://apilinks.cn/api/comments/f7e8930a-becf-42ee-a3f4-6a09d6af837c/like"
```
**响应字段:**

成功点赞后返回空响应体，返回http状态码200

**响应示例：**
```json
无
```

### 删除评论
**地址:** /api/comments/{commentId}

**请求协议:** DELETE


**内容类型:** application/x-www-form-urlencoded

**描述:**


**请求参数:**

| 参数     | 类型   | 必填 | 描述              | 示例                                   |
|----------|--------|------|-------------------|----------------------------------------|
| commentId| 字符串 | 是   | 评论唯一标识符    | `239afa5d-37af-4aad-9aee-26cea17353b0` |

**请求示例:**
```bash
curl -X DELETE -H "Cookie: SESSION=YTI2MDM3OWUtYThhNi00ZTEwLTg3MTMtYjU4Y2YyOTAyNGZj" -i "https://apilinks.cn/api/comments/239afa5d-37af-4aad-9aee-26cea17353b0"
```
**响应字段:**

成功删除后返回空响应体，返回http状态码200

**响应示例：**
```json
获取用户登录状态
```

## UserController - 用户控制器
### getUserStatus
**地址:** /api/user/status

**类型:** GET


**内容类型:** application/x-www-form-urlencoded

**描述:**


**请求示例:**
```bash
curl -X GET -H "Cookie: SESSION=YTI2MDM3OWUtYThhNi00ZTEwLTg3MTMtYjU4Y2YyOTAyNGZj" -i "https://apilinks.cn/api/user/status"
```
**响应字段:**

| 字段       | 类型    | 描述                    | 示例             |
|------------|---------|-------------------------|------------------|
| data       | 对象    | 数据对象                |                  |
| └─ loggedIn| 布尔值  | 是否已登录              | `true`           |
| └─ username| 字符串  | 用户名                  | `"lingview"`     |
| └─ message| 字符串  | 用户状态消息            | `""`             |

**响应示例：**
```json
{
  "loggedIn": true,
  "username": "lingview"
}
```


## ReadArticleController - 文章阅读控制器
### 检查文章密码
**地址:** http://{{server}}/api/article/{alias}/check-password

**请求协议:** GET


**内容类型:** application/x-www-form-urlencoded

**描述:**


**请求参数:**

| 参数   | 类型   | 必填 | 描述              | 示例               |
|--------|--------|------|-------------------|--------------------|
| alias  | 字符串 | 是   | 文章别名          | `thanks`           |

**请求示例:**
```bash
curl -X GET -i "https://apilinks.cn/api/article/thanks/check-password"
```
**响应字段:**

| 字段       | 类型    | 描述                    | 示例                 |
|------------|---------|-------------------------|----------------------|
| data       | 对象    | 数据对象                |                      |
| └─ success| 布尔值  | 请求是否成功            | `true`               |
| └─ needPassword| 布尔值| 文章是否需要密码        | `false`              |

**响应示例：**
```json
{
  "success": true,
  "needPassword": false
}
```

### 获取文章内容

**地址:** /api/article/{alias}

**类型:** GET


**内容类型:** application/x-www-form-urlencoded

**描述:**


**请求参数:**
| 参数   | 类型   | 必填 | 描述              | 示例               |
|--------|--------|------|-------------------|--------------------|
| alias  | 字符串 | 是   | 文章别名          | `about`            |
| password | 字符串 | 否   | 文章密码          | `mysecretpassword` |

**请求示例:**
```bash
curl -X GET -i 'http://{{server}}/api/article/{alias}?password='
```
**响应字段:**

| 字段       | 类型    | 描述                    | 示例                 |
|------------|---------|-------------------------|----------------------|
| data       | 对象    | 数据对象                |                      |
| └─ id      | 整数    | 文章 ID                 | `1`                  |
| └─ uuid    | 字符串  | 文章 UUID               | `"075eb86f721743e3940f35869154a140175689381296899805858"` |
| └─ article_id | 字符串 | 文章唯一标识符        | `"a1d3112d-fd8e-4484-9c3c-bad24a9e2019"` |
| └─ article_name | 字符串 | 文章标题              | `"关于"`             |
| └─ article_cover | 字符串 | 文章封面图          | `"https://pan.apilinks.cn/f/29um/Image_2756849649102.jpg"` |
| └─ excerpt  | 字符串  | 文章摘要              | `"关于次元栈论坛"`   |
| └─ article_content | 字符串 | 文章内容            | `"# 关于次元栈\n## \uD83C\uDF1F 项目简介\n\n**次元栈** 是一个面向多元兴趣群体的内容社区平台，致力于为 **Vsinger 爱好者**、**Minecraft 创作者** 与 **计算机技术爱好者** 提供一个自由表达、知识共享与创作沉淀的空间。\n\n平台核心功能：\n- \uD83D\uDCDD 文章发布与内容管理（CMS）\n- \uD83D\uDCAC 用户互动：评论、点赞、收藏\n- \uD83D\uDD16 标签分类：支持跨圈层内容组织（如 #洛天依、#乐正绫、#星尘、#红石电路、#Java）\n- \uD83D\uDC65 用户系统：注册、登录、个人主页\n- \uD83D\uDD0D 内容搜索与推荐\n- \uD83D\uDCF1 响应式前端，支持移动端浏览\n\n---\n\n## \uD83D\uDEE0 技术栈\n\n| 层级       | 技术选型                                                         |\n|------------|--------------------------------------------------------------|\n| **后端**   | Java 17, Spring Boot 3.5, Mybatis, MySQL, Redis, Cookie      |\n| **前端**   | React 19, JavaScript, Vite, Axios, Tailwind CSS              |\n| **构建**   | Maven (后端), npm/pnpm (前端)                                    |\n| **部署**   | Docker, Nginx, Linux, Windows                                |\n---\n\n"` |
| └─ page_views  | 整数    | 阅读次数              | `48`                 |
| └─ like_count  | 整数    | 点赞次数              | `0`                  |
| └─ favorite_count | 整数    | 收藏次数            | `0`                  |
| └─ password  | 字符串  | 文章密码              | `""`                 |
| └─ tag  | 字符串  | 文章标签              | `"默认标签"`         |
| └─ category  | 字符串  | 文章分类              | `"默认分类"`         |
| └─ alias  | 字符串  | 文章别名              | `"about"`            |
| └─ create_time | 字符串  | 创建时间              | `"2025-09-13 12:42:47"` |
| └─ status  | 整数    | 文章状态              | `1`                  |
| success    | 布尔值  | 请求是否成功          | `true`               |

**响应示例：**
```json
{
  "data": {
    "id": 1,
    "uuid": "075eb86f721743e3940f35869154a140175689381296899805858",
    "article_id": "a1d3112d-fd8e-4484-9c3c-bad24a9e2019",
    "article_name": "关于",
    "article_cover": "https://pan.apilinks.cn/f/29um/Image_2756849649102.jpg",
    "excerpt": "关于次元栈论坛",
    "article_content": "# 关于次元栈\n## \uD83C\uDF1F 项目简介\n\n**次元栈** 是一个面向多元兴趣群体的内容社区平台，致力于为 **Vsinger 爱好者**、**Minecraft 创作者** 与 **计算机技术爱好者** 提供一个自由表达、知识共享与创作沉淀的空间。\n\n平台核心功能：\n- \uD83D\uDCDD 文章发布与内容管理（CMS）\n- \uD83D\uDCAC 用户互动：评论、点赞、收藏\n- \uD83D\uDD16 标签分类：支持跨圈层内容组织（如 #洛天依、#乐正绫、#星尘、#红石电路、#Java）\n- \uD83D\uDC65 用户系统：注册、登录、个人主页\n- \uD83D\uDD0D 内容搜索与推荐\n- \uD83D\uDCF1 响应式前端，支持移动端浏览\n\n---\n\n## \uD83D\uDEE0 技术栈\n\n| 层级       | 技术选型                                                         |\n|------------|--------------------------------------------------------------|\n| **后端**   | Java 17, Spring Boot 3.5, Mybatis, MySQL, Redis, Cookie      |\n| **前端**   | React 19, JavaScript, Vite, Axios, Tailwind CSS              |\n| **构建**   | Maven (后端), npm/pnpm (前端)                                    |\n| **部署**   | Docker, Nginx, Linux, Windows                                |\n---\n\n",
    "page_views": 48,
    "like_count": 0,
    "favorite_count": 0,
    "password": "",
    "tag": "默认标签",
    "category": "默认分类",
    "alias": "about",
    "create_time": "2025-09-13 12:42:47",
    "status": 1
  },
  "success": true
}
```

