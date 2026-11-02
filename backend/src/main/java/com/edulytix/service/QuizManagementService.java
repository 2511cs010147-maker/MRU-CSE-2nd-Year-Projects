package com.edulytix.service;

import com.edulytix.dto.QuestionDto;
import com.edulytix.dto.QuizDto;
import com.edulytix.dto.QuizSubmissionDto;
import com.edulytix.entity.*;
import com.edulytix.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class QuizManagementService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private QuizService quizService;

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAllByOrderByCreatedAtDesc();
    }

    public Quiz getQuizById(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + id));
    }

    public List<Quiz> getQuizzesByCourse(Long courseId) {
        return quizRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
    }

    public List<Quiz> getQuizzesByTeacher(Long teacherId) {
        return quizRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);
    }

    @Transactional
    public Quiz createQuiz(QuizDto dto) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + dto.getCourseId()));

        Teacher teacher = null;
        if (dto.getTeacherId() != null) {
            teacher = teacherRepository.findById(dto.getTeacherId()).orElse(null);
        } else if (course.getTeacher() != null) {
            teacher = course.getTeacher();
        }

        Quiz quiz = new Quiz(
                dto.getTitle(),
                dto.getDescription(),
                course,
                teacher,
                dto.getWeekNumber() != null ? dto.getWeekNumber() : 1,
                dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 20,
                dto.getTotalMarks() != null ? dto.getTotalMarks() : 20,
                dto.getStatus() != null ? dto.getStatus() : "PUBLISHED"
        );

        return quizRepository.save(quiz);
    }

    @Transactional
    public Quiz updateQuiz(Long id, QuizDto dto) {
        Quiz quiz = getQuizById(id);

        if (dto.getTitle() != null) quiz.setTitle(dto.getTitle());
        if (dto.getDescription() != null) quiz.setDescription(dto.getDescription());
        if (dto.getWeekNumber() != null) quiz.setWeekNumber(dto.getWeekNumber());
        if (dto.getDurationMinutes() != null) quiz.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getTotalMarks() != null) quiz.setTotalMarks(dto.getTotalMarks());
        if (dto.getStatus() != null) quiz.setStatus(dto.getStatus());

        if (dto.getCourseId() != null && !dto.getCourseId().equals(quiz.getCourse().getId())) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found with id: " + dto.getCourseId()));
            quiz.setCourse(course);
        }

        if (dto.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(dto.getTeacherId()).orElse(null);
            quiz.setTeacher(teacher);
        }

        return quizRepository.save(quiz);
    }

    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = getQuizById(id);
        quizRepository.delete(quiz);
    }

    public List<Question> getQuestionsByQuiz(Long quizId) {
        return questionRepository.findByQuizIdOrderByOrderNumberAsc(quizId);
    }

    @Transactional
    public Question addQuestion(Long quizId, QuestionDto dto) {
        Quiz quiz = getQuizById(quizId);

        List<Question> existing = questionRepository.findByQuizIdOrderByOrderNumberAsc(quizId);
        int nextOrder = existing.size() + 1;

        Question question = new Question(
                quiz,
                dto.getQuestionText(),
                dto.getQuestionType() != null ? dto.getQuestionType() : "MCQ",
                dto.getOptionA(),
                dto.getOptionB(),
                dto.getOptionC(),
                dto.getOptionD(),
                dto.getCorrectAnswer(),
                dto.getMarks() != null ? dto.getMarks() : 2,
                dto.getExplanation(),
                dto.getOrderNumber() != null ? dto.getOrderNumber() : nextOrder
        );

        Question saved = questionRepository.save(question);

        // Recalculate quiz total marks from questions
        int sumMarks = existing.stream().mapToInt(Question::getMarks).sum() + saved.getMarks();
        quiz.setTotalMarks(sumMarks);
        quizRepository.save(quiz);

        return saved;
    }

    @Transactional
    public Question updateQuestion(Long questionId, QuestionDto dto) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionId));

        if (dto.getQuestionText() != null) question.setQuestionText(dto.getQuestionText());
        if (dto.getQuestionType() != null) question.setQuestionType(dto.getQuestionType());
        if (dto.getOptionA() != null) question.setOptionA(dto.getOptionA());
        if (dto.getOptionB() != null) question.setOptionB(dto.getOptionB());
        if (dto.getOptionC() != null) question.setOptionC(dto.getOptionC());
        if (dto.getOptionD() != null) question.setOptionD(dto.getOptionD());
        if (dto.getCorrectAnswer() != null) question.setCorrectAnswer(dto.getCorrectAnswer());
        if (dto.getMarks() != null) question.setMarks(dto.getMarks());
        if (dto.getExplanation() != null) question.setExplanation(dto.getExplanation());
        if (dto.getOrderNumber() != null) question.setOrderNumber(dto.getOrderNumber());

        Question saved = questionRepository.save(question);

        // Update quiz total marks
        Quiz quiz = question.getQuiz();
        List<Question> allQuestions = questionRepository.findByQuizIdOrderByOrderNumberAsc(quiz.getId());
        int sumMarks = allQuestions.stream().mapToInt(Question::getMarks).sum();
        quiz.setTotalMarks(sumMarks);
        quizRepository.save(quiz);

        return saved;
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionId));
        Quiz quiz = question.getQuiz();
        questionRepository.delete(question);

        // Update total marks
        List<Question> allQuestions = questionRepository.findByQuizIdOrderByOrderNumberAsc(quiz.getId());
        int sumMarks = allQuestions.stream().mapToInt(Question::getMarks).sum();
        quiz.setTotalMarks(sumMarks > 0 ? sumMarks : 10);
        quizRepository.save(quiz);
    }

    @Transactional
    public Map<String, Object> evaluateQuizAttempt(Long quizId, Map<String, String> submittedAnswers, Long studentId) {
        Quiz quiz = getQuizById(quizId);
        List<Question> questions = questionRepository.findByQuizIdOrderByOrderNumberAsc(quizId);

        int totalQuestions = questions.size();
        int correctCount = 0;
        int obtainedMarks = 0;
        int totalMarks = 0;

        List<Map<String, Object>> questionEvaluations = new ArrayList<>();

        for (Question q : questions) {
            String submitted = submittedAnswers != null ? submittedAnswers.get(String.valueOf(q.getId())) : null;
            boolean isCorrect = submitted != null && submitted.trim().equalsIgnoreCase(q.getCorrectAnswer().trim());

            int qMarks = q.getMarks() != null ? q.getMarks() : 2;
            totalMarks += qMarks;

            if (isCorrect) {
                correctCount++;
                obtainedMarks += qMarks;
            }

            Map<String, Object> eval = new HashMap<>();
            eval.put("questionId", q.getId());
            eval.put("questionText", q.getQuestionText());
            eval.put("submittedAnswer", submitted);
            eval.put("correctAnswer", q.getCorrectAnswer());
            eval.put("isCorrect", isCorrect);
            eval.put("marksObtained", isCorrect ? qMarks : 0);
            eval.put("totalQuestionMarks", qMarks);
            eval.put("explanation", q.getExplanation());
            questionEvaluations.add(eval);
        }

        if (totalMarks == 0) totalMarks = quiz.getTotalMarks();
        double percentage = totalMarks > 0 ? Math.round(((double) obtainedMarks / totalMarks) * 1000.0) / 10.0 : 0.0;

        // If a studentId is provided, record into QuizResult and evaluate Risk Alert
        QuizResult recordedResult = null;
        if (studentId != null) {
            QuizSubmissionDto submissionDto = new QuizSubmissionDto();
            submissionDto.setStudentId(studentId);
            submissionDto.setCourseId(quiz.getCourse().getId());
            submissionDto.setWeekNumber(quiz.getWeekNumber());
            submissionDto.setScore((double) obtainedMarks);
            submissionDto.setTotalMarks((double) totalMarks);
            submissionDto.setRemarks("Online Quiz Submission: " + quiz.getTitle() + " (" + correctCount + "/" + totalQuestions + " correct)");
            recordedResult = quizService.submitQuiz(submissionDto);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("quizId", quiz.getId());
        response.put("quizTitle", quiz.getTitle());
        response.put("courseName", quiz.getCourse().getCourseName());
        response.put("totalQuestions", totalQuestions);
        response.put("correctCount", correctCount);
        response.put("obtainedMarks", obtainedMarks);
        response.put("totalMarks", totalMarks);
        response.put("percentage", percentage);
        response.put("evaluations", questionEvaluations);
        if (recordedResult != null) {
            response.put("quizResultId", recordedResult.getId());
        }

        return response;
    }
}
