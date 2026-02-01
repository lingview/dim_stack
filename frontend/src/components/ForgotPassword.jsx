import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../utils/axios.jsx'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    captcha: '',
    newPassword: '',
    confirmNewPassword: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [captchaSent, setCaptchaSent] = useState(false)
  const navigate = useNavigate()

  const isSubmitting = useRef(false)
  const errorTimeoutRef = useRef(null)

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSendCaptcha = async () => {
    if (!formData.username.trim()) return setErrorWithTimeout('请输入用户名')
    if (!formData.email.trim()) return setErrorWithTimeout('请输入邮箱')

    if (countdown > 0) return

    setLoading(true)

    try {
      const response = await apiClient.post('/forgot-password/send-captcha', {
        username: formData.username,
        email: formData.email
      })

      if (response.code === 200) {
        setError('')
        setCaptchaSent(true)
        setCountdown(60)
        setErrorWithTimeout('验证码已发送到您的邮箱', 3000)
      } else if (response.code === 429) {
        setErrorWithTimeout(response.message || '请求过于频繁，请稍后再试')
      } else {
        setErrorWithTimeout(response.message || '发送验证码失败')
      }
    } catch (err) {
      console.error('发送验证码失败:', err)
      if (err.response?.status === 429) {
        setErrorWithTimeout('请求过于频繁，请稍后再试', 5000)
      } else {
        setErrorWithTimeout(
            err.response?.data?.message ||
            err.response?.data?.data?.message ||
            '网络错误，请稍后再试',
            5000
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCaptcha = async (e) => {
    e.preventDefault()

    if (!formData.username.trim()) return setErrorWithTimeout('请输入用户名')
    if (!formData.email.trim()) return setErrorWithTimeout('请输入邮箱')
    if (!formData.captcha.trim()) return setErrorWithTimeout('请输入验证码')
    if (!captchaSent) return setErrorWithTimeout('请先发送验证码')

    if (isSubmitting.current) return
    isSubmitting.current = true
    setLoading(true)

    try {
      const response = await apiClient.post('/forgot-password/verify', {
        username: formData.username,
        email: formData.email,
        captcha: formData.captcha
      })

      if (response.code === 200 && response.data?.success) {
        setError('')
        console.log('验证成功，进入第二步')
        setStep(2)
      } else if (response.code === 429) {
        setErrorWithTimeout(response.message || '验证失败次数过多，请稍后再试')
      } else {
        setErrorWithTimeout(response.message || response.data?.message || '验证失败')
      }
    } catch (err) {
      console.error('验证失败:', err)
      if (err.response?.status === 429) {
        setErrorWithTimeout('请求过于频繁或验证次数过多，请稍后再试', 5000)
      } else {
        setErrorWithTimeout(
            err.response?.data?.message ||
            err.response?.data?.data?.message ||
            '网络错误，请稍后再试',
            5000
        )
      }
    } finally {
      isSubmitting.current = false
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!formData.newPassword) return setErrorWithTimeout('请输入新密码')
    if (!formData.confirmNewPassword) return setErrorWithTimeout('请确认新密码')
    if (formData.newPassword !== formData.confirmNewPassword) return setErrorWithTimeout('两次输入的密码不一致')
    if (formData.newPassword.length < 6) return setErrorWithTimeout('密码长度不能少于6位')

    if (isSubmitting.current) return
    isSubmitting.current = true
    setLoading(true)

    try {
      const response = await apiClient.post('/forgot-password/reset', {
        username: formData.username,
        email: formData.email,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      })

      if (response.code === 200 && response.data?.success) {
        setError('')
        setErrorWithTimeout('密码重置成功，即将跳转到登录页面...', 3000)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else if (response.code === 429) {
        setErrorWithTimeout('请求过于频繁，请稍后再试')
      } else {
        setErrorWithTimeout(response.message || response.data?.message || '密码重置失败')
      }
    } catch (err) {
      console.error('重置密码失败:', err)
      if (err.response?.status === 429) {
        setErrorWithTimeout('请求过于频繁，请稍后再试', 5000)
      } else {
        setErrorWithTimeout(
            err.response?.data?.message ||
            err.response?.data?.data?.message ||
            '网络错误，请稍后再试',
            5000
        )
      }
    } finally {
      isSubmitting.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    let timer = null
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [countdown])

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }
    }
  }, [])

  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {step === 1 ? '找回密码' : '设置新密码'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {step === 1
                  ? '请输入您的用户名和注册邮箱'
                  : '请设置您的新密码'}
            </p>
          </div>

          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
            )}

            {step === 1 ? (
                <form className="space-y-6" onSubmit={handleVerifyCaptcha}>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      用户名
                    </label>
                    <div className="mt-1">
                      <input
                          id="username"
                          name="username"
                          type="text"
                          value={formData.username}
                          onChange={handleChange}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="请输入用户名"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      邮箱
                    </label>
                    <div className="mt-1">
                      <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="请输入注册邮箱"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="captcha" className="block text-sm font-medium text-gray-700">
                      验证码
                    </label>
                    <div className="mt-1 flex space-x-2">
                      <input
                          id="captcha"
                          name="captcha"
                          type="text"
                          value={formData.captcha}
                          onChange={handleChange}
                          className="flex-1 appearance-none block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="请输入验证码"
                      />
                      <button
                          type="button"
                          onClick={handleSendCaptcha}
                          disabled={loading || countdown > 0}
                          className={`px-4 py-2 text-sm rounded-md whitespace-nowrap ${
                              countdown > 0
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                      >
                        {countdown > 0 ? `${countdown}s` : '获取'}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      验证码有效期10分钟，最多尝试5次
                    </p>
                  </div>

                  <div>
                    <button
                        type="submit"
                        disabled={loading || !captchaSent}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            验证中...
                          </>
                      ) : '验证并继续'}
                    </button>
                  </div>
                </form>
            ) : (
                <form className="space-y-6" onSubmit={handleResetPassword}>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      新密码
                    </label>
                    <div className="mt-1">
                      <input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="请输入新密码（至少6位）"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                      确认新密码
                    </label>
                    <div className="mt-1">
                      <input
                          id="confirmNewPassword"
                          name="confirmNewPassword"
                          type="password"
                          value={formData.confirmNewPassword}
                          onChange={handleChange}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="请再次输入新密码"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            重置中...
                          </>
                      ) : '重置密码'}
                    </button>
                  </div>
                </form>
            )}

            <p className="mt-6 text-center text-sm text-gray-600">
              记起密码了？ <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">返回登录</Link>
            </p>
          </div>
        </div>
      </div>
  )
}