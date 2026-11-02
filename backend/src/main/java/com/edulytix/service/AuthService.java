package com.edulytix.service;

import com.edulytix.dto.LoginRequest;
import com.edulytix.dto.LoginResponse;
import com.edulytix.dto.RegisterRequest;
import com.edulytix.entity.Student;
import com.edulytix.entity.Teacher;
import com.edulytix.entity.User;
import com.edulytix.repository.StudentRepository;
import com.edulytix.repository.TeacherRepository;
import com.edulytix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    public LoginResponse login(LoginRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            throw new RuntimeException("Username and password are required");
        }

        Optional<User> userOpt = userRepository.findByUsername(request.getUsername().trim());
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        User user = userOpt.get();
        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getFullName(),
                user.getEmail(),
                null,
                null,
                "Login successful"
        );

        if ("STUDENT".equalsIgnoreCase(user.getRole())) {
            Optional<Student> studentOpt = studentRepository.findByUserId(user.getId());
            if (studentOpt.isPresent()) {
                Student s = studentOpt.get();
                response.setStudentId(s.getId());
                response.setRollNo(s.getRollNo());
                response.setDepartment(s.getDepartment());
                response.setSemester(s.getSemester());
                response.setPhone(s.getPhone());
            }
        } else if ("TEACHER".equalsIgnoreCase(user.getRole())) {
            Optional<Teacher> teacherOpt = teacherRepository.findByUserId(user.getId());
            if (teacherOpt.isPresent()) {
                Teacher t = teacherOpt.get();
                response.setTeacherId(t.getId());
                response.setTeacherCode(t.getTeacherCode());
                response.setDepartment(t.getDepartment());
                response.setDesignation(t.getDesignation());
                response.setPhone(t.getPhone());
            }
        }

        return response;
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new RuntimeException("Full name is required");
        }

        String username = request.getUsername().trim().toLowerCase();
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username '" + username + "' is already taken. Please choose another.");
        }

        String role = request.getRole() != null ? request.getRole().trim().toUpperCase() : "STUDENT";
        if (!"ADMIN".equals(role) && !"TEACHER".equals(role) && !"STUDENT".equals(role)) {
            role = "STUDENT";
        }

        String email = request.getEmail() != null && !request.getEmail().trim().isEmpty()
                ? request.getEmail().trim()
                : username + "@edulytix.edu";

        // Create User
        User user = new User(username, request.getPassword().trim(), role, request.getFullName().trim(), email);
        user = userRepository.save(user);

        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getFullName(),
                user.getEmail(),
                null,
                null,
                "Account created successfully"
        );

        if ("STUDENT".equals(role)) {
            String rollNo = request.getRollNo() != null && !request.getRollNo().trim().isEmpty()
                    ? request.getRollNo().trim().toUpperCase()
                    : "STU" + (int)(Math.random() * 9000 + 1000);

            // Avoid collision
            if (studentRepository.findByRollNo(rollNo).isPresent()) {
                rollNo = rollNo + "_" + (int)(Math.random() * 900 + 100);
            }

            String department = request.getDepartment() != null && !request.getDepartment().trim().isEmpty()
                    ? request.getDepartment().trim()
                    : "Computer Science";

            String semester = request.getSemester() != null && !request.getSemester().trim().isEmpty()
                    ? request.getSemester().trim()
                    : "Semester 1";

            String phone = request.getPhone() != null ? request.getPhone().trim() : "";

            Student student = new Student(user, rollNo, user.getFullName(), user.getEmail(), department, semester, phone, LocalDate.now());
            student = studentRepository.save(student);

            response.setStudentId(student.getId());
            response.setRollNo(student.getRollNo());
            response.setDepartment(student.getDepartment());
            response.setSemester(student.getSemester());
            response.setPhone(student.getPhone());

        } else if ("TEACHER".equals(role)) {
            String teacherCode = request.getTeacherCode() != null && !request.getTeacherCode().trim().isEmpty()
                    ? request.getTeacherCode().trim().toUpperCase()
                    : "TCH" + (int)(Math.random() * 900 + 100);

            if (teacherRepository.findByTeacherCode(teacherCode).isPresent()) {
                teacherCode = teacherCode + "_" + (int)(Math.random() * 90 + 10);
            }

            String department = request.getDepartment() != null && !request.getDepartment().trim().isEmpty()
                    ? request.getDepartment().trim()
                    : "Computer Science";

            String designation = request.getDesignation() != null && !request.getDesignation().trim().isEmpty()
                    ? request.getDesignation().trim()
                    : "Assistant Professor";

            String phone = request.getPhone() != null ? request.getPhone().trim() : "";

            Teacher teacher = new Teacher(user, teacherCode, user.getFullName(), user.getEmail(), department, designation, phone);
            teacher = teacherRepository.save(teacher);

            response.setTeacherId(teacher.getId());
            response.setTeacherCode(teacher.getTeacherCode());
            response.setDepartment(teacher.getDepartment());
            response.setDesignation(teacher.getDesignation());
            response.setPhone(teacher.getPhone());
        }

        return response;
    }
}
