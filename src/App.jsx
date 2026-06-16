import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlannerProvider } from './context/PlannerContext';
import Navigation from './components/Navigation';
import InAppSurveyModal from './components/InAppSurveyModal';

import Home from './pages/Home';
import Library from './pages/Library';
import CategoryPage from './pages/CategoryPage';
import Planner from './pages/Planner';
import Calendar from './pages/Calendar';
import SavedPlans from './pages/SavedPlans';
import SettingsPage from './pages/SettingsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoute from './components/AdminRoute';

// Public Pages
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import SurveyPage from './pages/SurveyPage';
import PublicSurvey from './pages/PublicSurvey';

import './index.css';

const ProtectedApp = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/saved" element={<SavedPlans />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </main>
      <Navigation />
      <InAppSurveyModal />
    </div>
  );
};

const AppRoutes = () => {
  const { currentUser } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={currentUser ? <Navigate to="/app" replace /> : <LandingPage />} />
      <Route path="/login" element={currentUser ? <Navigate to="/app" replace /> : <LoginPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/survey/:id" element={<SurveyPage />} />
      <Route path="/feedback" element={<PublicSurvey />} />
      <Route path="/app/*" element={<ProtectedApp />} />
      <Route 
        path="/admin/*" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <PlannerProvider>
        <AppRoutes />
      </PlannerProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
