
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { companyApi } from "../../services/companyApi";
import "./CompanyRoundTwo.css";

function getRounds(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.rounds)) return result.rounds;
    if (Array.isArray(result?.content)) return result.content;
    return [];
}

function CompanyRoundTwo() {
    const { applicationId } = useParams();

    const [feedback, setFeedback] = useState("");
    const [score, setScore] = useState("");
    const [round, setRound] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadRound = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const result =
                await companyApi.getApplicationRounds(applicationId);

            const rounds = getRounds(result);
            const savedRound = rounds.find(
                item => Number(item.roundNumber) === 2
            );

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
            setError(err.message || "Unable to load Round 2 history.");
        } finally {
            setLoading(false);
        }
    }, [applicationId]);

    useEffect(() => {
        loadRound();
    }, [loadRound]);

    const status = String(round?.status || "").toUpperCase();
    const evaluated = ["SHORTLISTED", "REJECTED", "COMPLETED"].includes(status);
    const terminal = ["REJECTED", "SELECTED", "HIRED"].includes(
        String(round?.application?.status || "").toUpperCase()
    );

    async function startRound() {
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const result = await companyApi.createRoundTwo(applicationId);

            setRound(previous => result || previous);
            setMessage("Technical interview round is ready.");
            await loadRound();
        } catch (err) {
            setError(err.message || "Unable to start Round 2.");
        } finally {
            setSaving(false);
        }
    }

    async function submitDecision(decision) {
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

        if (evaluated || terminal) {
            setError("This round has already been evaluated or the application is closed.");
            return;
        }

        setSaving(true);

        try {
            await companyApi.decideRoundTwo(applicationId, {
                decision,
                feedback: feedback.trim(),
                score: numericScore,
            });

            setMessage(
                decision === "SHORTLISTED"
                    ? "Candidate shortlisted for Round 3."
                    : "Candidate rejected at the technical interview stage."
            );

            await loadRound();
        } catch (err) {
            setError(err.message || "Unable to save the decision.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <main className="round-two-page">Loading Round 2...</main>;
    }

    return (
        <main className="round-two-page">
            <header className="round-two-header">
                <div>
                    <p className="round-two-kicker">RECRUITMENT / ROUND 2</p>
                    <h1>Technical Interview</h1>
                    <p>Application ID: <strong>{applicationId}</strong></p>
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

                {round && (
                    <div className="round-two-alert success">
                        Saved Round 2 status: <strong>{status}</strong>
                    </div>
                )}

                {evaluated ? (
                    <>
                        <p>
                            This round has already been evaluated.
                            Its saved decision cannot be submitted again.
                        </p>
                        <p><strong>Score:</strong> {round?.score ?? "Not recorded"}</p>
                        <p><strong>Feedback:</strong> {round?.feedback || "No feedback recorded."}</p>
                    </>
                ) : terminal ? (
                    <p>This application is closed. No further evaluation is allowed.</p>
                ) : !round ? (
                    <>
                        <p>
                            Start Round 2 only after the candidate passes
                            Round 1. The backend must validate this requirement.
                        </p>
                        <button
                            type="button"
                            onClick={startRound}
                            disabled={saving}
                            className="round-two-button"
                        >
                            {saving ? "Please wait..." : "Start Technical Interview"}
                        </button>
                    </>
                ) : (
                    <form
                        className="round-two-form"
                        onSubmit={event => {
                            event.preventDefault();
                            submitDecision("SHORTLISTED");
                        }}
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
                                disabled={saving}
                                className="round-two-button"
                            >
                                {saving ? "Saving..." : "Shortlist for Round 3"}
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => submitDecision("REJECTED")}
                                className="round-two-button danger"
                            >
                                Reject Candidate
                            </button>
                        </div>
                    </form>
                )}

                <button
                    type="button"
                    className="round-two-button"
                    disabled={saving}
                    onClick={loadRound}
                    style={{ marginTop: "16px" }}
                >
                    Refresh Round Status
                </button>
            </section>
        </main>
    );
}

export default CompanyRoundTwo;
