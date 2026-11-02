package com.edulytix.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "roll_no", unique = true, nullable = false)
    private String rollNo;

    @Column(nullable = false)
    private String name;

    private String email;

    private String department;

    private String semester;

    private String phone;

    @Column(name = "enrolled_date")
    private LocalDate enrolledDate = LocalDate.now();

    public Student() {}

    public Student(User user, String rollNo, String name, String email, String department, String semester, String phone, LocalDate enrolledDate) {
        this.user = user;
        this.rollNo = rollNo;
        this.name = name;
        this.email = email;
        this.department = department;
        this.semester = semester;
        this.phone = phone;
        this.enrolledDate = enrolledDate != null ? enrolledDate : LocalDate.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDate getEnrolledDate() { return enrolledDate; }
    public void setEnrolledDate(LocalDate enrolledDate) { this.enrolledDate = enrolledDate; }

    // JSON Aliases for compatibility
    public String getFullName() { return this.name; }
    public String getRollNumber() { return this.rollNo; }
}
