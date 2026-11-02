package com.edulytix.service;

import com.edulytix.dto.StudentPerformanceDto;
import com.edulytix.entity.QuizResult;
import com.edulytix.entity.RiskAlert;
import com.edulytix.entity.Student;
import com.edulytix.entity.User;
import com.edulytix.repository.QuizResultRepository;
import com.edulytix.repository.RiskAlertRepository;
import com.edulytix.repository.StudentRepository;
import com.edulytix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private RiskAlertRepository riskAlertRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    public Optional<Student> getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId);
    }

    public StudentPerformanceDto getStudentPerformance(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        List<QuizResult> quizzes = quizResultRepository.findByStudentIdOrderByWeekNumberAsc(studentId);
        List<RiskAlert> alerts = riskAlertRepository.findByStudentIdOrderByAlertDateDesc(studentId);

        double totalPercent = 0.0;
        for (QuizResult q : quizzes) {
            totalPercent += q.getPercentage();
        }
        double avg = quizzes.isEmpty() ? 0.0 : Math.round((totalPercent / quizzes.size()) * 100.0) / 100.0;

        long activeAlerts = alerts.stream().filter(a -> "ACTIVE".equalsIgnoreCase(a.getStatus())).count();
        boolean isAtRisk = activeAlerts > 0;

        return new StudentPerformanceDto(
                student,
                avg,
                quizzes.size(),
                isAtRisk,
                (int) activeAlerts,
                quizzes,
                alerts
        );
    }

    @Transactional
    public Student createStudent(Student student, String username, String password) {
        if (studentRepository.findByRollNo(student.getRollNo()).isPresent()) {
            throw new RuntimeException("Roll number already exists: " + student.getRollNo());
        }

        String uname = (username != null && !username.trim().isEmpty()) ? username : student.getRollNo().toLowerCase();
        String pass = (password != null && !password.trim().isEmpty()) ? password : "password123";

        User user = new User(uname, pass, "STUDENT", student.getName(), student.getEmail());
        user = userRepository.save(user);

        student.setUser(user);
        if (student.getEnrolledDate() == null) {
            student.setEnrolledDate(LocalDate.now());
        }
        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudent(Long id, Student details) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        student.setName(details.getName());
        student.setEmail(details.getEmail());
        student.setDepartment(details.getDepartment());
        student.setSemester(details.getSemester());
        student.setPhone(details.getPhone());

        if (student.getUser() != null) {
            student.getUser().setFullName(details.getName());
            student.getUser().setEmail(details.getEmail());
            userRepository.save(student.getUser());
        }

        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        // Delete associated quiz results and risk alerts
        List<QuizResult> quizzes = quizResultRepository.findByStudentIdOrderByWeekNumberAsc(id);
        quizResultRepository.deleteAll(quizzes);

        List<RiskAlert> alerts = riskAlertRepository.findByStudentIdOrderByAlertDateDesc(id);
        riskAlertRepository.deleteAll(alerts);

        User user = student.getUser();
        studentRepository.delete(student);
        if (user != null) {
            userRepository.delete(user);
        }
    }
}
