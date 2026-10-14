
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useCompanyProfile } from "../../context/CompanyProfileContext";
import { companyApi } from "../../services/companyApi";
import StatusBadge from "../../components/company/StatusBadge";

function CompanyJobs() {
    const { profile } = useCompanyProfile();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const approved = profile?.profileStatus === "APPROVED";

    useEffect(() => {
        let cancelled = false;

        async function loadJobs() {
            if (!approved) return;

            setLoading(true);

            try {
                const result = await companyApi.getMyJobs();

                if (!cancelled) {
                    setJobs(
                        Array.isArray(result) ? result : result.jobs || []
                    );
                    setError("");
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Unable to load jobs.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadJobs();

        return () => {
            cancelled = true;
        };
    }, [approved]);

    if (!approved) {
        return (
            <div className="company-profile-page">
                <div className="company-page-state">
                    <div className="company-state-icon">🔒</div>
                    <h1>Job posting is locked</h1>
                    <p>
                        Complete your company profile and receive admin
                        approval before publishing jobs.
                    </p>
                    <StatusBadge status={profile?.profileStatus} />
                    <Link
                        to="/company/profile"
                        className="company-button primary"
                    >
                        View Company Profile
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="company-profile-page">
            <div className="company-page-title">
                <div>
                    <span className="company-kicker">RECRUITMENT</span>
                    <h1>Job Openings</h1>
                    <p>Manage jobs published by your company.</p>
                </div>

                <button
                    type="button"
                    className="company-button primary"
                    onClick={() =>
                        setError(
                            "Job creation will be connected in the backend implementation."
                        )
                    }
                >
                    + Create Job
                </button>
            </div>

            {error && <div className="company-alert info">{error}</div>}

            {loading ? (
                <p>Loading jobs...</p>
            ) : jobs.length === 0 ? (
                <div className="company-empty-state">
                    <span>▣</span>
                    <h3>No job openings yet</h3>
                    <p>Your published job openings will appear here.</p>
                </div>
            ) : (
                <div className="company-data-list">
                    {jobs.map((job) => (
                        <div
                            className="company-data-row"
                            key={job.id || job.jobId}
                        >
                            <div>
                                <strong>{job.title || job.jobTitle}</strong>
                                <small>
                                    {job.location || "Location not specified"}
                                </small>
                            </div>
                            <StatusBadge status={job.status || "PUBLISHED"} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CompanyJobs;
