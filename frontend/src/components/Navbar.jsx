import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Task 2 Component: Navigation Bar
 * Contains links to all routes using React Router (NavLink) without full-page reloads.
 */
const Navbar = () => {
  const { employee, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <NavLink to={isAuthenticated ? '/my-leaves' : '/'} className="nav-brand">
          <span style={{ fontSize: '1.4rem' }}>🏖️</span>
          <span>TechSolutions Leave Portal</span>
        </NavLink>

        <nav>
          <ul className="nav-links">
            {!isAuthenticated ? (
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                >
                  Login
                </NavLink>
              </li>
            ) : (
              <>
                <li>
                  <NavLink
                    to="/my-leaves"
                    className={({ isActive }) =>
                      isActive ? 'nav-link active' : 'nav-link'
                    }
                  >
                    My Leaves
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/apply"
                    className={({ isActive }) =>
                      isActive ? 'nav-link active' : 'nav-link'
                    }
                  >
                    Apply Leave
                  </NavLink>
                </li>
                {role === 'hr' && (
                  <li>
                    <NavLink
                      to="/hr"
                      className={({ isActive }) =>
                        isActive ? 'nav-link active' : 'nav-link'
                      }
                    >
                      HR Panel
                    </NavLink>
                  </li>
                )}
              </>
            )}
          </ul>
        </nav>

        {isAuthenticated && employee && (
          <div className="nav-user">
            <div className="user-badge">
              <span>👤 {employee.name}</span>
              <span className="role-tag">{role}</span>
              <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 600 }}>
                ({employee.leaveBalance ?? 20} days left)
              </span>
            </div>
            <button onClick={handleLogout} className="btn-logout" title="Sign out">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
