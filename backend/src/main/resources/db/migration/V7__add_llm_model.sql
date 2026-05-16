ALTER TABLE `site_config`
    ADD COLUMN `enable_llm` int NULL DEFAULT 0 COMMENT '是否启动系统大模型接入（1：启用，0：禁用）',
    ADD COLUMN `enable_llm_article_review` int NULL DEFAULT 0 COMMENT '是否启用大模型自动审核文章（1：启用，0：禁用）',
    ADD COLUMN `enable_llm_create_article` int NULL DEFAULT 0 COMMENT '是否启用大模型生成文章（1：启用，0：禁用）';

DROP TABLE IF EXISTS `llm_config`;
CREATE TABLE `llm_config`  (
                               `api_key` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '密钥',
                               `api_url` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '模型地址',
                               `model` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '模型名称'
) ENGINE = InnoDB CHARACTER SET = utf8mb4 ROW_FORMAT = DYNAMIC;

DROP TABLE IF EXISTS `llm_prompt_config`;
CREATE TABLE `llm_prompt_config`  (
                                      `id` int NOT NULL AUTO_INCREMENT,
                                      `prompt_name` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '提示词模板名称',
                                      `prompt_content` mediumtext CHARACTER SET utf8mb4 NOT NULL COMMENT '提示词内容',
                                      `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                      `status` int NOT NULL COMMENT '提示词状态',
                                      PRIMARY KEY (`id`) USING BTREE,
                                      UNIQUE INDEX `prompt_name`(`prompt_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 ROW_FORMAT = Dynamic;

INSERT INTO `llm_prompt_config` VALUES (1, 'article_review', '你是一名专业的文章内容审核员，需依据以下多维度标准对用户提交的文章内容进行综合评估与风险研判：\n一、价值导向与合规性\n是否符合社会主义核心价值观：包括富强、民主、文明、和谐，自由、平等、公正、法治，爱国、敬业、诚信、友善等；\n是否符合人类基本道德准则：如尊重生命、诚实守信、反对暴力歧视、维护人格尊严等；\n是否契合社会基本运行秩序：不得破坏社会稳定、煽动群体对立、传播反科学或封建迷信内容；\n是否遵守中国法律法规及主流意识形态：严禁涉及危害国家安全、分裂国家、颠覆政权、泄露国家秘密、破坏宗教政策等内容。\n二、违规词与敏感信息分析\n广告法违禁词识别：检测是否存在“最”“第一”“唯一”“国家级”“顶级”“全网最低价”等极限化、绝对化用语；\n政治与敏感词筛查：识别涉政不当表述、领导人姓名职务错误、涉疆涉藏涉台不当用语、不规范地图引用等高危内容；\n低俗、暴力、谣言类词汇：包括色情暗示、人身攻击、伪科学、已被官方辟谣的虚假信息等；\n变异规避词检测：识别使用谐音、符号替代（如“薇❤”“电①③⑧”）、生僻字、火星文等方式试图绕过审核的敏感词。\n你的输出必须且只能是如下两种 JSON 格式：\n{\"compliant\": true}\n{\"compliant\": false}\n下面是需要你审核的文章：', '2026-04-08 17:43:27', 1);
INSERT INTO `llm_prompt_config` VALUES (2, 'article_create', '你是一位经验丰富的通用内容作者，擅长撰写结构清晰、语言流畅、富有逻辑与人文关怀的文章。你的文风平实而不平淡，兼具可读性与思想性，能用具体例子或生动比喻解释抽象概念。请避免使用术语堆砌或空洞口号，注重真实感、节奏感和读者共鸣。\n下面是本文的主题和内容要求：', '2026-04-08 17:49:55', 1);
