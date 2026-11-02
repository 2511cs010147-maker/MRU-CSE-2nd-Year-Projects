package com.edulytix.controller;

import com.edulytix.entity.RiskAlert;
import com.edulytix.service.RiskAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/risk-alerts")
@CrossOrigin(origins = "*")
public class RiskAlertController {

    @Autowired
    private RiskAlertService riskAlertService;

    @GetMapping
    public ResponseEntity<List<RiskAlert>> getAllAlerts() {
        return ResponseEntity.ok(riskAlertService.getAllAlerts());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<RiskAlert>> getAlertsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(riskAlertService.getAlertsByStudent(studentId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<RiskAlert>> getAlertsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(riskAlertService.getAlertsByStatus(status));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveAlert(@PathVariable Long id) {
        try {
            RiskAlert alert = riskAlertService.resolveAlert(id);
            return ResponseEntity.ok(alert);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAlert(@PathVariable Long id) {
        try {
            riskAlertService.deleteAlert(id);
            return ResponseEntity.ok(Map.of("message", "Alert removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
