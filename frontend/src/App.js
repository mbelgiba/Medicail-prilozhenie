import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Sidebar      from './components/Sidebar';
import Header       from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import AiBot        from './components/AiBot';

import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Medical      from './pages/Medical';
import Games        from './pages/Games';
import Profile      from './pages/Profile';
import Appointments from './pages/Appointments';
import Map          from './pages/Map';

// Layout wrapper for authenticated pages (sidebar + header + content)
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="content-wrapper">
        <Header />
        <main className="main-content">
          {children}
        </main>
      </div>
      <AiBot />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes — wrapped in AppLayout */}
        <Route path="/" element={
          <PrivateRoute>
            <AppLayout><Dashboard /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/appointments" element={
          <PrivateRoute>
            <AppLayout><Appointments /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/medical" element={
          <PrivateRoute>
            <AppLayout><Medical /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/games" element={
          <PrivateRoute>
            <AppLayout><Games /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <AppLayout><Profile /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/map" element={
          <PrivateRoute>
            <AppLayout><Map /></AppLayout>
          </PrivateRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;