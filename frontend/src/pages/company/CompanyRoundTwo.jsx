import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { companyApi } from "../../services/companyApi";
import "./CompanyRoundTwo.css";

function CompanyRoundTwo() {
    const { applicationId } = useParams();

    const [feedback, setFeedback] = useState("");
    const [score, setScore] = useState("");
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function startRound() {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            await companyApi.createRoundTwo(applicationId);
            setStarted(true);
            setMessage("Technical interview round is ready.");
        } catch (err) {
            setError(err.message || "Unable to start Round 2.");
        } finally {
            setLoading(false);
        }
    }

    async function submitDecision(event) {
        event.preventDefault();
        setError("");
        setMessage("");

        const numericScore = Number(score);

        if (
            score.trim() === "" ||
            !Number.isFinite(numericScore) ||
            numericScore < 0 ||
            numericScore > 100
        ) {
            setError("Enter a score between 0 and 100.");
            return;
        }

        if (!feedback.trim()) {
            setError("Please enter interview feedback.");
            return;
        }

        setLoading(true);

        try {
            await companyApi.decideRoundTwo(applicationId, {
                decision: "SHORTLISTED",
                feedback: feedback.trim(),
                score: numericScore,
            });

            setMessage(
                "Technical interview completed. Candidate shortlisted for Round 3."
            );
            setStarted(false);
        } catch (err) {
            setError(err.message || "Unable to save the interview decision.");
        } finally {
            setLoading(false);
        }
    }

    async function rejectCandidate() {
        if (!feedback.trim()) {
            setError("Enter a rejection reason in the feedback field.");
            return;
        }

        const numericScore = Number(score);

        if (
            score.trim() === "" ||
            !Number.isFinite(numericScore) ||
            numericScore < 0 ||
            numericScore > 100
        ) {
            setError("Enter a score between 0 and 100.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            await companyApi.decideRoundTwo(applicationId, {
                decision: "REJECTED",
                feedback: feedback.trim(),
                score: numericScore,
            });

            setMessage("Candidate rejected at the technical interview stage.");
            setStarted(false);
        } catch (err) {
            setError(err.message || "Unable to save the rejection.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="round-two-page">
            <header className="round-two-header">
                <div>
                    <p className="round-two-kicker">RECRUITMENT / ROUND 2</p>
                    <h1>Technical Interview</h1>
                    <p>
                        Application ID: <strong>{applicationId}</strong>
                    </p>
                </div>

                <Link
                    to={`/company/applications/${applicationId}`}
                    className="round-two-back"
                >
                    Back to Candidate
                </Link>
            </header>

            {error && (
                <div className="round-two-alert error" role="alert">
                    {error}
                </div>
            )}

            {message && (
                <div className="round-two-alert success" role="status">
                    {message}
                </div>
            )}

            <section className="round-two-card">
                <h2>Technical Evaluation</h2>

                <p>
                    Start this round only after the candidate has passed
                    Round 1. The backend validates this requirement.
                </p>

                {!started ? (
                    <button
                        type="button"
                        onClick={startRound}
                        disabled={loading}
                        className="round-two-button"
                    >
                        {loading ? "Please wait..." : "Start Technical Interview"}
                    </button>
                ) : (
                    <form
                        className="round-two-form"
                        onSubmit={submitDecision}
                    >
                        <label>
                            Interview score (0–100)
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
                            Interview feedback
                            <textarea
                                value={feedback}
                                onChange={event => setFeedback(event.target.value)}
                                rows="5"
                                maxLength="2000"
                                placeholder="Evaluate Java, OOP, SQL, problem-solving, projects..."
                                required
                            />
                        </label>

                        <div className="round-two-actions">
                            <button
                                type="submit"
                                disabled={loading}
                                className="round-two-button"
                            >
                                {loading
                                    ? "Saving..."
                                    : "Shortlist for Round 3"}
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={rejectCandidate}
                                className="round-two-button danger"
                            >
                                Reject Candidate
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </main>
    );
}

export default CompanyRoundTwo;