
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { companyApi } from "../../services/companyApi";
import "./CompanyRoundThree.css";

function getRounds(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.rounds)) return result.rounds;
    if (Array.isArray(result?.content)) return result.content;
    return [];
}

function getApplications(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.applications)) return result.applications;
    if (Array.isArray(result?.content)) return result.content;
    return [];
}

function getApplicationId(application) {
    return application?.id ?? application?.applicationId;
}

function CompanyRoundThree() {
    const { applicationId } = useParams();

    const [round, setRound] = useState(null);
    const [application, setApplication] = useState(null);

    const [feedback, setFeedback] = useState("");
    const [score, setScore] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadRound = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [roundsResult, applicationsResult] = await Promise.all([
                companyApi.getApplicationRounds(applicationId),
                companyApi.getMyApplications(),
            ]);

            const rounds = getRounds(roundsResult);
            const savedRound = rounds.find(
                item => Number(item.roundNumber) === 3
            );

            const applications = getApplications(applicationsResult);
            const foundApplication = applications.find(
                item =>
                    String(getApplicationId(item)) === String(applicationId)
            );

            if (!foundApplication) {
                throw new Error(
                    "Application not found or you do not have access to it."
                );
            }

            setApplication(foundApplication);
            setRound(savedRound || null);

            if (savedRound) {
                setFeedback(savedRound.feedback || "");
                setScore(
                    savedRound.score == null
                        ? ""
                        : String(savedRound.score)
                );
            }
        } catch (err) {
            setError(err.message || "Unable to load HR interview.");
        } finally {
            setLoading(false);
        }
    }, [applicationId]);

    useEffect(() => {
        loadRound();
    }, [loadRound]);

    const roundStatus = String(round?.status || "").toUpperCase();

    const evaluated = ["SHORTLISTED", "REJECTED", "COMPLETED"].includes(
        roundStatus
    );

    const terminal = ["REJECTED", "SELECTED", "HIRED"].includes(
        String(application?.status || "").toUpperCase()
    );

    async function startRound() {
        setSaving(true);
        setError("");
        setMessage("");

        try {
            await companyApi.createRoundThree(applicationId);
            setMessage("HR interview is ready.");
            await loadRound();
        } catch (err) {
            setError(err.message || "Unable to start Round 3.");
        } finally {
            setSaving(false);
        }
    }

    function validateForm() {
        if (score.trim() === "") {
            setError("Enter an HR interview score between 0 and 100.");
            return false;
        }

        const numericScore = Number(score);

        if (
            !Number.isFinite(numericScore) ||
            numericScore < 0 ||
            numericScore > 100
        ) {
            setError("Score must be between 0 and 100.");
            return false;
        }

        if (!feedback.trim()) {
            setError("Please enter HR interview feedback.");
            return false;
        }

        return true;
    }

    async function submitDecision(decision) {
        setError("");
        setMessage("");

        if (evaluated || terminal) {
            setError("This round has already been evaluated or the application is closed.");
            return;
        }

        if (!validateForm()) return;

        setSaving(true);

        try {
            await companyApi.decideRoundThree(applicationId, {
                decision,
                feedback: feedback.trim(),
                score: Number(score),
            });

            setMessage(
                decision === "SHORTLISTED"
                    ? "Candidate selected successfully. Application status is SELECTED."
                    : "Candidate rejected at the HR interview stage."
            );

            await loadRound();
        } catch (err) {
            setError(err.message || "Unable to save the HR interview decision.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="round-three-page">
                <p>Loading HR interview...</p>
            </main>
        );
    }

    return (
        <main className="round-three-page">
            <header className="round-three-header">
                <div>
                    <p className="round-three-kicker">
                        RECRUITMENT / ROUND 3
                    </p>
                    <h1>HR Interview</h1>
                    <p>
                        Application ID: <strong>{applicationId}</strong>
                    </p>
                </div>

                <Link
                    to={`/company/applications/${applicationId}`}
                    className="round-three-back"
                >
                    Back to Candidate
                </Link>
            </header>

            {error && (
                <div className="round-three-alert error" role="alert">
                    {error}
                </div>
            )}

            {message && (
                <div className="round-three-alert success" role="status">
                    {message}
                </div>
            )}

            <section className="round-three-card">
                <h2>Final Interview Evaluation</h2>

                <p>
                    Assess communication, teamwork, role expectations,
                    availability, and final suitability.
                </p>

                {round && (
                    <div className="round-three-alert success">
                        Round 3 status: <strong>{roundStatus}</strong>
                    </div>
                )}

                {evaluated ? (
                    <>
                        <h3>Saved Decision</h3>
                        <p>
                            Decision: <strong>{roundStatus}</strong>
                        </p>
                        <p>
                            Score: <strong>{round?.score ?? "Not recorded"}</strong>
                        </p>
                        <p>
                            Feedback:{" "}
                            <strong>{round?.feedback || "No feedback recorded."}</strong>
                        </p>
                        <p>This round cannot be evaluated again.</p>
                    </>
                ) : terminal ? (
                    <p>
                        This application is already closed with status{" "}
                        <strong>{application?.status}</strong>. No further
                        evaluation is allowed.
                    </p>
                ) : !round ? (
                    <>
                        <p
                            style={{ marginBottom: "20px" }}>
                            Round 3 can start only after the candidate passes
                            Round 2. The backend must validate this requirement.
                        </p>
                        <button
                            type="button"
                            onClick={startRound}
                            disabled={saving}
                            className="round-three-button"

                        >
                            {saving ? "Please wait..." : "Start HR Interview"}
                        </button>
                    </>
                ) : (
                    <form
                        className="round-three-form"
                        onSubmit={event => {
                            event.preventDefault();
                            submitDecision("SHORTLISTED");
                        }}
                    >
                        <label>
                            HR interview score (0–100)
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={score}
                                onChange={event => setScore(event.target.value)}
                                required
                            />
                        </label>

                        <label>
                            HR interview feedback
                            <textarea
                                value={feedback}
                                onChange={event => setFeedback(event.target.value)}
                                rows="5"
                                maxLength="2000"
                                placeholder="Enter communication assessment, availability, and final recommendation..."
                                required
                            />
                        </label>

                        <div className="round-three-actions">
                            <button
                                type="submit"
                                disabled={saving}
                                className="round-three-button"
                            >
                                {saving ? "Saving..." : "Select Candidate"}
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => submitDecision("REJECTED")}
                                className="round-three-button danger"
                            >
                                Reject Candidate
                            </button>
                        </div>
                    </form>
                )}

                <div>
                    <button
                        type="button"
                        className="round-three-button"
                        style={{ marginTop: "16px" }}
                        disabled={saving}
                        onClick={loadRound}
                    >
                        Refresh Round Status
                    </button>

                </div>
            </section>
        </main>
    );
}

export default CompanyRoundThree;
