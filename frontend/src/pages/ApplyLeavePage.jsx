import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

/**
 * Task 2 Page: ApplyLeavePage
 * Form containing leave type, from date, to date, reason.
 * Uses useState to meaningfully manage state values including selected leave type and computed number of days.
 */
const ApplyLeavePage = () => {
  const { employee, token, updateBalance } = useAuth();
  const navigate = useNavigate();

  // State values managed via useState
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [computedDays, setComputedDays] = useState(0);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch available leave types from public API
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const res = await axios.get('/api/v1/leave-types');
        if (res.data.success && res.data.data.length > 0) {
          setLeaveTypes(res.data.data);
          setSelectedLeaveType(res.data.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load leave types:', err);
        setError('Failed to load leave types. Please refresh.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  // Meaningful state computation: calculate days dynamically between fromDate and toDate
  useEffect(() => {
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);

      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setComputedDays(diffDays);
      } else {
        setComputedDays(0);
      }
    } else {
      setComputedDays(0);
    }
  }, [fromDate, toDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedLeaveType) {
      setError('Please select a valid leave type.');
      return;
    }

    if (computedDays <= 0) {
      setError('Invalid date range. "To Date" must be on or after "From Date".');
      return;
    }

    if (employee && computedDays > employee.leaveBalance) {
      setError(
        `Requested leave (${computedDays} days) exceeds your remaining balance of ${employee.leaveBalance} days.`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        '/api/v1/leaves',
        {
          leaveTypeId: selectedLeaveType,
          fromDate,
          toDate,
          days: computedDays,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess('Leave request submitted successfully!');
        if (response.data.remainingBalance !== undefined) {
          updateBalance(response.data.remainingBalance);
        }
        setTimeout(() => {
          navigate('/my-leaves');
        }, 1200);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to submit leave request. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedTypeDetails = leaveTypes.find((lt) => lt._id === selectedLeaveType);

  return (
    <div style={{ maxWidth: '650px', margin: '1rem auto' }}>
      <div className="card">
        <div className="page-header">
          <div>
            <h1 className="page-title">Apply for Leave</h1>
            <p className="page-subtitle">Submit a leave request for managerial approval</p>
          </div>
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              textAlign: 'right',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>
              Current Leave Balance
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1d4ed8' }}>
              {employee?.leaveBalance ?? 20} <span style={{ fontSize: '0.9rem' }}>days</span>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        {fetchLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading leave types...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="leaveType">
                Leave Type <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <select
                id="leaveType"
                className="form-control"
                value={selectedLeaveType}
                onChange={(e) => setSelectedLeaveType(e.target.value)}
                required
              >
                {leaveTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name} (Max {type.maxDaysPerYear} days/year)
                  </option>
                ))}
              </select>
              {selectedTypeDetails && (
                <small style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  Policy: Max allowance is {selectedTypeDetails.maxDaysPerYear} days annually.
                </small>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="fromDate">
                  From Date <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  id="fromDate"
                  type="date"
                  className="form-control"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="toDate">
                  To Date <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  id="toDate"
                  type="date"
                  className="form-control"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Computed Number of Days display */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 600, color: '#334155' }}>
                Computed Duration (Task 2 state):
              </span>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: computedDays > (employee?.leaveBalance ?? 20) ? '#dc3545' : '#2563eb',
                }}
              >
                {computedDays} {computedDays === 1 ? 'day' : 'days'}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reason">
                Reason for Leave (Optional, max 500 chars)
              </label>
              <textarea
                id="reason"
                className="form-control"
                rows="3"
                placeholder="Describe reason for leave request..."
                maxLength="500"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <small style={{ color: '#94a3b8', textAlign: 'right', display: 'block' }}>
                {reason.length}/500 characters
              </small>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={loading || computedDays <= 0}
              >
                {loading ? 'Submitting Request...' : 'Submit Leave Application'}
              </button>
              <button
                type="button"
                className="btn"
                style={{ background: '#f1f5f9', color: '#475569' }}
                onClick={() => navigate('/my-leaves')}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplyLeavePage;
