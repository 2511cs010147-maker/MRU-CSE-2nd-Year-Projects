import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { studentAPI, teacherAPI } from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchDetailedProfile = async () => {
      setLoading(true);
      try {
        if (user.role === 'STUDENT' && user.studentId) {
          const res = await studentAPI.getById(user.studentId);
          setProfileData(res.data);
        } else if (user.role === 'TEACHER' && user.teacherId) {
          const res = await teacherAPI.getById(user.teacherId);
          setProfileData(res.data);
        }
      } catch (err) {
        console.error('Error fetching extra profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div className="card card-modern p-5 bg-white border max-w-md mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-person-x text-muted display-4 mb-3"></i>
          <h4>Not Signed In</h4>
          <p className="text-muted">Please sign in to view your account profile.</p>
          <Link to="/login" className="btn btn-primary-custom mt-2">
            Go to Login / Sign Up
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-role-admin';
      case 'TEACHER': return 'badge-role-teacher';
      case 'STUDENT': return 'badge-role-student';
      default: return 'bg-secondary';
    }
  };

  const department = user.department || profileData?.department || 'Computer Science';
  const semester = user.semester || profileData?.semester || '';
  const designation = user.designation || profileData?.designation || '';
  const rollNo = user.rollNo || profileData?.rollNo || profileData?.rollNumber || '';
  const teacherCode = user.teacherCode || profileData?.teacherCode || '';
  const phone = user.phone || profileData?.phone || '';

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-7">
          <div className="card card-modern border bg-white p-4 p-md-5 shadow-sm">
            <div className="text-center mb-4">
              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-2 mx-auto mb-3 shadow"
                style={{ width: '84px', height: '84px' }}
              >
                {user.fullName ? user.fullName.charAt(0) : user.username.charAt(0).toUpperCase()}
              </div>

              <h4 className="fw-bold text-dark mb-1">{user.fullName || user.username}</h4>
              <p className="text-muted small mb-2">{user.email || 'campus.member@edulytix.edu'}</p>

              <span className={`badge ${getRoleBadge(user.role)} text-uppercase px-3 py-2 rounded-pill`}>
                <i className="bi bi-shield-check me-1"></i> {user.role} ACCOUNT
              </span>
            </div>

            <div className="border-top pt-4 mb-4">
              <h6 className="fw-bold text-secondary text-uppercase small mb-3">
                <i className="bi bi-person-lines-fill me-1.5 text-primary"></i> Academic Profile Details
              </h6>

              <ul className="list-group list-group-flush">
                <li className="list-group-item px-0 py-2.5 d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Username</span>
                  <strong className="text-dark font-monospace">{user.username}</strong>
                </li>

                <li className="list-group-item px-0 py-2.5 d-flex justify-content-between align-items-center">
                  <span className="text-muted small">System Role</span>
                  <span className="fw-semibold text-primary">{user.role}</span>
                </li>

                {rollNo && (
                  <li className="list-group-item px-0 py-2.5 d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Roll Number</span>
                    <strong className="text-dark font-monospace">{rollNo}</strong>
                  </li>
                )}

                {teacherCode && (
                  <li className="list-group-item px-0 py-2.5 d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Faculty Code</span>
                    <strong className="text-dark font-monospace">{teacherCode}</strong>
                  </li>
                )}

                {department && (
                  <li className="list-group-item px-0 py-2.5 d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Academic Department</span>
                    <span className="text-dark fw-medium">{department}</span>
                  </li>
                )}

                {semester && (
                  <li className="list-group-item px-0 py-2.5 d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Current Semester</span>
                    <span className="badge bg-secondary-subtle text-secondary px-2.5 py-1">{semester}</span>
                  </li>
                )}

                {designation && (
                  <li className="list-group-item px-0 py-2.5 d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Faculty Designation</span>
                    <span className="badge bg-info-subtle text-info px-2.5 py-1">{designation}</span>
                  </li>
                )}

                {phone && (
                  <li className="list-group-item px-0 py-2.5 d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Phone Contact</span>
                    <span className="text-dark font-monospace">{phone}</span>
                  </li>
                )}

                <li className="list-group-item px-0 py-2.5 d-flex justify-content-between align-items-center">
                  <span className="text-muted small">System User ID</span>
                  <span className="text-muted font-monospace">#{user.userId}</span>
                </li>
              </ul>
            </div>

            <div className="d-grid gap-2">
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="btn btn-outline-primary">
                  <i className="bi bi-speedometer2 me-1"></i> Open Admin Dashboard
                </Link>
              )}
              {user.role === 'TEACHER' && (
                <Link to="/teacher" className="btn btn-outline-primary">
                  <i className="bi bi-journal-check me-1"></i> Open Teacher Dashboard
                </Link>
              )}
              {user.role === 'STUDENT' && (
                <Link to="/student" className="btn btn-outline-primary">
                  <i className="bi bi-graph-up-arrow me-1"></i> Open Student Dashboard
                </Link>
              )}
              <Link to="/quizzes" className="btn btn-light border text-dark">
                <i className="bi bi-patch-question-fill text-warning me-1.5"></i>
                {user.role === 'STUDENT' ? 'Browse Available Quizzes' : 'Manage Course Quizzes'}
              </Link>

              <button onClick={handleLogout} className="btn btn-outline-danger mt-2">
                <i className="bi bi-box-arrow-right me-1"></i> Sign Out of Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
