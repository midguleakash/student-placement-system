
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { companyApi } from "../../services/companyApi";
import { useCompanyProfile } from "../../context/CompanyProfileContext";
import StatusBadge from "../../components/company/StatusBadge";

import "./CompanyCandidateDetails.css";

function CompanyCandidateDetails() {
    const { applicationId } = useParams();
    const { profile } = useCompanyProfile();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadCandidate() {
            setLoading(true);
            setError("");

            try {
                const result = await companyApi.getMyApplications();

                const records = Array.isArray(result)
                    ? result
                    : Array.isArray(result?.applications)
                        ? result.applications
                        : Array.isArray(result?.content)
                            ? result.content
                            : [];

                const found = records.find(
                    (item) =>
                        String(item.id ?? item.applicationId) ===
                        String(applicationId)
                );

                if (active) {
                    if (!found) {
                        setError(
                            "Application not found, or you do not have access to it."
                        );
                    } else {
                        setApplication(found);
                    }
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.message || "Unable to load candidate details."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadCandidate();

        return () => {
            active = false;
        };
    }, [applicationId]);

    if (profile?.profileStatus !== "APPROVED") {
        return (
            <section className="company-profile-page">
                <div className="company-page-state">
                    <h1>Applications are locked</h1>
                    <p>
                        Your company profile must be approved before you can
                        manage candidates.
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

    return (
        <section className="company-profile-page">
            <div className="company-page-title">
                <div>
                    <span className="company-kicker">
                        RECRUITMENT / CANDIDATE
                    </span>
                    <h1>Candidate Details</h1>
                    <p>Review this application and manage recruitment rounds.</p>
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
                        Application ID: {application.id ?? application.applicationId}
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
                    Review the candidate's resume and record the Round 1
                    decision. Later rounds can be opened when the candidate
                    qualifies.
                </p>

                <div className="candidate-round-item">
                    <div>
                        <span className="candidate-round-number">01</span>
                    </div>
                    <div className="candidate-round-content">
                        <h3>Round 1 — Resume Screening</h3>
                        <p>
                            Check eligibility, resume skills, matching score,
                            and screening feedback.
                        </p>
                    </div>
                    <Link
                        to={`/company/applications/${applicationId}/rounds/1`}
                        className="company-button primary"
                    >
                        Open Round 1
                    </Link>
                </div>

                <div className="candidate-round-item candidate-round-disabled">
                    <div>
                        <span className="candidate-round-number">02</span>
                    </div>
                    <div className="candidate-round-content">
                        <h3>Round 2 — Technical Interview</h3>
                        <p>Available after Round 1 is shortlisted and the next-round workflow is implemented.</p>
                    </div>
                    <span className="candidate-coming-soon">Coming next</span>
                </div>

                <div className="candidate-round-item candidate-round-disabled">
                    <div>
                        <span className="candidate-round-number">03</span>
                    </div>
                    <div className="candidate-round-content">
                        <h3>Round 3 — HR Interview</h3>
                        <p>Final interview and hiring decision.</p>
                    </div>
                    <span className="candidate-coming-soon">Coming next</span>
                </div>
            </section>
        </section>
    );
}

export default CompanyCandidateDetails;
