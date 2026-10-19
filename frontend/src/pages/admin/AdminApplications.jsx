
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/adminApi";
import "./AdminStudents.css";

const INITIAL_FILTERS = {
    search: "",
    company: "",
    jobTitle: "",
    status: "",
    dateFrom: "",
    dateTo: "",
};

const APPLICATION_STATUSES = [
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "REJECTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEWED",
    "SELECTED",
    "HIRED",
];

function formatStatus(status) {
    if (!status) return "Unknown";

    return status
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function AdminApplications() {
    const [applications, setApplications] = useState([]);
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadApplications = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            // This API method will be connected in the backend step.
            const data = await adminApi.getAllApplications();

            setApplications(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.message || "Unable to load applications."
            );
        } finally {
            setLoading(false);
        }
    }, []);

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

    const companies = useMemo(
        () =>
            [...new Set(
                applications
                    .map((application) => application.companyName)
                    .filter(Boolean)
            )].sort((a, b) => a.localeCompare(b)),
        [applications]
    );

    const jobTitles = useMemo(
        () =>
            [...new Set(
                applications
                    .map((application) => application.jobTitle)
                    .filter(Boolean)
            )].sort((a, b) => a.localeCompare(b)),
        [applications]
    );

    const statusCounts = useMemo(() => {
        const counts = { ALL: applications.length };

        APPLICATION_STATUSES.forEach((status) => {
            counts[status] = applications.filter(
                (application) => application.status === status
            ).length;
        });

        return counts;
    }, [applications]);

    const filteredApplications = useMemo(() => {
        const search = filters.search.trim().toLowerCase();

        return applications.filter((application) => {
            const matchesSearch =
                !search ||
                [
                    application.id,
                    application.studentUserId,
                    application.studentName,
                    application.studentEmail,
                    application.companyName,
                    application.jobTitle,
                ].some((value) =>
                    String(value ?? "").toLowerCase().includes(search)
                );

            const matchesCompany =
                !filters.company ||
                application.companyName === filters.company;

            const matchesJob =
                !filters.jobTitle ||
                application.jobTitle === filters.jobTitle;

            const matchesStatus =
                !filters.status ||
                application.status === filters.status;

            const appliedDate = application.appliedAt
                ? String(application.appliedAt).slice(0, 10)
                : "";

            const matchesFrom =
                !filters.dateFrom ||
                (appliedDate && appliedDate >= filters.dateFrom);

            const matchesTo =
                !filters.dateTo ||
                (appliedDate && appliedDate <= filters.dateTo);

            return (
                matchesSearch &&
                matchesCompany &&
                matchesJob &&
                matchesStatus &&
                matchesFrom &&
                matchesTo
            );
        });
    }, [applications, filters]);

    function clearFilters() {
        setFilters(INITIAL_FILTERS);
    }

    return (
        <section className="admin-applications-page">
            <header className="applications-heading">
                <div>
                    <p className="applications-eyebrow">
                        ADMINISTRATION
                    </p>
                    <h1>All Applications</h1>
                    <p className="applications-subtitle">
                        Monitor student applications and track recruitment
                        progress across companies.
                    </p>
                </div>

                <button
                    type="button"
                    className="applications-refresh-btn"
                    onClick={loadApplications}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "↻ Refresh"}
                </button>
            </header>

            {error && (
                <div className="applications-alert" role="alert">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="application-stat-grid">
                <article className="application-stat-card">
                    <span>Total Applications</span>
                    <strong>{applications.length}</strong>
                    <small>Across all available records</small>
                </article>

                <article className="application-stat-card">
                    <span>Under Review</span>
                    <strong>{statusCounts.UNDER_REVIEW || 0}</strong>
                    <small>Applications being reviewed</small>
                </article>

                <article className="application-stat-card">
                    <span>Shortlisted</span>
                    <strong>{statusCounts.SHORTLISTED || 0}</strong>
                    <small>Selected for the next stage</small>
                </article>

                <article className="application-stat-card">
                    <span>Hired</span>
                    <strong>{statusCounts.HIRED || 0}</strong>
                    <small>Successfully hired candidates</small>
                </article>
            </div>

            <div className="applications-toolbar">
                <div>
                    <h2>Application Records</h2>
                    <p>
                        Showing {filteredApplications.length} of{" "}
                        {applications.length} applications
                    </p>
                </div>

                <button
                    type="button"
                    className="applications-filter-toggle"
                    onClick={() => setShowFilters((visible) => !visible)}
                    aria-expanded={showFilters}
                    aria-controls="admin-application-filters"
                >
                    <span>☷</span>
                    {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
            </div>

            {showFilters && (
                <section
                    className="applications-filter-panel"
                    id="admin-application-filters"
                >
                    <div className="filter-panel-heading">
                        <div>
                            <h3>Filter Applications</h3>
                            <p>
                                Narrow results using the fields below.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="filter-clear-btn"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>

                    <div className="applications-filter-grid">
                        <label>
                            Search student or application
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={updateFilter}
                                placeholder="Student name, email or ID"
                            />
                        </label>

                        <label>
                            Company
                            <select
                                name="company"
                                value={filters.company}
                                onChange={updateFilter}
                            >
                                <option value="">All companies</option>
                                {companies.map((company) => (
                                    <option key={company} value={company}>
                                        {company}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Job title
                            <select
                                name="jobTitle"
                                value={filters.jobTitle}
                                onChange={updateFilter}
                            >
                                <option value="">All jobs</option>
                                {jobTitles.map((jobTitle) => (
                                    <option key={jobTitle} value={jobTitle}>
                                        {jobTitle}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Application status
                            <select
                                name="status"
                                value={filters.status}
                                onChange={updateFilter}
                            >
                                <option value="">All statuses</option>
                                {APPLICATION_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {formatStatus(status)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Applied from
                            <input
                                type="date"
                                name="dateFrom"
                                value={filters.dateFrom}
                                max={filters.dateTo || undefined}
                                onChange={updateFilter}
                            />
                        </label>

                        <label>
                            Applied to
                            <input
                                type="date"
                                name="dateTo"
                                value={filters.dateTo}
                                min={filters.dateFrom || undefined}
                                onChange={updateFilter}
                            />
                        </label>
                    </div>
                </section>
            )}

            <section className="applications-table-card">
                {loading ? (
                    <div className="applications-state">
                        <span className="applications-spinner" />
                        <p>Loading applications...</p>
                    </div>
                ) : error && applications.length === 0 ? (
                    <div className="applications-state">
                        <p>Applications could not be loaded.</p>
                        <button
                            type="button"
                            onClick={loadApplications}
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="applications-state">
                        <span className="applications-empty-icon">
                            ▤
                        </span>
                        <h3>No applications found</h3>
                        <p>
                            {applications.length === 0
                                ? "There are no application records to display yet."
                                : "Try changing your filters or clearing them."}
                        </p>
                        {applications.length > 0 && (
                            <button
                                type="button"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="applications-table-wrapper">
                        <table className="applications-table">
                            <thead>
                                <tr>
                                    <th>Application</th>
                                    <th>Student</th>
                                    <th>Job Position</th>
                                    <th>Company</th>
                                    <th>Applied Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredApplications.map((application) => (
                                    <tr key={application.id}>
                                        <td>
                                            <span className="application-id">
                                                #{application.id}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="application-student">
                                                <strong>
                                                    {application.studentName ||
                                                        `Student #${application.studentUserId ?? "—"}`}
                                                </strong>
                                                {application.studentEmail && (
                                                    <small>
                                                        {application.studentEmail}
                                                    </small>
                                                )}
                                                <small>
                                                    User ID:{" "}
                                                    {application.studentUserId ?? "—"}
                                                </small>
                                            </div>
                                        </td>

                                        <td>
                                            <strong>
                                                {application.jobTitle ||
                                                    `Job #${application.jobId ?? "—"}`}
                                            </strong>
                                        </td>

                                        <td>
                                            {application.companyName ||
                                                "Company unavailable"}
                                        </td>

                                        <td>
                                            {formatDate(application.appliedAt)}
                                        </td>

                                        <td>
                                            <span
                                                className={`application-status status-${String(
                                                    application.status || "unknown"
                                                ).toLowerCase()}`}
                                            >
                                                {formatStatus(application.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </section>
    );
}

export default AdminApplications;
