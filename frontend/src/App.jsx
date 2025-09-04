import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from "./components/Dashboard.jsx";
import ArticleReader from './components/ArticleReader';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/article/:articleId" element={<ArticleReader />} />
    </Routes>
  )
}

export default App
