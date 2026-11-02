package com.edulytix.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "quiz_results")
public class QuizResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(nullable = false)
    private Double score;

    @Column(name = "total_marks", nullable = false)
    private Double totalMarks;

    @Column(nullable = false)
    private Double percentage;

    private String remarks;

    @Column(name = "quiz_date")
    private LocalDate quizDate = LocalDate.now();

    public QuizResult() {}

    public QuizResult(Student student, Course course, Integer weekNumber, Double score, Double totalMarks, Double percentage, String remarks, LocalDate quizDate) {
        this.student = student;
        this.course = course;
        this.weekNumber = weekNumber;
        this.score = score;
        this.totalMarks = totalMarks;
        this.percentage = percentage;
        this.remarks = remarks;
        this.quizDate = quizDate != null ? quizDate : LocalDate.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public Integer getWeekNumber() { return weekNumber; }
    public void setWeekNumber(Integer weekNumber) { this.weekNumber = weekNumber; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public Double getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Double totalMarks) { this.totalMarks = totalMarks; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDate getQuizDate() { return quizDate; }
    public void setQuizDate(LocalDate quizDate) { this.quizDate = quizDate; }

    // JSON Aliases for compatibility
    public String getTitle() {
        return course != null ? (course.getCourseName() + " (Week " + weekNumber + ")") : ("Weekly Quiz " + weekNumber);
    }
    public Double getMaxMarks() { return this.totalMarks; }
    public LocalDate getDateEntered() { return this.quizDate; }
}
