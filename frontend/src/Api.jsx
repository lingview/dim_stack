import heroImage from './images/963c11d14f4928906520150421af25b9.jpg';
import articles0 from "./images/72e28a0afaa93ebaeda8135d3e6a79b6.jpg"
import articles1 from "./images/53b4390f9ad55fe70430039d7d2d3a7b.jpg"
import articles2 from "./images/7e2eca515d52f7f67e978beba1f98af8.jpg"
import articles3 from "./images/800ccaba0d3ad4e8f2416239ed0761e4.jpg"

export const fakeData = {
    // 网站基本信息
    siteInfo: {
        title: '次元栈 - Dim Stack',
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
            excerpt: '回顾洛天依自出道以来的发展历程，以及她如何成为最受欢迎的虚拟歌手之一发手机号发不色。',
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
        { id: 3, title: '乐正龙牙......', date: '2023-06-01' },
        { id: 4, title: 'vsinger发展史', date: '2023-05-25' },
    ]
};