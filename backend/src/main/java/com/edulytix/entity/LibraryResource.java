package com.edulytix.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "library")
public class LibraryResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String author;

    @Column(nullable = false)
    private String category; // "Book", "Notes", "PDF", "Study Material"

    private String subject;

    @Column(name = "file_type")
    private String fileType; // "PDF", "EPUB", "Document", "Link"

    @Column(name = "resource_url", length = 1000)
    private String resourceUrl;

    @Column(length = 1000)
    private String description;

    @Column(name = "uploaded_by")
    private String uploadedBy;

    @Column(name = "upload_date")
    private LocalDate uploadDate = LocalDate.now();

    public LibraryResource() {}

    public LibraryResource(String title, String author, String category, String subject, String fileType, String resourceUrl, String description, String uploadedBy) {
        this.title = title;
        this.author = author;
        this.category = category;
        this.subject = subject;
        this.fileType = fileType;
        this.resourceUrl = resourceUrl;
        this.description = description;
        this.uploadedBy = uploadedBy;
        this.uploadDate = LocalDate.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getResourceUrl() { return resourceUrl; }
    public void setResourceUrl(String resourceUrl) { this.resourceUrl = resourceUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public LocalDate getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDate uploadDate) { this.uploadDate = uploadDate; }
}
