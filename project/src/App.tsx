import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Vitals from './pages/Vitals';
import Medications from './pages/Medications';
import Conditions from './pages/Conditions';
import AISummary from './pages/AISummary';
import AuthCallback from './pages/AuthCallback';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/vitals" element={
                <ProtectedRoute>
                  <Layout>
                    <Vitals />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/medications" element={
                <ProtectedRoute>
                  <Layout>
                    <Medications />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/conditions" element={
                <ProtectedRoute>
                  <Layout>
                    <Conditions />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/ai-summary" element={
                <ProtectedRoute>
                  <Layout>
                    <AISummary />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#333',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;