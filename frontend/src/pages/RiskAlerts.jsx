import React, { useState, useEffect } from 'react';
import { riskAlertAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RiskAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await riskAlertAPI.getAll();
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Failed to load risk alerts.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleToggleResolve = async (id) => {
    try {
      const res = await riskAlertAPI.resolve(id);
      setMessage({
        type: 'success',
        text: `Alert status updated to: ${res.data.status}`,
      });
      fetchAlerts();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Failed to update alert status.' });
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm('Are you sure you want to remove this risk alert?')) return;
    try {
      await riskAlertAPI.delete(id);
      setMessage({ type: 'success', text: 'Alert deleted successfully.' });
      fetchAlerts();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Failed to delete alert.' });
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter((a) => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSearch =
      a.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.student?.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course?.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course?.courseCode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1 mb-1 rounded-pill">
            <i className="bi bi-shield-exclamation me-1"></i> Early Intervention Engine
          </span>
          <h2 className="fw-bold text-dark mb-0">Risk Alerts Center</h2>
          <p className="text-muted small mb-0">
            Real-time monitoring of students whose weekly quiz marks dropped by <strong>&ge; 20%</strong>.
          </p>
        </div>

        <div className="d-flex gap-2">
          <span className="badge bg-danger p-2 px-3 rounded-pill fs-6">
            {activeCount} Active Alerts
          </span>
          <span className="badge bg-success p-2 px-3 rounded-pill fs-6">
            {resolvedCount} Resolved
          </span>
        </div>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card card-modern p-3 border bg-white mb-4 shadow-sm">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary-custom' : 'btn-outline-secondary'}`}
                onClick={() => setStatusFilter('ALL')}
              >
                All Alerts ({alerts.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'ACTIVE' ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={() => setStatusFilter('ACTIVE')}
              >
                Active Dips ({activeCount})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'RESOLVED' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setStatusFilter('RESOLVED')}
              >
                Resolved ({resolvedCount})
              </button>
            </div>
          </div>

          <div className="col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by student, roll number, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
          <div className="text-muted mt-2">Scanning risk alerts...</div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="card card-modern p-5 text-center bg-white border">
          <i className="bi bi-shield-check text-success display-3 mb-3"></i>
          <h4 className="fw-bold text-dark">No Risk Alerts Found</h4>
          <p className="text-muted mb-0">
            {statusFilter === 'ALL'
              ? 'All students are performing smoothly without 20%+ drops.'
              : `No alerts found with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="col-lg-6">
              <div
                className={`card card-modern p-4 h-100 border ${alert.status === 'ACTIVE' ? 'alert-glow-danger border-danger-subtle' : 'border-success-subtle bg-white'}`}
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">{alert.student?.name}</h5>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-light text-dark border font-monospace">
                        {alert.student?.rollNo}
                      </span>
                      <span className="small text-muted">{alert.student?.department} &bull; {alert.student?.semester}</span>
                    </div>
                  </div>

                  <div className="d-flex flex-column align-items-end gap-1">
                    <span className={`badge ${alert.status === 'ACTIVE' ? 'bg-danger' : 'bg-success'} text-uppercase`}>
                      {alert.status}
                    </span>
                    <span
                      className={`badge ${alert.alertLevel === 'CRITICAL' ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-warning-subtle text-warning-emphasis'}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {alert.alertLevel} PRIORITY
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="small text-muted">Affected Course:</div>
                  <strong className="text-primary">
                    {alert.course?.courseCode} - {alert.course?.courseName}
                  </strong>
                </div>

                {/* Score Comparison Visual */}
                <div className="p-3 bg-light rounded-3 border mb-3">
                  <div className="row text-center align-items-center">
                    <div className="col-4">
                      <span className="text-muted small d-block">Previous Score</span>
                      <span className="fs-5 fw-bold text-success">{alert.previousScore}%</span>
                    </div>
                    <div className="col-4 border-start border-end">
                      <span className="text-danger fw-bold small d-block">
                        <i className="bi bi-arrow-down-right"></i> Drop
                      </span>
                      <span className="fs-5 fw-bold text-danger">-{alert.percentageDrop}%</span>
                    </div>
                    <div className="col-4">
                      <span className="text-muted small d-block">Current Score</span>
                      <span className="fs-5 fw-bold text-danger">{alert.currentScore}%</span>
                    </div>
                  </div>
                </div>

                <p className="text-dark small mb-3 bg-white p-2 rounded border border-light-subtle">
                  <i className="bi bi-chat-left-quote-fill text-muted me-1"></i>
                  {alert.message}
                </p>

                <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                  <span className="text-muted small">
                    <i className="bi bi-calendar3 me-1"></i> Triggered: {alert.alertDate}
                  </span>

                  <div className="d-flex gap-2">
                    <button
                      className={`btn btn-sm ${alert.status === 'ACTIVE' ? 'btn-success' : 'btn-outline-secondary'}`}
                      onClick={() => handleToggleResolve(alert.id)}
                    >
                      {alert.status === 'ACTIVE' ? (
                        <span><i className="bi bi-check-circle me-1"></i> Mark Resolved</span>
                      ) : (
                        <span><i className="bi bi-arrow-counterclockwise me-1"></i> Reopen</span>
                      )}
                    </button>

                    {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteAlert(alert.id)}
                        title="Delete Alert"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiskAlerts;
