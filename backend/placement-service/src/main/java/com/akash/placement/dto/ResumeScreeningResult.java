
package com.akash.placement.dto;

import java.util.List;

public record ResumeScreeningResult(
        Long jobId,
        Long studentUserId,
        boolean eligible,
        List<String> eligibilityReasons,
        int matchScore,
        List<String> matchedProfileSkills,
        List<String> matchedResumeSkills,
        List<String> missingSkills,
        String recommendation
) {
}
