
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { companyApi } from "../../services/companyApi";
import { useCompanyProfile } from "../../context/CompanyProfileContext";
import StatusBadge from "../../components/company/StatusBadge";

import "./CompanyDashboard.css";
import "./CompanyRoundOne.css";

function getRecords(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.applications)) return result.applications;
    if (Array.isArray(result?.content)) return result.content;
    return [];
}

function getApplicationId(application) {
    return application?.id ?? application?.applicationId;
}

function CompanyRoundOne() {
    const { applicationId } = useParams();
    const { profile } = useCompanyProfile();

    const [application, setApplication] = useState(null);
    const [screening, setScreening] = useState(null);
    const [decision, setDecision] = useState("SHORTLISTED");
    const [feedback, setFeedback] = useState("");
    const [score, setScore] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const approved = profile?.profileStatus === "APPROVED";

    const loadPage = useCallback(async () => {
        if (!approved || !applicationId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const applicationsResult = await companyApi.getMyApplications();
            const applications = getRecords(applicationsResult);

            const found = applications.find(
                item =>
                    String(getApplicationId(item)) === String(applicationId)
            );

            if (!found) {
                throw new Error(
                    "Application not found or you do not have access to it."
                );
            }

            setApplication(found);

            const screeningResult =
                await companyApi.getApplicationScreening(applicationId);

            setScreening(screeningResult);

            if (screeningResult?.matchScore != null) {
                setScore(String(screeningResult.matchScore));
            }
        } catch (err) {
            setError(err.message || "Unable to load resume screening.");
        } finally {
            setLoading(false);
        }
    }, [approved, applicationId]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    async function submitDecision(event) {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!application || !screening) {
            setError("Load the candidate's screening result first.");
            return;
        }

        if (
            application.status === "REJECTED" ||
            application.status === "SELECTED" ||
            application.status === "HIRED"
        ) {
            setError("This application has already reached a terminal status.");
            return;
        }

        const numericScore =
            score.trim() === "" ? null : Number(score);

        if (
            numericScore !== null &&
            (!Number.isFinite(numericScore) ||
                numericScore < 0 ||
                numericScore > 100)
        ) {
            setError("Score must be between 0 and 100.");
            return;
        }

        if (decision === "REJECTED" && !feedback.trim()) {
            setError("Please provide a reason for rejecting the candidate.");
            return;
        }

        setSaving(true);

        try {
            await companyApi.decideRoundOne(applicationId, {
                decision,
                feedback: feedback.trim(),
                score: numericScore,
            });

            setMessage(
                decision === "SHORTLISTED"
                    ? "Candidate shortlisted for the next round."
                    : "Candidate rejected at resume screening."
            );

            await loadPage();
        } catch (err) {
            setError(err.message || "Unable to save the Round 1 decision.");
        } finally {
            setSaving(false);
        }
    }

    if (!approved) {
        return (
            <section className="company-profile-page">
                <h1>Resume screening is locked</h1>
                <p>Your company profile must be approved first.</p>
                <Link to="/company/profile" className="company-button primary">
                    View Company Profile
                </Link>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="company-profile-page">
                <p>Loading resume screening...</p>
            </section>
        );
    }

    if (!application) {
        return (
            <section className="company-profile-page">
                <div className="company-alert error" role="alert">
                    {error || "Application not found."}
                </div>
                <Link to="/company/applications" className="company-button">
                    Back to Applications
                </Link>
            </section>
        );
    }

    const terminal =
        ["REJECTED", "SELECTED", "HIRED"].includes(application.status);

    return (
        <section className="company-profile-page">
            <div className="company-page-title">
                <div>
                    <span className="company-kicker">
                        RECRUITMENT / ROUND 1
                    </span>
                    <h1>Resume Screening</h1>
                    <p>Review candidate eligibility and resume skill matching.</p>
                </div>

                <Link
                    to={`/company/applications/${applicationId}`}
                    className="company-button"
                >
                    Back to Candidate
                </Link>
            </div>

            {error && (
                <div className="company-alert error" role="alert">
                    {error}
                </div>
            )}

            {message && (
                <div className="company-alert success" role="status">
                    {message}
                </div>
            )}

            <section className="company-data-row">
                <div>
                    <h2>
                        {application.studentName ||
                            `Student #${application.studentUserId ?? "—"}`}
                    </h2>
                    <p>{application.studentEmail || "Email unavailable"}</p>
                    <p>
                        Job: <strong>{application.jobTitle || "Untitled job"}</strong>
                    </p>
                    <p>Application ID: {applicationId}</p>
                </div>
                <StatusBadge status={application.status} />
            </section>

            {!screening ? (
                <div className="company-empty-state">
                    Screening information is unavailable.
                </div>
            ) : (
                <>
                    <section className="company-data-row">
                        <div>
                            <h2>Screening Result</h2>
                            <p>
                                Recommendation:{" "}
                                <strong>{screening.recommendation || "—"}</strong>
                            </p>
                            <p>
                                Skill match score:{" "}
                                <strong>
                                    {screening.matchScore ?? 0}%
                                </strong>
                            </p>
                            <p>
                                Eligibility:{" "}
                                <strong>
                                    {screening.eligible
                                        ? "Eligible"
                                        : "Eligibility requirements need review"}
                                </strong>
                            </p>
                        </div>
                    </section>

                    <section className="company-data-row">
                        <div>
                            <h3>Eligibility Review</h3>
                            {screening.reasons?.length ? (
                                <ul>
                                    {screening.reasons.map((reason, index) => (
                                        <li key={`${reason}-${index}`}>{reason}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No eligibility issues reported.</p>
                            )}
                        </div>
                    </section>

                    <section className="company-data-row">
                        <div>
                            <h3>Skills Found in Profile</h3>
                            {screening.matchedProfile?.length ? (
                                <ul>
                                    {screening.matchedProfile.map(skill => (
                                        <li key={skill}>{skill}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No matching profile skills reported.</p>
                            )}

                            <h3>Skills Found in Resume</h3>
                            {screening.matchedResume?.length ? (
                                <ul>
                                    {screening.matchedResume.map(skill => (
                                        <li key={skill}>{skill}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No matching resume skills reported.</p>
                            )}

                            <h3>Missing Skills</h3>
                            {screening.missingSkills?.length ? (
                                <ul>
                                    {screening.missingSkills.map(skill => (
                                        <li key={skill}>{skill}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No missing skills reported.</p>
                            )}
                        </div>
                    </section>
                </>
            )}

            <section className="company-data-row">
                <form onSubmit={submitDecision} className="round-decision-form">
                    <h2>Record Round 1 Decision</h2>

                    {terminal ? (
                        <p>
                            This application is already in a terminal status.
                            A new Round 1 decision cannot be submitted.
                        </p>
                    ) : (
                        <>
                            <label>
                                Decision
                                <select
                                    value={decision}
                                    onChange={event => setDecision(event.target.value)}
                                    disabled={saving}
                                >
                                    <option value="SHORTLISTED">
                                        Shortlist for Round 2
                                    </option>
                                    <option value="REJECTED">
                                        Reject candidate
                                    </option>
                                </select>
                            </label>

                            <label>
                                Evaluation score (0–100, optional)
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={score}
                                    onChange={event => setScore(event.target.value)}
                                    disabled={saving}
                                />
                            </label>

                            <label>
                                Feedback / reason
                                <textarea
                                    rows="4"
                                    maxLength="2000"
                                    value={feedback}
                                    onChange={event => setFeedback(event.target.value)}
                                    placeholder="Enter screening feedback..."
                                    disabled={saving}
                                />
                            </label>

                            <button
                                type="submit"
                                className="company-button primary"
                                disabled={saving || !screening}
                            >
                                {saving ? "Saving decision..." : "Save Decision"}
                            </button>
                        </>
                    )}
                </form>
            </section>
        </section>
    );
}

export default CompanyRoundOne;
