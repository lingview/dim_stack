ALTER TABLE `site_config`
    ADD COLUMN `comment_status` INT NOT NULL DEFAULT 1 COMMENT '评论默认状态（1直接发布，3待审核）',
    ADD COLUMN `enable_llm_comment_review` INT NOT NULL DEFAULT 0 COMMENT '是否启用大模型自动审核评论（1启用，0禁用）',
    ADD COLUMN `admin_comment_no_review` INT NOT NULL DEFAULT 1 COMMENT '管理员用户评论免审核（1启用，0禁用）';

INSERT INTO `permission` VALUES (62, 'system:comments:review', '审核评论', 'comments', NOW());
INSERT INTO `permission` VALUES (63, 'commentreview:menus', '评论审核菜单', 'menus', NOW());

INSERT INTO `dashboard_menu` VALUES (112, '评论审核', 'comment-review', '/dashboard/commentsreview', 3, 'commentreview:menus', 35, NOW(), 'sidebar');

INSERT INTO `role_permission` VALUES (1, 62);
INSERT INTO `role_permission` VALUES (1, 63);

INSERT INTO `llm_prompt_config` VALUES (3, 'comment_review', '你是一名专业的评论内容审核员，需依据以下标准对用户提交的评论内容进行快速评估与风险研判：\n一、违规内容识别\n是否包含色情、低俗、性暗示等不当内容；\n是否包含人身攻击、辱骂、歧视性言论、地域黑等不友善内容；\n是否包含广告、垃圾营销、引流、联系方式等信息；\n是否包含政治敏感、违法信息、谣言、欺诈等内容；\n是否包含恶意代码、SQL注入、XSS攻击等技术性威胁。\n二、评论质量判断\n是否为无意义灌水（如纯表情、重复字符、随机字母等）；\n是否与主题完全无关的恶意刷屏内容。\n你的输出必须且只能是如下两种 JSON 格式：\n{"compliant": true}\n{"compliant": false}\n下面是需要你审核的评论：', NOW(), 1);
