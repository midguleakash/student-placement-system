
package com.akash.placement.service;

import com.akash.placement.dto.ResumeScreeningResult;
import com.akash.placement.dto.StudentScreeningData;
import com.akash.placement.model.Job;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResumeScreeningService {

    private final StudentScreeningClient studentScreeningClient;

    public ResumeScreeningService(
            StudentScreeningClient studentScreeningClient) {
        this.studentScreeningClient = studentScreeningClient;
    }

    public ResumeScreeningResult evaluate(Job job, Long studentUserId) {

        StudentScreeningData student =
                studentScreeningClient.getStudent(studentUserId);

        List<String> reasons = new ArrayList<>();

        // Mandatory profile and placement approvals.
        if (!"APPROVED".equals(student.profileStatus())) {
            reasons.add("Student profile is not approved.");
        }

        if (!"APPROVED".equals(student.placementRegistrationStatus())) {
            reasons.add("Placement registration is not approved.");
        }

        // CGPA rule.
        if (job.getMinimumCgpa() != null) {
            if (student.cgpa() == null) {
                reasons.add("CGPA is missing from the student profile.");
            } else if (BigDecimal.valueOf(student.cgpa())
                    .compareTo(job.getMinimumCgpa()) < 0) {
                reasons.add("CGPA is below the job's minimum requirement.");
            }
        }

        // Active backlog rule.
        if (job.getMaximumActiveBacklogs() != null) {
            if (student.activeBacklogs() == null) {
                reasons.add("Active backlog information is missing.");
            } else if (student.activeBacklogs()
                    > job.getMaximumActiveBacklogs()) {
                reasons.add("Active backlogs exceed the job's limit.");
            }
        }

        // Graduation-year rule. Stored as comma-separated years, e.g. 2026,2027.
        if (job.getEligibleGraduationYears() != null
                && !job.getEligibleGraduationYears().isBlank()) {

            Set<Integer> allowedYears = parseYears(
                    job.getEligibleGraduationYears());

            if (student.graduationYear() == null) {
                reasons.add("Graduation year is missing.");
            } else if (!allowedYears.contains(student.graduationYear())) {
                reasons.add("Graduation year does not match job criteria.");
            }
        }

        // Extract resume text only when a resume is available.
        String resumeText = "";

        if (student.hasResume()) {
            byte[] pdf = studentScreeningClient.getResume(studentUserId);
            resumeText = extractPdfText(pdf);
        } else {
            reasons.add("No resume is available for review.");
        }

        List<String> requiredSkills =
                parseSkills(job.getRequiredSkills());

        Set<String> profileSkills = normalizeSkills(student.skills());
        String normalizedResume = normalize(resumeText);

        List<String> matchedProfile = new ArrayList<>();
        List<String> matchedResume = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String skill : requiredSkills) {
            String normalizedSkill = normalize(skill);

            boolean foundInProfile =
                    containsSkill(profileSkills, normalizedSkill);

            boolean foundInResume =
                    containsSkillText(normalizedResume, normalizedSkill);

            if (foundInProfile) {
                matchedProfile.add(skill);
            }

            if (foundInResume) {
                matchedResume.add(skill);
            }

            if (!foundInProfile && !foundInResume) {
                missingSkills.add(skill);
            }
        }

        int matchScore = requiredSkills.isEmpty()
                ? 0
                : (int) Math.round(
                100.0 * (requiredSkills.size() - missingSkills.size())
                        / requiredSkills.size());

        boolean eligible = reasons.isEmpty();

        String recommendation;

        if (!eligible) {
            recommendation = "NEEDS_REVIEW";
        } else if (matchScore >= 75) {
            recommendation = "STRONG_MATCH";
        } else if (matchScore >= 40) {
            recommendation = "REVIEW";
        } else {
            recommendation = "LOW_MATCH";
        }

        return new ResumeScreeningResult(
                job.getId(),
                studentUserId,
                eligible,
                reasons,
                matchScore,
                matchedProfile,
                matchedResume,
                missingSkills,
                recommendation
        );
    }

    private String extractPdfText(byte[] pdfBytes) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            return "";
        }

        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            return new PDFTextStripper().getText(document);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Unable to extract text from the student's resume.", e);
        }
    }

    private List<String> parseSkills(String skills) {
        if (skills == null || skills.isBlank()) {
            return List.of();
        }

        return Arrays.stream(skills.split("[,;\\n]"))
                .map(String::trim)
                .filter(skill -> !skill.isBlank())
                .distinct()
                .toList();
    }

    private Set<String> normalizeSkills(String skills) {
        return parseSkills(skills).stream()
                .map(this::normalize)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }

        return value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9+#.]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean containsSkill(Set<String> profileSkills, String skill) {
        return profileSkills.contains(skill);
    }

    private boolean containsSkillText(String resumeText, String skill) {
        if (skill.isBlank()) {
            return false;
        }

        String pattern = "(?<![a-z0-9])"
                + Pattern.quote(skill)
                + "(?![a-z0-9])";

        return Pattern.compile(pattern).matcher(resumeText).find();
    }

    private Set<Integer> parseYears(String years) {
        return Arrays.stream(years.split("[,;\\s]+"))
                .map(String::trim)
                .filter(year -> !year.isBlank())
                .map(Integer::parseInt)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
