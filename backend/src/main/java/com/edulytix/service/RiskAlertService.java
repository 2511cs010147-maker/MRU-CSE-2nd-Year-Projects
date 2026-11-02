package com.edulytix.service;

import com.edulytix.entity.RiskAlert;
import com.edulytix.repository.RiskAlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RiskAlertService {

    @Autowired
    private RiskAlertRepository riskAlertRepository;

    public List<RiskAlert> getAllAlerts() {
        return riskAlertRepository.findAllByOrderByAlertDateDesc();
    }

    public List<RiskAlert> getAlertsByStudent(Long studentId) {
        return riskAlertRepository.findByStudentIdOrderByAlertDateDesc(studentId);
    }

    public List<RiskAlert> getAlertsByStatus(String status) {
        return riskAlertRepository.findByStatusOrderByAlertDateDesc(status);
    }

    public RiskAlert resolveAlert(Long alertId) {
        RiskAlert alert = riskAlertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Risk alert not found with id: " + alertId));

        if ("ACTIVE".equalsIgnoreCase(alert.getStatus())) {
            alert.setStatus("RESOLVED");
        } else {
            alert.setStatus("ACTIVE");
        }
        return riskAlertRepository.save(alert);
    }

    public void deleteAlert(Long alertId) {
        riskAlertRepository.deleteById(alertId);
    }
}
