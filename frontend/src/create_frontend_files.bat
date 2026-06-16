@echo off
echo ========================================
echo Creating Frontend Files Automatically
echo ========================================
echo.

cd /d %~dp0

REM ============================================
REM CONFIG FILES
REM ============================================

echo // API Configuration > config.js
echo export const API_BASE_URL = 'http://localhost/exclusivegrade/backend/api'; >> config.js
echo. >> config.js
echo export default { API_BASE_URL }; >> config.js

REM ============================================
REM UTILS
REM ============================================

echo // Resolve URL helper > utils\resolveUrl.js
echo export function resolveUrl(url) { >> utils\resolveUrl.js
echo   if (!url) return ''; >> utils\resolveUrl.js
echo   if (url.startsWith('http')) return url; >> utils\resolveUrl.js
echo   return API_BASE_URL.replace('/api', '') + url; >> utils\resolveUrl.js
echo } >> utils\resolveUrl.js

REM ============================================
REM HOOKS
REM ============================================

echo import { useCallback, useRef } from 'react' > hooks\useApi.js
echo import { API_BASE_URL } from '../config' >> hooks\useApi.js
echo. >> hooks\useApi.js
echo export function useApi() { >> hooks\useApi.js
echo   const tokenRef = useRef(localStorage.getItem('gg_token')); >> hooks\useApi.js
echo. >> hooks\useApi.js
echo   tokenRef.current = localStorage.getItem('gg_token'); >> hooks\useApi.js
echo. >> hooks\useApi.js
echo   const request = useCallback(async (method, path, body = null) => { >> hooks\useApi.js
echo     const token = tokenRef.current; >> hooks\useApi.js
echo. >> hooks\useApi.js
echo     const opts = { >> hooks\useApi.js
echo       method, >> hooks\useApi.js
echo       headers: { >> hooks\useApi.js
echo         'Content-Type': 'application/json', >> hooks\useApi.js
echo         ...(token ? { Authorization: `Bearer ${token}` } : {}), >> hooks\useApi.js
echo       }, >> hooks\useApi.js
echo     }; >> hooks\useApi.js
echo     if (body) opts.body = JSON.stringify(body); >> hooks\useApi.js
echo. >> hooks\useApi.js
echo     const res = await fetch(`${API_BASE_URL}${path}`, opts); >> hooks\useApi.js
echo     const data = await res.json(); >> hooks\useApi.js
echo     if (!data.success) throw new Error(data.message || 'Request failed'); >> hooks\useApi.js
echo     return data; >> hooks\useApi.js
echo   }, []); >> hooks\useApi.js
echo. >> hooks\useApi.js
echo   const get = useCallback((path) => request('GET', path), [request]); >> hooks\useApi.js
echo   const post = useCallback((path, body) => request('POST', path, body), [request]); >> hooks\useApi.js
echo   const put = useCallback((path, body) => request('PUT', path, body), [request]); >> hooks\useApi.js
echo   const del = useCallback((path) => request('DELETE', path), [request]); >> hooks\useApi.js
echo. >> hooks\useApi.js
echo   return { get, post, put, del }; >> hooks\useApi.js
echo } >> hooks\useApi.js

REM ============================================
REM CONTEXT
REM ============================================

