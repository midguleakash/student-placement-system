
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useCompanyProfile } from "../../context/CompanyProfileContext";
import { companyApi } from "../../services/companyApi";
import StatusBadge from "../../components/company/StatusBadge";
import "./CompanyDashboard.css";
import "./CompanyApplications.css";

const initialFilters = {
    search: "",
    jobTitle: "",
    status: "",
    appliedFrom: "",
    appliedTo: "",
};

const applicationStatuses = [
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "REJECTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEWED",
    "SELECTED",
    "HIRED",
];

function getApplicationId(application) {
    return application.id ?? application.applicationId;
}

function getJobId(application) {
    return application.jobId ?? application.job?.id;
}

function getJobTitle(application) {
    return (
        application.jobTitle ??
        application.job?.title ??
        application.title ??
        "Untitled job"
    );
}

function getStudentName(application) {
    return (
        application.studentName ??
        application.fullName ??
        application.student?.fullName ??
        application.student?.name ??
        application.name ??
        `Student #${application.studentUserId ?? application.studentId ?? "—"}`
    );
}

function getStudentEmail(application) {
    return (
        application.studentEmail ??
        application.email ??
        application.student?.email ??
        "Email unavailable"
    );
}

function getStatus(application) {
    return String(application.status ?? "APPLIED").toUpperCase();
}

function getAppliedDate(application) {
    const value = application.appliedAt ?? application.createdAt;

    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date) {
    return date ? date.toLocaleString() : "—";
}

