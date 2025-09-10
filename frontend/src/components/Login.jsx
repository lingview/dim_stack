import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../utils/axios.jsx'

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    captcha: '',
  })

  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaKey, setCaptchaKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  // 其实都是为了解决React18双重渲染问题（最终后端加的兼容）
  const isFetchingCaptcha = useRef(false)
  const isSubmitting = useRef(false)
  const effectRan = useRef(false)
  const errorTimeoutRef = useRef(null)

  const fetchCaptcha = async () => {
    if (isFetchingCaptcha.current) return
    isFetchingCaptcha.current = true

    try {
      const response = await apiClient.get('/captcha')
      if (response.success) {
        setCaptchaImage(response.image)
        setCaptchaKey(response.key)
        setFormData(prev => ({ ...prev, captcha: '' }))
      } else {
        setError(response.message || '获取验证码失败')
      }
    } catch (err) {
      console.error('获取验证码失败:', err)
      setError('获取验证码失败')
    } finally {
      isFetchingCaptcha.current = false
    }
  }

  const clearError = () => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    setError('');
  }

  const setErrorWithTimeout = (message, timeout = 5000) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    setError(message);

    errorTimeoutRef.current = setTimeout(() => {
      setError('');
      errorTimeoutRef.current = null;
    }, timeout);
  }

  useEffect(() => {
    if (effectRan.current) return
    effectRan.current = true
    fetchCaptcha()
  }, [])

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.username.trim()) return setErrorWithTimeout('请输入用户名')
    if (!formData.password) return setErrorWithTimeout('请输入密码')
    if (!formData.captcha) return setErrorWithTimeout('请输入验证码')
    if (!captchaKey) return setErrorWithTimeout('验证码无效，请刷新验证码')

    if (isSubmitting.current) return
    isSubmitting.current = true
    setLoading(true)

    try {
      const response = await apiClient.post('/login', {
        username: formData.username,
        password: formData.password,
        captcha: formData.captcha,
        captchaKey
      })

      if (response.data?.success) {
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('username', formData.username)
        clearError();
        navigate('/')
      } else {
        setErrorWithTimeout(response.data?.message || '登录失败', 5000)
        fetchCaptcha()
      }
    } catch (err) {
      setErrorWithTimeout(err.response?.data?.data?.message || err.response?.data?.message || '网络错误，请稍后再试', 5000)
      fetchCaptcha()
    } finally {
      isSubmitting.current = false
      setLoading(false)
    }
  }

  return (
      <div className="min-h-screen bg-gray-50  flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 ">
              登录到您的账户
            </h2>
          </div>

          <div className="bg-white  py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
                <div className="mb-4 bg-red-50  text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 ">
                  用户名
                </label>
                <div className="mt-1">
                  <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300  rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 "
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 ">
                  密码
                </label>
                <div className="mt-1">
                  <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300  rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="captcha" className="block text-sm font-medium text-gray-700 ">
                  验证码 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                      id="captcha"
                      name="captcha"
                      type="text"
                      required
                      value={formData.captcha}
                      onChange={handleChange}
                      className="flex-1 appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 "
                      placeholder="请输入验证码"
                  />
                  <div className="flex items-center">
                    {captchaImage ? (
                        <img
                            src={captchaImage}
                            alt="验证码"
                            className="h-10 w-24 border rounded cursor-pointer"
                            onClick={fetchCaptcha}
                        />
                    ) : (
                        <div className="h-10 w-24 bg-gray-200 rounded flex items-center justify-center cursor-pointer"
                             onClick={fetchCaptcha}>
                          <span className="text-gray-500 text-xs">点击获取</span>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={fetchCaptcha}
                        className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded captcha-refresh-btn"
                    >
                      刷新
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                  ) : '登录'}
                </button>
              </div>
            </form>

            <p className="mt-2 text-center text-sm text-gray-600">
              没有账户? <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">注册</Link>
            </p>
          </div>
        </div>
      </div>
  )
}
