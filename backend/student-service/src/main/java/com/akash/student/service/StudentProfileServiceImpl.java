package com.akash.student.service;

import com.akash.student.dto.StudentProfileRequest;
import com.akash.student.enums.PlacementRegistrationStatus;
import com.akash.student.enums.ProfileStatus;
import com.akash.student.model.StudentProfile;
import com.akash.student.repository.StudentProfileRepository;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class StudentProfileServiceImpl implements StudentProfileService {

    private final StudentProfileRepository repository;
    private final Cloudinary cloudinary;

    public StudentProfileServiceImpl(
            StudentProfileRepository repository,
            Cloudinary cloudinary) {
        this.repository = repository;
        this.cloudinary = cloudinary;
    }

    @Override
    @Transactional
    public StudentProfile saveProfile(Long userId, StudentProfileRequest request) {

        StudentProfile profile = repository.findByUserId(userId)
                .orElseGet(() -> {
                    StudentProfile newProfile = new StudentProfile();
                    newProfile.setUserId(userId);
                    newProfile.setProfileStatus(ProfileStatus.INCOMPLETE);
                    return newProfile;
                });

        if (profile.getProfileStatus() == ProfileStatus.PENDING
                || profile.getProfileStatus() == ProfileStatus.APPROVED) {
            throw new IllegalStateException(
                    "Profile cannot be edited in its current status.");
        }

        profile.setFirstName(request.getFirstName().trim());
        profile.setLastName(request.getLastName().trim());
        profile.setPhone(request.getPhone().trim());
        profile.setBranch(request.getBranch().trim());
        profile.setGraduationYear(request.getGraduationYear());
        profile.setCgpa(request.getCgpa());
        profile.setActiveBacklogs(request.getActiveBacklogs());
        profile.setSkills(request.getSkills().trim());


        profile.setProfileStatus(ProfileStatus.INCOMPLETE);
        profile.setRejectionRemarks(null);

        return repository.save(profile);
    }

    @Override
    @Transactional
    public StudentProfile submitProfile(Long userId) {

        StudentProfile profile = repository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Please complete your profile first."));

        validateProfile(profile);

        if (profile.getProfileStatus() == ProfileStatus.PENDING) {
            throw new IllegalStateException(
                    "Profile is already pending review.");
        }

        if (profile.getProfileStatus() == ProfileStatus.APPROVED) {
            throw new IllegalStateException(
                    "Profile is already approved.");
        }

        profile.setProfileStatus(ProfileStatus.PENDING);
        profile.setProfileSubmittedAt(LocalDateTime.now());
        profile.setProfileReviewedAt(null);
        profile.setRejectionRemarks(null);

        return repository.save(profile);
    }


    @Override
    @Transactional
    public StudentProfile getMyProfile(Long userId) {
        return repository.findByUserId(userId)
                .orElseGet(() -> {
                    StudentProfile profile = new StudentProfile();
                    profile.setUserId(userId);
                    profile.setProfileStatus(ProfileStatus.INCOMPLETE);
                    return repository.save(profile);
                });
    }


    @Override
    @Transactional(readOnly = true)
    public List<StudentProfile> getPendingProfiles() {
        return repository.findByProfileStatus(ProfileStatus.PENDING);
    }

    @Override
    @Transactional
    public StudentProfile approveProfile(Long profileId) {

        StudentProfile profile = getPendingProfile(profileId);

        profile.setProfileStatus(ProfileStatus.APPROVED);
        profile.setProfileReviewedAt(LocalDateTime.now());
        profile.setRejectionRemarks(null);

        return repository.save(profile);
    }

    @Override
    @Transactional
    public StudentProfile rejectProfile(Long profileId, String remarks) {

        if (remarks == null || remarks.isBlank()) {
            throw new IllegalArgumentException(
                    "Rejection remarks are required.");
        }

        StudentProfile profile = getPendingProfile(profileId);

        profile.setProfileStatus(ProfileStatus.REJECTED);
        profile.setRejectionRemarks(remarks.trim());
        profile.setProfileReviewedAt(LocalDateTime.now());

        return repository.save(profile);
    }

    @Override
    @Transactional
    public StudentProfile uploadResume(Long userId, MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select a PDF resume.");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Resume size must not exceed 5 MB.");
        }

        String filename = file.getOriginalFilename();

        if (filename == null
                || !filename.toLowerCase().endsWith(".pdf")
                || !"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new IllegalArgumentException(
                    "Only PDF resumes are allowed.");
        }

        StudentProfile profile = repository.findByUserId(userId)
                .orElseGet(() -> {
                    StudentProfile newProfile = new StudentProfile();
                    newProfile.setUserId(userId);
                    newProfile.setProfileStatus(ProfileStatus.INCOMPLETE);
                    return repository.save(newProfile);
                });

        if (profile.getProfileStatus() == ProfileStatus.PENDING
                || profile.getProfileStatus() == ProfileStatus.APPROVED) {
            throw new IllegalStateException(
                    "Resume cannot be changed while the profile is pending or approved.");
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "type", "authenticated",
                            "folder", "student-placement/resumes",
                            "public_id", "student_" + userId
                                    + "_resume_" + System.currentTimeMillis() + ".pdf"
                    )
            );

            String publicId = (String) result.get("public_id");

            if (publicId == null || publicId.isBlank()) {
                throw new IllegalStateException(
                        "Cloudinary did not return a resume identifier.");
            }

            profile.setResumePublicId(publicId);
            return repository.save(profile);

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Unable to read the uploaded resume.", e);
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Resume upload failed. Please try again.", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getMyResume(Long userId) {
        StudentProfile profile = repository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Student profile not found."));

        String publicId = profile.getResumePublicId();

        if (publicId == null || publicId.isBlank()) {
            throw new IllegalArgumentException("No resume has been uploaded.");
        }

        try {
            String signedUrl = cloudinary.url()
                    .resourceType("raw")
                    .type("authenticated")
                    .signed(true)
                    .generate(publicId);

            HttpClient client = HttpClient.newHttpClient();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(signedUrl))
                    .GET()
                    .build();

            HttpResponse<byte[]> response = client.send(
                    request,
                    HttpResponse.BodyHandlers.ofByteArray()
            );

            if (response.statusCode() != 200) {
                throw new IllegalStateException(
                        "Unable to retrieve the private resume from Cloudinary.");
            }

            String contentType = response.headers()
                    .firstValue("Content-Type")
                    .orElse("");

            if (!contentType.equalsIgnoreCase("application/pdf")) {
                throw new IllegalStateException(
                        "Cloudinary did not return a PDF file.");
            }

            if (response.body().length > 5 * 1024 * 1024) {
                throw new IllegalStateException("Resume exceeds the 5 MB limit.");
            }

            return response.body();

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Resume retrieval was interrupted.", e);
        } catch (java.io.IOException e) {
            throw new IllegalStateException("Unable to retrieve the resume.", e);
        }
    }

    private StudentProfile getPendingProfile(Long profileId) {

        StudentProfile profile = repository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student profile not found."));

        if (profile.getProfileStatus() != ProfileStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending profiles can be reviewed.");
        }

        return profile;
    }

    private void validateProfile(StudentProfile profile) {

        if (isBlank(profile.getFirstName())
                || isBlank(profile.getLastName())
                || isBlank(profile.getPhone())
                || isBlank(profile.getBranch())
                || profile.getGraduationYear() == null
                || profile.getCgpa() == null
                || profile.getActiveBacklogs() == null
                || isBlank(profile.getSkills())
                || isBlank(profile.getResumePublicId())) {

            throw new IllegalArgumentException(
                    "Complete all required fields before submission.");
        }

        if (profile.getCgpa() < 0 || profile.getCgpa() > 10) {
            throw new IllegalArgumentException(
                    "CGPA must be between 0 and 10.");
        }

        if (profile.getActiveBacklogs() < 0) {
            throw new IllegalArgumentException(
                    "Active backlogs cannot be negative.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getStudentResume(Long profileId) {
        StudentProfile profile = repository.findById(profileId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Student profile not found."));

        String publicId = profile.getResumePublicId();

        if (publicId == null || publicId.isBlank()) {
            throw new IllegalArgumentException(
                    "No resume has been uploaded.");
        }

        try {
            String signedUrl = cloudinary.url()
                    .resourceType("raw")
                    .type("authenticated")
                    .signed(true)
                    .generate(publicId);

            HttpClient client = HttpClient.newHttpClient();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(signedUrl))
                    .GET()
                    .build();

            HttpResponse<byte[]> response = client.send(
                    request,
                    HttpResponse.BodyHandlers.ofByteArray()
            );

            if (response.statusCode() != 200) {
                throw new IllegalStateException(
                        "Unable to retrieve the private resume from Cloudinary.");
            }

            String contentType = response.headers()
                    .firstValue("Content-Type")
                    .orElse("");

            if (!contentType.equalsIgnoreCase("application/pdf")) {
                throw new IllegalStateException(
                        "Cloudinary did not return a PDF file.");
            }

            if (response.body().length > 5 * 1024 * 1024) {
                throw new IllegalStateException(
                        "Resume exceeds the 5 MB limit.");
            }

            return response.body();

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(
                    "Resume retrieval was interrupted.", e);
        } catch (java.io.IOException e) {
            throw new IllegalStateException(
                    "Unable to retrieve the resume.", e);
        }
    }



    @Override
    @Transactional
    public StudentProfile registerForPlacement(Long userId) {
        StudentProfile profile = repository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Student profile not found"));

        if (profile.getProfileStatus() != ProfileStatus.APPROVED) {
            throw new IllegalStateException(
                    "Your student profile must be approved first");
        }

        PlacementRegistrationStatus status =
                profile.getPlacementRegistrationStatus();

        if (status == PlacementRegistrationStatus.PENDING ||
                status == PlacementRegistrationStatus.APPROVED) {
            throw new IllegalStateException(
                    "Placement registration is already " + status);
        }

        profile.setPlacementRegistrationStatus(
                PlacementRegistrationStatus.PENDING);
        profile.setPlacementRegisteredAt(LocalDateTime.now());
        profile.setPlacementReviewedAt(null);
        profile.setPlacementReviewedBy(null);
        profile.setPlacementRejectionRemarks(null);

        return repository.save(profile);
    }

    @Override
    @Transactional
    public StudentProfile approvePlacementRegistration(
            Long profileId, Long adminUserId) {
        StudentProfile profile = repository.findById(profileId)
                .orElseThrow(() ->
                        new RuntimeException("Student profile not found"));

        if (profile.getProfileStatus() != ProfileStatus.APPROVED) {
            throw new IllegalStateException(
                    "Student profile must be approved first");
        }

        if (profile.getPlacementRegistrationStatus()
                != PlacementRegistrationStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending placement registrations can be approved");
        }

        profile.setPlacementRegistrationStatus(
                PlacementRegistrationStatus.APPROVED);
        profile.setPlacementReviewedAt(LocalDateTime.now());
        profile.setPlacementReviewedBy(adminUserId);
        profile.setPlacementRejectionRemarks(null);

        return repository.save(profile);
    }

    @Override
    @Transactional
    public StudentProfile rejectPlacementRegistration(
            Long profileId, Long adminUserId, String remarks) {
        StudentProfile profile = repository.findById(profileId)
                .orElseThrow(() ->
                        new RuntimeException("Student profile not found"));

        if (profile.getPlacementRegistrationStatus()
                != PlacementRegistrationStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending placement registrations can be rejected");
        }

        if (remarks == null || remarks.isBlank()) {
            throw new IllegalArgumentException(
                    "Rejection remarks are required");
        }

        profile.setPlacementRegistrationStatus(
                PlacementRegistrationStatus.REJECTED);
        profile.setPlacementReviewedAt(LocalDateTime.now());
        profile.setPlacementReviewedBy(adminUserId);
        profile.setPlacementRejectionRemarks(remarks.trim());

        return repository.save(profile);
    }

    @Override
    public java.util.List<StudentProfile> getPendingPlacementRegistrations() {
        return repository.findByPlacementRegistrationStatus(
                PlacementRegistrationStatus.PENDING);
    }

}



