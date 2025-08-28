import heroImage from './images/963c11d14f4928906520150421af25b9.jpg';
import articles0 from "./images/72e28a0afaa93ebaeda8135d3e6a79b6.jpg"
import articles1 from "./images/53b4390f9ad55fe70430039d7d2d3a7b.jpg"
import articles2 from "./images/7e2eca515d52f7f67e978beba1f98af8.jpg"
import articles3 from "./images/800ccaba0d3ad4e8f2416239ed0761e4.jpg"

export const fakeData = {
    // 网站基本信息
    siteInfo: {
        title: '次元栈 - Dim Stack',
        chineseTitle: '次元栈',
        englishTitle: 'Dim Stack',
        copyright: '© 2025 次元栈 - Dim Stack. All rights reserved.'
    },

    // 顶部导航数据
    navItems: [
        { id: 1, name: '首页', href: '/' },
        { id: 2, name: 'Vsinger', href: '/category/vsinger' },
        { id: 3, name: '音乐', href: '/category/music' },
        { id: 4, name: '关于', href: '/about' },
    ],

    // 头图数据
    hero: {
        title: '欢迎来到瓦纳海姆星',
        subtitle: '探索洛天依和Vsinger家族的音乐之旅',
        image: heroImage,
        ctaText: '了解更多',
        ctaLink: '/about'
    },

    // 文章列表数据
    articles: [
        {
            id: 1,
            title: '洛天依十年：虚拟歌手的成长之路',
            excerpt: '回顾洛天依自出道以来的发展历程，以及她如何成为最受欢迎的虚拟歌手之一。',
            date: '2023-06-15',
            author: 'lingview',
            category: 'Vsinger',
            readTime: '5分钟阅读',
            image: articles0
        },
        {
            id: 2,
            title: 'Vsinger家族全解析',
            excerpt: '详细介绍Vsinger旗下的每一位成员，包括他们的特点和代表作品。',
            date: '2023-06-10',
            author: 'lingview',
            category: 'Vsinger',
            readTime: '8分钟阅读',
            image: articles1
        },
        {
            id: 3,
            title: '洛天依音乐制作背后的故事',
            excerpt: '深入探讨洛天依歌曲背后的创作过程，从词曲创作到声音合成技术的应用。',
            date: '2023-06-05',
            author: 'lingview',
            category: '音乐',
            readTime: '12分钟阅读',
            image: articles2
        },
        {
            id: 4,
            title: 'Vsinger在现代音乐产业中的地位',
            excerpt: '分析Vsinger及其相关技术对现代音乐创作和传播方式的影响。',
            date: '2023-05-28',
            author: 'lingview',
            category: '音乐',
            readTime: '6分钟阅读',
            image: articles3
        }
    ],

    // 分类数据
    categories: [
        { id: 1, name: 'Vsinger', count: 12 },
        { id: 2, name: '音乐', count: 8 },
        { id: 3, name: '活动', count: 5 },
        { id: 4, name: '幕后', count: 3 },
    ],

    // 推荐文章数据
    recommendedArticles: [
        { id: 1, title: '洛天依最新单曲解读', date: '2023-06-12' },
        { id: 2, title: '无限共鸣演唱会全程回顾', date: '2023-06-08' },
        { id: 3, title: '乐正龙牙专访', date: '2023-06-01' },
        { id: 4, title: 'Vsinger发展史', date: '2023-05-25' },
    ],

    // 控制台相关数据
    dashboard: {
        stats: [
            { label: '文章', value: 56, icon: 'article' },
            { label: '用户', value: 13, icon: 'user' },
            { label: '评论', value: 39, icon: 'comment' },
            { label: '浏览量', value: 8223, icon: 'view' }
        ],

        quickActions: [
            { id: 1, title: '个人中心', description: '管理您的个人信息', icon: 'user', link: '/dashboard/profile' },
            { id: 2, title: '查看站点', description: '预览您的网站', icon: 'eye', link: '/site-preview' },
            { id: 3, title: '创建文章', description: '撰写新的文章', icon: 'edit', link: '/dashboard/articles/create' },
            { id: 4, title: '创建页面', description: '创建新的页面', icon: 'page', link: '/dashboard/pages/create' },
            { id: 5, title: '附件上传', description: '上传文件和图片', icon: 'upload', link: '/dashboard/media/upload' },
            { id: 8, title: '新建用户', description: '创建新用户账户', icon: 'add-user', link: '/dashboard/users/create' },
        ],

        sidebarMenu: [
            { id: 1, title: '仪表盘', icon: 'dashboard', link: '/dashboard', active: true },
            {
                id: 2, title: '内容', icon: 'content',
                children: [
                    { id: 21, title: '文章', icon: 'article', link: '/dashboard/articles' },
                    { id: 22, title: '页面', icon: 'page', link: '/dashboard/pages' },
                    { id: 23, title: '评论', icon: 'comment', link: '/dashboard/comments' },
                    { id: 24, title: '附件', icon: 'media', link: '/dashboard/media' },
                    { id: 25, title: '链接', icon: 'link', link: '/dashboard/links' }
                ]
            },
            {
                id: 3, title: '外观', icon: 'appearance',
                children: [
                    { id: 31, title: '主题', icon: 'theme', link: '/dashboard/theme' },
                    { id: 32, title: '菜单', icon: 'menu', link: '/dashboard/menu' }
                ]
            },
            {
                id: 4, title: '系统', icon: 'system',
                children: [
                    { id: 41, title: '插件', icon: 'plugin', link: '/dashboard/plugins' },
                    { id: 42, title: '用户', icon: 'users', link: '/dashboard/users' },
                    { id: 43, title: '设置', icon: 'settings', link: '/dashboard/settings' },
                    { id: 44, title: '概览', icon: 'overview', link: '/dashboard/overview' },
                    { id: 45, title: '备份', icon: 'backup', link: '/dashboard/backup' },
                    { id: 46, title: '工具', icon: 'tools', link: '/dashboard/tools' },
                    { id: 47, title: '应用市场', icon: 'marketplace', link: '/dashboard/marketplace' }
                ]
            },
            {
                id: 5, title: '工具', icon: 'tools',
                children: [
                    { id: 51, title: '迁移', icon: 'migrate', link: '/dashboard/migrate' }
                ]
            }
        ],

        // 通知数据
        notifications: [
            { id: 1, title: '欢迎登录', content: '欢迎回来，lingview！', time: '5分钟前', read: false },
            { id: 2, title: '新评论', content: '有人在你的文章下留言。', time: '10分钟前', read: false },
            { id: 3, title: '系统更新', content: '后台已更新至最新版本。', time: '1小时前', read: true }
        ],

        // 后台管理文章列表
        articles : [
            { id: 1, title: '洛天依十年：虚拟歌手的成长之路', date: '2023-06-15', author: 'lingview', status: '已发布' },
            { id: 2, title: 'Vsinger家族全解析', date: '2023-06-10', author: 'lingview', status: '草稿' },
            { id: 3, title: '洛天依音乐制作背后的故事', date: '2023-06-05', author: 'lingview', status: '已发布' },
            { id: 4, title: 'Vsinger在现代音乐产业中的地位', date: '2023-05-28', author: 'lingview', status: '已发布' },
        ]
    }
};