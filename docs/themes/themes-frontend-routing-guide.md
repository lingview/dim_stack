# 次元栈 - DimStack API

次元栈主题开发者接口文档

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer

# Default

## GET 获取首页文章列表

GET /api/articles

用于系统首页获取文章列表，支持按分类过滤

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|page|query|integer(int32)| 否 |页码|
|size|query|integer(int32)| 否 |每页数量|
|category|query|string| 否 |按分类名过滤|

> 返回示例

> 200 Response

```json
{
  "data": [
    {
      "id": 0,
      "article_id": "string",
      "title": "string",
      "excerpt": "string",
      "image": "string",
      "date": "string",
      "author": "string",
      "author_avatar": "string",
      "category": "string",
      "tag": "string",
      "alias": "string",
      "password": true
    }
  ],
  "total": 0,
  "page": 0,
  "size": 0,
  "total_pages": 0
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|文章列表|[PaginatedArticlesResponse](#schemapaginatedarticlesresponse)|

## GET 获取站点名称

GET /api/site/name

返回站点名称

> 返回示例

> 200 Response

```
"string"
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|站点名称|string|

## GET 获取站点图标

GET /api/site/icon

返回站点图标URL

> 返回示例

> 200 Response

```
"string"
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|站点图标URL|string|

## GET 获取首屏Hero配置

GET /api/site/hero

返回首屏Hero配置

> 返回示例

> 200 Response

```json
{
  "title": "string",
  "subtitle": "string",
  "image": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Hero配置|[HeroConfig](#schemaheroconfig)|

## GET 获取版权信息

GET /api/site/copyright

返回版权信息

> 返回示例

> 200 Response

```
"string"
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|版权信息|string|

## GET 获取ICP备案号

GET /api/site/icp-record

返回ICP备案号

> 返回示例

> 200 Response

```
"string"
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ICP备案号|string|

## GET 获取公安备案号

GET /api/site/mps-record

返回公安备案号

> 返回示例

> 200 Response

```
"string"
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|公安备案号|string|

## GET 获取评论开关状态

GET /api/site/enable-comment

返回评论是否启用

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "enableComment": true
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|评论开关状态|[EnableCommentResponse](#schemaenablecommentresponse)|

## GET 获取注册开关状态

GET /api/site/enable-register

返回注册是否启用

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "enableRegister": true
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|注册开关状态|[EnableRegisterResponse](#schemaenableregisterresponse)|

## GET 获取全局自定义代码

GET /api/site/global-head-code

返回全局自定义代码

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "globalHeadCode": "string",
    "contentHeadCode": "string",
    "footerCode": "string"
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|全局自定义代码|[CustomCodeResponse](#schemacustomcoderesponse)|

## GET 获取内容自定义代码

GET /api/site/content-head-code

返回内容自定义代码

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "globalHeadCode": "string",
    "contentHeadCode": "string",
    "footerCode": "string"
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|内容自定义代码|[CustomCodeResponse](#schemacustomcoderesponse)|

## GET 获取页脚自定义代码

GET /api/site/footer-code

返回页脚自定义代码

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "globalHeadCode": "string",
    "contentHeadCode": "string",
    "footerCode": "string"
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|页脚自定义代码|[CustomCodeResponse](#schemacustomcoderesponse)|

## GET 获取验证码

GET /api/captcha

获取图形验证码，返回Base64图片与配套的key

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "image": "string",
    "key": "string"
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|验证码信息|[CaptchaResponse](#schemacaptcharesponse)|

## POST 用户注册接口

POST /api/register

用户注册

> Body 请求参数

```json
{
  "username": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "captcha": "string",
  "captchaKey": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|[RegisterRequest](#schemaregisterrequest)| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {},
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|注册结果|[ApiResponse](#schemaapiresponse)|

## POST 用户登录接口

POST /api/login

用户登录

> Body 请求参数

```json
{
  "username": "string",
  "password": "string",
  "captcha": "string",
  "captchaKey": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|[LoginRequest](#schemaloginrequest)| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {},
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|登录结果|[ApiResponse](#schemaapiresponse)|

## POST 用户登出接口

POST /api/logout

用户登出

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {},
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|登出结果|[ApiResponse](#schemaapiresponse)|

## POST 发送找回密码验证码

POST /api/forgot-password/send-captcha

发送找回密码验证码到邮箱

> Body 请求参数

```json
{
  "username": "string",
  "email": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|[ForgotPasswordSendCaptchaRequest](#schemaforgotpasswordsendcaptcharequest)| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {},
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|发送结果|[ApiResponse](#schemaapiresponse)|

## POST 校验找回密码验证码

POST /api/forgot-password/verify

校验找回密码验证码

> Body 请求参数

```json
{
  "username": "string",
  "email": "string",
  "captcha": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|[ForgotPasswordVerifyRequest](#schemaforgotpasswordverifyrequest)| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {},
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|验证结果|[ApiResponse](#schemaapiresponse)|

## POST 重置密码

POST /api/forgot-password/reset

重置用户密码

> Body 请求参数

```json
{
  "username": "string",
  "email": "string",
  "newPassword": "string",
  "confirmNewPassword": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|[ForgotPasswordResetRequest](#schemaforgotpasswordresetrequest)| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {},
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|重置结果|[ApiResponse](#schemaapiresponse)|

## GET 获取登录状态

GET /api/user/status

获取当前用户登录状态及基本信息

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "loggedIn": true,
    "username": "string",
    "avatar": "string",
    "message": "string"
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|用户登录状态|[UserStatusResponse](#schemauserstatusresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|未登录|[UnauthorizedResponse](#schemaunauthorizedresponse)|

## GET 搜索文章

GET /api/articlesearch/search

搜索文章

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|keyword|query|string| 否 |搜索关键字（中文需URL编码）|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "count": 0,
    "data": [
      {
        "title": "string",
        "alias": "string",
        "id": 0,
        "excerpt": "string"
      }
    ]
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|搜索结果|[SearchResponse](#schemasearchresponse)|

## GET 获取所有启用的标签

GET /api/tags

返回所有启用的标签

> 返回示例

> 200 Response

```json
[
  {
    "id": 0,
    "tag_name": "string",
    "tag_explain": "string",
    "founder": "string",
    "create_time": "2019-08-24T14:15:22Z",
    "status": 0
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|标签列表|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|[[Tag](#schematag)]|false|none||none|
|» id|integer(int32)|false|none||标签ID|
|» tag_name|string|false|none||标签名称|
|» tag_explain|string|false|none||标签说明|
|» founder|string|false|none||创建者UUID|
|» create_time|string(date-time)|false|none||创建时间|
|» status|integer(int32)|false|none||状态（0禁用，1启用）|

## GET 获取启用的分类

GET /api/categories

返回启用的分类

> 返回示例

> 200 Response

```json
[
  {
    "id": 0,
    "article_categories": "string",
    "categories_explain": "string",
    "founder": "string",
    "create_time": "2019-08-24T14:15:22Z",
    "status": 0,
    "parent_id": 0,
    "level": 0,
    "full_path": "string",
    "sort_order": 0,
    "article_count": 0
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|分类列表|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|[[Category](#schemacategory)]|false|none||none|
|» id|integer(int32)|false|none||分类ID|
|» article_categories|string|false|none||分类名称|
|» categories_explain|string|false|none||分类说明|
|» founder|string|false|none||创建者UUID|
|» create_time|string(date-time)|false|none||创建时间|
|» status|integer(int32)|false|none||状态（0禁用，1启用）|
|» parent_id|integer(int32)¦null|false|none||父分类ID（顶级为null）|
|» level|integer(int32)¦null|false|none||层级|
|» full_path|string¦null|false|none||分类完整路径|
|» sort_order|integer(int32)¦null|false|none||排序值|
|» article_count|integer(int32)¦null|false|none||文章数|

## GET 获取所有已启用的分类及文章数

GET /api/categoriesandcount

返回所有已启用的分类及文章数

> 返回示例

> 200 Response

```json
[
  {
    "id": 0,
    "article_categories": "string",
    "categories_explain": "string",
    "founder": "string",
    "create_time": "2019-08-24T14:15:22Z",
    "status": 0,
    "parent_id": 0,
    "level": 0,
    "full_path": "string",
    "sort_order": 0,
    "article_count": 0,
    "articleCount": 0
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|分类列表|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|[allOf]|false|none||none|

*allOf*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|[Category](#schemacategory)|false|none||none|
|»» id|integer(int32)|false|none||分类ID|
|»» article_categories|string|false|none||分类名称|
|»» categories_explain|string|false|none||分类说明|
|»» founder|string|false|none||创建者UUID|
|»» create_time|string(date-time)|false|none||创建时间|
|»» status|integer(int32)|false|none||状态（0禁用，1启用）|
|»» parent_id|integer(int32)¦null|false|none||父分类ID（顶级为null）|
|»» level|integer(int32)¦null|false|none||层级|
|»» full_path|string¦null|false|none||分类完整路径|
|»» sort_order|integer(int32)¦null|false|none||排序值|
|»» article_count|integer(int32)¦null|false|none||文章数|

*and*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|object|false|none||none|
|»» articleCount|integer(int64)|false|none||该分类下文章数量|

## GET 获取某分类下的所有文章

GET /api/categories/articles

获取某分类下的所有文章

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|category|query|string| 是 |分类名称（中文需URL编码）|
|page|query|integer(int32)| 否 |当前页码|
|size|query|integer(int32)| 否 |每页文章数|

> 返回示例

> 200 Response

```json
{
  "data": [
    {
      "id": 0,
      "article_id": "string",
      "title": "string",
      "excerpt": "string",
      "image": "string",
      "date": "string",
      "author": "string",
      "author_avatar": "string",
      "category": "string",
      "tag": "string",
      "alias": "string",
      "password": true
    }
  ],
  "total": 0,
  "page": 0,
  "size": 0,
  "total_pages": 0
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|分类文章列表|[PaginatedArticlesResponse](#schemapaginatedarticlesresponse)|

## GET 获取某标签下的所有文章

GET /api/tags/{tag}/articles

获取某标签下的所有文章

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|tag|path|string| 是 |标签名称（中文需URL编码）|
|page|query|integer(int32)| 否 |当前页码|
|size|query|integer(int32)| 否 |每页文章数|

> 返回示例

> 200 Response

```json
{
  "data": [
    {
      "id": 0,
      "article_id": "string",
      "title": "string",
      "excerpt": "string",
      "image": "string",
      "date": "string",
      "author": "string",
      "author_avatar": "string",
      "category": "string",
      "tag": "string",
      "alias": "string",
      "password": true
    }
  ],
  "total": 0,
  "page": 0,
  "size": 0,
  "total_pages": 0
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|标签文章列表|[PaginatedArticlesResponse](#schemapaginatedarticlesresponse)|

## GET 获取热门文章

GET /api/hot/articles

返回热门文章列表

> 返回示例

> 200 Response

```json
[
  {
    "id": 0,
    "article_id": "string",
    "title": "string",
    "excerpt": "string",
    "date": "string",
    "author": "string",
    "category": "string",
    "page_views": 0,
    "alias": "string"
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|热门文章列表|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|[[HotArticle](#schemahotarticle)]|false|none||none|
|» id|integer(int32)|false|none||文章ID|
|» article_id|string|false|none||文章UUID|
|» title|string|false|none||文章标题|
|» excerpt|string|false|none||文章摘要|
|» date|string|false|none||发布日期|
|» author|string|false|none||作者|
|» category|string|false|none||文章分类|
|» page_views|integer(int32)|false|none||浏览次数|
|» alias|string|false|none||文章别名|

## GET 检查文章是否需要密码

GET /api/article/{alias}/check-password

检查文章是否需要密码

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|alias|path|string| 是 |文章别名|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "needPassword": true
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|密码检查结果|[CheckPasswordResponse](#schemacheckpasswordresponse)|

## GET 获取文章内容

GET /api/article/{alias}

获取文章详细内容

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|alias|path|string| 是 |文章别名|
|password|query|string| 否 |文章密码（按需填写）|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "id": 0,
    "uuid": "string",
    "article_id": "string",
    "article_name": "string",
    "article_cover": "string",
    "excerpt": "string",
    "article_content": "string",
    "page_views": 0,
    "like_count": 0,
    "favorite_count": 0,
    "password": "string",
    "tag": "string",
    "category": "string",
    "alias": "string",
    "author": "string",
    "avatar": "string",
    "create_time": "string",
    "status": 0,
    "enable_comment": 0
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|文章内容|[ArticleDetailResponse](#schemaarticledetailresponse)|

## GET 获取文章点赞状态

GET /api/article/{alias}/liked

获取当前用户对文章的点赞状态

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|alias|path|string| 是 |文章别名|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "liked": true
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|点赞状态|[LikeStatusResponse](#schemalikestatusresponse)|

## POST 点赞/取消点赞文章

POST /api/article/{alias}/like

点赞或取消点赞文章

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|alias|path|string| 是 |文章别名|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "success": true
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|点赞操作结果|[LikeResponse](#schemalikeresponse)|

## GET 获取文章下所有评论

GET /api/comments/article/{articleAlias}

获取文章下所有评论（树形结构）

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|articleAlias|path|string| 是 |文章别名|

> 返回示例

> 200 Response

```json
[
  {
    "comment_id": "string",
    "user_id": "string",
    "username": "string",
    "avatar": "string",
    "content": "string",
    "create_time": "2019-08-24T14:15:22Z",
    "comment_like_count": 0,
    "to_comment_id": "string",
    "to_comment_user_id": "string",
    "to_comment_username": "string",
    "article_id": "string",
    "article_title": "string",
    "status": 0,
    "is_liked": true,
    "children": [
      {
        "comment_id": "string",
        "user_id": "string",
        "username": "string",
        "avatar": "string",
        "content": "string",
        "create_time": "2019-08-24T14:15:22Z",
        "comment_like_count": 0,
        "to_comment_id": "string",
        "to_comment_user_id": "string",
        "to_comment_username": "string",
        "article_id": "string",
        "article_title": "string",
        "status": 0,
        "is_liked": true,
        "children": [
          {
            "comment_id": "string",
            "user_id": "string",
            "username": "string",
            "avatar": "string",
            "content": "string",
            "create_time": "2019-08-24T14:15:22Z",
            "comment_like_count": 0,
            "to_comment_id": "string",
            "to_comment_user_id": "string",
            "to_comment_username": "string",
            "article_id": "string",
            "article_title": "string",
            "status": 0,
            "is_liked": true,
            "children": [
              null
            ]
          }
        ]
      }
    ]
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|评论列表|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|[[Comment](#schemacomment)]|false|none||none|
|» comment_id|string|false|none||评论唯一标识|
|» user_id|string|false|none||评论者UUID|
|» username|string|false|none||评论者用户名|
|» avatar|string¦null|false|none||评论者头像|
|» content|string|false|none||评论内容|
|» create_time|string(date-time)|false|none||评论时间|
|» comment_like_count|integer(int64)|false|none||点赞数|
|» to_comment_id|string¦null|false|none||回复的评论ID|
|» to_comment_user_id|string¦null|false|none||被回复者UUID|
|» to_comment_username|string¦null|false|none||被回复者用户名|
|» article_id|string¦null|false|none||关联文章ID|
|» article_title|string¦null|false|none||关联文章标题|
|» status|integer(int32)¦null|false|none||评论状态|
|» is_liked|boolean¦null|false|none||当前用户是否已点赞|
|» children|[[Comment](#schemacomment)]|false|none||子评论列表|
|»» comment_id|string|false|none||评论唯一标识|
|»» user_id|string|false|none||评论者UUID|
|»» username|string|false|none||评论者用户名|
|»» avatar|string¦null|false|none||评论者头像|
|»» content|string|false|none||评论内容|
|»» create_time|string(date-time)|false|none||评论时间|
|»» comment_like_count|integer(int64)|false|none||点赞数|
|»» to_comment_id|string¦null|false|none||回复的评论ID|
|»» to_comment_user_id|string¦null|false|none||被回复者UUID|
|»» to_comment_username|string¦null|false|none||被回复者用户名|
|»» article_id|string¦null|false|none||关联文章ID|
|»» article_title|string¦null|false|none||关联文章标题|
|»» status|integer(int32)¦null|false|none||评论状态|
|»» is_liked|boolean¦null|false|none||当前用户是否已点赞|
|»» children|[[Comment](#schemacomment)]|false|none||子评论列表|

## POST 添加评论

POST /api/comments

添加评论到文章

> Body 请求参数

```json
{
  "article_alias": "string",
  "content": "string",
  "to_comment_id": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|[AddCommentRequest](#schemaaddcommentrequest)| 是 |none|

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|评论添加成功|None|

## POST 点赞评论

POST /api/comments/{commentId}/like

点赞评论

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|commentId|path|string| 是 |评论唯一标识|

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|点赞成功|None|

## DELETE 删除评论

DELETE /api/comments/{commentId}

删除评论

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|commentId|path|string| 是 |评论唯一标识|

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|删除成功|None|

## GET 获取前台导航菜单

GET /api/frontendgetmenus

返回前台导航菜单

> 返回示例

> 200 Response

```json
[
  {
    "menus_id": "string",
    "menus_name": "string",
    "menus_url": "string",
    "sort_order": 0,
    "status": 0,
    "user_id": "string",
    "username": "string"
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|导航菜单列表|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|[[Menu](#schemamenu)]|false|none||none|
|» menus_id|string|false|none||菜单ID|
|» menus_name|string|false|none||菜单名称|
|» menus_url|string|false|none||菜单链接|
|» sort_order|integer(int32)|false|none||排序值|
|» status|integer(int32)|false|none||状态（0禁用，1启用）|
|» user_id|string|false|none||创建者UUID|
|» username|string|false|none||创建者用户名|

## GET 根据别名获取自定义页面

GET /api/custom-pages/{alias}

根据别名获取自定义页面

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|alias|path|string| 是 |页面别名|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "id": 0,
    "pageName": "string",
    "pageCode": "string",
    "alias": "string",
    "creatorUsername": "string",
    "createTime": "2019-08-24T14:15:22Z",
    "status": 0
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|自定义页面详情|[CustomPageResponse](#schemacustompageresponse)|

## GET 分页获取已审核友链

GET /api/friend-links/approved/page

分页获取已审核友链

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|page|query|integer(int32)| 否 |页码|
|size|query|integer(int32)| 否 |每页数量|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "total": 0,
    "page": 0,
    "size": 0,
    "total_pages": 0,
    "data": [
      {
        "id": 0,
        "siteName": "string",
        "siteUrl": "string",
        "siteIcon": "string",
        "siteDescription": "string",
        "webmasterName": "string",
        "contact": "string",
        "createTime": "string",
        "status": 0
      }
    ]
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|友链列表|[PaginatedFriendLinksResponse](#schemapaginatedfriendlinksresponse)|

## GET 获取本站友链信息

GET /api/friend-links/site-info

获取本站友链信息（用于申请页展示）

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {},
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|本站友链信息|[SiteInfoResponse](#schemasiteinforesponse)|

## POST 申请友链

POST /api/friend-links/apply

申请友链

> Body 请求参数

```json
{
  "siteName": "string",
  "siteUrl": "string",
  "siteIcon": "string",
  "siteDescription": "string",
  "webmasterName": "string",
  "contact": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|[FriendLinkApplyRequest](#schemafriendlinkapplyrequest)| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {},
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|申请结果|[ApiResponse](#schemaapiresponse)|

## GET 获取已启用的音乐列表

GET /api/music/enabled

返回已启用的音乐列表

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": [
    {
      "id": 0,
      "musicName": "string",
      "musicAuthor": "string",
      "musicUrl": "string",
      "createTime": "2019-08-24T14:15:22Z",
      "status": 0
    }
  ],
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|音乐列表|[MusicListResponse](#schemamusiclistresponse)|

# 数据模型

<h2 id="tocS_Article">Article</h2>

<a id="schemaarticle"></a>
<a id="schema_Article"></a>
<a id="tocSarticle"></a>
<a id="tocsarticle"></a>

```json
{
  "id": 0,
  "article_id": "string",
  "title": "string",
  "excerpt": "string",
  "image": "string",
  "date": "string",
  "author": "string",
  "author_avatar": "string",
  "category": "string",
  "tag": "string",
  "alias": "string",
  "password": true
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer(int32)|false|none||数据项的唯一标识|
|article_id|string|false|none||文章的UUID|
|title|string|false|none||文章标题|
|excerpt|string|false|none||文章摘要|
|image|string|false|none||文章封面图链接|
|date|string|false|none||发布时间 yyyy-MM-dd HH:mm:ss|
|author|string|false|none||作者名|
|author_avatar|string|false|none||作者头像链接|
|category|string|false|none||文章所属分类|
|tag|string¦null|false|none||文章标签，多个以英文逗号分隔|
|alias|string|false|none||文章别名（URL片段）|
|password|boolean|false|none||是否为加密文章|

<h2 id="tocS_PaginatedArticlesResponse">PaginatedArticlesResponse</h2>

<a id="schemapaginatedarticlesresponse"></a>
<a id="schema_PaginatedArticlesResponse"></a>
<a id="tocSpaginatedarticlesresponse"></a>
<a id="tocspaginatedarticlesresponse"></a>

```json
{
  "data": [
    {
      "id": 0,
      "article_id": "string",
      "title": "string",
      "excerpt": "string",
      "image": "string",
      "date": "string",
      "author": "string",
      "author_avatar": "string",
      "category": "string",
      "tag": "string",
      "alias": "string",
      "password": true
    }
  ],
  "total": 0,
  "page": 0,
  "size": 0,
  "total_pages": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|data|[[Article](#schemaarticle)]|false|none||none|
|total|integer(int32)|false|none||符合条件的数据总数|
|page|integer(int32)|false|none||当前页码|
|size|integer(int32)|false|none||每页数量|
|total_pages|integer(int32)|false|none||总页数|

<h2 id="tocS_UnauthorizedResponse">UnauthorizedResponse</h2>

<a id="schemaunauthorizedresponse"></a>
<a id="schema_UnauthorizedResponse"></a>
<a id="tocSunauthorizedresponse"></a>
<a id="tocsunauthorizedresponse"></a>

```json
{
  "success": true,
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|success|boolean|false|none||请求是否成功|
|message|string|false|none||错误消息|

<h2 id="tocS_HeroConfig">HeroConfig</h2>

<a id="schemaheroconfig"></a>
<a id="schema_HeroConfig"></a>
<a id="tocSheroconfig"></a>
<a id="tocsheroconfig"></a>

```json
{
  "title": "string",
  "subtitle": "string",
  "image": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|title|string|false|none||主标题|
|subtitle|string|false|none||副标题|
|image|string|false|none||背景图链接|

<h2 id="tocS_EnableCommentResponse">EnableCommentResponse</h2>

<a id="schemaenablecommentresponse"></a>
<a id="schema_EnableCommentResponse"></a>
<a id="tocSenablecommentresponse"></a>
<a id="tocsenablecommentresponse"></a>

```json
{
  "code": 0,
  "data": {
    "enableComment": true
  },
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object|false|none||none|
|» enableComment|boolean|false|none||是否启用评论|
|message|string|false|none||提示信息|

<h2 id="tocS_EnableRegisterResponse">EnableRegisterResponse</h2>

<a id="schemaenableregisterresponse"></a>
<a id="schema_EnableRegisterResponse"></a>
<a id="tocSenableregisterresponse"></a>
<a id="tocsenableregisterresponse"></a>

```json
{
  "code": 0,
  "data": {
    "enableRegister": true
  },
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object|false|none||none|
|» enableRegister|boolean|false|none||是否启用注册|
|message|string|false|none||提示信息|

<h2 id="tocS_CustomCodeResponse">CustomCodeResponse</h2>

<a id="schemacustomcoderesponse"></a>
<a id="schema_CustomCodeResponse"></a>
<a id="tocScustomcoderesponse"></a>
<a id="tocscustomcoderesponse"></a>

```json
{
  "code": 0,
  "data": {
    "globalHeadCode": "string",
    "contentHeadCode": "string",
    "footerCode": "string"
  },
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object|false|none||none|
|» globalHeadCode|string|false|none||全局头部代码|
|» contentHeadCode|string|false|none||内容头部代码|
|» footerCode|string|false|none||页脚代码|
|message|string|false|none||提示信息|

<h2 id="tocS_CaptchaResponse">CaptchaResponse</h2>

<a id="schemacaptcharesponse"></a>
<a id="schema_CaptchaResponse"></a>
<a id="tocScaptcharesponse"></a>
<a id="tocscaptcharesponse"></a>

```json
{
  "code": 0,
  "data": {
    "image": "string",
    "key": "string"
  },
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object|false|none||none|
|» image|string|false|none||图像的Base64编码|
|» key|string|false|none||验证码唯一标识|
|message|string|false|none||提示信息|

<h2 id="tocS_RegisterRequest">RegisterRequest</h2>

<a id="schemaregisterrequest"></a>
<a id="schema_RegisterRequest"></a>
<a id="tocSregisterrequest"></a>
<a id="tocsregisterrequest"></a>

```json
{
  "username": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "captcha": "string",
  "captchaKey": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|username|string|true|none||用户名|
|email|string|false|none||电子邮件地址|
|phone|string|false|none||手机号|
|password|string|true|none||密码|
|captcha|string|true|none||验证码|
|captchaKey|string|true|none||验证码密钥|

<h2 id="tocS_LoginRequest">LoginRequest</h2>

<a id="schemaloginrequest"></a>
<a id="schema_LoginRequest"></a>
<a id="tocSloginrequest"></a>
<a id="tocsloginrequest"></a>

```json
{
  "username": "string",
  "password": "string",
  "captcha": "string",
  "captchaKey": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|username|string|true|none||用户名|
|password|string|true|none||密码|
|captcha|string|true|none||验证码|
|captchaKey|string|true|none||验证码密钥|

<h2 id="tocS_ApiResponse">ApiResponse</h2>

<a id="schemaapiresponse"></a>
<a id="schema_ApiResponse"></a>
<a id="tocSapiresponse"></a>
<a id="tocsapiresponse"></a>

```json
{
  "code": 0,
  "data": {},
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object|false|none||返回数据|
|message|string|false|none||提示信息|

<h2 id="tocS_ForgotPasswordSendCaptchaRequest">ForgotPasswordSendCaptchaRequest</h2>

<a id="schemaforgotpasswordsendcaptcharequest"></a>
<a id="schema_ForgotPasswordSendCaptchaRequest"></a>
<a id="tocSforgotpasswordsendcaptcharequest"></a>
<a id="tocsforgotpasswordsendcaptcharequest"></a>

```json
{
  "username": "string",
  "email": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|username|string|true|none||用户名|
|email|string|true|none||注册邮箱|

<h2 id="tocS_ForgotPasswordVerifyRequest">ForgotPasswordVerifyRequest</h2>

<a id="schemaforgotpasswordverifyrequest"></a>
<a id="schema_ForgotPasswordVerifyRequest"></a>
<a id="tocSforgotpasswordverifyrequest"></a>
<a id="tocsforgotpasswordverifyrequest"></a>

```json
{
  "username": "string",
  "email": "string",
  "captcha": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|username|string|true|none||用户名|
|email|string|true|none||邮箱|
|captcha|string|true|none||邮箱收到的验证码|

<h2 id="tocS_ForgotPasswordResetRequest">ForgotPasswordResetRequest</h2>

<a id="schemaforgotpasswordresetrequest"></a>
<a id="schema_ForgotPasswordResetRequest"></a>
<a id="tocSforgotpasswordresetrequest"></a>
<a id="tocsforgotpasswordresetrequest"></a>

```json
{
  "username": "string",
  "email": "string",
  "newPassword": "string",
  "confirmNewPassword": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|username|string|true|none||用户名|
|email|string|true|none||邮箱|
|newPassword|string|true|none||新密码|
|confirmNewPassword|string|true|none||确认新密码|

<h2 id="tocS_UserStatusResponse">UserStatusResponse</h2>

<a id="schemauserstatusresponse"></a>
<a id="schema_UserStatusResponse"></a>
<a id="tocSuserstatusresponse"></a>
<a id="tocsuserstatusresponse"></a>

```json
{
  "code": 0,
  "data": {
    "loggedIn": true,
    "username": "string",
    "avatar": "string",
    "message": "string"
  },
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object|false|none||none|
|» loggedIn|boolean|false|none||是否已登录|
|» username|string|false|none||用户名|
|» avatar|string|false|none||头像链接|
|» message|string|false|none||状态消息|
|message|string|false|none||提示信息|

<h2 id="tocS_SearchResponse">SearchResponse</h2>

<a id="schemasearchresponse"></a>
<a id="schema_SearchResponse"></a>
<a id="tocSsearchresponse"></a>
<a id="tocssearchresponse"></a>

```json
{
  "code": 0,
  "data": {
    "count": 0,
    "data": [
      {
        "title": "string",
        "alias": "string",
        "id": 0,
        "excerpt": "string"
      }
    ]
  },
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object|false|none||none|
|» count|integer(int32)|false|none||匹配文章总数|
|» data|[object]|false|none||none|
|»» title|string|false|none||文章标题|
|»» alias|string|false|none||文章别名|
|»» id|integer(int32)|false|none||文章ID|
|»» excerpt|string|false|none||文章摘要|
|message|string|false|none||提示信息|

<h2 id="tocS_Tag">Tag</h2>

<a id="schematag"></a>
<a id="schema_Tag"></a>
<a id="tocStag"></a>
<a id="tocstag"></a>

```json
{
  "id": 0,
  "tag_name": "string",
  "tag_explain": "string",
  "founder": "string",
  "create_time": "2019-08-24T14:15:22Z",
  "status": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer(int32)|false|none||标签ID|
|tag_name|string|false|none||标签名称|
|tag_explain|string|false|none||标签说明|
|founder|string|false|none||创建者UUID|
|create_time|string(date-time)|false|none||创建时间|
|status|integer(int32)|false|none||状态（0禁用，1启用）|

<h2 id="tocS_Category">Category</h2>

<a id="schemacategory"></a>
<a id="schema_Category"></a>
<a id="tocScategory"></a>
<a id="tocscategory"></a>

```json
{
  "id": 0,
  "article_categories": "string",
  "categories_explain": "string",
  "founder": "string",
  "create_time": "2019-08-24T14:15:22Z",
  "status": 0,
  "parent_id": 0,
  "level": 0,
  "full_path": "string",
  "sort_order": 0,
  "article_count": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer(int32)|false|none||分类ID|
|article_categories|string|false|none||分类名称|
|categories_explain|string|false|none||分类说明|
|founder|string|false|none||创建者UUID|
|create_time|string(date-time)|false|none||创建时间|
|status|integer(int32)|false|none||状态（0禁用，1启用）|
|parent_id|integer(int32)¦null|false|none||父分类ID（顶级为null）|
|level|integer(int32)¦null|false|none||层级|
|full_path|string¦null|false|none||分类完整路径|
|sort_order|integer(int32)¦null|false|none||排序值|
|article_count|integer(int32)¦null|false|none||文章数|

<h2 id="tocS_CategoryWithCount">CategoryWithCount</h2>

<a id="schemacategorywithcount"></a>
<a id="schema_CategoryWithCount"></a>
<a id="tocScategorywithcount"></a>
<a id="tocscategorywithcount"></a>

```json
{
  "id": 0,
  "article_categories": "string",
  "categories_explain": "string",
  "founder": "string",
  "create_time": "2019-08-24T14:15:22Z",
  "status": 0,
  "parent_id": 0,
  "level": 0,
  "full_path": "string",
  "sort_order": 0,
  "article_count": 0,
  "articleCount": 0
}

```

### 属性

allOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|[Category](#schemacategory)|false|none||none|

and

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|object|false|none||none|
|» articleCount|integer(int64)|false|none||该分类下文章数量|

<h2 id="tocS_HotArticle">HotArticle</h2>

<a id="schemahotarticle"></a>
<a id="schema_HotArticle"></a>
<a id="tocShotarticle"></a>
<a id="tocshotarticle"></a>

```json
{
  "id": 0,
  "article_id": "string",
  "title": "string",
  "excerpt": "string",
  "date": "string",
  "author": "string",
  "category": "string",
  "page_views": 0,
  "alias": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer(int32)|false|none||文章ID|
|article_id|string|false|none||文章UUID|
|title|string|false|none||文章标题|
|excerpt|string|false|none||文章摘要|
|date|string|false|none||发布日期|
|author|string|false|none||作者|
|category|string|false|none||文章分类|
|page_views|integer(int32)|false|none||浏览次数|
|alias|string|false|none||文章别名|

<h2 id="tocS_CheckPasswordResponse">CheckPasswordResponse</h2>

<a id="schemacheckpasswordresponse"></a>
<a id="schema_CheckPasswordResponse"></a>
<a id="tocScheckpasswordresponse"></a>
<a id="tocscheckpasswordresponse"></a>

```json
{
  "code": 0,
  "data": {
    "needPassword": true
  },
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object|false|none||none|
|» needPassword|boolean|false|none||是否需要密码|
|message|string|false|none||提示信息|

<h2 id="tocS_ArticleDetailResponse">ArticleDetailResponse</h2>

<a id="schemaarticledetailresponse"></a>
<a id="schema_ArticleDetailResponse"></a>
<a id="tocSarticledetailresponse"></a>
<a id="tocsarticledetailresponse"></a>

```json
{
  "code": 0,
  "data": {
    "id": 0,
    "uuid": "string",
    "article_id": "string",
    "article_name": "string",
    "article_cover": "string",
    "excerpt": "string",
    "article_content": "string",
    "page_views": 0,
    "like_count": 0,
    "favorite_count": 0,
    "password": "string",
    "tag": "string",
    "category": "string",
    "alias": "string",
    "author": "string",
    "avatar": "string",
    "create_time": "string",
    "status": 0,
    "enable_comment": 0
  },
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object|false|none||none|
|» id|integer(int32)|false|none||文章ID|
|» uuid|string|false|none||作者UUID|
|» article_id|string|false|none||文章唯一标识|
|» article_name|string|false|none||文章标题|
|» article_cover|string|false|none||文章封面图|
|» excerpt|string|false|none||文章摘要|
|» article_content|string|false|none||文章正文（Markdown）|
|» page_views|integer(int64)|false|none||阅读次数|
|» like_count|integer(int64)|false|none||点赞次数|
|» favorite_count|integer(int64)|false|none||收藏次数|
|» password|string|false|none||密码占位（已脱敏为******|
|» tag|string|false|none||文章标签|
|» category|string|false|none||文章分类|
|» alias|string|false|none||文章别名|
|» author|string|false|none||作者名|
|» avatar|string|false|none||作者头像|
|» create_time|string|false|none||创建时间|
|» status|integer(int32)|false|none||文章状态|
|» enable_comment|integer(int32)|false|none||是否允许评论（0/1）|
|message|string|false|none||提示信息|

<h2 id="tocS_LikeStatusResponse">LikeStatusResponse</h2>

<a id="schemalikestatusresponse"></a>
<a id="schema_LikeStatusResponse"></a>
<a id="tocSlikestatusresponse"></a>
<a id="tocslikestatusresponse"></a>

```json
{
  "code": 0,
  "data": {
    "liked": true
  },
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object|false|none||none|
|» liked|boolean|false|none||是否已点赞|
|message|string|false|none||提示信息|

<h2 id="tocS_LikeResponse">LikeResponse</h2>

<a id="schemalikeresponse"></a>
<a id="schema_LikeResponse"></a>
<a id="tocSlikeresponse"></a>
<a id="tocslikeresponse"></a>

```json
{
  "code": 0,
  "data": {
    "success": true
  },
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object|false|none||none|
|» success|boolean|false|none||操作是否成功|
|message|string|false|none||提示信息|

<h2 id="tocS_Comment">Comment</h2>

<a id="schemacomment"></a>
<a id="schema_Comment"></a>
<a id="tocScomment"></a>
<a id="tocscomment"></a>

```json
{
  "comment_id": "string",
  "user_id": "string",
  "username": "string",
  "avatar": "string",
  "content": "string",
  "create_time": "2019-08-24T14:15:22Z",
  "comment_like_count": 0,
  "to_comment_id": "string",
  "to_comment_user_id": "string",
  "to_comment_username": "string",
  "article_id": "string",
  "article_title": "string",
  "status": 0,
  "is_liked": true,
  "children": [
    {
      "comment_id": "string",
      "user_id": "string",
      "username": "string",
      "avatar": "string",
      "content": "string",
      "create_time": "2019-08-24T14:15:22Z",
      "comment_like_count": 0,
      "to_comment_id": "string",
      "to_comment_user_id": "string",
      "to_comment_username": "string",
      "article_id": "string",
      "article_title": "string",
      "status": 0,
      "is_liked": true,
      "children": [
        {
          "comment_id": "string",
          "user_id": "string",
          "username": "string",
          "avatar": "string",
          "content": "string",
          "create_time": "2019-08-24T14:15:22Z",
          "comment_like_count": 0,
          "to_comment_id": "string",
          "to_comment_user_id": "string",
          "to_comment_username": "string",
          "article_id": "string",
          "article_title": "string",
          "status": 0,
          "is_liked": true,
          "children": [
            {}
          ]
        }
      ]
    }
  ]
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|comment_id|string|false|none||评论唯一标识|
|user_id|string|false|none||评论者UUID|
|username|string|false|none||评论者用户名|
|avatar|string¦null|false|none||评论者头像|
|content|string|false|none||评论内容|
|create_time|string(date-time)|false|none||评论时间|
|comment_like_count|integer(int64)|false|none||点赞数|
|to_comment_id|string¦null|false|none||回复的评论ID|
|to_comment_user_id|string¦null|false|none||被回复者UUID|
|to_comment_username|string¦null|false|none||被回复者用户名|
|article_id|string¦null|false|none||关联文章ID|
|article_title|string¦null|false|none||关联文章标题|
|status|integer(int32)¦null|false|none||评论状态|
|is_liked|boolean¦null|false|none||当前用户是否已点赞|
|children|[[Comment](#schemacomment)]|false|none||子评论列表|

<h2 id="tocS_AddCommentRequest">AddCommentRequest</h2>

<a id="schemaaddcommentrequest"></a>
<a id="schema_AddCommentRequest"></a>
<a id="tocSaddcommentrequest"></a>
<a id="tocsaddcommentrequest"></a>

```json
{
  "article_alias": "string",
  "content": "string",
  "to_comment_id": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|article_alias|string|true|none||文章别名|
|content|string|true|none||评论内容|
|to_comment_id|string¦null|false|none||回复的评论ID|

<h2 id="tocS_Menu">Menu</h2>

<a id="schemamenu"></a>
<a id="schema_Menu"></a>
<a id="tocSmenu"></a>
<a id="tocsmenu"></a>

```json
{
  "menus_id": "string",
  "menus_name": "string",
  "menus_url": "string",
  "sort_order": 0,
  "status": 0,
  "user_id": "string",
  "username": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|menus_id|string|false|none||菜单ID|
|menus_name|string|false|none||菜单名称|
|menus_url|string|false|none||菜单链接|
|sort_order|integer(int32)|false|none||排序值|
|status|integer(int32)|false|none||状态（0禁用，1启用）|
|user_id|string|false|none||创建者UUID|
|username|string|false|none||创建者用户名|

<h2 id="tocS_CustomPageResponse">CustomPageResponse</h2>

<a id="schemacustompageresponse"></a>
<a id="schema_CustomPageResponse"></a>
<a id="tocScustompageresponse"></a>
<a id="tocscustompageresponse"></a>

```json
{
  "code": 0,
  "data": {
    "id": 0,
    "pageName": "string",
    "pageCode": "string",
    "alias": "string",
    "creatorUsername": "string",
    "createTime": "2019-08-24T14:15:22Z",
    "status": 0
  },
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object|false|none||none|
|» id|integer(int32)|false|none||页面ID|
|» pageName|string|false|none||页面名称|
|» pageCode|string|false|none||页面HTML代码|
|» alias|string|false|none||页面别名|
|» creatorUsername|string|false|none||创建者用户名|
|» createTime|string(date-time)|false|none||创建时间|
|» status|integer(int32)|false|none||状态（0禁用，1启用）|
|message|string|false|none||提示信息|

<h2 id="tocS_PaginatedFriendLinksResponse">PaginatedFriendLinksResponse</h2>

<a id="schemapaginatedfriendlinksresponse"></a>
<a id="schema_PaginatedFriendLinksResponse"></a>
<a id="tocSpaginatedfriendlinksresponse"></a>
<a id="tocspaginatedfriendlinksresponse"></a>

```json
{
  "code": 0,
  "data": {
    "total": 0,
    "page": 0,
    "size": 0,
    "total_pages": 0,
    "data": [
      {
        "id": 0,
        "siteName": "string",
        "siteUrl": "string",
        "siteIcon": "string",
        "siteDescription": "string",
        "webmasterName": "string",
        "contact": "string",
        "createTime": "string",
        "status": 0
      }
    ]
  },
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object|false|none||none|
|» total|integer(int32)|false|none||友链总数|
|» page|integer(int32)|false|none||当前页码|
|» size|integer(int32)|false|none||每页数量|
|» total_pages|integer(int32)|false|none||总页数|
|» data|[object]|false|none||none|
|»» id|integer(int32)|false|none||友链ID|
|»» siteName|string|false|none||站点名称|
|»» siteUrl|string|false|none||站点地址|
|»» siteIcon|string|false|none||站点图标|
|»» siteDescription|string|false|none||站点描述|
|»» webmasterName|string|false|none||站长名称|
|»» contact|string|false|none||联系方式|
|»» createTime|string|false|none||创建时间|
|»» status|integer(int32)|false|none||状态|
|message|string|false|none||提示信息|

<h2 id="tocS_SiteInfoResponse">SiteInfoResponse</h2>

<a id="schemasiteinforesponse"></a>
<a id="schema_SiteInfoResponse"></a>
<a id="tocSsiteinforesponse"></a>
<a id="tocssiteinforesponse"></a>

```json
{
  "code": 0,
  "data": {},
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|object¦null|false|none||站点信息|
|message|string|false|none||提示信息|

<h2 id="tocS_FriendLinkApplyRequest">FriendLinkApplyRequest</h2>

<a id="schemafriendlinkapplyrequest"></a>
<a id="schema_FriendLinkApplyRequest"></a>
<a id="tocSfriendlinkapplyrequest"></a>
<a id="tocsfriendlinkapplyrequest"></a>

```json
{
  "siteName": "string",
  "siteUrl": "string",
  "siteIcon": "string",
  "siteDescription": "string",
  "webmasterName": "string",
  "contact": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|siteName|string|true|none||站点名称|
|siteUrl|string|true|none||站点地址|
|siteIcon|string|false|none||站点图标|
|siteDescription|string|true|none||站点描述|
|webmasterName|string|true|none||站长名称|
|contact|string|true|none||联系方式|

<h2 id="tocS_MusicListResponse">MusicListResponse</h2>

<a id="schemamusiclistresponse"></a>
<a id="schema_MusicListResponse"></a>
<a id="tocSmusiclistresponse"></a>
<a id="tocsmusiclistresponse"></a>

```json
{
  "code": 0,
  "data": [
    {
      "id": 0,
      "musicName": "string",
      "musicAuthor": "string",
      "musicUrl": "string",
      "createTime": "2019-08-24T14:15:22Z",
      "status": 0
    }
  ],
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer(int32)|false|none||状态码|
|data|[object]|false|none||none|
|» id|integer(int32)|false|none||音乐ID|
|» musicName|string|false|none||曲名|
|» musicAuthor|string|false|none||作者|
|» musicUrl|string|false|none||音频地址|
|» createTime|string(date-time)|false|none||创建时间|
|» status|integer(int32)|false|none||状态|
|message|string|false|none||提示信息|

