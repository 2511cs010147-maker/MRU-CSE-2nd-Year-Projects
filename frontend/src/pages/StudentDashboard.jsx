import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch performance based on logged-in student or default student for demo
  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      setError('');
      try {
        let studentId = user?.studentId;

        // If user is not directly a student or studentId is null, resolve from student list
        if (!studentId) {
          const allRes = await studentAPI.getAll();
          if (allRes.data && allRes.data.length > 0) {
            // Default to Priya Sharma (at-risk student) for demonstration if not logged in as student
            studentId = allRes.data[0].id;
          }
        }

        if (studentId) {
          const res = await studentAPI.getPerformance(studentId);
          setPerformance(res.data);
        } else {
          setError('No student record found.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load student performance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-muted mt-2">Loading student dashboard...</div>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning py-3">{error || 'Student not found.'}</div>
      </div>
    );
  }

  const { student, overallAverage, totalQuizzes, isAtRisk, activeAlertCount, quizResults, riskAlerts } = performance;

  // Chart Data preparation
  const chartLabels = quizResults.map((q) => `W${q.weekNumber} (${q.course?.courseCode || 'Quiz'})`);
  const chartScores = quizResults.map((q) => q.percentage);

  const chartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['No data'],
    datasets: [
      {
        label: 'Quiz Percentage (%)',
        data: chartScores.length > 0 ? chartScores : [0],
        borderColor: isAtRisk ? '#ef4444' : '#4f46e5',
        backgroundColor: isAtRisk ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 70, 229, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: chartScores.map(score => score < 60 ? '#ef4444' : score >= 80 ? '#10b981' : '#f59e0b'),
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
        grid: {
          color: '#f1f5f9',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="container py-4">
      {/* Student Welcome Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <span className="badge badge-role-student text-uppercase px-2 py-1 mb-1">Student Portal</span>
          <h2 className="fw-bold text-dark mb-0">Welcome, {student.name}</h2>
          <p className="text-muted small mb-0">
            Roll No: <strong className="font-monospace">{student.rollNo}</strong> &bull; {student.department} &bull; {student.semester}
          </p>
        </div>

        <div>
          {isAtRisk ? (
            <span className="badge bg-danger px-3 py-2 rounded-pill fs-6 shadow-sm">
              <i className="bi bi-exclamation-triangle-fill me-1"></i> Academic Risk Status: AT RISK
            </span>
          ) : (
            <span className="badge bg-success px-3 py-2 rounded-pill fs-6 shadow-sm">
              <i className="bi bi-check-circle-fill me-1"></i> Academic Standing: GOOD
            </span>
          )}
        </div>
      </div>

      {/* Prominent Risk Warning Banner if At Risk */}
      {isAtRisk && (
        <div className="alert alert-danger alert-glow-danger p-4 mb-4 rounded-3 shadow-sm border-0">
          <div className="d-flex align-items-start gap-3">
            <div className="stat-icon bg-danger text-white flex-shrink-0">
              <i className="bi bi-shield-fill-exclamation fs-3"></i>
            </div>
            <div className="flex-grow-1">
              <h5 className="alert-heading fw-bold mb-1 text-danger">
                Academic Risk Alert Warning!
              </h5>
              <p className="mb-2 text-dark">
                Our automated early warning system detected a significant drop (<strong>&ge; 20%</strong>) in your weekly quiz performance.
              </p>
              {riskAlerts && riskAlerts.filter(a => a.status === 'ACTIVE').map(a => (
                <div key={a.id} className="p-2 bg-white rounded-2 border border-danger-subtle mb-2 small">
                  <strong>{a.course?.courseName} ({a.course?.courseCode}):</strong> {a.message}
                </div>
              ))}
              <div className="mt-2 text-danger-emphasis small fw-medium">
                <i className="bi bi-info-circle me-1"></i> Recommendation: Consult your course instructor or visit the Digital Library for study guides.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card card-modern p-3 border-0 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Average Score</span>
                <h3 className={`fw-bold mb-0 mt-1 ${overallAverage < 60 ? 'text-danger' : 'text-primary'}`}>
                  {overallAverage}%
                </h3>
              </div>
              <div className={`stat-icon ${overallAverage < 60 ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                <i className="bi bi-percent"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card card-modern p-3 border-0 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Quizzes Taken</span>
                <h3 className="fw-bold text-success mb-0 mt-1">{totalQuizzes}</h3>
              </div>
              <div className="stat-icon bg-success-subtle text-success">
                <i className="bi bi-check2-all"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card card-modern p-3 border-0 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Active Alerts</span>
                <h3 className={`fw-bold mb-0 mt-1 ${activeAlertCount > 0 ? 'text-danger' : 'text-secondary'}`}>
                  {activeAlertCount}
                </h3>
              </div>
              <div className={`stat-icon ${activeAlertCount > 0 ? 'bg-danger-subtle text-danger' : 'bg-light text-muted'}`}>
                <i className="bi bi-bell-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card card-modern p-3 border-0 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Academic Status</span>
                <h5 className="fw-bold text-dark mb-0 mt-2">
                  {isAtRisk ? <span className="text-danger">Action Required</span> : <span className="text-success">On Track</span>}
                </h5>
              </div>
              <div className="stat-icon bg-info-subtle text-info">
                <i className="bi bi-award-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart & Details */}
      <div className="row g-4 mb-4">
        {/* Performance Chart */}
        <div className="col-lg-8">
          <div className="card card-modern p-4 border bg-white h-100 shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold text-dark mb-0">
                  <i className="bi bi-graph-up text-primary me-2"></i> Weekly Performance Chart
                </h5>
                <small className="text-muted">Trend of your quiz percentages across weeks</small>
              </div>
              <span className="badge bg-light text-dark border">Timeline</span>
            </div>

            <div style={{ height: '280px', position: 'relative' }}>
              {quizResults.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                  No quiz scores available to display chart.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Student Profile Overview */}
        <div className="col-lg-4">
          <div className="card card-modern p-4 border bg-white h-100 shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-person-badge text-primary me-2"></i> Student Details
              </h5>
            </div>

            <ul className="list-group list-group-flush small">
              <li className="list-group-item px-0 py-2 d-flex justify-content-between">
                <span className="text-muted">Full Name</span>
                <strong className="text-dark">{student.name}</strong>
              </li>
              <li className="list-group-item px-0 py-2 d-flex justify-content-between">
                <span className="text-muted">Roll Number</span>
                <strong className="font-monospace text-primary">{student.rollNo}</strong>
              </li>
              <li className="list-group-item px-0 py-2 d-flex justify-content-between">
                <span className="text-muted">Department</span>
                <span className="text-dark">{student.department || 'N/A'}</span>
              </li>
              <li className="list-group-item px-0 py-2 d-flex justify-content-between">
                <span className="text-muted">Current Semester</span>
                <span className="badge bg-primary-subtle text-primary">{student.semester || 'N/A'}</span>
              </li>
              <li className="list-group-item px-0 py-2 d-flex justify-content-between">
                <span className="text-muted">Email</span>
                <span className="text-dark">{student.email || 'N/A'}</span>
              </li>
              <li className="list-group-item px-0 py-2 d-flex justify-content-between">
                <span className="text-muted">Phone</span>
                <span className="text-dark">{student.phone || 'N/A'}</span>
              </li>
              <li className="list-group-item px-0 py-2 d-flex justify-content-between">
                <span className="text-muted">Enrollment Date</span>
                <span className="text-dark">{student.enrolledDate || 'N/A'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quiz Marks History Table */}
      <div className="card card-modern border p-4 bg-white shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <h5 className="fw-bold text-dark mb-0">
            <i className="bi bi-table text-primary me-2"></i> Weekly Quiz Score Breakdown
          </h5>
          <span className="badge bg-secondary">{quizResults.length} Quizzes Logged</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-custom align-middle">
            <thead>
              <tr>
                <th>Week</th>
                <th>Course</th>
                <th>Score</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Instructor Remarks</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {quizResults.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No quizzes recorded for this student yet.
                  </td>
                </tr>
              ) : (
                quizResults.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <span className="badge bg-primary-subtle text-primary font-monospace">Week {q.weekNumber}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{q.course?.courseName}</div>
                      <small className="text-muted">{q.course?.courseCode}</small>
                    </td>
                    <td>
                      <strong>{q.score}</strong>
                    </td>
                    <td>{q.totalMarks}</td>
                    <td>
                      <span
                        className={`badge ${q.percentage >= 75 ? 'bg-success' : q.percentage >= 60 ? 'bg-warning text-dark' : 'bg-danger'}`}
                      >
                        {q.percentage}%
                      </span>
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

export default StudentDashboard;
