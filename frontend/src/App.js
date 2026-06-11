import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Sidebar      from './components/Sidebar';
import Header       from './components/Header';
import PrivateRoute from './components/PrivateRoute';

import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Medical      from './pages/Medical';
import Games        from './pages/Games';
import Profile      from './pages/Profile';
import Appointments from './pages/Appointments';
import Map          from './pages/Map';
import DoctorDashboard from './pages/DoctorDashboard';
import AIAssistant from './components/AIAssistant';

import { AuthContext } from './context/AuthContext';

// Layout wrapper for authenticated pages (sidebar + header + content)
function AppLayout({ children }) {
  const { currentUser } = useContext(AuthContext);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!currentUser || !currentUser.email) return;
    
    // Connect to WebSocket using the user's email as the identifier
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = process.env.REACT_APP_API_URL 
      ? process.env.REACT_APP_API_URL.replace(/^http/, 'ws') + '/ws?token=' + currentUser.email
      : `${protocol}//localhost:5000/api/ws?token=${currentUser.email}`;
      
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.message) {
          setToast(data.message);
          setTimeout(() => setToast(null), 5000); // Hide after 5 seconds
        }
      } catch (e) {
        console.error("WS Parse error", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [currentUser]);

  return (
    <div className="app-layout">
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: 'var(--gradient-primary)', color: 'white',
          padding: '16px 24px', borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(27,110,243,0.4)',
          fontWeight: '600', animation: 'fadeInUp 0.3s ease-out'
        }}>
          🔔 {toast}
        </div>
      )}
      <Sidebar />
      <div className="content-wrapper">
        <Header />
        <main className="main-content">
          {children}
        </main>
      </div>
      <AIAssistant />
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
        <Route path="/doctor" element={
          <PrivateRoute>
            <AppLayout><DoctorDashboard /></AppLayout>
          </PrivateRoute>
        } />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
