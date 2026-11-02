package com.edulytix.controller;

import com.edulytix.dto.DashboardStatsDto;
import com.edulytix.entity.Student;
import com.edulytix.entity.Teacher;
import com.edulytix.service.AdminService;
import com.edulytix.service.StudentService;
import com.edulytix.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private TeacherService teacherService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // Student CRUD
    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody Map<String, Object> payload) {
        try {
            Student student = new Student();
            student.setName((String) payload.get("name"));
            student.setRollNo((String) payload.get("rollNo"));
            student.setEmail((String) payload.get("email"));
            student.setDepartment((String) payload.get("department"));
            student.setSemester((String) payload.get("semester"));
            student.setPhone((String) payload.get("phone"));

            String username = (String) payload.get("username");
            String password = (String) payload.get("password");

            Student created = studentService.createStudent(student, username, password);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Student student) {
        try {
            Student updated = studentService.updateStudent(id, student);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        try {
            studentService.deleteStudent(id);
            return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Teacher CRUD
    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @PostMapping("/teachers")
    public ResponseEntity<?> createTeacher(@RequestBody Map<String, Object> payload) {
        try {
            Teacher teacher = new Teacher();
            teacher.setName((String) payload.get("name"));
            teacher.setTeacherCode((String) payload.get("teacherCode"));
            teacher.setEmail((String) payload.get("email"));
            teacher.setDepartment((String) payload.get("department"));
            teacher.setDesignation((String) payload.get("designation"));
            teacher.setPhone((String) payload.get("phone"));

            String username = (String) payload.get("username");
            String password = (String) payload.get("password");

            Teacher created = teacherService.createTeacher(teacher, username, password);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/teachers/{id}")
    public ResponseEntity<?> updateTeacher(@PathVariable Long id, @RequestBody Teacher teacher) {
        try {
            Teacher updated = teacherService.updateTeacher(id, teacher);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        try {
            teacherService.deleteTeacher(id);
            return ResponseEntity.ok(Map.of("message", "Teacher deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
