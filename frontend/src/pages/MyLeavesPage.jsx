import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LeaveRequestCard from '../components/LeaveRequestCard';

/**
 * Task 2 & 4 Page: MyLeavesPage
 * 1. Displays "Welcome, [Name]" at the top reading from AuthContext.
 * 2. Uses useEffect to call GET /api/v1/leaves/my with Authorization Bearer header.
 * 3. Maintains 3 states: leaves, loading, error.
 * 4. Displays loading indicator during fetch.
 * 5. Displays "Failed to load your leave history." on non-200 / error.
 * 6. Renders leaves dynamically using LeaveRequestCard.
 * 7. Client-side status filter dropdown (All | Pending | Approved | Rejected) without re-fetching API.
 */
const MyLeavesPage = () => {
  const { employee, token } = useAuth();

  // Three mandatory states as required by Task 4
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Client-side filter state
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch leave history on mount
  useEffect(() => {
    const fetchMyLeaves = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await axios.get('/api/v1/leaves/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200 && response.data.success) {
          setLeaves(response.data.data || []);
        } else {
          // Task 4 exact error message requirement
          setError('Failed to load your leave history.');
        }
      } catch (err) {
        console.error('Error fetching leaves:', err);
        // Task 4 exact error message requirement
        setError('Failed to load your leave history.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyLeaves();
    }
  }, [token]);

  // Client-side filter implementation (Task 4 hint: leaves.filter(...))
  const filteredLeaves = leaves.filter((leave) => {
    if (statusFilter === 'All') return true;
    return (leave.status || '').toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div>
      {/* Task 2: Welcome, [Name] header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome, {employee ? employee.name : 'Employee'}
          </h1>
          <p className="page-subtitle">
            Department: {employee?.department || 'N/A'} &bull; Designation: {employee?.designation || 'Staff'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: '#065f46',
              fontWeight: 600,
            }}
          >
            Balance: <strong>{employee?.leaveBalance ?? 20} days</strong>
          </div>
          <Link to="/apply" className="btn btn-primary">
            + Apply for Leave
          </Link>
        </div>
      </div>

      {/* Task 4: Filter Dropdown & Controls */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div className="filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>
              Filter by Status:
            </span>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Requests ({leaves.length})</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing <strong>{filteredLeaves.length}</strong> of <strong>{leaves.length}</strong> records (Client-side filtered)
          </div>
        </div>
      </div>

      {/* Task 4: Loading State */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading your leave history from server...</p>
        </div>
      )}

      {/* Task 4: Error State ("Failed to load your leave history.") */}
      {!loading && error && (
        <div className="alert alert-danger" style={{ textAlign: 'center', justifyContent: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Task 4: Successful rendering with LeaveRequestCard */}
      {!loading && !error && filteredLeaves.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '1rem' }}>
            No leave requests found for selected status ({statusFilter}).
          </p>
          <Link to="/apply" className="btn btn-primary">
            Create New Leave Application
          </Link>
        </div>
      )}

      {!loading && !error && filteredLeaves.length > 0 && (
        <div className="leave-cards-grid">
          {filteredLeaves.map((req) => (
            <LeaveRequestCard
              key={req._id}
              fromDate={req.fromDate}
              toDate={req.toDate}
              days={req.days}
              leaveType={req.leaveTypeId?.name || 'General Leave'}
              reason={req.reason}
              status={req.status}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLeavesPage;
