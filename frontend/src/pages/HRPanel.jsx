import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

/**
 * Task 2 & Mandatory Requirement: HRPanel
 * Lazy-loaded component requiring role 'hr'.
 * Displays all leave requests across the company with Approve/Reject actions calling PATCH /api/v1/leaves/:id/status.
 */
const HRPanel = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/leaves', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load leave requests for HR:', err);
      setMessage({ type: 'danger', text: 'Failed to load employee leave requests.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, [token]);

  const handleStatusUpdate = async (id, newStatus) => {
    setActionLoading(id);
    setMessage(null);

    try {
      const res = await axios.patch(
        `/api/v1/leaves/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Leave request has been successfully ${newStatus}!`,
        });
        // Update local state
        setRequests((prev) =>
          prev.map((item) => (item._id === id ? res.data.data : item))
        );
      }
    } catch (err) {
      const errText =
        err.response?.data?.message || `Failed to update status to ${newStatus}`;
      setMessage({ type: 'danger', text: errText });
    } finally {
      setActionLoading(null);
    }
  };

  const getBadgeStyle = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'approved':
        return { bg: '#28A745', text: '#fff' };
      case 'rejected':
        return { bg: '#DC3545', text: '#fff' };
      case 'cancelled':
        return { bg: '#6C757D', text: '#fff' };
      default:
        return { bg: '#FFC107', text: '#000' };
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🛡️ HR Administration Panel</h1>
          <p className="page-subtitle">
            Review, approve, or reject employee leave applications across the organization.
          </p>
        </div>
        <button onClick={fetchAllRequests} className="btn" style={{ background: '#e2e8f0', color: '#334155' }}>
          🔄 Refresh Requests
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading company-wide leave requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: '#64748b' }}>No leave requests found in the system.</p>
        </div>
      ) : (
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>
            All Company Requests ({requests.length})
          </h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const badge = getBadgeStyle(req.status);
                  const isPending = req.status === 'pending';
                  const isProcessing = actionLoading === req._id;

                  return (
                    <tr key={req._id}>
                      <td>
                        <strong>{req.employeeId?.name || 'Unknown'}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {req.employeeId?.email}
                        </div>
                      </td>
                      <td>{req.employeeId?.department || 'N/A'}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {req.leaveTypeId?.name || 'General'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(req.fromDate).toLocaleDateString()} to{' '}
                        {new Date(req.toDate).toLocaleDateString()}
                      </td>
                      <td>
                        <strong>{req.days}</strong> d
                      </td>
                      <td style={{ maxWidth: '220px', fontSize: '0.85rem' }}>
                        {req.reason || '—'}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleStatusUpdate(req._id, 'approved')}
                            disabled={isProcessing || req.status === 'approved'}
                            className="btn btn-success btn-sm"
                            title="Approve Request"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req._id, 'rejected')}
                            disabled={isProcessing || req.status === 'rejected'}
                            className="btn btn-danger btn-sm"
                            title="Reject Request"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRPanel;
