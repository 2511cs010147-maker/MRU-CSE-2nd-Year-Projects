package com.edulytix.service;

import com.edulytix.entity.LibraryResource;
import com.edulytix.repository.LibraryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class LibraryService {

    @Autowired
    private LibraryRepository libraryRepository;

    public List<LibraryResource> getAllResources() {
        return libraryRepository.findAllByOrderByUploadDateDesc();
    }

    public List<LibraryResource> searchResources(String query, String category) {
        if (query != null && !query.trim().isEmpty()) {
            List<LibraryResource> results = libraryRepository
                    .findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrSubjectContainingIgnoreCase(query, query, query);
            if (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) {
                return results.stream()
                        .filter(r -> category.equalsIgnoreCase(r.getCategory()))
                        .toList();
            }
            return results;
        } else if (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            return libraryRepository.findByCategoryIgnoreCase(category);
        }
        return libraryRepository.findAllByOrderByUploadDateDesc();
    }

    public Optional<LibraryResource> getResourceById(Long id) {
        return libraryRepository.findById(id);
    }

    public LibraryResource addResource(LibraryResource resource) {
        if (resource.getUploadDate() == null) {
            resource.setUploadDate(LocalDate.now());
        }
        return libraryRepository.save(resource);
    }

    public void deleteResource(Long id) {
        libraryRepository.deleteById(id);
    }
}
