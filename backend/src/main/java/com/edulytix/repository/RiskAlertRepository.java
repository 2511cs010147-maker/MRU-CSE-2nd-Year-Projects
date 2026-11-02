package com.edulytix.repository;

import com.edulytix.entity.RiskAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RiskAlertRepository extends JpaRepository<RiskAlert, Long> {
    List<RiskAlert> findAllByOrderByAlertDateDesc();
    List<RiskAlert> findByStudentIdOrderByAlertDateDesc(Long studentId);
    List<RiskAlert> findByStatusOrderByAlertDateDesc(String status);
    List<RiskAlert> findByStudentIdAndStatus(Long studentId, String status);
    long countByStatus(String status);
}
