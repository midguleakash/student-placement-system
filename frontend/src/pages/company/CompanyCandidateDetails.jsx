import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { companyApi } from "../../services/companyApi";
import { useCompanyProfile } from "../../context/CompanyProfileContext";
import StatusBadge from "../../components/company/StatusBadge";

import "./CompanyCandidateDetails.css";

function CompanyCandidateDetails() {
    const { applicationId } = useParams();
    const { profile } = useCompanyProfile();

    const [application, setApplication] = useState(null);
    const [rounds, setRounds] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadCandidate = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [applicationResult, roundResult] = await Promise.all([
                companyApi.getMyApplications(),
                companyApi.getRecruitmentRounds(applicationId),
            ]);

            const records = Array.isArray(applicationResult)
                ? applicationResult
                : Array.isArray(applicationResult?.applications)
                    ? applicationResult.applications
                    : Array.isArray(applicationResult?.content)
                        ? applicationResult.content
                        : [];

            const found = records.find(
                item =>
                    String(item.id ?? item.applicationId) ===
                    String(applicationId)
            );

            if (!found) {
                throw new Error(
                    "Application not found, or you do not have access to it."
                );
            }

            setApplication(found);
            setRounds(Array.isArray(roundResult) ? roundResult : []);
        } catch (err) {
            setError(err.message || "Unable to load candidate details.");
        } finally {
            setLoading(false);
        }
    }, [applicationId]);

    useEffect(() => {
        loadCandidate();
    }, [loadCandidate]);

    if (profile?.profileStatus !== "APPROVED") {
        return (
            <section className="company-profile-page">
                <div className="company-page-state">
                    <h1>Applications are locked</h1>

                    <p>
                        Your company profile must be approved before you
                        can manage candidates.
                    </p>

                    <Link
                        to="/company/profile"
                        className="company-button primary"
                    >
                        View Company Profile
                    </Link>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="company-profile-page">
                <div className="company-page-loading">
                    Loading candidate details...
                </div>
            </section>
        );
    }

    if (error || !application) {
        return (
            <section className="company-profile-page">
                <div className="company-alert error" role="alert">
                    {error || "Candidate not found."}
                </div>

                <Link
                    to="/company/applications"
                    className="company-button"
                >
                    Back to Applications
                </Link>
            </section>
        );
    }

    const studentName =
        application.studentName ??
        application.fullName ??
        application.student?.fullName ??
        application.student?.name ??
        application.name ??
        `Student #${application.studentUserId ?? "—"}`;

    const studentEmail =
        application.studentEmail ??
        application.email ??
        application.student?.email ??
        "Email unavailable";

    const jobTitle =
        application.jobTitle ??
        application.job?.title ??
        "Untitled job";

    const status = String(application.status ?? "APPLIED").toUpperCase();

    const appliedAt = application.appliedAt ?? application.createdAt;

    const getRound = number =>
        rounds.find(round => Number(round.roundNumber) === number);

    const roundOne = getRound(1);
    const roundTwo = getRound(2);
    const roundThree = getRound(3);

    const terminalStatuses = ["REJECTED", "SELECTED", "HIRED"];

    const isTerminal = terminalStatuses.includes(status);

    const canStartRoundOne =
        !isTerminal && !roundOne;

    const canStartRoundTwo =
        !isTerminal &&
        roundOne?.status === "SHORTLISTED" &&
        !roundTwo;

    const canStartRoundThree =
        !isTerminal &&
        roundTwo?.status === "SHORTLISTED" &&
        !roundThree;

    function getRoundLabel(round) {
        if (!round) return "Not started";

        switch (round.status) {
            case "PENDING":
                return "Ready for evaluation";
            case "IN_PROGRESS":
                return "In progress";
            case "SHORTLISTED":
                return "Passed";
            case "REJECTED":
                return "Rejected";
            case "COMPLETED":
                return "Completed";
            default:
                return round.status;
        }
    }

    function renderRound(number, title, description, round, canStart) {
        const path =
            `/company/applications/${applicationId}/rounds/${number}`;

        const terminalRound =
            round?.status === "REJECTED" ||
            round?.status === "COMPLETED";

        let action;

        if (isTerminal || round?.status === "REJECTED") {
            action = (
                <button
                    type="button"
                    className="company-button"
                    disabled
                >
                    Closed
                </button>
            );
        } else if (round && !terminalRound) {
            action = (
                <Link
                    to={path}
                    className="company-button primary"
                >
                    {round.status === "SHORTLISTED"
                        ? "View Decision"
                        : "Continue Round"}
                </Link>
            );
        } else if (canStart) {
            action = (
                <Link
                    to={path}
                    className="company-button primary"
                >
                    Open Round {number}
                </Link>
            );
        } else {
            action = (
                <button
                    type="button"
                    className="company-button"
                    disabled
                    title="The previous round must be passed first."
                >
                    Locked
                </button>
            );
        }

        return (
            <div className="candidate-round-item" key={number}>
                <div>
                    <span className="candidate-round-number">
                        {String(number).padStart(2, "0")}
                    </span>
                </div>

                <div className="candidate-round-content">
                    <h3>{title}</h3>
                    <p>{description}</p>

                    <p>
                        <strong>Status:</strong>{" "}
                        {getRoundLabel(round)}
                    </p>

                    {round?.score !== null &&
                        round?.score !== undefined &&
                        round?.score !== "" && (
                            <p>
                                <strong>Score:</strong> {round.score}/100
                            </p>
                        )}

                    {round?.feedback && (
                        <p>
                            <strong>Feedback:</strong> {round.feedback}
                        </p>
                    )}
                </div>

                {action}
            </div>
        );
    }

    return (
        <section className="company-profile-page">
            <div className="company-page-title">
                <div>
                    <span className="company-kicker">
                        RECRUITMENT / CANDIDATE
                    </span>

                    <h1>Candidate Details</h1>

                    <p>
                        Review the candidate and manage recruitment rounds.
                    </p>
                </div>

                <Link
                    to="/company/applications"
                    className="company-button"
                >
                    Back to Applications
                </Link>
            </div>

            <div className="candidate-details-card">
                <div className="candidate-details-avatar">
                    {studentName.charAt(0).toUpperCase()}
                </div>

                <div className="candidate-details-main">
                    <h2>{studentName}</h2>
                    <p>{studentEmail}</p>

                    <p>
                        Applied for: <strong>{jobTitle}</strong>
                    </p>

                    <p>
                        Application ID:{" "}
                        {application.id ?? application.applicationId}
                    </p>

                    <p>
                        Applied on:{" "}
                        {appliedAt
                            ? new Date(appliedAt).toLocaleString()
                            : "—"}
                    </p>

                    {application.statusRemarks && (
                        <p>
                            Remarks: {application.statusRemarks}
                        </p>
                    )}
                </div>

                <StatusBadge status={status} />
            </div>

            <section className="candidate-rounds-card">
                <h2>Recruitment Progress</h2>

                <p>
                    Each round becomes available only after the candidate
                    passes the preceding round.
                </p>

                {isTerminal && (
                    <div
                        className="company-alert error"
                        role="status"
                    >
                        This application is closed. No further rounds
                        can be started.
                    </div>
                )}

                {renderRound(
                    1,
                    "Round 1 — Resume Screening",
                    "Review eligibility, resume skills, matching score, and screening feedback.",
                    roundOne,
                    canStartRoundOne
                )}

                {renderRound(
                    2,
                    "Round 2 — Technical Interview",
                    "Evaluate technical knowledge, problem-solving, and project experience.",
                    roundTwo,
                    canStartRoundTwo
                )}

                {renderRound(
                    3,
                    "Round 3 — HR Interview",
                    "Evaluate communication, role suitability, and final hiring readiness.",
                    roundThree,
                    canStartRoundThree
                )}

                <button
                    type="button"
                    className="company-button"
                    onClick={loadCandidate}
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "Refresh Progress"}
                </button>
            </section>
        </section>
    );
}

export default CompanyCandidateDetails;