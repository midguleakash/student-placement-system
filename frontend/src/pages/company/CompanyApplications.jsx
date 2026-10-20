
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

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

function getAppliedDay(date) {
    if (!date) return "";

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
}

function CompanyApplications() {
    const { profile } = useCompanyProfile();
    const { jobId: routeJobId } = useParams();
    const [searchParams] = useSearchParams();

    // Supports both /company/applications?jobId=5
    // and /company/jobs/5/applicants.
    const selectedJobId =
        routeJobId ?? searchParams.get("jobId") ?? "";

    const isJobSpecific = Boolean(routeJobId || searchParams.get("jobId"));
    const approved = profile?.profileStatus === "APPROVED";

    const [applications, setApplications] = useState([]);
    const [job, setJob] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [showFilters, setShowFilters] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
            setError(err.message || "Unable to load applications.");
            setApplications([]);
        } finally {
            setLoading(false);
        }
    }, [approved]);

    useEffect(() => {
        loadApplications();
    }, [loadApplications]);

    // Fetch the job separately so its title appears even when
    // no students have applied yet.
    useEffect(() => {
        let cancelled = false;

        async function loadJob() {
            setJob(null);

            if (!selectedJobId || !approved) return;

            try {
                const result = await companyApi.getMyJob(selectedJobId);

                if (!cancelled) {
                    setJob(result?.job ?? result);
                }
            } catch {
                // The application list can still be displayed.
                // The heading will fall back to the job ID.
            }
        }

        loadJob();

        return () => {
            cancelled = true;
        };
    }, [selectedJobId, approved]);

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

    const selectedJob = useMemo(() => {
        if (!selectedJobId) return null;

        const applicationJob = jobOptions.find(
            (item) => item.id === String(selectedJobId)
        );

        return {
            id: selectedJobId,
            title:
                job?.title ??
                applicationJob?.title ??
                `Job #${selectedJobId}`,
        };
    }, [selectedJobId, job, jobOptions]);

    // Restrict the list to the selected job first, then apply
    // the user's filters.
    const jobApplications = useMemo(() => {
        if (!selectedJobId) return applications;

        return applications.filter(
            (application) =>
                String(getJobId(application)) === String(selectedJobId)
        );
    }, [applications, selectedJobId]);

    const filteredApplications = useMemo(() => {
        const search = filters.search.trim().toLowerCase();
        const titleFilter = filters.jobTitle.trim().toLowerCase();

        return jobApplications.filter((application) => {
            const jobTitle = getJobTitle(application);
            const studentName = getStudentName(application);
            const studentEmail = getStudentEmail(application);
            const status = getStatus(application);
            const appliedDate = getAppliedDate(application);
            const appliedDay = getAppliedDay(appliedDate);

            const searchableText = [
                studentName,
                studentEmail,
                jobTitle,
                getJobId(application),
                getApplicationId(application),
            ]
                .join(" ")
                .toLowerCase();

            return (
                (!search || searchableText.includes(search)) &&
                jobTitle.toLowerCase().includes(titleFilter) &&
                (!filters.status || status === filters.status) &&
                (!filters.appliedFrom ||
                    (appliedDay && appliedDay >= filters.appliedFrom)) &&
                (!filters.appliedTo ||
                    (appliedDay && appliedDay <= filters.appliedTo))
            );
        });
    }, [jobApplications, filters]);

    const counts = useMemo(() => ({
        total: filteredApplications.length,
        applied: filteredApplications.filter(
            (item) => getStatus(item) === "APPLIED"
        ).length,
        shortlisted: filteredApplications.filter(
            (item) => getStatus(item) === "SHORTLISTED"
        ).length,
        rejected: filteredApplications.filter(
            (item) => getStatus(item) === "REJECTED"
        ).length,
    }), [filteredApplications]);

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

    return (
        <section className="company-profile-page">
            <div className="company-page-title">
                <div>
                    <span className="company-kicker">RECRUITMENT</span>

                    <h1>
                        {isJobSpecific ? "Job Applicants" : "All Applications"}
                    </h1>

                    <p>
                        {isJobSpecific
                            ? `Review and filter applicants for ${selectedJob?.title ?? `Job #${selectedJobId}`}.`
                            : "Review and manage applications submitted to your job openings."}
                    </p>
                </div>

                <div className="company-application-header-actions">
                    {isJobSpecific && (
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

            {isJobSpecific && (
                <div className="selected-job-banner">
                    <div>
                        <span>YOU ARE REVIEWING APPLICANTS FOR</span>
                        <h2>
                            {selectedJob?.title ?? `Job #${selectedJobId}`}
                        </h2>
                        <p>Job ID: {selectedJobId}</p>
                    </div>

                    <Link
                        to="/company/jobs"
                        className="company-button"
                    >
                        Back to Jobs
                    </Link>
                </div>
            )}

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
                            Find applicants by student, status, or application date.
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
                        >
                            {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
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
                    <div className="company-application-filter-grid">
                        <label>
                            Student, email, or application ID
                            <input
                                name="search"
                                value={filters.search}
                                onChange={updateFilter}
                                placeholder="Search applicants..."
                            />
                        </label>

                        {!isJobSpecific && (
                            <label>
                                Job title
                                <input
                                    name="jobTitle"
                                    value={filters.jobTitle}
                                    onChange={updateFilter}
                                    placeholder="Filter by job title"
                                />
                            </label>
                        )}

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
                        {jobApplications.length} applications
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
                        {jobApplications.length === 0
                            ? isJobSpecific
                                ? "No applicants for this job yet"
                                : "No applications available"
                            : "No applications match your filters"}
                    </h3>

                    <p>
                        {jobApplications.length === 0
                            ? isJobSpecific
                                ? "Student applications for this job will appear here when students apply."
                                : "Applications will appear here when students apply to your published jobs."
                            : "Try changing your filters or clearing them to see more applications."}
                    </p>

                    {jobApplications.length > 0 && (
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
                        const studentName = getStudentName(application);

                        return (
                            <article
                                className="company-application-card"
                                key={id ?? `${jobId}-${getStudentEmail(application)}`}
                            >
                                <div className="company-application-card-main">
                                    <div className="company-application-avatar">
                                        {studentName.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="company-application-person">
                                        <h3>{studentName}</h3>

                                        <p>{getStudentEmail(application)}</p>

                                        {!isJobSpecific && (
                                            <p>
                                                Applied for:{" "}
                                                <strong>{getJobTitle(application)}</strong>
                                            </p>
                                        )}

                                        <p>
                                            Application ID: {id ?? "—"}
                                            {" · "}
                                            Applied: {formatDate(appliedDate)}
                                        </p>

                                        {application.statusRemarks && (
                                            <p>
                                                Remarks: {application.statusRemarks}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="company-application-card-actions">
                                    <StatusBadge status={status} />

                                    {!isJobSpecific && jobId != null && (
                                        <Link
                                            to={`/company/jobs/${jobId}/applicants`}
                                            className="company-button"
                                        >
                                            View Job Applicants
                                        </Link>
                                    )}

                                    {id != null && (
                                        <Link
                                            to={`/company/applications/${id}`}
                                            className="company-button primary"
                                        >
                                            View Candidate
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
