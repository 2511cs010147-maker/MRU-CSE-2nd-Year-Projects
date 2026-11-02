package com.edulytix.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "risk_alerts")
public class RiskAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "previous_score")
    private Double previousScore;

    @Column(name = "current_score")
    private Double currentScore;

    @Column(name = "percentage_drop")
    private Double percentageDrop;

    @Column(name = "alert_level")
    private String alertLevel; // "HIGH", "CRITICAL", "MODERATE"

    @Column(name = "alert_date")
    private LocalDate alertDate = LocalDate.now();

    @Column(nullable = false)
    private String status = "ACTIVE"; // "ACTIVE", "RESOLVED"

    @Column(length = 500)
    private String message;

    public RiskAlert() {}

    public RiskAlert(Student student, Course course, Double previousScore, Double currentScore, Double percentageDrop, String alertLevel, String message) {
        this.student = student;
        this.course = course;
        this.previousScore = previousScore;
        this.currentScore = currentScore;
        this.percentageDrop = percentageDrop;
        this.alertLevel = alertLevel;
        this.message = message;
        this.alertDate = LocalDate.now();
        this.status = "ACTIVE";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public Double getPreviousScore() { return previousScore; }
    public void setPreviousScore(Double previousScore) { this.previousScore = previousScore; }

    public Double getCurrentScore() { return currentScore; }
    public void setCurrentScore(Double currentScore) { this.currentScore = currentScore; }

    public Double getPercentageDrop() { return percentageDrop; }
    public void setPercentageDrop(Double percentageDrop) { this.percentageDrop = percentageDrop; }

    public String getAlertLevel() { return alertLevel; }
    public void setAlertLevel(String alertLevel) { this.alertLevel = alertLevel; }

    public LocalDate getAlertDate() { return alertDate; }
    public void setAlertDate(LocalDate alertDate) { this.alertDate = alertDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    // JSON Aliases for compatibility
    public Double getDropPercentage() { return this.percentageDrop; }
    public String getRiskLevel() { return this.alertLevel; }
    public LocalDate getDate() { return this.alertDate; }
}
