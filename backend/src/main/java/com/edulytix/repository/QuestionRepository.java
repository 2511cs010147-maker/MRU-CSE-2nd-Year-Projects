package com.edulytix.repository;

import com.edulytix.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuizIdOrderByOrderNumberAsc(Long quizId);
    void deleteByQuizId(Long quizId);
}
