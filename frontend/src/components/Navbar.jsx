import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold fs-4 text-primary" to="/">
          <span className="navbar-brand-badge shadow-sm">
            <i className="bi bi-mortarboard-fill"></i>
          </span>
          <span>Edulytix</span>
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-bold' : ''}`} to="/">
                Home
              </NavLink>
            </li>

            {/* Role-based dashboard link */}
            {role === 'ADMIN' && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-bold' : ''}`} to="/admin">
                  <i className="bi bi-speedometer2 me-1"></i> Admin Dashboard
                </NavLink>
              </li>
            )}

            {role === 'TEACHER' && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-bold' : ''}`} to="/teacher">
                  <i className="bi bi-journal-check me-1"></i> Teacher Dashboard
                </NavLink>
              </li>
            )}

            {role === 'STUDENT' && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-bold' : ''}`} to="/student">
                  <i className="bi bi-graph-up-arrow me-1"></i> Student Dashboard
                </NavLink>
              </li>
            )}

            {/* Quiz Management link */}
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-bold' : ''}`} to="/quizzes">
                  <i className="bi bi-patch-question-fill text-warning me-1"></i>
                  {role === 'STUDENT' ? 'Quizzes' : 'Quiz Management'}
                </NavLink>
              </li>
            )}

            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-bold' : ''}`} to="/risk-alerts">
                <i className="bi bi-exclamation-triangle-fill text-danger me-1"></i> Risk Alerts
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-bold' : ''}`} to="/library">
                <i className="bi bi-book-half text-info me-1"></i> Digital Library
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-3">
                <Link to="/profile" className="text-decoration-none d-flex align-items-center gap-2">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '36px', height: '36px' }}>
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="d-none d-sm-block text-start">
                    <div className="fw-semibold text-dark small">{user?.fullName || user?.username}</div>
                    <span className={`badge ${user?.role === 'ADMIN' ? 'badge-role-admin' : user?.role === 'TEACHER' ? 'badge-role-teacher' : 'badge-role-student'} text-uppercase`} style={{ fontSize: '0.65rem' }}>
                      {user?.role}
                    </span>
                  </div>
                </Link>

                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 ms-2">
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-primary btn-sm px-3 py-1.5 fw-semibold">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                </Link>
                <Link to="/register" className="btn btn-primary-custom btn-sm px-3 py-1.5 fw-semibold shadow-sm">
                  <i className="bi bi-person-plus me-1"></i> Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
