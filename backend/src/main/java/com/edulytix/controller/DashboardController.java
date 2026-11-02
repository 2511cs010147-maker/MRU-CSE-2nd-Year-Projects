package com.edulytix.controller;

import com.edulytix.entity.QuizResult;
import com.edulytix.entity.RiskAlert;
import com.edulytix.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private TeacherRepository teacherRepo;

    @Autowired
    private CourseRepository courseRepo;

    @Autowired
    private QuizResultRepository quizResultRepo;

    @Autowired
    private RiskAlertRepository riskAlertRepo;

    @Autowired
    private LibraryRepository libraryRepo;

    @GetMapping("/teacher")
    public ResponseEntity<Map<String, Object>> getTeacherDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalStudents", studentRepo.count());
        data.put("totalQuizzes", quizResultRepo.count());
        data.put("highRiskStudents", riskAlertRepo.findAll().stream()
                .filter(r -> "HIGH".equalsIgnoreCase(r.getAlertLevel()) || "CRITICAL".equalsIgnoreCase(r.getAlertLevel()))
                .count());
        data.put("recentAlerts", riskAlertRepo.findAllByOrderByAlertDateDesc().stream().limit(5).collect(Collectors.toList()));
        data.put("recentResults", quizResultRepo.findAllByOrderByQuizDateDesc().stream().limit(5).collect(Collectors.toList()));
        return ResponseEntity.ok(data);
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalStudents", studentRepo.count());
        data.put("totalTeachers", teacherRepo.count());
        data.put("totalQuizzes", quizResultRepo.count());
        data.put("highRiskStudents", riskAlertRepo.findAll().stream()
                .filter(r -> "HIGH".equalsIgnoreCase(r.getAlertLevel()) || "CRITICAL".equalsIgnoreCase(r.getAlertLevel()))
                .count());
        data.put("learningMaterials", libraryRepo.count());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/student/{id}")
    public ResponseEntity<Map<String, Object>> getStudentDashboard(@PathVariable Long id) {
        Map<String, Object> data = new HashMap<>();
        List<QuizResult> results = quizResultRepo.findByStudentIdOrderByWeekNumberAsc(id);
        data.put("quizResults", results);

        double avg = results.stream()
                .mapToDouble(r -> r.getPercentage() != null ? r.getPercentage() : 0.0)
                .average()
                .orElse(0.0);
        data.put("averageScore", Math.round(avg * 100.0) / 100.0);

        List<RiskAlert> alerts = riskAlertRepo.findByStudentIdOrderByAlertDateDesc(id);
        data.put("riskStatus", alerts.isEmpty() ? "SAFE" : alerts.get(0).getAlertLevel());
        data.put("recentAlerts", alerts);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<RiskAlert>> getAllAlerts() {
        return ResponseEntity.ok(riskAlertRepo.findAllByOrderByAlertDateDesc());
    }
}