function CompanyApplications() {
    const { profile } = useCompanyProfile();
    const [searchParams] = useSearchParams();

    const selectedJobId = searchParams.get("jobId");

    const [applications, setApplications] = useState([]);
    const [filters, setFilters] = useState(initialFilters);
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const approved = profile?.profileStatus === "APPROVED";

    const loadApplications = useCallback(async () => {
        if (!approved) {
            setApplications([]);
            setLoading(false);
            return;
        }

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

            setApplications(records);
        } catch (err) {
            setError(
                err.message || "Unable to load applications."
            );
        } finally {
            setLoading(false);
        }
    }, [approved]);

    useEffect(() => {
        loadApplications();
    }, [loadApplications]);

    function updateFilter(event) {
        const { name, value } = event.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function resetFilters() {
        setFilters({ ...initialFilters });
    }

    const jobOptions = useMemo(() => {
        const uniqueJobs = new Map();

        applications.forEach((application) => {
            const id = getJobId(application);

            if (id != null) {
                uniqueJobs.set(String(id), {
                    id: String(id),
                    title: getJobTitle(application),
                });
            }
        });

        return Array.from(uniqueJobs.values()).sort((a, b) =>
            a.title.localeCompare(b.title)
        );
    }, [applications]);

    const filteredApplications = useMemo(() => {
        const search = filters.search.trim().toLowerCase();
        const titleFilter = filters.jobTitle.trim().toLowerCase();

        return applications.filter((application) => {
            const jobId = getJobId(application);
            const jobTitle = getJobTitle(application);
            const studentName = getStudentName(application);
            const studentEmail = getStudentEmail(application);
            const status = getStatus(application);
            const appliedDate = getAppliedDate(application);

            const searchableText = [
                studentName,
                studentEmail,
                jobTitle,
                jobId,
            ]
                .join(" ")
                .toLowerCase();

            const appliedDay = appliedDate
                ? [
                    appliedDate.getFullYear(),
                    String(appliedDate.getMonth() + 1).padStart(2, "0"),
                    String(appliedDate.getDate()).padStart(2, "0"),
                ].join("-")
                : "";

            return (
                (!selectedJobId ||
                    String(jobId) === String(selectedJobId)) &&
                (!search || searchableText.includes(search)) &&
                jobTitle.toLowerCase().includes(titleFilter) &&
                (!filters.status || status === filters.status) &&
                (!filters.appliedFrom ||
                    (appliedDay && appliedDay >= filters.appliedFrom)) &&
                (!filters.appliedTo ||
                    (appliedDay && appliedDay <= filters.appliedTo))
            );
        });
    }, [applications, filters, selectedJobId]);

    const counts = useMemo(() => {
        const records = filteredApplications;

        return {
            total: records.length,
            applied: records.filter(
                (item) => getStatus(item) === "APPLIED"
            ).length,
            shortlisted: records.filter(
                (item) => getStatus(item) === "SHORTLISTED"
            ).length,
            rejected: records.filter(
                (item) => getStatus(item) === "REJECTED"
            ).length,
        };
    }, [filteredApplications]);

    if (!approved) {
        return (
            <section className="company-profile-page">
                <div className="company-page-state">
                    <div className="company-state-icon">🔒</div>
                    <h1>Applications are locked</h1>
                    <p>
                        Your company profile must be approved before you
                        can manage student applications.
                    </p>
                    <StatusBadge status={profile?.profileStatus} />
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

    const selectedJob = jobOptions.find(
        (job) => job.id === String(selectedJobId)
    );

    return (
        <section className="company-profile-page">
            <div className="company-page-title">
                <div>
                    <span className="company-kicker">
                        RECRUITMENT
                    </span>

                    <h1>
                        {selectedJobId
                            ? "Job Applicants"
                            : "All Applications"}
                    </h1>

                    <p>
                        {selectedJobId
                            ? `Review applications for ${
                                selectedJob?.title ??
                                `Job #${selectedJobId}`
                            }.`
                            : "Review and manage applications submitted to your job openings."}
                    </p>
                </div>

                <div className="company-application-header-actions">
                    {selectedJobId && (
                        <Link
                            to="/company/applications"
                            className="company-button"
                        >
                            View All Applications
                        </Link>
                    )}

                    <button
                        type="button"
                        className="company-button"
                        onClick={loadApplications}
                        disabled={loading}
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="company-alert error" role="alert">
                    {error}
                </div>
            )}

            <div className="company-application-stats">
                <article className="company-application-stat">
                    <span>Total Applications</span>
                    <strong>{counts.total}</strong>
                </article>

                <article className="company-application-stat">
                    <span>New / Applied</span>
                    <strong>{counts.applied}</strong>
                </article>

                <article className="company-application-stat">
                    <span>Shortlisted</span>
                    <strong>{counts.shortlisted}</strong>
                </article>

                <article className="company-application-stat">
                    <span>Rejected</span>
                    <strong>{counts.rejected}</strong>
                </article>
            </div>

            <section className="company-application-filters">
                <div className="company-application-filter-heading">
                    <div>
                        <h2>Search and Filter Applications</h2>
                        <p>
                            Find applicants by student, job, status,
                            or application date.
                        </p>
                    </div>

                    <div className="company-application-filter-actions">
                        <button
                            type="button"
                            className="company-button company-filter-toggle"
                            onClick={() =>
                                setShowFilters((previous) => !previous)
                            }
                            aria-expanded={showFilters}
                            aria-controls="company-application-filter-fields"
                        >
                            {showFilters
                                ? "Hide Filters ▲"
                                : "Show Filters ▼"}
                        </button>

                        <button
                            type="button"
                            className="company-button"
                            onClick={resetFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div
                        id="company-application-filter-fields"
                        className="company-application-filter-grid"
                    >
                        <label>
                            Student, email, or job
                            <input
                                name="search"
                                value={filters.search}
                                onChange={updateFilter}
                                placeholder="Search applicants..."
                            />
                        </label>

                        <label>
                            Job title
                            <input
                                name="jobTitle"
                                value={filters.jobTitle}
                                onChange={updateFilter}
                                placeholder="Filter by job title"
                            />
                        </label>

                        <label>
                            Application status
                            <select
                                name="status"
                                value={filters.status}
                                onChange={updateFilter}
                            >
                                <option value="">All statuses</option>
                                {applicationStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status.replaceAll("_", " ")}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Applied from
                            <input
                                type="date"
                                name="appliedFrom"
                                value={filters.appliedFrom}
                                onChange={updateFilter}
                                max={filters.appliedTo || undefined}
                            />
                        </label>

                        <label>
                            Applied to
                            <input
                                type="date"
                                name="appliedTo"
                                value={filters.appliedTo}
                                onChange={updateFilter}
                                min={filters.appliedFrom || undefined}
                            />
                        </label>
                    </div>
                )}

                <div className="company-application-filter-footer">
                    <span>
                        Showing {filteredApplications.length} of{" "}
                        {applications.filter(
                            (application) =>
                                !selectedJobId ||
                                String(getJobId(application)) ===
                                    String(selectedJobId)
                        ).length}{" "}
                        applications
                    </span>

                    {showFilters && (
                        <button
                            type="button"
                            className="company-button"
                            onClick={resetFilters}
                        >
                            Reset All Filters
                        </button>
                    )}
                </div>
            </section>

            {loading ? (
                <div className="company-page-loading">
                    Loading applications...
                </div>
            ) : filteredApplications.length === 0 ? (
                <div className="company-empty-state">
                    <h3>
                        {applications.length === 0
                            ? "No applications available"
                            : "No applications match your filters"}
                    </h3>

                    <p>
                        {applications.length === 0
                            ? "Applications will appear here when students apply to your published jobs."
                            : "Try changing the filters or clearing them to see more applications."}
                    </p>

                    {applications.length > 0 && (
                        <button
                            type="button"
                            className="company-button"
                            onClick={resetFilters}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="company-application-list">
                    {filteredApplications.map((application) => {
                        const id = getApplicationId(application);
                        const jobId = getJobId(application);
                        const status = getStatus(application);
                        const appliedDate = getAppliedDate(application);

                        return (
                            <article
                                className="company-application-card"
                                key={id ?? `${jobId}-${getStudentEmail(application)}`}
                            >
                                <div className="company-application-card-main">
                                    <div className="company-application-avatar">
                                        {getStudentName(application)
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div className="company-application-person">
                                        <h3>
                                            {getStudentName(application)}
                                        </h3>
                                        <p>
                                            {getStudentEmail(application)}
                                        </p>
                                        <p>
                                            Applied for:{" "}
                                            <strong>{getJobTitle(application)}</strong>
                                        </p>
                                        <p>
                                            Application ID: {id ?? "—"}
                                            {" · "}
                                            Applied: {formatDate(appliedDate)}
                                        </p>

                                        {application.statusRemarks && (
                                            <p>
                                                Remarks:{" "}
                                                {application.statusRemarks}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="company-application-card-actions">
                                    <StatusBadge status={status} />

                                    {jobId != null && (
                                        <Link
                                            to={`/company/applications?jobId=${jobId}`}
                                            className="company-button"
                                        >
                                            View Job Applicants
                                        </Link>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default CompanyApplications;