echo import { createContext, useContext, useState, useEffect } from 'react' > context\AuthContext.jsx
echo. >> context\AuthContext.jsx
echo const AuthContext = createContext(null); >> context\AuthContext.jsx
echo. >> context\AuthContext.jsx
echo export function AuthProvider({ children }) { >> context\AuthContext.jsx
echo   const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('gg_user') || 'null')); >> context\AuthContext.jsx
echo   const [school, setSchool] = useState(() => JSON.parse(localStorage.getItem('gg_school') || 'null')); >> context\AuthContext.jsx
echo   const [token, setToken] = useState(() => localStorage.getItem('gg_token') || null); >> context\AuthContext.jsx
echo. >> context\AuthContext.jsx
echo   const login = (data) => { >> context\AuthContext.jsx
echo     localStorage.setItem('gg_token', data.token); >> context\AuthContext.jsx
echo     localStorage.setItem('gg_user', JSON.stringify(data.user)); >> context\AuthContext.jsx
echo     if (data.school) localStorage.setItem('gg_school', JSON.stringify(data.school)); >> context\AuthContext.jsx
echo     setToken(data.token); >> context\AuthContext.jsx
echo     setUser(data.user); >> context\AuthContext.jsx
echo     if (data.school) setSchool(data.school); >> context\AuthContext.jsx
echo   }; >> context\AuthContext.jsx
echo. >> context\AuthContext.jsx
echo   const logout = () => { >> context\AuthContext.jsx
echo     localStorage.removeItem('gg_token'); >> context\AuthContext.jsx
echo     localStorage.removeItem('gg_user'); >> context\AuthContext.jsx
echo     localStorage.removeItem('gg_school'); >> context\AuthContext.jsx
echo     setToken(null); setUser(null); setSchool(null); >> context\AuthContext.jsx
echo   }; >> context\AuthContext.jsx
echo. >> context\AuthContext.jsx
echo   return ( >> context\AuthContext.jsx
echo     <AuthContext.Provider value={{ user, school, token, login, logout }}> >> context\AuthContext.jsx
echo       {children} >> context\AuthContext.jsx
echo     </AuthContext.Provider> >> context\AuthContext.jsx
echo   ); >> context\AuthContext.jsx
echo } >> context\AuthContext.jsx
echo. >> context\AuthContext.jsx
echo export const useAuth = () => useContext(AuthContext); >> context\AuthContext.jsx

REM ============================================
REM MAIN APP FILES
REM ============================================

echo import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom' > App.jsx
echo import { AuthProvider, useAuth } from './context/AuthContext' >> App.jsx
echo import Landing from './pages/Landing' >> App.jsx
echo import Login from './pages/Login' >> App.jsx
echo import Register from './pages/Register' >> App.jsx
echo import SchoolPage from './pages/SchoolPage' >> App.jsx
echo import AdminDashboard from './pages/admin/Dashboard' >> App.jsx
echo import TeacherDashboard from './pages/teacher/Dashboard' >> App.jsx
echo import SuperDashboard from './pages/super/Dashboard' >> App.jsx
echo import './App.css' >> App.jsx
echo. >> App.jsx
echo function PrivateRoute({ children, allowedRoles }) { >> App.jsx
echo   const { user, token } = useAuth(); >> App.jsx
echo   if (!token) return <Navigate to="/login" replace />; >> App.jsx
echo   if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />; >> App.jsx
echo   return children; >> App.jsx
echo } >> App.jsx
echo. >> App.jsx
echo function App() { >> App.jsx
echo   return ( >> App.jsx
echo     <BrowserRouter> >> App.jsx
echo       <AuthProvider> >> App.jsx
echo         <Routes> >> App.jsx
echo           <Route path="/" element={<Landing />} /> >> App.jsx
echo           <Route path="/login" element={<Login />} /> >> App.jsx
echo           <Route path="/register" element={<Register />} /> >> App.jsx
echo           <Route path="/s/:slug" element={<SchoolPage />} /> >> App.jsx
echo           <Route path="/admin/*" element={<PrivateRoute allowedRoles={['school_admin']}><AdminDashboard /></PrivateRoute>} /> >> App.jsx
echo           <Route path="/teacher/*" element={<PrivateRoute allowedRoles={['teacher']}><TeacherDashboard /></PrivateRoute>} /> >> App.jsx
echo           <Route path="/super/*" element={<PrivateRoute allowedRoles={['super_admin']}><SuperDashboard /></PrivateRoute>} /> >> App.jsx
echo         </Routes> >> App.jsx
echo       </AuthProvider> >> App.jsx
echo     </BrowserRouter> >> App.jsx
echo   ); >> App.jsx
echo } >> App.jsx
echo. >> App.jsx
echo export default App; >> App.jsx

REM main.jsx
echo import React from 'react' > main.jsx
echo import ReactDOM from 'react-dom/client' >> main.jsx
echo import App from './App' >> main.jsx
echo import './index.css' >> main.jsx
echo. >> main.jsx
echo ReactDOM.createRoot(document.getElementById('root')).render( >> main.jsx
echo   <React.StrictMode> >> main.jsx
echo     <App /> >> main.jsx
echo   </React.StrictMode> >> main.jsx
echo ); >> main.jsx

REM ============================================
echo.
echo ========================================
echo Frontend files created successfully!
echo ========================================
echo.
pause