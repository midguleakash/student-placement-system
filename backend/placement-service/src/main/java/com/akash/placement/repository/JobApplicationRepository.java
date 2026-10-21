
package com.akash.placement.repository;

import com.akash.placement.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long> {

    Optional<JobApplication> findByJobIdAndStudentUserId(
            Long jobId,
            Long studentUserId
    );

    boolean existsByJobIdAndStudentUserId(
            Long jobId,
            Long studentUserId
    );

    List<JobApplication> findByStudentUserIdOrderByAppliedAtDesc(
            Long studentUserId
    );

    List<JobApplication> findByJobIdOrderByAppliedAtDesc(
            Long jobId
    );

    List<JobApplication> findAllByOrderByAppliedAtDesc();

    long countByJobId(Long jobId);

    long countByJobIdAndStatus(
            Long jobId,
            com.akash.placement.enums.ApplicationStatus status
    );

    long countByStatus(
            com.akash.placement.enums.ApplicationStatus status
    );
}
