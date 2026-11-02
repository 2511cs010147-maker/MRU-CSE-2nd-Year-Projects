package com.edulytix.controller;

import com.edulytix.entity.Course;
import com.edulytix.entity.Teacher;
import com.edulytix.repository.CourseRepository;
import com.edulytix.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Course>> getCoursesByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(courseRepository.findByTeacherId(teacherId));
    }

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody Map<String, Object> payload) {
        try {
            Course course = new Course();
            course.setCourseCode((String) payload.get("courseCode"));
            course.setCourseName((String) payload.get("courseName"));
            course.setDepartment((String) payload.get("department"));
            course.setSemester((String) payload.get("semester"));

            if (payload.get("teacherId") != null) {
                Long teacherId = Long.valueOf(payload.get("teacherId").toString());
                Teacher teacher = teacherRepository.findById(teacherId).orElse(null);
                course.setTeacher(teacher);
            }

            Course saved = courseRepository.save(course);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
