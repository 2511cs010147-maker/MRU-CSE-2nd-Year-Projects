package com.edulytix.service;

import com.edulytix.entity.Teacher;
import com.edulytix.entity.User;
import com.edulytix.repository.CourseRepository;
import com.edulytix.repository.TeacherRepository;
import com.edulytix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TeacherService {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public Optional<Teacher> getTeacherById(Long id) {
        return teacherRepository.findById(id);
    }

    public Optional<Teacher> getTeacherByUserId(Long userId) {
        return teacherRepository.findByUserId(userId);
    }

    @Transactional
    public Teacher createTeacher(Teacher teacher, String username, String password) {
        if (teacherRepository.findByTeacherCode(teacher.getTeacherCode()).isPresent()) {
            throw new RuntimeException("Teacher code already exists: " + teacher.getTeacherCode());
        }

        String uname = (username != null && !username.trim().isEmpty()) ? username : teacher.getTeacherCode().toLowerCase();
        String pass = (password != null && !password.trim().isEmpty()) ? password : "password123";

        User user = new User(uname, pass, "TEACHER", teacher.getName(), teacher.getEmail());
        user = userRepository.save(user);

        teacher.setUser(user);
        return teacherRepository.save(teacher);
    }

    @Transactional
    public Teacher updateTeacher(Long id, Teacher details) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));

        teacher.setName(details.getName());
        teacher.setEmail(details.getEmail());
        teacher.setDepartment(details.getDepartment());
        teacher.setDesignation(details.getDesignation());
        teacher.setPhone(details.getPhone());

        if (teacher.getUser() != null) {
            teacher.getUser().setFullName(details.getName());
            teacher.getUser().setEmail(details.getEmail());
            userRepository.save(teacher.getUser());
        }

        return teacherRepository.save(teacher);
    }

    @Transactional
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));

        User user = teacher.getUser();
        teacherRepository.delete(teacher);
        if (user != null) {
            userRepository.delete(user);
        }
    }
}
