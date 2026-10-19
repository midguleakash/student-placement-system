
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

const STATUSES = [
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "REJECTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEWED",
    "SELECTED",
    "HIRED",
];

function includesText(value, search) {
    return String(value ?? "")
        .toLowerCase()
        .includes(search.trim().toLowerCase());
}

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

    return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleString("en-IN");
}

function dateMatches(value, from, to) {
    if (!from && !to) return true;
    if (!value) return false;

    const date = String(value).slice(0, 10);

    return (!from || date >= from) && (!to || date <= to);
}

export default function AdminApplications() {
    const [applications, setApplications] = useState([]);
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

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

    function resetFilters() {
        setFilters({ ...INITIAL_FILTERS });
    }

    const companies = useMemo(
        () =>
            [...new Set(
                applications
                    .map((application) => application.companyName)
                    .filter(Boolean)
            )].sort(),
        [applications]
    );

    const jobTitles = useMemo(
        () =>
            [...new Set(
                applications
                    .map((application) => application.jobTitle)
                    .filter(Boolean)
            )].sort(),
        [applications]
    );

    const filteredApplications = useMemo(() => {
        return applications.filter((application) => {
            const matchesSearch =
                !filters.search ||
                [
                    application.id,
                    application.jobId,
                    application.studentUserId,
                    application.studentName,
                    application.studentEmail,
                    application.companyName,
                    application.jobTitle,
                ].some((value) =>
                    includesText(value, filters.search)
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

            const matchesFrom = dateMatches(
                application.appliedAt,
                filters.dateFrom,
                ""
            );

            const matchesTo = dateMatches(
                application.appliedAt,
                "",
                filters.dateTo
            );

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

    const countByStatus = (status) =>
        applications.filter(
            (application) => application.status === status
        ).length;

    return (
        <div className="admin-applications-page">
            <div className="admin-applications-heading">
                <div>
                    <p className="admin-applications-eyebrow">
                        ADMINISTRATION
                    </p>
                    <h2>All Applications</h2>
                    <p>
                        Monitor student applications across all companies
                        and track recruitment progress.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-applications-refresh"
                    onClick={loadApplications}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "↻ Refresh"}
                </button>
            </div>

            {error && (
                <div className="admin-applications-error" role="alert">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={loadApplications}
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="admin-application-stats">
                <div className="admin-application-stat">
                    <span>Total Applications</span>
                    <strong>{applications.length}</strong>
                </div>

                <div className="admin-application-stat">
                    <span>Under Review</span>
                    <strong>{countByStatus("UNDER_REVIEW")}</strong>
                </div>

                <div className="admin-application-stat">
                    <span>Shortlisted</span>
                    <strong>{countByStatus("SHORTLISTED")}</strong>
                </div>

                <div className="admin-application-stat">
                    <span>Hired</span>
                    <strong>{countByStatus("HIRED")}</strong>
                </div>
            </div>

            <section className="admin-application-table-panel">
                <div className="admin-application-table-heading">
                    <div>
                        <h3>Application Records</h3>
                        <p>
                            Showing {filteredApplications.length} of{" "}
                            {applications.length} applications
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-application-filter-toggle"
                        onClick={() =>
                            setShowFilters((previous) => !previous)
                        }
                        aria-expanded={showFilters}
                        aria-controls="admin-application-filters"
                    >
                        {showFilters ? "Hide Filters" : "Show Filters"}
                        <span>{showFilters ? "▲" : "▼"}</span>
                    </button>
                </div>

                {showFilters && (
                    <section
                        className="admin-application-filter-panel"
                        id="admin-application-filters"
                    >
                        <div className="admin-application-filter-heading">
                            <div>
                                <h3>Search and Filters</h3>
                                <p>
                                    Combine filters to narrow down
                                    application records.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="admin-application-reset"
                                onClick={resetFilters}
                            >
                                Reset Filters
                            </button>
                        </div>

                        <div className="admin-application-filter-grid">
                            <label>
                                Search student or application
                                <input
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
                                        <option
                                            key={company}
                                            value={company}
                                        >
                                            {company}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Job Title
                                <select
                                    name="jobTitle"
                                    value={filters.jobTitle}
                                    onChange={updateFilter}
                                >
                                    <option value="">All jobs</option>
                                    {jobTitles.map((job) => (
                                        <option key={job} value={job}>
                                            {job}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Application Status
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={updateFilter}
                                >
                                    <option value="">All statuses</option>
                                    {STATUSES.map((status) => (
                                        <option
                                            key={status}
                                            value={status}
                                        >
                                            {formatStatus(status)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Applied From
                                <input
                                    type="date"
                                    name="dateFrom"
                                    value={filters.dateFrom}
                                    max={filters.dateTo || undefined}
                                    onChange={updateFilter}
                                />
                            </label>

                            <label>
                                Applied To
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

                {loading ? (
                    <div className="admin-application-empty">
                        Loading applications...
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="admin-application-empty">
                        <h3>No applications found</h3>
                        <p>
                            {applications.length === 0
                                ? "No application records are available."
                                : "Try changing your filters or resetting them."}
                        </p>

                        {applications.length > 0 && (
                            <button
                                type="button"
                                onClick={resetFilters}
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="admin-application-table-scroll">
                        <table className="admin-application-table">
                            <thead>
                                <tr>
                                    <th>Application ID</th>
                                    <th>Student User ID</th>
                                    <th>Job Title</th>
                                    <th>Company</th>
                                    <th>Applied At</th>
                                    <th>Updated At</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredApplications.map((application) => (
                                    <tr key={application.id}>
                                        <td>#{application.id ?? "—"}</td>

                                        <td>
                                            {application.studentUserId ?? "—"}
                                        </td>

                                        <td>
                                            {application.jobTitle ||
                                                `Job #${application.jobId ?? "—"}`}
                                        </td>

                                        <td>
                                            {application.companyName ||
                                                "Company unavailable"}
                                        </td>

                                        <td>
                                            {formatDate(application.appliedAt)}
                                        </td>

                                        <td>
                                            {formatDate(application.updatedAt)}
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-application-status status-${String(
                                                    application.status ?? "unknown"
                                                ).toLowerCase()}`}
                                            >
                                                {formatStatus(application.status)}
                                            </span>
                                        </td>

                                        <td>
                                            {application.statusRemarks || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
