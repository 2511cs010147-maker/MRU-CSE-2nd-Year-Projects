package com.edulytix.repository;

import com.edulytix.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findAllByOrderByCreatedAtDesc();
    List<Quiz> findByCourseIdOrderByCreatedAtDesc(Long courseId);
    List<Quiz> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    List<Quiz> findByStatusOrderByCreatedAtDesc(String status);
}
