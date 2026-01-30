import apiClient from './utils/axios';

// 获取文章列表
export const fetchArticles = async (page = 1, size = 10, category = null) => {
    try {
        const params = { page, size };
        if (category) {
            params.category = category;
        }

        const response = await apiClient.get('/articles', { params });
        return response;
    } catch (error) {
        console.error('获取文章列表失败:', error);
        throw error;
    }
};

export const fetchArticlesByCategory = async (category, page, pageSize) => {
    try {
        const response = await apiClient.get(`/categories/${encodeURIComponent(category)}/articles?page=${page}&size=${pageSize}`);
        return response;
    } catch (error) {
        console.error('获取分类文章失败:', error);
        throw error;
    }
};

export const fetchStatistics = async () => {
    try {
        const [articleCount, userCount, commentCount, browseCount] = await Promise.all([
            apiClient.get('/statistics/articlecount'),
            apiClient.get('/statistics/usercount'),
            apiClient.get('/statistics/commentcount'),
            apiClient.get('/statistics/browsecount')
        ]);

        return {
            stats: [
                { label: '文章', value: articleCount, icon: 'article' },
                { label: '用户', value: userCount, icon: 'user' },
                { label: '评论', value: commentCount, icon: 'comment' },
                { label: '浏览量', value: browseCount, icon: 'view' }
            ]
        };
    } catch (error) {
        console.error('获取统计信息失败:', error);
        throw error;
    }
};


export const fetchSiteName = async () => {
    try {
        const response = await apiClient.get('/site/name');
        return response;
    } catch (error) {
        console.error('获取站点名称失败:', error);
        return null;
    }
};


export const fetchDashboardData = async () => {
    try {
        const response = await apiClient.get('/dashboard/menus');
        if (response.success) {
            return response.data;
        } else {
            throw new Error(response.message || '获取仪表盘数据失败');
        }
    } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        throw error;
    }
}


export const fetchSiteIcon = async () => {
    try {
        const response = await apiClient.get('/site/icon');
        return response;
    } catch (error) {
        console.error('获取站点图标失败:', error);
        return null;
    }
};