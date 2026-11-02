package com.edulytix.repository;

import com.edulytix.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    List<QuizResult> findByStudentIdOrderByWeekNumberAsc(Long studentId);
    List<QuizResult> findByCourseIdOrderByWeekNumberAsc(Long courseId);
    List<QuizResult> findByStudentIdAndCourseIdOrderByWeekNumberDesc(Long studentId, Long courseId);
    Optional<QuizResult> findByStudentIdAndCourseIdAndWeekNumber(Long studentId, Long courseId, Integer weekNumber);
    List<QuizResult> findAllByOrderByQuizDateDesc();
}
