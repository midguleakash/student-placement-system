
import { useState } from "react";
import { Link } from "react-router-dom";
import { studentApi } from "../../services/studentApi";
import { useStudentProfile } from "../../context/StudentProfileContext";

function PlacementRegistration() {
    const {
        profile,
        loading,
        refreshPlacementRegistration,
    } = useStudentProfile();

    const [accepted, setAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    if (loading) {
        return <div className="page-loading">Loading placement registration...</div>;
    }
    const profileApproved = profile?.profileStatus === "APPROVED";
    const status =
        profile?.placementRegistrationStatus || "NOT_REGISTERED";

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!accepted) {
            setError("Please accept the placement policy.");
            return;
        }

        setSubmitting(true);

        try {
            await studentApi.registerForPlacement();
            await refreshPlacementRegistration();
            setAccepted(false);
            setMessage("Placement registration submitted successfully.");
        } catch (err) {
            setError(err.message || "Unable to submit registration.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="student-page">
            <section className="page-title-row">
                <div>
                    <span className="section-kicker">PLACEMENT PROCESS</span>
                    <h1>Placement Registration</h1>
                    <p>Request access to placement opportunities.</p>
                </div>
            </section>

            {error && <div className="notice notice-error">{error}</div>}
            {message && <div className="notice notice-success">{message}</div>}

            <section className="profile-form-card">
                {!profileApproved ? (
                    <>
                        <h2>Profile approval required</h2>
                        <p>Your student profile must be approved first.</p>
                        <Link to="/student/profile" className="button button-primary">
                            View Profile
                        </Link>
                    </>
                ) : (
                    <>
                        <h2>
                            Registration status: {status.replaceAll("_", " ")}
                        </h2>

                        {status === "APPROVED" && (
                            <p>Your placement registration is approved.</p>
                        )}

                        {status === "PENDING" && (
                            <p>
                                Your request is awaiting admin approval.
                                Jobs and applications remain locked.
                            </p>
                        )}

                        {status === "REJECTED" && (
                            <>
                                <p>Your registration needs attention.</p>
                                {profile.placementRejectionRemarks && (
                                    <p>
                                        <strong>Admin remarks:</strong>{" "}
                                        {profile.placementRejectionRemarks}
                                    </p>
                                )}
                            </>
                        )}

                        {status !== "APPROVED" && status !== "PENDING" && (
                            <form onSubmit={handleSubmit}>
                                <p>
                                    Confirm that you want to participate in
                                    placements and agree to follow the
                                    institution's placement policy.
                                </p>

                                <label className="placement-policy-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={accepted}
                                        onChange={(event) => setAccepted(event.target.checked)}
                                    />
                                    <span>I accept the placement policy.</span>
                                </label>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="button button-primary"
                                        disabled={!accepted || submitting}
                                    >
                                        {submitting
                                            ? "Submitting..."
                                            : status === "REJECTED"
                                                ? "Register Again"
                                                : "Register for Placement"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}

export default PlacementRegistration;
