package com.edulytix.controller;

import com.edulytix.dto.QuizSubmissionDto;
import com.edulytix.entity.QuizResult;
import com.edulytix.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @Autowired
    private com.edulytix.service.QuizManagementService quizManagementService;

    @GetMapping
    public ResponseEntity<List<QuizResult>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizResults());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<QuizResult>> getQuizzesByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(quizService.getQuizzesByStudent(studentId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<QuizResult>> getQuizzesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizService.getQuizzesByCourse(courseId));
    }

    @PostMapping
    public ResponseEntity<?> submitQuiz(@RequestBody Map<String, Object> payload) {
        try {
            QuizSubmissionDto dto = new QuizSubmissionDto();

            // If it's a quiz creation form: { title, weekNumber, maxMarks }
            if (payload.containsKey("title") && !payload.containsKey("studentId")) {
                // Return created quiz mock representation for compatibility
                return ResponseEntity.ok(Map.of(
                        "id", System.currentTimeMillis() % 1000,
                        "title", payload.get("title"),
                        "weekNumber", payload.get("weekNumber"),
                        "maxMarks", payload.get("maxMarks")
                ));
            }

            if (payload.get("studentId") != null) {
                dto.setStudentId(Long.valueOf(payload.get("studentId").toString()));
            }
            if (payload.get("courseId") != null) {
                dto.setCourseId(Long.valueOf(payload.get("courseId").toString()));
            } else if (payload.get("quizId") != null) {
                dto.setCourseId(Long.valueOf(payload.get("quizId").toString()));
            }
            if (payload.get("weekNumber") != null) {
                dto.setWeekNumber(Integer.valueOf(payload.get("weekNumber").toString()));
            } else {
                dto.setWeekNumber(1);
            }
            if (payload.get("score") != null) {
                dto.setScore(Double.valueOf(payload.get("score").toString()));
            }
            if (payload.get("totalMarks") != null) {
                dto.setTotalMarks(Double.valueOf(payload.get("totalMarks").toString()));
            } else {
                dto.setTotalMarks(20.0);
            }
            if (payload.get("remarks") != null) {
                dto.setRemarks(payload.get("remarks").toString());
            }

            QuizResult result = quizService.submitQuiz(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/results")
    public ResponseEntity<?> submitQuizResultNested(@RequestBody Map<String, Object> payload) {
        try {
            QuizSubmissionDto dto = new QuizSubmissionDto();
            if (payload.get("student") instanceof Map) {
                Map<?, ?> sMap = (Map<?, ?>) payload.get("student");
                dto.setStudentId(Long.valueOf(sMap.get("id").toString()));
            } else if (payload.get("studentId") != null) {
                dto.setStudentId(Long.valueOf(payload.get("studentId").toString()));
            }

            Long courseId = 1L;
            if (payload.get("quiz") instanceof Map) {
                Map<?, ?> qMap = (Map<?, ?>) payload.get("quiz");
                courseId = Long.valueOf(qMap.get("id").toString());
            } else if (payload.get("quizId") != null) {
                courseId = Long.valueOf(payload.get("quizId").toString());
            } else if (payload.get("courseId") != null) {
                courseId = Long.valueOf(payload.get("courseId").toString());
            }
            dto.setCourseId(courseId);

            dto.setWeekNumber(payload.get("weekNumber") != null ? Integer.valueOf(payload.get("weekNumber").toString()) : 1);
            dto.setScore(Double.valueOf(payload.get("score").toString()));
            dto.setTotalMarks(payload.get("totalMarks") != null ? Double.valueOf(payload.get("totalMarks").toString()) : 20.0);
            dto.setRemarks(payload.get("remarks") != null ? payload.get("remarks").toString() : "Entered result");

            QuizResult result = quizService.submitQuiz(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<?>> getQuestions(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizManagementService.getQuestionsByQuiz(quizId));
    }
}
