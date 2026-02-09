import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import SuperadminProtectedRoute from './components/SuperadminProtectedRoute';
import CRMPage from './pages/CRMPage';
import LogsPage from './pages/LogsPage';
import ScraperPage from './pages/ScraperPage';
import ScraperLivePage from './pages/ScraperLivePage';
import ScraperHistoryPage from './pages/ScraperHistoryPage';
import ScraperSessionDetailPage from './pages/ScraperSessionDetailPage';
import TemplateManagerPage from './pages/TemplateManagerPage';
import MonitorPage from './pages/MonitorPage';
import SuperadminPage from './pages/SuperadminPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

function MainLayout() {
  return (
    <>
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/crm" replace />} />
          <Route path="/crm" element={<CRMPage />} />
          <Route path="/crm/templates" element={<TemplateManagerPage />} />
          <Route path="/scraper" element={<ScraperPage />} />
          <Route path="/scraper/live" element={<ScraperLivePage />} />
          <Route path="/scraper/history" element={<ScraperHistoryPage />} />
          <Route path="/scraper/history/:slug" element={<ScraperSessionDetailPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/monitor" element={<MonitorPage />} />
          <Route
            path="/superadmin"
            element={
              <SuperadminProtectedRoute>
                <SuperadminPage />
              </SuperadminProtectedRoute>
            }
          />
          <Route path="/sales" element={<div className="placeholder"><h2>Sales Page</h2><p>Coming soon...</p></div>} />
          <Route path="/lpbuilder" element={<div className="placeholder"><h2>LP Builder</h2><p>Coming soon...</p></div>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
