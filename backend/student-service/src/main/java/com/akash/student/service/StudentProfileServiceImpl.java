package com.akash.student.service;

import com.akash.student.dto.StudentProfileRequest;
import com.akash.student.enums.ProfileStatus;
import com.akash.student.model.StudentProfile;
import com.akash.student.repository.StudentProfileRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StudentProfileServiceImpl implements StudentProfileService {

    private final StudentProfileRepository repository;

    public StudentProfileServiceImpl(StudentProfileRepository repository) {
        this.repository = repository;
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
        profile.setResumeUrl(request.getResumeUrl().trim());

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
                || isBlank(profile.getResumeUrl())) {

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
}