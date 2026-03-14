import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 0,
  withCredentials: true // 允许携带cookies
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 429) {
      const message = error.response.data?.message || '请求过于频繁，请稍后再试';
      alert(message);
      console.warn('Rate Limited:', message);
    } else if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
