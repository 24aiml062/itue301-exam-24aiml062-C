import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

/**
 * Task 1 & 2 Page: LoginPage
 * Authenticates employee against /api/v1/auth/login and stores session in AuthContext.
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/v1/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        login(response.data.employee, response.data.token);
        navigate('/my-leaves');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🏢</span>
          <h1 className="page-title" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
            Employee Portal Login
          </h1>
          <p className="page-subtitle">TechSolutions Leave Management System</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Work Email
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="e.g. john@techsolutions.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>
            Quick Demo Logins (Click to autofill):
          </p>
          <div className="quick-login-grid">
            <button
              type="button"
              className="btn-demo"
              onClick={() => handleQuickLogin('john@techsolutions.com', 'password123')}
            >
              👤 Employee (John)
            </button>
            <button
              type="button"
              className="btn-demo"
              onClick={() => handleQuickLogin('hr@techsolutions.com', 'password123')}
            >
              🛡️ HR Lead (Alice)
            </button>
            <button
              type="button"
              className="btn-demo"
              onClick={() => handleQuickLogin('manager@techsolutions.com', 'password123')}
            >
              👔 Manager (Sarah)
            </button>
            <button
              type="button"
              className="btn-demo"
              onClick={() => handleQuickLogin('24aiml062@charusat.edu.in', 'password123')}
            >
              🎓 Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
