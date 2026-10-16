package com.akash.student.service;

import com.akash.student.dto.StudentProfileRequest;
import com.akash.student.model.StudentProfile;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StudentProfileService {

    StudentProfile saveProfile(
            Long userId,
            StudentProfileRequest request
    );

    StudentProfile submitProfile(Long userId);

    StudentProfile getMyProfile(Long userId);

    List<StudentProfile> getPendingProfiles();

    StudentProfile approveProfile(Long profileId);

    StudentProfile rejectProfile(
            Long profileId,
            String remarks
    );

    StudentProfile uploadResume(Long userId, MultipartFile file);
    byte[] getMyResume(Long userId);

    byte[] getStudentResume(Long profileId);

    StudentProfile registerForPlacement(Long userId);

    StudentProfile approvePlacementRegistration(
            Long profileId, Long adminUserId);

    StudentProfile rejectPlacementRegistration(
            Long profileId, Long adminUserId, String remarks);

    java.util.List<StudentProfile> getPendingPlacementRegistrations();
}