package com.edulytix.service;

import com.edulytix.dto.QuizSubmissionDto;
import com.edulytix.entity.Course;
import com.edulytix.entity.QuizResult;
import com.edulytix.entity.RiskAlert;
import com.edulytix.entity.Student;
import com.edulytix.repository.CourseRepository;
import com.edulytix.repository.QuizResultRepository;
import com.edulytix.repository.RiskAlertRepository;
import com.edulytix.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class QuizService {

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private RiskAlertRepository riskAlertRepository;

    public List<QuizResult> getAllQuizResults() {
        return quizResultRepository.findAllByOrderByQuizDateDesc();
    }

    public List<QuizResult> getQuizzesByStudent(Long studentId) {
        return quizResultRepository.findByStudentIdOrderByWeekNumberAsc(studentId);
    }

    public List<QuizResult> getQuizzesByCourse(Long courseId) {
        return quizResultRepository.findByCourseIdOrderByWeekNumberAsc(courseId);
    }

    @Transactional
    public QuizResult submitQuiz(QuizSubmissionDto dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + dto.getStudentId()));

        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + dto.getCourseId()));

        if (dto.getTotalMarks() == null || dto.getTotalMarks() <= 0) {
            throw new RuntimeException("Total marks must be greater than 0");
        }

        double percentage = Math.round(((dto.getScore() / dto.getTotalMarks()) * 100.0) * 100.0) / 100.0;

        // Check for existing quiz entry for this student, course, and week
        Optional<QuizResult> existing = quizResultRepository
                .findByStudentIdAndCourseIdAndWeekNumber(dto.getStudentId(), dto.getCourseId(), dto.getWeekNumber());

        QuizResult quizResult;
        if (existing.isPresent()) {
            quizResult = existing.get();
            quizResult.setScore(dto.getScore());
            quizResult.setTotalMarks(dto.getTotalMarks());
            quizResult.setPercentage(percentage);
            quizResult.setRemarks(dto.getRemarks());
            quizResult.setQuizDate(LocalDate.now());
        } else {
            quizResult = new QuizResult(
                    student,
                    course,
                    dto.getWeekNumber(),
                    dto.getScore(),
                    dto.getTotalMarks(),
                    percentage,
                    dto.getRemarks(),
                    LocalDate.now()
            );
        }

        QuizResult savedQuiz = quizResultRepository.save(quizResult);

        // Core Requirement: Automatically generate Risk Alert when score decreases by 20% or more compared to previous week's score
        List<QuizResult> previousQuizzes = quizResultRepository
                .findByStudentIdAndCourseIdOrderByWeekNumberDesc(student.getId(), course.getId());

        // Find the quiz directly preceding the current week
        Optional<QuizResult> priorQuizOpt = previousQuizzes.stream()
                .filter(q -> !q.getId().equals(savedQuiz.getId()) && q.getWeekNumber() < dto.getWeekNumber())
                .findFirst();

        if (priorQuizOpt.isPresent()) {
            QuizResult priorQuiz = priorQuizOpt.get();
            double prevPercentage = priorQuiz.getPercentage();
            double absoluteDrop = prevPercentage - percentage;
            double relativeDrop = prevPercentage > 0 ? ((prevPercentage - percentage) / prevPercentage) * 100.0 : 0.0;

            // Trigger if decrease is 20% or more (either absolute percentage points or relative drop)
            if (absoluteDrop >= 20.0 || relativeDrop >= 20.0) {
                double dropReported = Math.max(absoluteDrop, relativeDrop);
                String alertLevel = (dropReported >= 30.0) ? "CRITICAL" : "HIGH";

                String message = String.format(
                        "Performance Risk Alert: Student's score dropped by %.1f%% in %s (%s). Week %d score: %.1f%%, Week %d score: %.1f%%. Immediate academic support recommended.",
                        dropReported,
                        course.getCourseName(),
                        course.getCourseCode(),
                        priorQuiz.getWeekNumber(),
                        prevPercentage,
                        dto.getWeekNumber(),
                        percentage
                );

                RiskAlert alert = new RiskAlert(
                        student,
                        course,
                        prevPercentage,
                        percentage,
                        Math.round(dropReported * 10.0) / 10.0,
                        alertLevel,
                        message
                );
                riskAlertRepository.save(alert);
            }
        }

        return savedQuiz;
    }
}
