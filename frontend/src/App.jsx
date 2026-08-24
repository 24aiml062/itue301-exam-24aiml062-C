import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Standard Page Imports
import LoginPage from './pages/LoginPage';
import ApplyLeavePage from './pages/ApplyLeavePage';
import MyLeavesPage from './pages/MyLeavesPage';

// Task 2 & Mandatory Requirement: Lazy-loaded route for HR Panel using React.lazy + Suspense
const HRPanel = lazy(() => import('./pages/HRPanel'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Route */}
              <Route path="/" element={<LoginPage />} />

              {/* Task 2 Protected Routes */}
              <Route
                path="/apply"
                element={
                  <ProtectedRoute>
                    <ApplyLeavePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-leaves"
                element={
                  <ProtectedRoute>
                    <MyLeavesPage />
                  </ProtectedRoute>
                }
              />

              {/* Task 2 Lazy-loaded Protected Route for HR with Suspense fallback */}
              <Route
                path="/hr"
                element={
                  <ProtectedRoute requiredRole="hr">
                    <Suspense
                      fallback={
                        <div className="loading-indicator">
                          <div className="spinner"></div>
                          <p>Loading HR Panel module dynamically...</p>
                        </div>
                      }
                    >
                      <HRPanel />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
