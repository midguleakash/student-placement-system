package com.akash.placement.controller;

import com.akash.placement.dto.RoundOneDecisionRequest;
import com.akash.placement.model.RecruitmentRound;
import com.akash.placement.service.RecruitmentRoundService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
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

    // Get all rounds for a candidate
    @GetMapping("/{applicationId}/rounds")
    public ResponseEntity<List<Map<String, Object>>> getRounds(
            @PathVariable Long applicationId,
            HttpServletRequest request) {

        Long companyUserId = getAuthenticatedUserId(request);

        List<Map<String, Object>> rounds = recruitmentRoundService
                .getRounds(applicationId, companyUserId)
                .stream()
                .map(this::roundResponse)
                .toList();

        return ResponseEntity.ok(rounds);
    }

    // ---------------- ROUND 1 ----------------

    @PostMapping("/{applicationId}/rounds/1")
    public ResponseEntity<Map<String, Object>> createRoundOne(
            @PathVariable Long applicationId,
            HttpServletRequest request) {

        RecruitmentRound round = recruitmentRoundService.createRoundOne(
                applicationId,
                getAuthenticatedUserId(request)
        );

        return ResponseEntity.ok(roundResponse(round));
    }

    @PutMapping("/{applicationId}/rounds/1/decision")
    public ResponseEntity<Map<String, Object>> decideRoundOne(
            @PathVariable Long applicationId,
            @Valid @RequestBody RoundOneDecisionRequest body,
            HttpServletRequest request) {

        RecruitmentRound round = recruitmentRoundService.decideRoundOne(
                applicationId,
                getAuthenticatedUserId(request),
                body.decision(),
                body.feedback(),
                body.score()
        );

        return ResponseEntity.ok(roundResponse(round));
    }

    // ---------------- ROUND 2 ----------------

    @PostMapping("/{applicationId}/rounds/2")
    public ResponseEntity<Map<String, Object>> createRoundTwo(
            @PathVariable Long applicationId,
            HttpServletRequest request) {

        RecruitmentRound round = recruitmentRoundService.createRoundTwo(
                applicationId,
                getAuthenticatedUserId(request)
        );

        return ResponseEntity.ok(roundResponse(round));
    }

    @PutMapping("/{applicationId}/rounds/2/decision")
    public ResponseEntity<Map<String, Object>> decideRoundTwo(
            @PathVariable Long applicationId,
            @Valid @RequestBody RoundOneDecisionRequest body,
            HttpServletRequest request) {

        RecruitmentRound round = recruitmentRoundService.decideRoundTwo(
                applicationId,
                getAuthenticatedUserId(request),
                body.decision(),
                body.feedback(),
                body.score()
        );

        return ResponseEntity.ok(roundResponse(round));
    }

    // ---------------- ROUND 3 ----------------

    @PostMapping("/{applicationId}/rounds/3")
    public ResponseEntity<Map<String, Object>> createRoundThree(
            @PathVariable Long applicationId,
            HttpServletRequest request) {

        RecruitmentRound round = recruitmentRoundService.createRoundThree(
                applicationId,
                getAuthenticatedUserId(request)
        );

        return ResponseEntity.ok(roundResponse(round));
    }

    @PutMapping("/{applicationId}/rounds/3/decision")
    public ResponseEntity<Map<String, Object>> decideRoundThree(
            @PathVariable Long applicationId,
            @Valid @RequestBody RoundOneDecisionRequest body,
            HttpServletRequest request) {

        RecruitmentRound round = recruitmentRoundService.decideRoundThree(
                applicationId,
                getAuthenticatedUserId(request),
                body.decision(),
                body.feedback(),
                body.score()
        );

        return ResponseEntity.ok(roundResponse(round));
    }

    // ---------------- HELPERS ----------------

    private Long getAuthenticatedUserId(HttpServletRequest request) {
        Object rawUserId = request.getAttribute("userId");

        if (rawUserId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated user ID is missing."
            );
        }

        try {
            return Long.valueOf(rawUserId.toString());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid authenticated user ID."
            );
        }
    }

    private Map<String, Object> roundResponse(RecruitmentRound round) {
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("roundId", round.getId());
        result.put("applicationId", round.getApplication().getId());
        result.put("roundNumber", round.getRoundNumber());
        result.put("roundName", round.getRoundName());
        result.put("status", round.getStatus());
        result.put("score", round.getScore());
        result.put("feedback", round.getFeedback());
        result.put("evaluatedBy", round.getEvaluatedBy());
        result.put("evaluatedAt", round.getEvaluatedAt());

        return result;
    }
}