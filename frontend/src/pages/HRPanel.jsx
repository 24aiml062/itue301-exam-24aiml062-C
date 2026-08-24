import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

/**
 * Task 2 & Mandatory Requirement: HRPanel
 * Lazy-loaded component requiring role 'hr' (React.lazy + Suspense).
 * Purpose: HR generates and reviews company-wide leave reports and analytics.
 */
const HRPanel = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState('All');

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

  // Compute metrics for HR Report
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const departments = ['All', ...new Set(requests.map((r) => r.employeeId?.department).filter(Boolean))];

  const filteredRequests = requests.filter((req) => {
    if (departmentFilter === 'All') return true;
    return req.employeeId?.department === departmentFilter;
  });

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 HR Leave Reports & Analytics</h1>
          <p className="page-subtitle">
            Organization-wide leave summary and departmental report generation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchAllRequests} className="btn" style={{ background: '#e2e8f0', color: '#334155' }}>
            🔄 Refresh
          </button>
          <button onClick={handlePrintReport} className="btn btn-primary">
            🖨️ Print / Export Report
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {/* Metric Cards for HR Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Requests</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb' }}>{totalCount}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Pending Review</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706' }}>{pendingCount}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Approved Leaves</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>{approvedCount}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Rejected Leaves</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626' }}>{rejectedCount}</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading company-wide leave reports...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: '#64748b' }}>No leave requests found in the system.</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.15rem' }}>
              Company Leave Records ({filteredRequests.length})
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Filter Department:</span>
              <select
                className="filter-select"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => {
                  const badge = getBadgeStyle(req.status);

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
                        {new Date(req.fromDate).toLocaleDateString()}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(req.toDate).toLocaleDateString()}
                      </td>
                      <td>
                        <strong>{req.days}</strong> d
                      </td>
                      <td style={{ maxWidth: '240px', fontSize: '0.85rem' }}>
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
