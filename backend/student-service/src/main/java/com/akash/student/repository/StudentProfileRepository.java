
package com.akash.student.repository;

import com.akash.student.enums.PlacementRegistrationStatus;
import com.akash.student.enums.ProfileStatus;
import com.akash.student.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentProfileRepository
        extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<StudentProfile> findByProfileStatus(ProfileStatus profileStatus);

    long countByProfileStatus(ProfileStatus profileStatus);

    List<StudentProfile> findByPlacementRegistrationStatus(
            PlacementRegistrationStatus status);
}
