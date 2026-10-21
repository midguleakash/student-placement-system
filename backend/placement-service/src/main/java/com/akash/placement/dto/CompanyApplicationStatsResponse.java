package com.akash.placement.dto;

public record CompanyApplicationStatsResponse(
        long total,
        long applied,
        long shortlisted,
        long rejected
) {
}