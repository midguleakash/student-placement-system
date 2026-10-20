
package com.akash.placement.repository;

import com.akash.placement.enums.RecruitmentRoundStatus;
import com.akash.placement.model.RecruitmentRound;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecruitmentRoundRepository
        extends JpaRepository<RecruitmentRound, Long> {

    List<RecruitmentRound> findByApplication_IdOrderByRoundNumberAsc(
            Long applicationId);

    Optional<RecruitmentRound> findByApplication_IdAndRoundNumber(
            Long applicationId,
            Integer roundNumber);

    boolean existsByApplication_IdAndRoundNumber(
            Long applicationId,
            Integer roundNumber);

    List<RecruitmentRound> findByStatus(
            RecruitmentRoundStatus status);
}
