
package com.akash.placement.repository;

import com.akash.placement.enums.CompanyProfileStatus;
import com.akash.placement.model.CompanyProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyProfileRepository
        extends JpaRepository<CompanyProfile, Long> {

    Optional<CompanyProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<CompanyProfile> findByProfileStatus(
            CompanyProfileStatus profileStatus);

    List<CompanyProfile> findByProfileStatusOrderBySubmittedAtAsc(
            CompanyProfileStatus profileStatus);

    long countByProfileStatus(CompanyProfileStatus profileStatus);
}
