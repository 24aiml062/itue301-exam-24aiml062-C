import React from 'react';

/**
 * Task 1 Component: LeaveRequestCard
 * Accepts 6 props: fromDate, toDate, days, leaveType, reason, status
 * Renders status as a colored pill badge.
 */
const LeaveRequestCard = ({
  fromDate,
  toDate,
  days,
  leaveType,
  reason,
  status = 'pending',
}) => {
  // Pill badge color mapping as specified in Task 1 hints
  const statusColors = {
    pending: { bg: '#FFC107', text: '#000000' },
    approved: { bg: '#28A745', text: '#FFFFFF' },
    rejected: { bg: '#DC3545', text: '#FFFFFF' },
    cancelled: { bg: '#6C757D', text: '#FFFFFF' },
  };

  const normalizedStatus = (status || 'pending').toLowerCase();
  const currentBadgeStyle = statusColors[normalizedStatus] || {
    bg: '#E2E8F0',
    text: '#334155',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="leave-card">
      <div className="leave-card-header">
        <span className="leave-card-type">{leaveType || 'Leave'}</span>
        <span
          className="status-badge"
          style={{
            backgroundColor: currentBadgeStyle.bg,
            color: currentBadgeStyle.text,
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'capitalize',
            display: 'inline-block',
          }}
        >
          {status}
        </span>
      </div>

      <div className="leave-card-body">
        <div className="card-field">
          <span className="field-label">From:</span>
          <span className="field-value">{formatDate(fromDate)}</span>
        </div>

        <div className="card-field">
          <span className="field-label">To:</span>
          <span className="field-value">{formatDate(toDate)}</span>
        </div>

        <div className="card-field">
          <span className="field-label">Duration:</span>
          <span className="field-value">
            {days} {Number(days) === 1 ? 'day' : 'days'}
          </span>
        </div>

        <div className="card-field">
          <span className="field-label">Leave Type:</span>
          <span className="field-value">{leaveType || 'General'}</span>
        </div>

        {reason && (
          <div className="leave-card-reason">
            <strong>Reason:</strong> {reason}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequestCard;
