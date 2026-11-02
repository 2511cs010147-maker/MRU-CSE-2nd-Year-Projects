import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 4,
    totalTeachers: 2,
    totalCourses: 3,
    totalResources: 6,
    activeRiskAlerts: 2,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(res => {
        setStats(res.data);
      })
      .catch(err => {
        console.error("Could not fetch stats:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getDashboardPath = () => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'TEACHER') return '/teacher';
    if (role === 'STUDENT') return '/student';
    return '/login';
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient py-5">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-7 text-center text-lg-start mb-4 mb-lg-0">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold mb-3">
                <i className="bi bi-stars me-1"></i> Smart Education System &amp; Academic Intelligence
              </span>
              <h1 className="display-4 fw-extrabold text-dark tracking-tight mb-3">
                Empowering Campus Learning with <span className="text-primary">Edulytix</span>
              </h1>
              <p className="lead text-secondary mb-4 pe-lg-4">
                An integrated full-stack academic platform featuring automated student <strong>Risk Alerts</strong> for early academic intervention and a centralized <strong>Digital Library</strong> for seamless learning.
              </p>

              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                {isAuthenticated ? (
                  <Link to={getDashboardPath()} className="btn btn-primary-custom btn-lg shadow-sm">
                    <i className="bi bi-speedometer2 me-2"></i> Open {role} Dashboard
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-primary-custom btn-lg shadow-sm">
                    <i className="bi bi-box-arrow-in-right me-2"></i> Enter Portal
                  </Link>
                )}
                <Link to="/library" className="btn btn-outline-secondary btn-lg rounded-3">
                  <i className="bi bi-book-half me-2"></i> Browse Library
                </Link>
                <Link to="/risk-alerts" className="btn btn-outline-danger btn-lg rounded-3">
                  <i className="bi bi-shield-exclamation me-2"></i> View Risk Alerts
                </Link>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card card-modern p-4 border-0 shadow-lg bg-white">
                <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-danger rounded-circle p-2 d-inline-block"></span>
                    <span className="fw-bold text-dark">Live Risk Alert Demo</span>
                  </div>
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">20%+ Drop Trigger</span>
                </div>

                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="text-dark small">Priya Sharma (2024CS101)</strong>
                    <span className="badge bg-danger">Critical Alert</span>
                  </div>
                  <div className="text-muted small mb-2">CS301 - Data Structures &amp; Algorithms</div>
                  <div className="progress mb-2" style={{ height: '8px' }}>
                    <div className="progress-bar bg-success" style={{ width: '90%' }} title="Week 2: 90%"></div>
                  </div>
                  <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                    <span>Week 2: <strong>90%</strong></span>
                    <span className="text-danger fw-bold"><i className="bi bi-arrow-down-right"></i> -35.0% Drop</span>
                    <span className="text-danger">Week 3: <strong>55%</strong></span>
                  </div>
                </div>

                <div className="small text-muted mb-3">
                  <i className="bi bi-info-circle-fill text-primary me-1"></i> Teachers grade weekly quizzes; drops of &ge;20% immediately flag students for proactive mentoring.
                </div>

                <div className="row g-2 text-center">
                  <div className="col-6">
                    <div className="p-2 border rounded-3 bg-white">
                      <div className="fw-bold text-primary fs-5">{stats.totalStudents}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Enrolled Students</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 border rounded-3 bg-white">
                      <div className="fw-bold text-danger fs-5">{stats.activeRiskAlerts}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Active Risk Alerts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary text-uppercase fw-bold small tracking-wide">Core Architecture</span>
            <h2 className="fw-bold text-dark mt-1">Full-Stack Educational Capabilities</h2>
            <p className="text-muted">Designed for academic administrators, faculty, and engineering students.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card card-modern h-100 p-4 border">
                <div className="stat-icon bg-primary-subtle text-primary mb-3">
                  <i className="bi bi-person-gear"></i>
                </div>
                <h5 className="fw-bold text-dark">Admin Governance</h5>
                <p className="text-muted small">
                  Complete CRUD management for student and faculty directories, courses, and department-wide metrics overview.
                </p>
                <Link to="/admin" className="text-primary text-decoration-none fw-semibold small mt-auto">
                  Explore Admin Dashboard <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card card-modern h-100 p-4 border alert-glow-danger">
                <div className="stat-icon bg-danger-subtle text-danger mb-3">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <h5 className="fw-bold text-danger">Risk Alert Engine</h5>
                <p className="text-muted small">
                  Intelligent threshold evaluation compares current weekly quiz marks against prior weeks to pinpoint sudden performance dips (&ge;20%).
                </p>
                <Link to="/risk-alerts" className="text-danger text-decoration-none fw-semibold small mt-auto">
                  View Flagged Students <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card card-modern h-100 p-4 border">
                <div className="stat-icon bg-info-subtle text-info mb-3">
                  <i className="bi bi-journal-bookmark-fill"></i>
                </div>
                <h5 className="fw-bold text-dark">Digital Library</h5>
                <p className="text-muted small">
                  Curated academic repository supporting textbooks, lecture notes, lab manuals, and PDFs with real-time category filtering.
                </p>
                <Link to="/library" className="text-info text-decoration-none fw-semibold small mt-auto">
                  Browse Resources <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-5 bg-light border-top">
        <div className="container">
          <div className="card card-modern p-5 border bg-white shadow-sm text-center">
            <div className="max-w-700 mx-auto">
              <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold mb-3">
                <i className="bi bi-shield-check me-1"></i> Secure Academic Platform
              </span>
              <h3 className="fw-bold text-dark mb-2">Ready to Enhance Student Academic Success?</h3>
              <p className="text-muted mb-4">
                Monitor student score trends, design interactive quizzes, automatically catch academic risk alerts, and access our curated digital academic library.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/login" className="btn btn-primary-custom px-4 py-2 fw-semibold shadow-sm">
                  Sign In to Portal <i className="bi bi-arrow-right ms-1"></i>
                </Link>
                <Link to="/library" className="btn btn-outline-secondary px-4 py-2 fw-semibold">
                  Browse Digital Library
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
