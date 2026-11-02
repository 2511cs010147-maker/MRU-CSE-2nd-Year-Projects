import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Computer Science',
  'Data Science',
  'AI & Machine Learning',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
];

const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

const DESIGNATIONS = [
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Lecturer',
  'Professor & HOD',
];

const Login = ({ initialMode = 'signin' }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestedMode = queryParams.get('mode') === 'signup' ? 'signup' : initialMode;

  const [mode, setMode] = useState(requestedMode); // 'signin' | 'signup'
  const [selectedRole, setSelectedRole] = useState('STUDENT'); // 'STUDENT' | 'TEACHER' | 'ADMIN'
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [signInForm, setSignInForm] = useState({
    username: '',
    password: '',
  });

  // Sign Up Form State
  const [signUpForm, setSignUpForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    rollNo: '',
    department: 'Computer Science',
    semester: 'Semester 1',
    teacherCode: '',
    designation: 'Assistant Professor',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle Sign In Submission
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    if (!signInForm.username.trim() || !signInForm.password.trim()) {
      setError('Please enter both your username and password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await authAPI.login({
        username: signInForm.username.trim(),
        password: signInForm.password,
      });

      const userData = response.data;
      login(userData);

      // Redirect role-wise
      if (userData.role === 'ADMIN') {
        navigate('/admin');
      } else if (userData.role === 'TEACHER') {
        navigate('/teacher');
      } else if (userData.role === 'STUDENT') {
        navigate('/student');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError('Cannot connect to backend server. Please make sure the Spring Boot backend is running on port 8080.');
      } else {
        setError(err.response?.data?.message || 'Invalid credentials. Please verify your username and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up Submission
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!signUpForm.fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!signUpForm.username.trim()) {
      setError('Please choose a username.');
      return;
    }
    if (!signUpForm.password || signUpForm.password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        username: signUpForm.username.trim(),
        password: signUpForm.password,
        role: selectedRole,
        fullName: signUpForm.fullName.trim(),
        email: signUpForm.email.trim() || `${signUpForm.username.trim()}@edulytix.edu`,
        phone: signUpForm.phone.trim(),
        department: signUpForm.department,
        semester: selectedRole === 'STUDENT' ? signUpForm.semester : null,
        rollNo: selectedRole === 'STUDENT' ? signUpForm.rollNo.trim() : null,
        teacherCode: selectedRole === 'TEACHER' ? signUpForm.teacherCode.trim() : null,
        designation: selectedRole === 'TEACHER' ? signUpForm.designation : null,
      };

      const response = await authAPI.register(payload);
      const userData = response.data;
      login(userData);

      setSuccessMsg('Account registered successfully! Redirecting to your dashboard...');

      // Redirect role-wise after short delay for user feedback
      setTimeout(() => {
        if (userData.role === 'ADMIN') {
          navigate('/admin');
        } else if (userData.role === 'TEACHER') {
          navigate('/teacher');
        } else if (userData.role === 'STUDENT') {
          navigate('/student');
        } else {
          navigate('/');
        }
      }, 700);
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError('Cannot connect to backend server. Please make sure the Spring Boot backend is running on port 8080.');
      } else {
        setError(err.response?.data?.message || 'Failed to create account. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className={`col-md-9 ${mode === 'signup' ? 'col-lg-8' : 'col-lg-5'}`}>
          <div className="card card-modern p-4 p-md-5 border-0 shadow-lg">
            {/* Header / Brand */}
            <div className="text-center mb-4">
              <span className="navbar-brand-badge p-3 fs-3 mb-2 d-inline-flex shadow-sm">
                <i className="bi bi-mortarboard-fill"></i>
              </span>
              <h3 className="fw-bold text-dark mt-2">
                {mode === 'signin' ? 'Sign in to Edulytix' : 'Create an Account'}
              </h3>
              <p className="text-muted small">
                {mode === 'signin'
                  ? 'Access your academic portal, quiz records, and learning tools'
                  : 'Enroll as a Student, Faculty Member, or Administrator'}
              </p>

              {/* Mode Toggle Pills (Sign In vs Sign Up) */}
              <div className="d-flex justify-content-center mt-3">
                <div className="btn-group p-1 bg-light rounded-pill border" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm px-4 rounded-pill fw-semibold ${
                      mode === 'signin' ? 'btn-primary-custom text-white shadow-sm' : 'btn-light border-0 text-secondary'
                    }`}
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setSuccessMsg('');
                    }}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm px-4 rounded-pill fw-semibold ${
                      mode === 'signup' ? 'btn-primary-custom text-white shadow-sm' : 'btn-light border-0 text-secondary'
                    }`}
                    onClick={() => {
                      setMode('signup');
                      setError('');
                      setSuccessMsg('');
                    }}
                  >
                    <i className="bi bi-person-plus me-1"></i> Sign Up
                  </button>
                </div>
              </div>
            </div>

            {/* Role Type Selector Tabs */}
            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary d-block text-center mb-2">
                Select Your Role / Login Type
              </label>
              <div className="row g-2">
                <div className="col-4">
                  <button
                    type="button"
                    className={`btn w-100 py-2.5 rounded-3 d-flex flex-column align-items-center justify-content-center border ${
                      selectedRole === 'STUDENT'
                        ? 'border-primary bg-primary-subtle text-primary fw-bold shadow-sm'
                        : 'border-light-subtle bg-light text-secondary'
                    }`}
                    onClick={() => setSelectedRole('STUDENT')}
                  >
                    <i className="bi bi-mortarboard fs-5 mb-1"></i>
                    <span style={{ fontSize: '0.82rem' }}>Student</span>
                  </button>
                </div>

                <div className="col-4">
                  <button
                    type="button"
                    className={`btn w-100 py-2.5 rounded-3 d-flex flex-column align-items-center justify-content-center border ${
                      selectedRole === 'TEACHER'
                        ? 'border-primary bg-primary-subtle text-primary fw-bold shadow-sm'
                        : 'border-light-subtle bg-light text-secondary'
                    }`}
                    onClick={() => setSelectedRole('TEACHER')}
                  >
                    <i className="bi bi-person-video3 fs-5 mb-1"></i>
                    <span style={{ fontSize: '0.82rem' }}>Teacher</span>
                  </button>
                </div>

                <div className="col-4">
                  <button
                    type="button"
                    className={`btn w-100 py-2.5 rounded-3 d-flex flex-column align-items-center justify-content-center border ${
                      selectedRole === 'ADMIN'
                        ? 'border-primary bg-primary-subtle text-primary fw-bold shadow-sm'
                        : 'border-light-subtle bg-light text-secondary'
                    }`}
                    onClick={() => setSelectedRole('ADMIN')}
                  >
                    <i className="bi bi-shield-lock fs-5 mb-1"></i>
                    <span style={{ fontSize: '0.82rem' }}>Admin</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center mb-3">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div>{error}</div>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="alert alert-success py-2 small d-flex align-items-center mb-3">
                <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                <div>{successMsg}</div>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {mode === 'signin' && (
              <form onSubmit={handleSignInSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Username</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Enter your username"
                      value={signInForm.username}
                      onChange={(e) => setSignInForm({ ...signInForm, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control border-start-0 border-end-0"
                      placeholder="Enter your password"
                      value={signInForm.password}
                      onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="input-group-text bg-light border-start-0 text-muted"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-custom w-100 py-2.5 fw-semibold mb-3 shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Authenticating...
                    </span>
                  ) : (
                    <span>
                      <i className="bi bi-box-arrow-in-right me-1"></i> Sign In as {selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}
                    </span>
                  )}
                </button>

                <div className="text-center text-muted small mt-2">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    className="btn btn-link p-0 text-primary fw-semibold small text-decoration-none"
                    onClick={() => {
                      setMode('signup');
                      setError('');
                      setSuccessMsg('');
                    }}
                  >
                    Sign Up here
                  </button>
                </div>
              </form>
            )}

            {/* 2. SIGN UP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUpSubmit}>
                <div className="row g-3">
                  {/* Full Name */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Full Name *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-person-badge"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="e.g. John Doe"
                        value={signUpForm.fullName}
                        onChange={(e) => setSignUpForm({ ...signUpForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Username *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-at"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="e.g. jdoe24"
                        value={signUpForm.username}
                        onChange={(e) => setSignUpForm({ ...signUpForm, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0"
                        placeholder="e.g. jdoe@edulytix.edu"
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Password *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0"
                        placeholder="Minimum 4 characters"
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="input-group-text bg-light border-start-0 text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Role-Specific Fields */}
                  {selectedRole === 'STUDENT' && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Roll Number</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 2024CS105 (or leave blank to auto-generate)"
                          value={signUpForm.rollNo}
                          onChange={(e) => setSignUpForm({ ...signUpForm, rollNo: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Academic Semester</label>
                        <select
                          className="form-select"
                          value={signUpForm.semester}
                          onChange={(e) => setSignUpForm({ ...signUpForm, semester: e.target.value })}
                        >
                          {SEMESTERS.map((sem) => (
                            <option key={sem} value={sem}>{sem}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Department</label>
                        <select
                          className="form-select"
                          value={signUpForm.department}
                          onChange={(e) => setSignUpForm({ ...signUpForm, department: e.target.value })}
                        >
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Phone Contact</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 9876543210"
                          value={signUpForm.phone}
                          onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {selectedRole === 'TEACHER' && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Teacher / Faculty Code</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. TCH105 (or leave blank to auto-generate)"
                          value={signUpForm.teacherCode}
                          onChange={(e) => setSignUpForm({ ...signUpForm, teacherCode: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Designation</label>
                        <select
                          className="form-select"
                          value={signUpForm.designation}
                          onChange={(e) => setSignUpForm({ ...signUpForm, designation: e.target.value })}
                        >
                          {DESIGNATIONS.map((desig) => (
                            <option key={desig} value={desig}>{desig}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Department</label>
                        <select
                          className="form-select"
                          value={signUpForm.department}
                          onChange={(e) => setSignUpForm({ ...signUpForm, department: e.target.value })}
                        >
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Phone Contact</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 9876543210"
                          value={signUpForm.phone}
                          onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {selectedRole === 'ADMIN' && (
                    <>
                      <div className="col-md-12">
                        <div className="p-3 bg-light rounded-3 border small">
                          <i className="bi bi-shield-check text-primary me-2 fs-5"></i>
                          <span>
                            You are registering as an <strong>Administrator</strong>. You will receive system-wide access to manage student registries, faculty directories, risk intervention rules, and digital libraries.
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-custom w-100 py-2.5 fw-semibold mt-4 mb-3 shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating Account &amp; Profile...
                    </span>
                  ) : (
                    <span>
                      <i className="bi bi-person-check-fill me-1"></i> Register as {selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()} &amp; Enter Portal
                    </span>
                  )}
                </button>

                <div className="text-center text-muted small">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="btn btn-link p-0 text-primary fw-semibold small text-decoration-none"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setSuccessMsg('');
                    }}
                  >
                    Sign In instead
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
