package com.edulytix.dto;

public class DashboardStatsDto {
    private long totalStudents;
    private long totalTeachers;
    private long totalCourses;
    private long totalResources;
    private long totalRiskAlerts;
    private long activeRiskAlerts;

    public DashboardStatsDto() {}

    public DashboardStatsDto(long totalStudents, long totalTeachers, long totalCourses, long totalResources, long totalRiskAlerts, long activeRiskAlerts) {
        this.totalStudents = totalStudents;
        this.totalTeachers = totalTeachers;
        this.totalCourses = totalCourses;
        this.totalResources = totalResources;
        this.totalRiskAlerts = totalRiskAlerts;
        this.activeRiskAlerts = activeRiskAlerts;
    }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalTeachers() { return totalTeachers; }
    public void setTotalTeachers(long totalTeachers) { this.totalTeachers = totalTeachers; }

    public long getTotalCourses() { return totalCourses; }
    public void setTotalCourses(long totalCourses) { this.totalCourses = totalCourses; }

    public long getTotalResources() { return totalResources; }
    public void setTotalResources(long totalResources) { this.totalResources = totalResources; }

    public long getTotalRiskAlerts() { return totalRiskAlerts; }
    public void setTotalRiskAlerts(long totalRiskAlerts) { this.totalRiskAlerts = totalRiskAlerts; }

    public long getActiveRiskAlerts() { return activeRiskAlerts; }
    public void setActiveRiskAlerts(long activeRiskAlerts) { this.activeRiskAlerts = activeRiskAlerts; }
}
