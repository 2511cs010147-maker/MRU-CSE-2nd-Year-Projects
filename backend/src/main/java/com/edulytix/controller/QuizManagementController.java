package com.edulytix.controller;

import com.edulytix.dto.QuestionDto;
import com.edulytix.dto.QuizDto;
import com.edulytix.entity.Question;
import com.edulytix.entity.Quiz;
import com.edulytix.service.QuizManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz-management")
@CrossOrigin(origins = "*")
public class QuizManagementController {

    @Autowired
    private QuizManagementService quizManagementService;

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long teacherId) {
        if (courseId != null) {
            return ResponseEntity.ok(quizManagementService.getQuizzesByCourse(courseId));
        }
        if (teacherId != null) {
            return ResponseEntity.ok(quizManagementService.getQuizzesByTeacher(teacherId));
        }
        return ResponseEntity.ok(quizManagementService.getAllQuizzes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizManagementService.getQuizById(id));
    }

    @PostMapping
    public ResponseEntity<?> createQuiz(@RequestBody QuizDto dto) {
        try {
            Quiz created = quizManagementService.createQuiz(dto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuiz(@PathVariable Long id, @RequestBody QuizDto dto) {
        try {
            Quiz updated = quizManagementService.updateQuiz(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id) {
        try {
            quizManagementService.deleteQuiz(id);
            return ResponseEntity.ok(Map.of("message", "Quiz deleted successfully", "id", id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<Question>> getQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(quizManagementService.getQuestionsByQuiz(id));
    }

    @PostMapping("/{id}/questions")
    public ResponseEntity<?> addQuestion(@PathVariable Long id, @RequestBody QuestionDto dto) {
        try {
            Question added = quizManagementService.addQuestion(id, dto);
            return ResponseEntity.ok(added);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long questionId, @RequestBody QuestionDto dto) {
        try {
            Question updated = quizManagementService.updateQuestion(questionId, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long questionId) {
        try {
            quizManagementService.deleteQuestion(questionId);
            return ResponseEntity.ok(Map.of("message", "Question deleted successfully", "id", questionId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/attempt")
    public ResponseEntity<?> submitAttempt(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> answers = (Map<String, String>) payload.get("answers");
            Long studentId = null;
            if (payload.get("studentId") != null) {
                studentId = Long.valueOf(payload.get("studentId").toString());
            }
            Map<String, Object> evaluation = quizManagementService.evaluateQuizAttempt(id, answers, studentId);
            return ResponseEntity.ok(evaluation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
