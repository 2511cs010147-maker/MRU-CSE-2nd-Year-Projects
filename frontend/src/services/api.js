import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getStudents: () => api.get('/admin/students'),
  createStudent: (studentData) => api.post('/admin/students', studentData),
  updateStudent: (id, studentData) => api.put(`/admin/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  getTeachers: () => api.get('/admin/teachers'),
  createTeacher: (teacherData) => api.post('/admin/teachers', teacherData),
  updateTeacher: (id, teacherData) => api.put(`/admin/teachers/${id}`, teacherData),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
};

export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  getByUserId: (userId) => api.get(`/students/user/${userId}`),
  getPerformance: (id) => api.get(`/students/${id}/performance`),
};

export const teacherAPI = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  getByUserId: (userId) => api.get(`/teachers/user/${userId}`),
};

export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  getByTeacher: (teacherId) => api.get(`/courses/teacher/${teacherId}`),
  createCourse: (courseData) => api.post('/courses', courseData),
};

export const quizAPI = {
  getAll: () => api.get('/quizzes'),
  getByStudent: (studentId) => api.get(`/quizzes/student/${studentId}`),
  getByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
  submitQuiz: (submissionData) => api.post('/quizzes', submissionData),
};

export const riskAlertAPI = {
  getAll: () => api.get('/risk-alerts'),
  getByStudent: (studentId) => api.get(`/risk-alerts/student/${studentId}`),
  getByStatus: (status) => api.get(`/risk-alerts/status/${status}`),
  resolve: (id) => api.put(`/risk-alerts/${id}/resolve`),
  delete: (id) => api.delete(`/risk-alerts/${id}`),
};

export const libraryAPI = {
  getAll: () => api.get('/library'),
  search: (q, category) => api.get('/library/search', { params: { q, category } }),
  getById: (id) => api.get(`/library/${id}`),
  addResource: (resource) => api.post('/library', resource),
  deleteResource: (id) => api.delete(`/library/${id}`),
};

export const quizManagementAPI = {
  getAll: (params) => api.get('/quiz-management', { params }),
  getById: (id) => api.get(`/quiz-management/${id}`),
  create: (data) => api.post('/quiz-management', data),
  update: (id, data) => api.put(`/quiz-management/${id}`, data),
  delete: (id) => api.delete(`/quiz-management/${id}`),
  getQuestions: (quizId) => api.get(`/quiz-management/${quizId}/questions`),
  addQuestion: (quizId, questionData) => api.post(`/quiz-management/${quizId}/questions`, questionData),
  updateQuestion: (questionId, questionData) => api.put(`/quiz-management/questions/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/quiz-management/questions/${questionId}`),
  submitAttempt: (quizId, attemptData) => api.post(`/quiz-management/${quizId}/attempt`, attemptData),
};

export default api;
