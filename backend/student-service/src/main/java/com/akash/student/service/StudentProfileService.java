package com.akash.student.service;

import com.akash.student.dto.StudentProfileRequest;
import com.akash.student.model.StudentProfile;

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
}