import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { companyApi } from "../../services/companyApi";
import { useCompanyProfile } from "../../context/CompanyProfileContext";
import StatusBadge from "../../components/company/StatusBadge";

import "./CompanyCandidateDetails.css";

const ROUND_NAMES = {
    1: "Resume Screening",
    2: "Technical Interview",
    3: "HR Interview",
};

function normalizeRecords(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.applications)) return result.applications;
    if (Array.isArray(result?.content)) return result.content;
    return [];
}

function normalizeRounds(result) {
    return Array.isArray(result) ? result : [];
}

function getRoundStatus(rounds, number) {
    return rounds.find(
        (round) => Number(round.roundNumber) === number
    )?.status?.toUpperCase() || null;
}

function isPassed(status) {
    return status === "SHORTLISTED";
}

function isTerminalApplication(status) {
    return ["REJECTED", "SELECTED", "HIRED"].includes(status);
}

function roundActionLabel(status) {
    if (status === "SHORTLISTED") return "Passed";
    if (status === "REJECTED") return "Rejected";
    if (status === "COMPLETED") return "Completed";
    if (status === "IN_PROGRESS") return "In progress";
    if (status === "PENDING") return "Started";
    return null;
}

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
            const result = await companyApi.getMyApplications();
            const records = normalizeRecords(result);

            const found = records.find(
                (item) =>
                    String(item.id ?? item.applicationId) ===
                    String(applicationId)
            );

            if (!found) {
                setApplication(null);
                setRounds([]);
                setError(
                    "Application not found, or you do not have access to it."
                );
                return;
            }

            setApplication(found);

            const roundResult =
                await companyApi.getApplicationRounds(applicationId);

            setRounds(normalizeRounds(roundResult));
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
                    Loading candidate details and recruitment history...
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
        `Student #${application.studentUserId ?? application.studentId ?? "—"}`;

    const studentEmail =
        application.studentEmail ??
        application.email ??
        application.student?.email ??
        "Email unavailable";

    const jobTitle =
        application.jobTitle ??
        application.job?.title ??
        application.title ??
        "Untitled job";

    const status = String(application.status ?? "APPLIED").toUpperCase();
    const appliedAt = application.appliedAt ?? application.createdAt;

    const roundOneStatus = getRoundStatus(rounds, 1);
    const roundTwoStatus = getRoundStatus(rounds, 2);
    const roundThreeStatus = getRoundStatus(rounds, 3);

    const applicationClosed = isTerminalApplication(status);

    const roundOneAvailable = !applicationClosed;
    const roundTwoAvailable =
        !applicationClosed && isPassed(roundOneStatus);
    const roundThreeAvailable =
        !applicationClosed && isPassed(roundTwoStatus);

    const roundItems = [
        {
            number: 1,
            title: "Round 1 — Resume Screening",
            description:
                "Review resume screening, eligibility, matching score, and feedback.",
            status: roundOneStatus,
            available: roundOneAvailable,
        },
        {
            number: 2,
            title: "Round 2 — Technical Interview",
            description:
                "Evaluate technical knowledge, problem-solving, projects, and skills.",
            status: roundTwoStatus,
            available: roundTwoAvailable,
        },
        {
            number: 3,
            title: "Round 3 — HR Interview",
            description:
                "Assess communication, teamwork, role expectations, and final suitability.",
            status: roundThreeStatus,
            available: roundThreeAvailable,
        },
    ];

    return (
        <section className="company-profile-page">
            <div className="company-page-title">
                <div>
                    <span className="company-kicker">
                        RECRUITMENT / CANDIDATE
                    </span>
                    <h1>Candidate Details</h1>
                    <p>
                        Review candidate information and manage the
                        recruitment process.
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
                        <p>Remarks: {application.statusRemarks}</p>
                    )}
                </div>

                <StatusBadge status={status} />
            </div>

            <section className="candidate-rounds-card">
                <h2>Recruitment Progress</h2>

                <p>
                    Each round becomes available only after the required
                    previous round has been passed. The backend also
                    validates every action.
                </p>

                {applicationClosed && (
                    <div className="company-alert">
                        This application is closed. Current status:{" "}
                        <strong>{status}</strong>
                    </div>
                )}

                {roundItems.map((round) => {
                    const actionLabel = roundActionLabel(round.status);
                    const canOpen = round.available;

                    return (
                        <div
                            className={`candidate-round-item ${
                                canOpen ? "" : "candidate-round-disabled"
                            }`}
                            key={round.number}
                        >
                            <div>
                                <span className="candidate-round-number">
                                    {String(round.number).padStart(2, "0")}
                                </span>
                            </div>

                            <div className="candidate-round-content">
                                <h3>{round.title}</h3>
                                <p>{round.description}</p>

                                <p>
                                    Status:{" "}
                                    <strong>
                                        {round.status || "Not started"}
                                    </strong>
                                </p>
                            </div>

                            {canOpen ? (
                                <Link
                                    to={`/company/applications/${applicationId}/rounds/${round.number}`}
                                    className="company-button primary"
                                >
                                    {actionLabel ? "View Round" : "Open Round"}
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    className="company-button"
                                    disabled
                                    title={
                                        round.number === 2
                                            ? "Pass Round 1 first."
                                            : round.number === 3
                                                ? "Pass Round 2 first."
                                                : "This application is closed."
                                    }
                                >
                                    {round.status === "REJECTED"
                                        ? "Rejected"
                                        : "Locked"}
                                </button>
                            )}
                        </div>
                    );
                })}

                <button
                    type="button"
                    className="company-button"
                    onClick={loadCandidate}
                    disabled={loading}
                >
                    Refresh Recruitment Status
                </button>
            </section>
        </section>
    );
}

export default CompanyCandidateDetails;