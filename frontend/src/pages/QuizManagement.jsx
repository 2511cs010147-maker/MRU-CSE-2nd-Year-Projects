import React, { useState, useEffect } from 'react';
import { quizManagementAPI, courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const QuizManagement = () => {
  const { user, role } = useAuth();
  const isTeacherOrAdmin = role === 'TEACHER' || role === 'ADMIN';

  // State
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [notification, setNotification] = useState(null);

  // Quiz Modal (Create / Edit)
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    courseId: '',
    weekNumber: 1,
    durationMinutes: 20,
    totalMarks: 10,
    status: 'PUBLISHED',
  });
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  // Question Management View / Modal
  const [activeQuizForQuestions, setActiveQuizForQuestions] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    questionType: 'MCQ',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    marks: 2,
    explanation: '',
  });
  const [questionSubmitting, setQuestionSubmitting] = useState(false);

  // Interactive Quiz Attempt / Preview Modal
  const [attemptQuiz, setAttemptQuiz] = useState(null);
  const [attemptQuestions, setAttemptQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [quizzesRes, coursesRes] = await Promise.all([
        quizManagementAPI.getAll(),
        courseAPI.getAll(),
      ]);
      setQuizzes(quizzesRes.data || []);
      setCourses(coursesRes.data || []);

      if (coursesRes.data && coursesRes.data.length > 0 && !quizForm.courseId) {
        setQuizForm((prev) => ({ ...prev, courseId: coursesRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      showNotification('danger', 'Failed to load quizzes from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Filtered Quizzes
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.course?.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.course?.courseCode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse =
      selectedCourseFilter === 'ALL' ||
      String(quiz.course?.id) === String(selectedCourseFilter);

    const matchesStatus =
      selectedStatusFilter === 'ALL' || quiz.status === selectedStatusFilter;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Quiz Form Handlers
  const handleOpenCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({
      title: '',
      description: '',
      courseId: courses[0]?.id || '',
      weekNumber: 1,
      durationMinutes: 20,
      totalMarks: 10,
      status: 'PUBLISHED',
    });
    setShowQuizModal(true);
  };

  const handleOpenEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title || '',
      description: quiz.description || '',
      courseId: quiz.course?.id || '',
      weekNumber: quiz.weekNumber || 1,
      durationMinutes: quiz.durationMinutes || 20,
      totalMarks: quiz.totalMarks || 10,
      status: quiz.status || 'PUBLISHED',
    });
    setShowQuizModal(true);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.title.trim() || !quizForm.courseId) {
      showNotification('warning', 'Please provide a quiz title and select a course.');
      return;
    }

    setQuizSubmitting(true);
    try {
      const payload = {
        title: quizForm.title,
        description: quizForm.description,
        courseId: Number(quizForm.courseId),
        weekNumber: Number(quizForm.weekNumber),
        durationMinutes: Number(quizForm.durationMinutes),
        totalMarks: Number(quizForm.totalMarks),
        status: quizForm.status,
        teacherId: user?.teacherId || null,
      };

      if (editingQuiz) {
        await quizManagementAPI.update(editingQuiz.id, payload);
        showNotification('success', 'Quiz updated successfully!');
      } else {
        await quizManagementAPI.create(payload);
        showNotification('success', 'New quiz created successfully!');
      }

      setShowQuizModal(false);
      await loadData();
    } catch (err) {
      console.error(err);
      showNotification('danger', err.response?.data?.message || 'Error saving quiz.');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quizId, title) => {
    if (!window.confirm(`Are you sure you want to delete the quiz "${title}" and all its questions?`)) {
      return;
    }
    try {
      await quizManagementAPI.delete(quizId);
      showNotification('success', 'Quiz deleted successfully.');
      if (activeQuizForQuestions?.id === quizId) {
        setActiveQuizForQuestions(null);
      }
      await loadData();
    } catch (err) {
      console.error(err);
      showNotification('danger', err.response?.data?.message || 'Failed to delete quiz.');
    }
  };

  // Question Management Handlers
  const handleOpenManageQuestions = async (quiz) => {
    setActiveQuizForQuestions(quiz);
    setLoadingQuestions(true);
    try {
      const res = await quizManagementAPI.getQuestions(quiz.id);
      setQuestions(res.data || []);
    } catch (err) {
      console.error(err);
      showNotification('danger', 'Failed to load questions.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      questionText: '',
      questionType: 'MCQ',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      marks: 2,
      explanation: '',
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      questionText: q.questionText || '',
      questionType: q.questionType || 'MCQ',
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctAnswer: q.correctAnswer || 'A',
      marks: q.marks || 2,
      explanation: q.explanation || '',
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.questionText.trim()) {
      showNotification('warning', 'Please enter question text.');
      return;
    }
    if (questionForm.questionType === 'MCQ' && (!questionForm.optionA || !questionForm.optionB)) {
      showNotification('warning', 'Please provide at least Option A and Option B.');
      return;
    }

    setQuestionSubmitting(true);
    try {
      const payload = {
        questionText: questionForm.questionText,
        questionType: questionForm.questionType,
        optionA: questionForm.questionType === 'TRUE_FALSE' ? 'True' : questionForm.optionA,
        optionB: questionForm.questionType === 'TRUE_FALSE' ? 'False' : questionForm.optionB,
        optionC: questionForm.questionType === 'TRUE_FALSE' ? null : questionForm.optionC,
        optionD: questionForm.questionType === 'TRUE_FALSE' ? null : questionForm.optionD,
        correctAnswer: questionForm.correctAnswer,
        marks: Number(questionForm.marks),
        explanation: questionForm.explanation,
      };

      if (editingQuestion) {
        await quizManagementAPI.updateQuestion(editingQuestion.id, payload);
        showNotification('success', 'Question updated successfully.');
      } else {
        await quizManagementAPI.addQuestion(activeQuizForQuestions.id, payload);
        showNotification('success', 'New question added to quiz!');
      }

      setShowQuestionModal(false);
      // Reload questions & quiz list to reflect updated marks and count
      const updatedQRes = await quizManagementAPI.getQuestions(activeQuizForQuestions.id);
      setQuestions(updatedQRes.data || []);
      await loadData();
    } catch (err) {
      console.error(err);
      showNotification('danger', err.response?.data?.message || 'Error saving question.');
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }
    try {
      await quizManagementAPI.deleteQuestion(questionId);
      showNotification('success', 'Question removed.');
      const updatedQRes = await quizManagementAPI.getQuestions(activeQuizForQuestions.id);
      setQuestions(updatedQRes.data || []);
      await loadData();
    } catch (err) {
      console.error(err);
      showNotification('danger', err.response?.data?.message || 'Failed to delete question.');
    }
  };

  // Interactive Quiz Attempt Handlers
  const handleStartAttempt = async (quiz) => {
    setAttemptQuiz(quiz);
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setSubmittingAttempt(false);

    try {
      const res = await quizManagementAPI.getQuestions(quiz.id);
      setAttemptQuestions(res.data || []);
    } catch (err) {
      console.error(err);
      showNotification('danger', 'Failed to load quiz questions.');
    }
  };

  const handleSelectAnswer = (questionId, answer) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitAttempt = async () => {
    if (Object.keys(userAnswers).length === 0 && attemptQuestions.length > 0) {
      if (!window.confirm('You have not selected answers for any question. Submit anyway?')) {
        return;
      }
    }

    setSubmittingAttempt(true);
    try {
      const res = await quizManagementAPI.submitAttempt(attemptQuiz.id, {
        answers: userAnswers,
        studentId: user?.studentId || null,
      });
      setQuizResult(res.data);
      setQuizSubmitted(true);
      showNotification('success', `Quiz evaluated! Score: ${res.data.obtainedMarks} / ${res.data.totalMarks} (${res.data.percentage}%)`);
    } catch (err) {
      console.error(err);
      showNotification('danger', 'Failed to submit quiz attempt.');
    } finally {
      setSubmittingAttempt(false);
    }
  };

  // Metric Calculations
  const totalQuizzesCount = quizzes.length;
  const publishedQuizzesCount = quizzes.filter((q) => q.status === 'PUBLISHED').length;
  const totalQuestionsCount = quizzes.reduce((sum, q) => sum + (q.questions ? q.questions.length : 0), 0);
  const coursesCovered = new Set(quizzes.map((q) => q.course?.id)).size;

  return (
    <div className="container py-4">
      {/* Top Banner / Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-warning-subtle text-dark border border-warning px-2.5 py-1 rounded-pill fw-semibold">
              <i className="bi bi-patch-question-fill text-warning me-1"></i> Academic Assessments
            </span>
          </div>
          <h2 className="fw-bold text-dark mb-1">Quiz &amp; Question Management</h2>
          <p className="text-muted small mb-0">
            Create structured course quizzes, maintain question banks with rich MCQs, and evaluate student responses.
          </p>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={handleOpenCreateQuiz}
            className="btn btn-primary-custom px-4 py-2 fw-semibold d-inline-flex align-items-center shadow-sm"
          >
            <i className="bi bi-plus-circle me-2"></i> Create New Quiz
          </button>
        )}
      </div>

      {/* Notification Alert */}
      {notification && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show d-flex align-items-center mb-4 shadow-sm`} role="alert">
          <i className={`bi bi-${notification.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2 fs-5`}></i>
          <div>{notification.message}</div>
          <button type="button" className="btn-close" onClick={() => setNotification(null)}></button>
        </div>
      )}

      {/* Stats Counter Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card card-modern p-3 border-0 shadow-sm h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-folder-check"></i>
              </div>
              <div>
                <div className="fs-4 fw-bold text-dark">{totalQuizzesCount}</div>
                <div className="text-muted small fw-medium">Total Quizzes</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card card-modern p-3 border-0 shadow-sm h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon bg-success-subtle text-success">
                <i className="bi bi-check2-circle"></i>
              </div>
              <div>
                <div className="fs-4 fw-bold text-dark">{publishedQuizzesCount}</div>
                <div className="text-muted small fw-medium">Published</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card card-modern p-3 border-0 shadow-sm h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon bg-info-subtle text-info">
                <i className="bi bi-question-diamond-fill"></i>
              </div>
              <div>
                <div className="fs-4 fw-bold text-dark">{totalQuestionsCount > 0 ? totalQuestionsCount : '10+'}</div>
                <div className="text-muted small fw-medium">Questions Bank</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card card-modern p-3 border-0 shadow-sm h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon bg-warning-subtle text-dark">
                <i className="bi bi-book-half text-warning"></i>
              </div>
              <div>
                <div className="fs-4 fw-bold text-dark">{coursesCovered}</div>
                <div className="text-muted small fw-medium">Courses Covered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card card-modern p-3 border-0 shadow-sm mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by title, topic, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="btn btn-outline-secondary" onClick={() => setSearchQuery('')}>
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          <div className="col-sm-6 col-md-4">
            <select
              className="form-select"
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
            >
              <option value="ALL">All Academic Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseCode} - {course.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-sm-6 col-md-3">
            <select
              className="form-select"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Draft Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2 small">Loading quizzes &amp; question banks...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="card card-modern p-5 border-0 shadow-sm text-center">
          <div className="stat-icon bg-light text-muted mx-auto mb-3" style={{ width: '64px', height: '64px' }}>
            <i className="bi bi-journal-x fs-2"></i>
          </div>
          <h5 className="fw-bold text-dark">No Quizzes Found</h5>
          <p className="text-muted small max-w-500 mx-auto">
            {searchQuery || selectedCourseFilter !== 'ALL' || selectedStatusFilter !== 'ALL'
              ? 'Try adjusting your filters or search keywords.'
              : 'No quizzes have been created yet. Click "Create New Quiz" to get started!'}
          </p>
          {isTeacherOrAdmin && (
            <div>
              <button onClick={handleOpenCreateQuiz} className="btn btn-primary-custom px-4 py-2 mt-2">
                <i className="bi bi-plus-circle me-1"></i> Create First Quiz
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="row g-3">
          {filteredQuizzes.map((quiz) => {
            const questionCount = quiz.questions?.length || 0;
            return (
              <div key={quiz.id} className="col-lg-6">
                <div className="card card-modern border-0 shadow-sm h-100 p-4 d-flex flex-column justify-content-between">
                  <div>
                    {/* Header tags */}
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div className="d-flex flex-wrap gap-1 align-items-center">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold">
                          {quiz.course?.courseCode || 'COURSE'}
                        </span>
                        <span className="badge bg-secondary-subtle text-secondary">
                          Week {quiz.weekNumber}
                        </span>
                        <span
                          className={`badge ${
                            quiz.status === 'PUBLISHED'
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : 'bg-warning-subtle text-dark border border-warning-subtle'
                          }`}
                        >
                          {quiz.status}
                        </span>
                      </div>

                      {isTeacherOrAdmin && (
                        <div className="dropdown">
                          <button
                            className="btn btn-light btn-sm rounded-circle p-1 text-muted"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <i className="bi bi-three-dots-vertical"></i>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                            <li>
                              <button
                                className="dropdown-item small d-flex align-items-center"
                                onClick={() => handleOpenEditQuiz(quiz)}
                              >
                                <i className="bi bi-pencil me-2 text-primary"></i> Edit Details
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item small d-flex align-items-center text-danger"
                                onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                              >
                                <i className="bi bi-trash me-2"></i> Delete Quiz
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <h5 className="fw-bold text-dark mb-1">{quiz.title}</h5>
                    <div className="text-secondary small fw-medium mb-2">
                      {quiz.course?.courseName}
                    </div>

                    <p className="text-muted small mb-3 text-truncate-2">
                      {quiz.description || 'Comprehensive weekly assessment evaluating concept retention and problem solving.'}
                    </p>

                    {/* Metadata Badges */}
                    <div className="d-flex flex-wrap gap-3 py-2 px-3 bg-light rounded-3 mb-3 small text-muted">
                      <div>
                        <i className="bi bi-clock me-1 text-primary"></i>
                        <span>{quiz.durationMinutes || 20} mins</span>
                      </div>
                      <div>
                        <i className="bi bi-award me-1 text-warning"></i>
                        <span>{quiz.totalMarks || 10} Total Marks</span>
                      </div>
                      <div>
                        <i className="bi bi-card-checklist me-1 text-info"></i>
                        <span>{questionCount} Questions</span>
                      </div>
                      {quiz.teacher && (
                        <div className="ms-auto text-truncate" style={{ maxWidth: '140px' }}>
                          <i className="bi bi-person-badge me-1"></i>
                          <span>{quiz.teacher.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex flex-wrap gap-2 pt-2 border-top">
                    {isTeacherOrAdmin && (
                      <button
                        onClick={() => handleOpenManageQuestions(quiz)}
                        className="btn btn-outline-primary btn-sm px-3 fw-semibold d-inline-flex align-items-center"
                      >
                        <i className="bi bi-list-check me-1.5"></i> Manage Questions ({questionCount})
                      </button>
                    )}

                    <button
                      onClick={() => handleStartAttempt(quiz)}
                      className={`btn btn-sm px-3 fw-semibold d-inline-flex align-items-center ${
                        isTeacherOrAdmin ? 'btn-light border' : 'btn-primary-custom'
                      }`}
                    >
                      <i className="bi bi-play-circle-fill me-1.5 text-success"></i>
                      {isTeacherOrAdmin ? 'Preview Quiz' : 'Take Quiz'}
                    </button>

                    {isTeacherOrAdmin && (
                      <button
                        onClick={() => handleOpenEditQuiz(quiz)}
                        className="btn btn-light btn-sm border text-secondary ms-auto"
                        title="Edit Quiz"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Create / Edit Quiz */}
      {showQuizModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="bi bi-journal-plus me-2 text-primary"></i>
                  {editingQuiz ? 'Edit Quiz Details' : 'Create New Assessment Quiz'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowQuizModal(false)}></button>
              </div>

              <form onSubmit={handleSaveQuiz}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Quiz Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Week 3: Trees, Binary Search & Traversals"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Academic Course *</label>
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

                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-secondary">Week #</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="form-control"
                        value={quizForm.weekNumber}
                        onChange={(e) => setQuizForm({ ...quizForm, weekNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-secondary">Duration (Mins)</label>
                      <input
                        type="number"
                        min="5"
                        max="180"
                        className="form-control"
                        value={quizForm.durationMinutes}
                        onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-secondary">Total Marks</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="form-control"
                        value={quizForm.totalMarks}
                        onChange={(e) => setQuizForm({ ...quizForm, totalMarks: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Status</label>
                    <select
                      className="form-select"
                      value={quizForm.status}
                      onChange={(e) => setQuizForm({ ...quizForm, status: e.target.value })}
                    >
                      <option value="PUBLISHED">PUBLISHED (Students can view &amp; attempt)</option>
                      <option value="DRAFT">DRAFT (Hidden from students)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Quiz Description &amp; Instructions</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Outline topics covered, grading rules, or instructions for students..."
                      value={quizForm.description}
                      onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-light border px-3" onClick={() => setShowQuizModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom px-4 fw-semibold" disabled={quizSubmitting}>
                    {quizSubmitting ? 'Saving...' : editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Question Management Panel */}
      {activeQuizForQuestions && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom bg-light">
                <div>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle me-2">
                    {activeQuizForQuestions.course?.courseCode}
                  </span>
                  <span className="badge bg-secondary-subtle text-secondary me-2">
                    Week {activeQuizForQuestions.weekNumber}
                  </span>
                  <h5 className="modal-title fw-bold text-dark mt-1">
                    Questions for: {activeQuizForQuestions.title}
                  </h5>
                  <div className="text-muted small">
                    Total Questions: {questions.length} | Total Marks: {activeQuizForQuestions.totalMarks}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    onClick={handleOpenAddQuestion}
                    className="btn btn-primary-custom btn-sm px-3 fw-semibold d-flex align-items-center shadow-sm"
                  >
                    <i className="bi bi-plus-circle me-1.5"></i> Add Question
                  </button>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setActiveQuizForQuestions(null)}
                  ></button>
                </div>
              </div>

              <div className="modal-body p-4">
                {loadingQuestions ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted small mt-2">Loading questions...</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="stat-icon bg-light text-muted mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                      <i className="bi bi-question-circle fs-3"></i>
                    </div>
                    <h6 className="fw-bold text-dark">No questions added yet</h6>
                    <p className="text-muted small max-w-400 mx-auto mb-3">
                      Start building this quiz by adding multiple-choice or true/false questions for your students.
                    </p>
                    <button onClick={handleOpenAddQuestion} className="btn btn-primary-custom btn-sm px-3">
                      <i className="bi bi-plus-lg me-1"></i> Add First Question
                    </button>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="card p-3 border rounded-3 bg-white shadow-sm">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-dark text-white fw-bold">Q{idx + 1}</span>
                            <span className="badge bg-info-subtle text-info border border-info-subtle">
                              {q.questionType}
                            </span>
                            <span className="badge bg-warning-subtle text-dark border border-warning-subtle">
                              {q.marks || 2} Points
                            </span>
                          </div>

                          <div className="d-flex gap-1">
                            <button
                              onClick={() => handleOpenEditQuestion(q)}
                              className="btn btn-light btn-sm border text-primary"
                              title="Edit Question"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="btn btn-light btn-sm border text-danger"
                              title="Delete Question"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>

                        <div className="fw-semibold text-dark fs-6 mb-3">{q.questionText}</div>

                        {/* Options Grid */}
                        <div className="row g-2 mb-2">
                          {q.optionA && (
                            <div className="col-md-6">
                              <div
                                className={`p-2.5 rounded-3 border small d-flex align-items-center justify-content-between ${
                                  q.correctAnswer === 'A' || q.correctAnswer === 'True'
                                    ? 'bg-success-subtle border-success text-success fw-bold'
                                    : 'bg-light text-dark'
                                }`}
                              >
                                <span><strong>A)</strong> {q.optionA}</span>
                                {(q.correctAnswer === 'A' || q.correctAnswer === 'True') && (
                                  <span className="badge bg-success text-white">
                                    <i className="bi bi-check-lg me-1"></i> Correct Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {q.optionB && (
                            <div className="col-md-6">
                              <div
                                className={`p-2.5 rounded-3 border small d-flex align-items-center justify-content-between ${
                                  q.correctAnswer === 'B' || q.correctAnswer === 'False'
                                    ? 'bg-success-subtle border-success text-success fw-bold'
                                    : 'bg-light text-dark'
                                }`}
                              >
                                <span><strong>B)</strong> {q.optionB}</span>
                                {(q.correctAnswer === 'B' || q.correctAnswer === 'False') && (
                                  <span className="badge bg-success text-white">
                                    <i className="bi bi-check-lg me-1"></i> Correct Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {q.optionC && (
                            <div className="col-md-6">
                              <div
                                className={`p-2.5 rounded-3 border small d-flex align-items-center justify-content-between ${
                                  q.correctAnswer === 'C'
                                    ? 'bg-success-subtle border-success text-success fw-bold'
                                    : 'bg-light text-dark'
                                }`}
                              >
                                <span><strong>C)</strong> {q.optionC}</span>
                                {q.correctAnswer === 'C' && (
                                  <span className="badge bg-success text-white">
                                    <i className="bi bi-check-lg me-1"></i> Correct Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {q.optionD && (
                            <div className="col-md-6">
                              <div
                                className={`p-2.5 rounded-3 border small d-flex align-items-center justify-content-between ${
                                  q.correctAnswer === 'D'
                                    ? 'bg-success-subtle border-success text-success fw-bold'
                                    : 'bg-light text-dark'
                                }`}
                              >
                                <span><strong>D)</strong> {q.optionD}</span>
                                {q.correctAnswer === 'D' && (
                                  <span className="badge bg-success text-white">
                                    <i className="bi bi-check-lg me-1"></i> Correct Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {q.explanation && (
                          <div className="mt-2 p-2 bg-light border rounded-2 small text-muted">
                            <strong className="text-secondary">Explanation: </strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer border-top bg-light">
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  onClick={() => setActiveQuizForQuestions(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add / Edit Question */}
      {showQuestionModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="bi bi-patch-plus me-2 text-primary"></i>
                  {editingQuestion ? 'Edit Question' : 'Add Question to Quiz'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowQuestionModal(false)}></button>
              </div>

              <form onSubmit={handleSaveQuestion}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Question Text *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Type the question prompt here..."
                      value={questionForm.questionText}
                      onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">Question Type</label>
                      <select
                        className="form-select"
                        value={questionForm.questionType}
                        onChange={(e) => {
                          const type = e.target.value;
                          setQuestionForm({
                            ...questionForm,
                            questionType: type,
                            correctAnswer: type === 'TRUE_FALSE' ? 'A' : 'A',
                          });
                        }}
                      >
                        <option value="MCQ">Multiple Choice (A, B, C, D)</option>
                        <option value="TRUE_FALSE">True / False</option>
                      </select>
                    </div>

                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">Marks / Points</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="form-control"
                        value={questionForm.marks}
                        onChange={(e) => setQuestionForm({ ...questionForm, marks: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Options */}
                  {questionForm.questionType === 'MCQ' ? (
                    <div className="row g-2 mb-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Option A *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light fw-bold">A</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Option text..."
                            value={questionForm.optionA}
                            onChange={(e) => setQuestionForm({ ...questionForm, optionA: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Option B *</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light fw-bold">B</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Option text..."
                            value={questionForm.optionB}
                            onChange={(e) => setQuestionForm({ ...questionForm, optionB: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Option C</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light fw-bold">C</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Option text..."
                            value={questionForm.optionC}
                            onChange={(e) => setQuestionForm({ ...questionForm, optionC: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Option D</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light fw-bold">D</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Option text..."
                            value={questionForm.optionD}
                            onChange={(e) => setQuestionForm({ ...questionForm, optionD: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-light rounded-3 mb-3 border small">
                      <i className="bi bi-info-circle me-1 text-primary"></i>
                      Options are automatically set to <strong>A: True</strong> and <strong>B: False</strong>.
                    </div>
                  )}

                  {/* Correct Answer Selection */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Correct Answer *</label>
                    <div className="d-flex gap-3">
                      {questionForm.questionType === 'MCQ' ? (
                        ['A', 'B', 'C', 'D'].map((opt) => (
                          <div key={opt} className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="correctAnswer"
                              id={`opt_${opt}`}
                              value={opt}
                              checked={questionForm.correctAnswer === opt}
                              onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                            />
                            <label className="form-check-label fw-bold" htmlFor={`opt_${opt}`}>
                              Option {opt}
                            </label>
                          </div>
                        ))
                      ) : (
                        ['A', 'B'].map((opt) => (
                          <div key={opt} className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="correctAnswer"
                              id={`tf_${opt}`}
                              value={opt}
                              checked={questionForm.correctAnswer === opt}
                              onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                            />
                            <label className="form-check-label fw-bold" htmlFor={`tf_${opt}`}>
                              {opt === 'A' ? 'True (A)' : 'False (B)'}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary">Explanation / Feedback</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Why is this the correct answer? Explain the reasoning to students..."
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-light border px-3" onClick={() => setShowQuestionModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom px-4 fw-semibold" disabled={questionSubmitting}>
                    {questionSubmitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Interactive Quiz Attempt / Preview Modal */}
      {attemptQuiz && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom bg-light">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary">{attemptQuiz.course?.courseCode}</span>
                    <span className="badge bg-secondary">Week {attemptQuiz.weekNumber}</span>
                    {isTeacherOrAdmin && (
                      <span className="badge bg-warning-subtle text-dark border">Preview Mode</span>
                    )}
                  </div>
                  <h5 className="modal-title fw-bold text-dark mt-1">{attemptQuiz.title}</h5>
                </div>
                <button type="button" className="btn-close" onClick={() => setAttemptQuiz(null)}></button>
              </div>

              <div className="modal-body p-4">
                {/* Result Screen if submitted */}
                {quizSubmitted && quizResult ? (
                  <div className="text-center py-4">
                    <div
                      className={`stat-icon mx-auto mb-3 shadow-sm ${
                        quizResult.percentage >= 75
                          ? 'bg-success text-white'
                          : quizResult.percentage >= 50
                          ? 'bg-warning text-dark'
                          : 'bg-danger text-white'
                      }`}
                      style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}
                    >
                      <i className={`bi bi-${quizResult.percentage >= 75 ? 'trophy-fill' : quizResult.percentage >= 50 ? 'hand-thumbs-up-fill' : 'exclamation-triangle-fill'}`}></i>
                    </div>

                    <h4 className="fw-bold text-dark mb-1">
                      {quizResult.percentage >= 75
                        ? 'Outstanding Performance!'
                        : quizResult.percentage >= 50
                        ? 'Good Effort!'
                        : 'Review & Retake Recommended'}
                    </h4>

                    <div className="display-5 fw-bold text-primary my-2">
                      {quizResult.obtainedMarks} <span className="fs-4 text-muted">/ {quizResult.totalMarks} Marks</span>
                    </div>

                    <div className="fs-5 fw-semibold text-secondary mb-4">
                      Score: <span className="text-dark">{quizResult.percentage}%</span> •{' '}
                      {quizResult.correctCount} of {quizResult.totalQuestions} Questions Correct
                    </div>

                    {/* Question by Question Review */}
                    <div className="text-start mt-4 pt-3 border-top">
                      <h6 className="fw-bold text-dark mb-3">Detailed Answer Review:</h6>
                      <div className="d-flex flex-column gap-3">
                        {quizResult.evaluations?.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-3 border ${
                              item.isCorrect ? 'bg-success-subtle border-success' : 'bg-danger-subtle border-danger'
                            }`}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-bold small">Question {idx + 1}</span>
                              <span className={`badge ${item.isCorrect ? 'bg-success' : 'bg-danger'}`}>
                                {item.isCorrect ? `+${item.marksObtained} Marks (Correct)` : '0 Marks (Incorrect)'}
                              </span>
                            </div>
                            <div className="fw-semibold text-dark small mb-2">{item.questionText}</div>
                            <div className="small mb-1">
                              <strong>Your Answer: </strong>
                              <span className={item.isCorrect ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                {item.submittedAnswer || 'Unanswered'}
                              </span>
                              {!item.isCorrect && (
                                <span className="ms-3 text-success">
                                  <strong>Correct: </strong> {item.correctAnswer}
                                </span>
                              )}
                            </div>
                            {item.explanation && (
                              <div className="small text-muted mt-1 bg-white p-2 rounded border">
                                <strong>Explanation: </strong> {item.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : attemptQuestions.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">No questions available in this quiz.</p>
                  </div>
                ) : (
                  <div>
                    {/* Instructions Banner */}
                    <div className="alert alert-info py-2 small d-flex align-items-center mb-4">
                      <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                      <div>
                        Select your answer for each question below. When finished, click <strong>Submit Assessment</strong> for instant evaluation.
                      </div>
                    </div>

                    {/* Questions List */}
                    <div className="d-flex flex-column gap-4">
                      {attemptQuestions.map((q, idx) => (
                        <div key={q.id} className="p-3 border rounded-3 bg-white">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-primary">Question {idx + 1}</span>
                            <span className="badge bg-light text-dark border">{q.marks} Marks</span>
                          </div>

                          <div className="fw-semibold text-dark mb-3">{q.questionText}</div>

                          <div className="d-flex flex-column gap-2">
                            {q.optionA && (
                              <label
                                className={`p-2.5 rounded-3 border d-flex align-items-center gap-2 cursor-pointer ${
                                  userAnswers[q.id] === 'A' || userAnswers[q.id] === 'True'
                                    ? 'bg-primary-subtle border-primary text-primary fw-semibold'
                                    : 'hover-bg-light'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`attempt_q_${q.id}`}
                                  checked={userAnswers[q.id] === 'A' || userAnswers[q.id] === 'True'}
                                  onChange={() => handleSelectAnswer(q.id, q.questionType === 'TRUE_FALSE' ? 'True' : 'A')}
                                  className="form-check-input mt-0"
                                />
                                <span>{q.optionA}</span>
                              </label>
                            )}

                            {q.optionB && (
                              <label
                                className={`p-2.5 rounded-3 border d-flex align-items-center gap-2 cursor-pointer ${
                                  userAnswers[q.id] === 'B' || userAnswers[q.id] === 'False'
                                    ? 'bg-primary-subtle border-primary text-primary fw-semibold'
                                    : 'hover-bg-light'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`attempt_q_${q.id}`}
                                  checked={userAnswers[q.id] === 'B' || userAnswers[q.id] === 'False'}
                                  onChange={() => handleSelectAnswer(q.id, q.questionType === 'TRUE_FALSE' ? 'False' : 'B')}
                                  className="form-check-input mt-0"
                                />
                                <span>{q.optionB}</span>
                              </label>
                            )}

                            {q.optionC && (
                              <label
                                className={`p-2.5 rounded-3 border d-flex align-items-center gap-2 cursor-pointer ${
                                  userAnswers[q.id] === 'C'
                                    ? 'bg-primary-subtle border-primary text-primary fw-semibold'
                                    : 'hover-bg-light'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`attempt_q_${q.id}`}
                                  checked={userAnswers[q.id] === 'C'}
                                  onChange={() => handleSelectAnswer(q.id, 'C')}
                                  className="form-check-input mt-0"
                                />
                                <span>{q.optionC}</span>
                              </label>
                            )}

                            {q.optionD && (
                              <label
                                className={`p-2.5 rounded-3 border d-flex align-items-center gap-2 cursor-pointer ${
                                  userAnswers[q.id] === 'D'
                                    ? 'bg-primary-subtle border-primary text-primary fw-semibold'
                                    : 'hover-bg-light'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`attempt_q_${q.id}`}
                                  checked={userAnswers[q.id] === 'D'}
                                  onChange={() => handleSelectAnswer(q.id, 'D')}
                                  className="form-check-input mt-0"
                                />
                                <span>{q.optionD}</span>
                              </label>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top bg-light">
                {quizSubmitted ? (
                  <button type="button" className="btn btn-primary-custom px-4" onClick={() => setAttemptQuiz(null)}>
                    Close Results
                  </button>
                ) : (
                  <>
                    <button type="button" className="btn btn-light border px-3" onClick={() => setAttemptQuiz(null)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-success px-4 fw-semibold"
                      onClick={handleSubmitAttempt}
                      disabled={submittingAttempt || attemptQuestions.length === 0}
                    >
                      {submittingAttempt ? 'Evaluating...' : 'Submit Assessment'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;
