import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../utils/axios'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    captcha: ''
  })

  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaKey, setCaptchaKey] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const effectRan = useRef(false)
  const isFetchingCaptcha = useRef(false)
  const errorTimeoutRef = useRef(null)

  const fetchCaptcha = async () => {
    if (isFetchingCaptcha.current) return
    isFetchingCaptcha.current = true

    try {
      const response = await apiClient.get('/captcha')
      if (response.code === 200) {
        setCaptchaImage(response.data.image)
        setCaptchaKey(response.data.key)
        setFormData(prev => ({ ...prev, captcha: '' }))
      } else {
        setError(response.message || '获取验证码失败')
      }
    } catch (err) {
      setError('获取验证码失败')
      console.error('获取验证码失败:', err)
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

    if (!formData.username.trim()) {
      return setErrorWithTimeout('请输入用户名')
    }

    if (!formData.password) {
      return setErrorWithTimeout('请输入密码')
    }

    if (formData.password !== formData.confirmPassword) {
      return setErrorWithTimeout('两次输入的密码不一致')
    }

    if (!formData.captcha) {
      return setErrorWithTimeout('请输入验证码')
    }

    if (!captchaKey) {
      return setErrorWithTimeout('验证码无效，请刷新验证码')
    }

    setLoading(true)

    try {
      const response = await apiClient.post('/register', {
        username: formData.username,
        email: formData.email || null,
        phone: formData.phone || null,
        password: formData.password,
        captcha: formData.captcha,
        captchaKey: captchaKey
      })

      if (response.code === 200) {
        clearError();
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setErrorWithTimeout(response.message || '注册失败', 5000)
        fetchCaptcha()
      }
    } catch (err) {
      if (err.response?.data) {
        setErrorWithTimeout(
            err.response.data.message || '注册失败',
            5000
        )
      } else {
        setErrorWithTimeout('网络错误，请稍后再试', 5000)
      }
      fetchCaptcha()
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">注册成功！</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>您的账户已创建成功，正在跳转到登录页面...</p>
              </div>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              创建新账户
            </h2>
          </div>

          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  用户名 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入用户名"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    邮箱地址 <span className="text-gray-400">(选填)</span>
                  </label>
                  <div className="mt-1">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入邮箱地址"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    手机号 <span className="text-gray-400">(选填)</span>
                  </label>
                  <div className="mt-1">
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入手机号"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入密码"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    确认密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请再次输入密码"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="captcha" className="block text-sm font-medium text-gray-700">
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
                      className="flex-1 appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        <div
                            className="h-10 w-24 bg-gray-200 rounded flex items-center justify-center cursor-pointer"
                            onClick={fetchCaptcha}
                        >
                          <span className="text-gray-500 text-xs">点击获取</span>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={fetchCaptcha}
                        className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
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
                      <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                      >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                  ) : null}
                  {loading ? '注册中...' : '注册'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  已有账户？
                </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                    to="/login"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  登录
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}