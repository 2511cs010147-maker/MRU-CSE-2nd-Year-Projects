import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI, studentAPI, courseAPI, riskAlertAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [quizForm, setQuizForm] = useState({
    studentId: '',
    courseId: '',
    weekNumber: 4,
    score: '',
    totalMarks: 20,
    remarks: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load Initial Data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [coursesRes, studentsRes, quizzesRes, alertsRes] = await Promise.all([
        courseAPI.getAll(),
        studentAPI.getAll(),
        quizAPI.getAll(),
        riskAlertAPI.getAll(),
      ]);

      setCourses(coursesRes.data);
      setStudents(studentsRes.data);
      setQuizzes(quizzesRes.data);
      setAlerts(alertsRes.data);

      if (coursesRes.data.length > 0 && !quizForm.courseId) {
        setQuizForm((prev) => ({ ...prev, courseId: coursesRes.data[0].id }));
      }
      if (studentsRes.data.length > 0 && !quizForm.studentId) {
        setQuizForm((prev) => ({ ...prev, studentId: studentsRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!quizForm.studentId || !quizForm.courseId || quizForm.score === '') {
      setNotification({ type: 'warning', text: 'Please fill in all required quiz mark fields.' });
      return;
    }

    setSubmitting(true);
    setNotification(null);

    try {
      const initialAlertCount = alerts.length;
      const res = await quizAPI.submitQuiz({
        studentId: Number(quizForm.studentId),
        courseId: Number(quizForm.courseId),
        weekNumber: Number(quizForm.weekNumber),
        score: Number(quizForm.score),
        totalMarks: Number(quizForm.totalMarks),
        remarks: quizForm.remarks,
      });

      // Reload data to see if a new Risk Alert was generated
      const [updatedQuizzes, updatedAlerts] = await Promise.all([
        quizAPI.getAll(),
        riskAlertAPI.getAll(),
      ]);

      setQuizzes(updatedQuizzes.data);
      setAlerts(updatedAlerts.data);

      // Check if a new alert was created
      if (updatedAlerts.data.length > initialAlertCount) {
        const latestAlert = updatedAlerts.data[0];
        setNotification({
          type: 'danger',
          isRiskAlert: true,
          text: `⚠️ AUTOMATIC RISK ALERT GENERATED! Score for ${res.data.student?.name} decreased by ${latestAlert.percentageDrop}% (from ${latestAlert.previousScore}% to ${latestAlert.currentScore}%). Academic intervention flagged.`,
        });
      } else {
        setNotification({
          type: 'success',
          text: `Quiz marks recorded successfully for ${res.data.student?.name} (Week ${quizForm.weekNumber}: ${res.data.percentage}%).`,
        });
      }

      // Reset score & remarks
      setQuizForm((prev) => ({
        ...prev,
        score: '',
        remarks: '',
        weekNumber: Number(prev.weekNumber) + 1,
      }));
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to submit quiz marks.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <span className="badge badge-role-teacher text-uppercase px-2 py-1 mb-1">Faculty Portal</span>
          <h2 className="fw-bold text-dark mb-0">Teacher Dashboard</h2>
          <p className="text-muted small mb-0">
            Welcome back, <strong>{user?.fullName || 'Professor'}</strong>. Grade weekly quizzes and monitor student progress.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill">
            <i className="bi bi-bell-fill me-1"></i> Auto Risk Alert Rule Active: &ge; 20% Drop
          </span>
        </div>
      </div>

      {/* Quiz & Question Management Quick Access Banner */}
      <div className="card card-modern p-3 p-md-4 border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #fef3c7 100%)' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="stat-icon bg-warning text-dark shadow-sm" style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}>
              <i className="bi bi-patch-question-fill"></i>
            </div>
            <div>
              <h5 className="fw-bold text-dark mb-1">Quiz &amp; Question Management</h5>
              <p className="text-muted small mb-0">
                Create full course quizzes, construct question banks with multiple choices, and configure answer keys.
              </p>
            </div>
          </div>
          <Link to="/quizzes" className="btn btn-primary-custom px-4 py-2 fw-semibold text-nowrap shadow-sm">
            <i className="bi bi-gear-fill me-1.5"></i> Manage Quizzes &amp; Questions
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`alert ${notification.isRiskAlert ? 'alert-danger alert-glow-danger' : `alert-${notification.type}`} alert-dismissible fade show mb-4`}
          role="alert"
        >
          <div className="d-flex align-items-center">
            <i className={`bi ${notification.isRiskAlert ? 'bi-shield-fill-exclamation fs-4' : 'bi-check-circle-fill fs-5'} me-2`}></i>
            <span className={notification.isRiskAlert ? 'fw-bold' : ''}>{notification.text}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setNotification(null)}></button>
        </div>
      )}

      <div className="row g-4 mb-4">
        {/* Weekly Quiz Entry Form */}
        <div className="col-lg-5">
          <div className="card card-modern p-4 border bg-white h-100 shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-pencil-square text-primary me-2"></i> Enter Weekly Quiz Marks
              </h5>
              <span className="badge bg-light text-secondary border">Week Grading</span>
            </div>

            <form onSubmit={handleQuizSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Select Course *</label>
                <select
                  className="form-select"
                  value={quizForm.courseId}
                  onChange={(e) => setQuizForm({ ...quizForm, courseId: e.target.value })}
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseCode} - {c.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Select Student *</label>
                <select
                  className="form-select"
                  value={quizForm.studentId}
                  onChange={(e) => setQuizForm({ ...quizForm, studentId: e.target.value })}
                  required
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.rollNo} - {s.name} ({s.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Week Number *</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    className="form-control"
                    value={quizForm.weekNumber}
                    onChange={(e) => setQuizForm({ ...quizForm, weekNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Score Obtained *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={quizForm.totalMarks || 100}
                    className="form-control"
                    placeholder="e.g. 15"
                    value={quizForm.score}
                    onChange={(e) => setQuizForm({ ...quizForm, score: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Total Marks *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={quizForm.totalMarks}
                    onChange={(e) => setQuizForm({ ...quizForm, totalMarks: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Teacher Remarks</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="e.g. Good grasp of concepts / Needs help in Trees & DP"
                  value={quizForm.remarks}
                  onChange={(e) => setQuizForm({ ...quizForm, remarks: e.target.value })}
                ></textarea>
              </div>

              <div className="p-3 bg-light rounded-3 border mb-3 small text-muted">
                <i className="bi bi-info-circle text-primary me-1"></i>
                If the score drops by <strong>20% or more</strong> compared to the previous week, the system will instantly generate a <strong>Risk Alert</strong>!
              </div>

              <button
                type="submit"
                className="btn btn-primary-custom w-100 py-2"
                disabled={submitting}
              >
                {submitting ? 'Evaluating & Saving...' : 'Submit Quiz Marks'}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Risk Alerts Card */}
        <div className="col-lg-7">
          <div className="card card-modern p-4 border bg-white h-100 shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold text-dark mb-0">
                  <i className="bi bi-shield-exclamation text-danger me-2"></i> Recent Risk Alerts
                </h5>
                <small className="text-muted">Students flagged with &ge; 20% score drop</small>
              </div>
              <span className="badge bg-danger">{alerts.length} Total Alerts</span>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-check2-circle fs-1 text-success d-block mb-2"></i>
                No students currently in academic risk.
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {alerts.slice(0, 4).map((a) => (
                  <div key={a.id} className="list-group-item px-0 py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <strong className="text-dark">{a.student?.name}</strong>
                        <span className="badge bg-light text-dark border ms-2 font-monospace">
                          {a.student?.rollNo}
                        </span>
                      </div>
                      <span className={`badge ${a.alertLevel === 'CRITICAL' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {a.alertLevel} RISK
                      </span>
                    </div>

                    <div className="small text-muted mb-2">
                      Course: <strong>{a.course?.courseCode} - {a.course?.courseName}</strong>
                    </div>

                    <div className="d-flex align-items-center gap-3 p-2 bg-light rounded-3 small">
                      <div>
                        Prev: <strong>{a.previousScore}%</strong>
                      </div>
                      <div>
                        Current: <strong>{a.currentScore}%</strong>
                      </div>
                      <div className="text-danger fw-bold ms-auto">
                        <i className="bi bi-arrow-down-right"></i> -{a.percentageDrop}% Drop
                      </div>
                      <span className={`badge ${a.status === 'ACTIVE' ? 'bg-danger' : 'bg-success'}`}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quizzes Recorded Table */}
      <div className="card card-modern border p-4 bg-white shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <h5 className="fw-bold text-dark mb-0">
            <i className="bi bi-list-check text-primary me-2"></i> Student Performance Records
          </h5>
          <span className="badge bg-secondary">{quizzes.length} Entries Recorded</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-custom align-middle">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Week</th>
                <th>Marks</th>
                <th>Percentage</th>
                <th>Remarks</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No quiz entries recorded yet.
                  </td>
                </tr>
              ) : (
                quizzes.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <div className="fw-semibold text-dark">{q.student?.name}</div>
                      <small className="text-muted font-monospace">{q.student?.rollNo}</small>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{q.course?.courseCode}</span>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary">Week {q.weekNumber}</span>
                    </td>
                    <td>
                      <strong>{q.score}</strong> / {q.totalMarks}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: '6px', width: '60px' }}>
                          <div
                            className={`progress-bar ${q.percentage >= 75 ? 'bg-success' : q.percentage >= 50 ? 'bg-warning' : 'bg-danger'}`}
                            style={{ width: `${q.percentage}%` }}
                          ></div>
                        </div>
                        <span className="small fw-semibold">{q.percentage}%</span>
                      </div>
                    </td>
                    <td className="small text-muted">{q.remarks || '—'}</td>
                    <td className="small text-muted">{q.quizDate || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
