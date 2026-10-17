
package com.akash.placement.repository;

import com.akash.placement.enums.JobStatus;
import com.akash.placement.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    Optional<Job> findByIdAndCompanyId(Long id, Long companyId);

    List<Job> findByStatusOrderByPublishedAtDesc(JobStatus status);


    List<Job> findByStatusAndApplicationDeadlineAfterOrderByPublishedAtDesc(
            JobStatus status,
            java.time.LocalDateTime deadline
    );

}
