package com.edulytix.repository;

import com.edulytix.entity.LibraryResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LibraryRepository extends JpaRepository<LibraryResource, Long> {
    List<LibraryResource> findAllByOrderByUploadDateDesc();
    List<LibraryResource> findByCategoryIgnoreCase(String category);
    List<LibraryResource> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrSubjectContainingIgnoreCase(String title, String author, String subject);
}
