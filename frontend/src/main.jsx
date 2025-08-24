import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))

// 设置主题
const isDarkMode = localStorage.getItem('theme') === 'dark' ||
  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)

if (isDarkMode) {
  document.documentElement.classList.add('dark')
}

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
