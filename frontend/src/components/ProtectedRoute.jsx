import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Guards routes requiring authentication and role-based authorization.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role, employee } = useAuth();

  if (!isAuthenticated || !employee) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <h2 style={{ color: '#dc3545', marginBottom: '0.75rem' }}>Access Denied</h2>
        <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>
          This page requires <strong>{requiredRole.toUpperCase()}</strong> role privileges.
          Your current role is <strong>{role?.toUpperCase()}</strong>.
        </p>
        <a href="/my-leaves" className="btn btn-primary">
          Back to My Leaves
        </a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
