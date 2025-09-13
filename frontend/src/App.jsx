import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from "./components/dashboard/Dashboard.jsx";
import ArticleReader from './components/ArticleReader'
import { fetchSiteName } from './Api.jsx'

function App() {
  useEffect(() => {
    const setDocumentTitle = async () => {
      try {
        const siteName = await fetchSiteName();
        if (siteName) {
          document.title = siteName;
        } else {
          document.title = 'DimStack';
        }
      } catch (error) {
        console.error('设置站点标题失败:', error);
        document.title = 'DimStack';
      }
    };

    setDocumentTitle();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/category/:categoryName" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/article/:articleId" element={<ArticleReader />} />
    </Routes>
  )
}

export default App
