import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalResources: 0,
    totalRiskAlerts: 0,
    activeRiskAlerts: 0,
  });

  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Student Form State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    id: null,
    name: '',
    rollNo: '',
    email: '',
    department: 'Computer Science',
    semester: 'Semester 5',
    phone: '',
    username: '',
    password: '',
  });

  // Teacher Form State
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    id: null,
    name: '',
    teacherCode: '',
    email: '',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    phone: '',
    username: '',
    password: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, studentsRes, teachersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getStudents(),
        adminAPI.getTeachers(),
      ]);
      setStats(statsRes.data);
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Error loading admin data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Student Handlers
  const handleOpenAddStudent = () => {
    setIsEditingStudent(false);
    setStudentForm({
      id: null,
      name: '',
      rollNo: '',
      email: '',
      department: 'Computer Science',
      semester: 'Semester 5',
      phone: '',
      username: '',
      password: '',
    });
    setShowStudentModal(true);
  };

  const handleOpenEditStudent = (student) => {
    setIsEditingStudent(true);
    setStudentForm({
      id: student.id,
      name: student.name,
      rollNo: student.rollNo,
      email: student.email || '',
      department: student.department || '',
      semester: student.semester || '',
      phone: student.phone || '',
      username: student.user?.username || '',
      password: '',
    });
    setShowStudentModal(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (isEditingStudent) {
        await adminAPI.updateStudent(studentForm.id, studentForm);
        setMessage({ type: 'success', text: `Student ${studentForm.name} updated successfully.` });
      } else {
        await adminAPI.createStudent(studentForm);
        setMessage({ type: 'success', text: `Student ${studentForm.name} added successfully.` });
      }
      setShowStudentModal(false);
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to save student.' });
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}"? This removes related quiz results and alerts.`)) return;
    try {
      await adminAPI.deleteStudent(id);
      setMessage({ type: 'success', text: `Student ${name} deleted successfully.` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to delete student.' });
    }
  };

  // Teacher Handlers
  const handleOpenAddTeacher = () => {
    setIsEditingTeacher(false);
    setTeacherForm({
      id: null,
      name: '',
      teacherCode: '',
      email: '',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      phone: '',
      username: '',
      password: '',
    });
    setShowTeacherModal(true);
  };

  const handleOpenEditTeacher = (teacher) => {
    setIsEditingTeacher(true);
    setTeacherForm({
      id: teacher.id,
      name: teacher.name,
      teacherCode: teacher.teacherCode,
      email: teacher.email || '',
      department: teacher.department || '',
      designation: teacher.designation || '',
      phone: teacher.phone || '',
      username: teacher.user?.username || '',
      password: '',
    });
    setShowTeacherModal(true);
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    try {
      if (isEditingTeacher) {
        await adminAPI.updateTeacher(teacherForm.id, teacherForm);
        setMessage({ type: 'success', text: `Teacher ${teacherForm.name} updated successfully.` });
      } else {
        await adminAPI.createTeacher(teacherForm);
        setMessage({ type: 'success', text: `Teacher ${teacherForm.name} added successfully.` });
      }
      setShowTeacherModal(false);
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to save teacher.' });
    }
  };

  const handleDeleteTeacher = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete teacher "${name}"?`)) return;
    try {
      await adminAPI.deleteTeacher(id);
      setMessage({ type: 'success', text: `Teacher ${name} deleted successfully.` });
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to delete teacher.' });
    }
  };

  // Filter lists by search
  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.teacherCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <span className="badge badge-role-admin text-uppercase px-2 py-1 mb-1">Administrative Console</span>
          <h2 className="fw-bold text-dark mb-0">Admin Dashboard</h2>
          <p className="text-muted small mb-0">Manage university students, faculty members, and view overall system metrics.</p>
        </div>

        <div className="d-flex gap-2">
          {activeTab === 'students' ? (
            <button className="btn btn-primary-custom" onClick={handleOpenAddStudent}>
              <i className="bi bi-person-plus-fill me-1"></i> Add Student
            </button>
          ) : (
            <button className="btn btn-primary-custom" onClick={handleOpenAddTeacher}>
              <i className="bi bi-person-plus-fill me-1"></i> Add Teacher
            </button>
          )}
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card card-modern p-3 border-0 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Students</span>
                <h3 className="fw-bold text-primary mb-0 mt-1">{stats.totalStudents}</h3>
              </div>
              <div className="stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-people-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card card-modern p-3 border-0 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Teachers</span>
                <h3 className="fw-bold text-success mb-0 mt-1">{stats.totalTeachers}</h3>
              </div>
              <div className="stat-icon bg-success-subtle text-success">
                <i className="bi bi-person-workspace"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card card-modern p-3 border-0 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Active Courses</span>
                <h3 className="fw-bold text-info mb-0 mt-1">{stats.totalCourses}</h3>
              </div>
              <div className="stat-icon bg-info-subtle text-info">
                <i className="bi bi-journal-code"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card card-modern p-3 border-0 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Active Risk Alerts</span>
                <h3 className="fw-bold text-danger mb-0 mt-1">{stats.activeRiskAlerts}</h3>
              </div>
              <div className="stat-icon bg-danger-subtle text-danger">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="card card-modern border p-4 bg-white mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 pb-3 border-bottom">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => setActiveTab('students')}
              >
                <i className="bi bi-people me-1"></i> Students ({students.length})
              </button>
            </li>
            <li className="nav-item ms-2">
              <button
                className={`nav-link rounded-pill px-4 ${activeTab === 'teachers' ? 'active' : ''}`}
                onClick={() => setActiveTab('teachers')}
              >
                <i className="bi bi-person-badge me-1"></i> Teachers ({teachers.length})
              </button>
            </li>
          </ul>

          <div style={{ maxWidth: '300px', width: '100%' }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Students Table */}
        {activeTab === 'students' && (
          <div className="table-responsive">
            <table className="table table-hover table-custom align-middle">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Contact Info</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No students found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className="badge bg-light text-dark border font-monospace">{s.rollNo}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{s.name}</div>
                        <small className="text-muted">{s.user ? `@${s.user.username}` : ''}</small>
                      </td>
                      <td>{s.department || 'N/A'}</td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary">{s.semester || 'N/A'}</span>
                      </td>
                      <td>
                        <div className="small text-dark">{s.email || 'No email'}</div>
                        <div className="small text-muted">{s.phone || 'No phone'}</div>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleOpenEditStudent(s)}
                          title="Edit Student"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteStudent(s.id, s.name)}
                          title="Delete Student"
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Teachers Table */}
        {activeTab === 'teachers' && (
          <div className="table-responsive">
            <table className="table table-hover table-custom align-middle">
              <thead>
                <tr>
                  <th>Teacher Code</th>
                  <th>Faculty Name</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Contact Info</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No teachers found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <span className="badge bg-light text-dark border font-monospace">{t.teacherCode}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{t.name}</div>
                        <small className="text-muted">{t.user ? `@${t.user.username}` : ''}</small>
                      </td>
                      <td>
                        <span className="badge bg-success-subtle text-success">{t.designation || 'Faculty'}</span>
                      </td>
                      <td>{t.department || 'N/A'}</td>
                      <td>
                        <div className="small text-dark">{t.email || 'No email'}</div>
                        <div className="small text-muted">{t.phone || 'No phone'}</div>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleOpenEditTeacher(t)}
                          title="Edit Teacher"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteTeacher(t.id, t.name)}
                          title="Delete Teacher"
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Modal (Add/Edit) */}
      {showStudentModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-modern border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {isEditingStudent ? 'Edit Student Details' : 'Add New Student'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowStudentModal(false)}></button>
              </div>
              <form onSubmit={handleSaveStudent}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Roll Number *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={studentForm.rollNo}
                        onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                        disabled={isEditingStudent}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Semester</label>
                      <select
                        className="form-select"
                        value={studentForm.semester}
                        onChange={(e) => setStudentForm({ ...studentForm, semester: e.target.value })}
                      >
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                        <option value="Semester 3">Semester 3</option>
                        <option value="Semester 4">Semester 4</option>
                        <option value="Semester 5">Semester 5</option>
                        <option value="Semester 6">Semester 6</option>
                        <option value="Semester 7">Semester 7</option>
                        <option value="Semester 8">Semester 8</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentForm.department}
                      onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {!isEditingStudent && (
                    <div className="row g-2 p-3 bg-light rounded-3 border">
                      <div className="col-12 text-muted small fw-semibold mb-1">Login Credentials (Optional)</div>
                      <div className="col-md-6">
                        <label className="form-label small">Username</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Defaults to rollNo"
                          value={studentForm.username}
                          onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Password</label>
                        <input
                          type="password"
                          className="form-control form-control-sm"
                          placeholder="Defaults to password123"
                          value={studentForm.password}
                          onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowStudentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom">
                    {isEditingStudent ? 'Save Changes' : 'Create Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Modal (Add/Edit) */}
      {showTeacherModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-modern border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {isEditingTeacher ? 'Edit Teacher Details' : 'Add New Teacher'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowTeacherModal(false)}></button>
              </div>
              <form onSubmit={handleSaveTeacher}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Faculty Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={teacherForm.name}
                      onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Teacher Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={teacherForm.teacherCode}
                        onChange={(e) => setTeacherForm({ ...teacherForm, teacherCode: e.target.value })}
                        disabled={isEditingTeacher}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        value={teacherForm.designation}
                        onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      value={teacherForm.department}
                      onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={teacherForm.email}
                        onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={teacherForm.phone}
                        onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {!isEditingTeacher && (
                    <div className="row g-2 p-3 bg-light rounded-3 border">
                      <div className="col-12 text-muted small fw-semibold mb-1">Login Credentials (Optional)</div>
                      <div className="col-md-6">
                        <label className="form-label small">Username</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Defaults to code"
                          value={teacherForm.username}
                          onChange={(e) => setTeacherForm({ ...teacherForm, username: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Password</label>
                        <input
                          type="password"
                          className="form-control form-control-sm"
                          placeholder="Defaults to teacher123"
                          value={teacherForm.password}
                          onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowTeacherModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom">
                    {isEditingTeacher ? 'Save Changes' : 'Create Teacher'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
