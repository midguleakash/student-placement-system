
package com.akash.placement.controller;

import com.akash.placement.dto.RoundOneDecisionRequest;
import com.akash.placement.model.RecruitmentRound;
import com.akash.placement.service.RecruitmentRoundService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/company/applications")
@PreAuthorize("hasRole('COMPANY')")
public class CompanyRecruitmentRoundController {

    private final RecruitmentRoundService recruitmentRoundService;

    public CompanyRecruitmentRoundController(
            RecruitmentRoundService recruitmentRoundService) {
        this.recruitmentRoundService = recruitmentRoundService;
    }

    @PostMapping("/{applicationId}/rounds/1")
    public ResponseEntity<?> createRoundOne(
            @PathVariable Long applicationId,
            HttpServletRequest request) {

        Long companyUserId = getAuthenticatedUserId(request);

        RecruitmentRound round =
                recruitmentRoundService.createRoundOne(
                        applicationId,
                        companyUserId
                );

        return ResponseEntity.ok(roundResponse(round));
    }

    @PutMapping("/{applicationId}/rounds/1/decision")
    public ResponseEntity<?> decideRoundOne(
            @PathVariable Long applicationId,
            @Valid @RequestBody RoundOneDecisionRequest body,
            HttpServletRequest request) {

        Long companyUserId = getAuthenticatedUserId(request);

        RecruitmentRound round =
                recruitmentRoundService.decideRoundOne(
                        applicationId,
                        companyUserId,
                        body.decision(),
                        body.feedback(),
                        body.score()
                );

        return ResponseEntity.ok(roundResponse(round));
    }

    private Long getAuthenticatedUserId(HttpServletRequest request) {
        Object rawUserId = request.getAttribute("userId");

        if (rawUserId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "Authenticated user ID is missing."
            );
        }

        try {
            return Long.valueOf(rawUserId.toString());
        } catch (NumberFormatException ex) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "Invalid authenticated user ID."
            );
        }
    }

    private Map<String, Object> roundResponse(RecruitmentRound round) {
        return Map.of(
                "roundId", round.getId(),
                "applicationId", round.getApplication().getId(),
                "roundNumber", round.getRoundNumber(),
                "roundName", round.getRoundName(),
                "status", round.getStatus(),
                "score", round.getScore() == null ? "" : round.getScore(),
                "feedback", round.getFeedback() == null ? "" : round.getFeedback(),
                "evaluatedBy", round.getEvaluatedBy() == null ? "" : round.getEvaluatedBy(),
                "evaluatedAt", round.getEvaluatedAt() == null
                        ? ""
                        : round.getEvaluatedAt()
        );
    }
}
