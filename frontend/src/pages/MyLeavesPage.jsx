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
 * 8. If logged in as Manager (role === 'manager'), provides manager approval/rejection actions.
 */
const MyLeavesPage = () => {
  const { employee, token, role } = useAuth();

  // Three mandatory states as required by Task 4
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Client-side filter state
  const [statusFilter, setStatusFilter] = useState('All');

  // Manager oversight state (for role === 'manager')
  const [teamRequests, setTeamRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [managerMessage, setManagerMessage] = useState(null);

  // Fetch leave history on mount
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

  const fetchTeamLeaves = async () => {
    if (role === 'manager') {
      try {
        const res = await axios.get('/api/v1/leaves', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setTeamRequests(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch team requests for manager:', err);
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyLeaves();
      if (role === 'manager') {
        fetchTeamLeaves();
      }
    }
  }, [token, role]);

  const handleManagerStatusUpdate = async (id, newStatus) => {
    setActionLoading(id);
    setManagerMessage(null);

    try {
      const res = await axios.patch(
        `/api/v1/leaves/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setManagerMessage({
          type: 'success',
          text: `Request has been ${newStatus} successfully!`,
        });
        // Update local team list
        setTeamRequests((prev) =>
          prev.map((item) => (item._id === id ? res.data.data : item))
        );
        fetchMyLeaves();
      }
    } catch (err) {
      const errText =
        err.response?.data?.message || `Failed to update status to ${newStatus}`;
      setManagerMessage({ type: 'danger', text: errText });
    } finally {
      setActionLoading(null);
    }
  };

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

      {/* Manager Approval Section (Rendered only for role === 'manager') */}
      {role === 'manager' && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#1e3a8a' }}>
              👔 Manager Approvals ({teamRequests.filter(r => r.status === 'pending').length} Pending)
            </h2>
            <button onClick={fetchTeamLeaves} className="btn btn-sm" style={{ background: '#e2e8f0', color: '#334155' }}>
              🔄 Refresh List
            </button>
          </div>

          {managerMessage && (
            <div className={`alert alert-${managerMessage.type}`} style={{ marginBottom: '1rem' }}>
              {managerMessage.type === 'success' ? '✅' : '⚠️'} {managerMessage.text}
            </div>
          )}

          {teamRequests.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No team leave requests submitted yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action (Manager)</th>
                  </tr>
                </thead>
                <tbody>
                  {teamRequests.map((req) => (
                    <tr key={req._id}>
                      <td>
                        <strong>{req.employeeId?.name || 'Unknown'}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.employeeId?.department}</div>
                      </td>
                      <td>{req.leaveTypeId?.name}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(req.fromDate).toLocaleDateString()} to {new Date(req.toDate).toLocaleDateString()}
                      </td>
                      <td><strong>{req.days}</strong> d</td>
                      <td style={{ maxWidth: '180px', fontSize: '0.85rem' }}>{req.reason || '—'}</td>
                      <td>
                        <span className={`status-badge status-${req.status}`}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleManagerStatusUpdate(req._id, 'approved')}
                            disabled={actionLoading === req._id || req.status === 'approved'}
                            className="btn btn-success btn-sm"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleManagerStatusUpdate(req._id, 'rejected')}
                            disabled={actionLoading === req._id || req.status === 'rejected'}
                            className="btn btn-danger btn-sm"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Task 4: Filter Dropdown & Controls for My Leaves */}
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
            Showing <strong>{filteredLeaves.length}</strong> of <strong>{leaves.length}</strong> records
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
