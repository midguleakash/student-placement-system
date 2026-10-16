
package com.akash.student.controller;

import com.akash.student.dto.PlacementReviewRequest;
import com.akash.student.dto.ProfileReviewRequest;
import com.akash.student.dto.StudentProfileResponse;
import com.akash.student.enums.ProfileStatus;
import com.akash.student.model.StudentProfile;
import com.akash.student.repository.StudentProfileRepository;
import com.akash.student.service.StudentProfileService;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentController {

    private final StudentProfileRepository repository;

    private final StudentProfileService service;

    public AdminStudentController(
            StudentProfileRepository repository,
            StudentProfileService service) {
        this.repository = repository;
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<StudentProfileResponse>> getAllStudents() {
        List<StudentProfileResponse> students = repository.findAll()
                .stream()
                .map(StudentProfileResponse::from)
                .toList();

        return ResponseEntity.ok(students);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<StudentProfileResponse>> getPendingStudents() {
        List<StudentProfileResponse> students =
                repository.findByProfileStatus(ProfileStatus.PENDING)
                        .stream()
                        .map(StudentProfileResponse::from)
                        .toList();

        return ResponseEntity.ok(students);
    }

    @GetMapping("/stats")
    public ResponseEntity<StudentStats> getStudentStats() {
        return ResponseEntity.ok(new StudentStats(
                repository.count(),
                repository.countByProfileStatus(ProfileStatus.PENDING),
                repository.countByProfileStatus(ProfileStatus.APPROVED),
                repository.countByProfileStatus(ProfileStatus.REJECTED)
        ));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<StudentProfileResponse> approveStudent(
            @PathVariable Long id) {

        StudentProfile profile = repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Student profile not found"));

        if (profile.getProfileStatus() != ProfileStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending profiles can be approved");
        }

        profile.setProfileStatus(ProfileStatus.APPROVED);
        profile.setRejectionRemarks(null);
        profile.setProfileReviewedAt(LocalDateTime.now());

        return ResponseEntity.ok(
                StudentProfileResponse.from(repository.save(profile)));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<StudentProfileResponse> rejectStudent(
            @PathVariable Long id,
            @Valid @RequestBody ProfileReviewRequest request) {

        StudentProfile profile = repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Student profile not found"));

        if (profile.getProfileStatus() != ProfileStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending profiles can be rejected");
        }

        profile.setProfileStatus(ProfileStatus.REJECTED);
        profile.setRejectionRemarks(request.getRemarks().trim());
        profile.setProfileReviewedAt(LocalDateTime.now());

        return ResponseEntity.ok(
                StudentProfileResponse.from(repository.save(profile)));
    }

    public record StudentStats(
            long totalStudents,
            long pendingStudents,
            long approvedStudents,
            long rejectedStudents
    ) {
    }

    @GetMapping(
            value = "/{id}/resume/view",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> viewStudentResume(
            @PathVariable Long id) {

        byte[] pdf = service.getStudentResume(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"student-resume.pdf\""
                )
                .cacheControl(CacheControl.noStore())
                .body(pdf);
    }



    @GetMapping("/placement-registrations/pending")
    public ResponseEntity<List<StudentProfileResponse>>
    getPendingPlacementRegistrations() {

        List<StudentProfileResponse> registrations =
                service.getPendingPlacementRegistrations()
                        .stream()
                        .map(StudentProfileResponse::from)
                        .toList();

        return ResponseEntity.ok(registrations);
    }

    @PatchMapping("/{profileId}/placement-registration/approve")
    public ResponseEntity<StudentProfileResponse>
    approvePlacementRegistration(
            @PathVariable Long profileId,
            @RequestAttribute("userId") Long adminUserId) {

        StudentProfile profile =
                service.approvePlacementRegistration(profileId, adminUserId);

        return ResponseEntity.ok(StudentProfileResponse.from(profile));
    }

    @PatchMapping("/{profileId}/placement-registration/reject")
    public ResponseEntity<StudentProfileResponse>
    rejectPlacementRegistration(
            @PathVariable Long profileId,
            @RequestAttribute("userId") Long adminUserId,
            @Valid @RequestBody PlacementReviewRequest request) {

        StudentProfile profile =
                service.rejectPlacementRegistration(
                        profileId, adminUserId, request.remarks());

        return ResponseEntity.ok(StudentProfileResponse.from(profile));
    }

}
