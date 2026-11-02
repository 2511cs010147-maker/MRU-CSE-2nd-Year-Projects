package com.edulytix.dto;

import com.edulytix.entity.QuizResult;
import com.edulytix.entity.RiskAlert;
import com.edulytix.entity.Student;
import java.util.List;

public class StudentPerformanceDto {
    private Student student;
    private Double overallAverage;
    private Integer totalQuizzes;
    private Boolean isAtRisk;
    private Integer activeAlertCount;
    private List<QuizResult> quizResults;
    private List<RiskAlert> riskAlerts;

    public StudentPerformanceDto() {}

    public StudentPerformanceDto(Student student, Double overallAverage, Integer totalQuizzes, Boolean isAtRisk, Integer activeAlertCount, List<QuizResult> quizResults, List<RiskAlert> riskAlerts) {
        this.student = student;
        this.overallAverage = overallAverage;
        this.totalQuizzes = totalQuizzes;
        this.isAtRisk = isAtRisk;
        this.activeAlertCount = activeAlertCount;
        this.quizResults = quizResults;
        this.riskAlerts = riskAlerts;
    }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Double getOverallAverage() { return overallAverage; }
    public void setOverallAverage(Double overallAverage) { this.overallAverage = overallAverage; }

    public Integer getTotalQuizzes() { return totalQuizzes; }
    public void setTotalQuizzes(Integer totalQuizzes) { this.totalQuizzes = totalQuizzes; }

    public Boolean getIsAtRisk() { return isAtRisk; }
    public void setIsAtRisk(Boolean atRisk) { isAtRisk = atRisk; }

    public Integer getActiveAlertCount() { return activeAlertCount; }
    public void setActiveAlertCount(Integer activeAlertCount) { this.activeAlertCount = activeAlertCount; }

    public List<QuizResult> getQuizResults() { return quizResults; }
    public void setQuizResults(List<QuizResult> quizResults) { this.quizResults = quizResults; }

    public List<RiskAlert> getRiskAlerts() { return riskAlerts; }
    public void setRiskAlerts(List<RiskAlert> riskAlerts) { this.riskAlerts = riskAlerts; }
}
