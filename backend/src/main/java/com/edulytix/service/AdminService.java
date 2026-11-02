package com.edulytix.service;

import com.edulytix.dto.DashboardStatsDto;
import com.edulytix.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LibraryRepository libraryRepository;

    @Autowired
    private RiskAlertRepository riskAlertRepository;

    public DashboardStatsDto getDashboardStats() {
        long students = studentRepository.count();
        long teachers = teacherRepository.count();
        long courses = courseRepository.count();
        long resources = libraryRepository.count();
        long totalAlerts = riskAlertRepository.count();
        long activeAlerts = riskAlertRepository.countByStatus("ACTIVE");

        return new DashboardStatsDto(students, teachers, courses, resources, totalAlerts, activeAlerts);
    }
}
