# 大模型相关功能

次元栈已支持大模型文章内容审核以及文章内容生成功能。

## 配置与使用

在系统配置页面中找到大模型相关配置项，开启后即可使用。

![大模型配置界面](../../images/large_model_configuration_interface.png)

## 文章审核模块

### 默认提示词

> 请谨慎修改提示词

![文章审核默认提示词](../../images/article_review_default_prompt.png)

大模型审核开启后，所有新发布的文章都会优先进行大模型分析：

- **审核通过**：文章直接发布
- **审核违规**：文章直接标记为违规，不会通知管理员审核
- **系统异常**：自动降级为通知有审核权限人员人工审核

文章作者如认为模型判断有误，可联系管理员处理。

## 文章生成模块

### 默认提示词

> 请谨慎修改提示词

![文章生成默认提示词](../../images/article_generation_default_prompt.png)

文章生成功能开启后，用户可以在文章编辑器中快捷调用大模型生成文章内容。

![文章生成演示1](../../images/article_generation_demo_1.png)

![文章生成演示2](../../images/article_generation_demo_2.png)

![文章生成演示3](../../images/article_generation_demo_3.png)
