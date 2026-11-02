import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/adminApi";
import "./AdminJobs.css";

function getValue(...values) {
    return values.find(
        value => value !== undefined && value !== null && value !== ""
    );
}

function getJobTitle(job) {
    return getValue(job.jobTitle, job.title, job.position, job.role, "Untitled Job");
}

function getCompanyName(job) {
    return getValue(
        job.companyName,
        job.company?.companyName,
        job.company?.name,
        job.company?.user?.username,
        job.company?.username,
        "Company not specified"
    );
}

function getLocation(job) {
    return getValue(
        job.location,
        job.jobLocation,
        job.city,
        job.workLocation,
        "Not specified"
    );
}

function getJobStatus(job) {
    return String(
        getValue(job.status, job.jobStatus, job.approvalStatus, "UNKNOWN")
    ).toUpperCase();
}

function getEmploymentType(job) {
    return getValue(
        job.employmentType,
        job.jobType,
        job.type,
        "Not specified"
    );
}

function getPostedDate(job) {
    return getValue(job.createdAt, job.postedAt, job.createdDate, job.updatedAt);
}

function formatDate(dateValue) {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatSalary(job) {
    const minimum = getValue(job.minSalary, job.salaryMin);
    const maximum = getValue(job.maxSalary, job.salaryMax);
    const salary = getValue(job.salary, job.salaryRange, job.ctc);

    if (minimum != null && maximum != null) {
        return `₹${minimum} - ₹${maximum}`;
    }

    if (salary != null) {
        return String(salary);
    }

    return "Not specified";
}

function getJobId(job) {
    return getValue(job.id, job.jobId);
}

function normalizeJobs(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.content)) {
        return response.content;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.jobs)) {
        return response.jobs;
    }

    return [];
}

function AdminJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [employmentFilter, setEmploymentFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState("NEWEST");

    const loadJobs = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await adminApi.getAllJobs();
            setJobs(normalizeJobs(response));
        } catch (err) {
            setError(err.message || "Unable to load jobs.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    const statusOptions = useMemo(() => {
        return [
            ...new Set(jobs.map(getJobStatus)),
        ].sort();
    }, [jobs]);

    const employmentOptions = useMemo(() => {
        return [
            ...new Set(
                jobs.map(job => String(getEmploymentType(job)))
            ),
        ].sort();
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        const result = jobs.filter(job => {
            const searchableText = [
                getJobTitle(job),
                getCompanyName(job),
                getLocation(job),
                getEmploymentType(job),
                getJobStatus(job),
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch = searchableText.includes(searchText);

            const matchesStatus =
                statusFilter === "ALL" ||
                getJobStatus(job) === statusFilter;

            const matchesEmployment =
                employmentFilter === "ALL" ||
                String(getEmploymentType(job)) === employmentFilter;

            return matchesSearch && matchesStatus && matchesEmployment;
        });

        return result.sort((a, b) => {
            const dateA = new Date(getPostedDate(a) || 0).getTime();
            const dateB = new Date(getPostedDate(b) || 0).getTime();

            return sortOrder === "OLDEST"
                ? dateA - dateB
                : dateB - dateA;
        });
    }, [jobs, search, statusFilter, employmentFilter, sortOrder]);

    const stats = useMemo(() => {
        return {
            total: jobs.length,
            open: jobs.filter(job =>
                ["OPEN", "PUBLISHED", "ACTIVE"].includes(getJobStatus(job))
            ).length,
            draft: jobs.filter(job =>
                getJobStatus(job) === "DRAFT"
            ).length,
            closed: jobs.filter(job =>
                ["CLOSED", "EXPIRED"].includes(getJobStatus(job))
            ).length,
        };
    }, [jobs]);

    function resetFilters() {
        setSearch("");
        setStatusFilter("ALL");
        setEmploymentFilter("ALL");
        setSortOrder("NEWEST");
    }

    return (
        <main className="admin-jobs-page">
            <header className="admin-jobs-header">
                <div>
                    <span className="admin-jobs-eyebrow">
                        ADMINISTRATION
                    </span>

                    <h1>Job Management</h1>

                    <p>
                        View and monitor job openings posted by registered
                        companies.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-jobs-refresh"
                    onClick={loadJobs}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "↻ Refresh Jobs"}
                </button>
            </header>

            {error && (
                <div className="admin-jobs-alert" role="alert">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={loadJobs}
                        disabled={loading}
                    >
                        Retry
                    </button>
                </div>
            )}

            <section className="admin-jobs-stats">
                <article className="admin-jobs-stat-card">
                    <span>Total Jobs</span>
                    <strong>{stats.total}</strong>
                </article>

                <article className="admin-jobs-stat-card">
                    <span>Open Jobs</span>
                    <strong>{stats.open}</strong>
                </article>

                <article className="admin-jobs-stat-card">
                    <span>Draft Jobs</span>
                    <strong>{stats.draft}</strong>
                </article>

                <article className="admin-jobs-stat-card">
                    <span>Closed Jobs</span>
                    <strong>{stats.closed}</strong>
                </article>
            </section>

            <section className="admin-jobs-panel">
                <div className="admin-jobs-panel-heading">
                    <div>
                        <h2>All Job Openings</h2>

                        <p>
                            {loading
                                ? "Loading job openings..."
                                : `${filteredJobs.length} of ${jobs.length} jobs`}
                        </p>
                    </div>
                </div>

                <div className="admin-jobs-filters">
                    <div className="admin-jobs-search">
                        <label htmlFor="admin-job-search">
                            Search jobs
                        </label>

                        <input
                            id="admin-job-search"
                            type="search"
                            placeholder="Search title, company, location..."
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                        />
                    </div>

                    <div className="admin-jobs-filter">
                        <label htmlFor="admin-job-status">
                            Job Status
                        </label>

                        <select
                            id="admin-job-status"
                            value={statusFilter}
                            onChange={event =>
                                setStatusFilter(event.target.value)
                            }
                        >
                            <option value="ALL">All Statuses</option>

                            {statusOptions.map(status => (
                                <option key={status} value={status}>
                                    {status.replaceAll("_", " ")}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-jobs-filter">
                        <label htmlFor="admin-job-type">
                            Employment Type
                        </label>

                        <select
                            id="admin-job-type"
                            value={employmentFilter}
                            onChange={event =>
                                setEmploymentFilter(event.target.value)
                            }
                        >
                            <option value="ALL">All Types</option>

                            {employmentOptions.map(type => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-jobs-filter">
                        <label htmlFor="admin-job-sort">
                            Sort By
                        </label>

                        <select
                            id="admin-job-sort"
                            value={sortOrder}
                            onChange={event =>
                                setSortOrder(event.target.value)
                            }
                        >
                            <option value="NEWEST">Newest First</option>
                            <option value="OLDEST">Oldest First</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        className="admin-jobs-reset"
                        onClick={resetFilters}
                    >
                        Reset Filters
                    </button>
                </div>

                {loading ? (
                    <div className="admin-jobs-state">
                        <div className="admin-jobs-spinner" />
                        <p>Loading job openings...</p>
                    </div>
                ) : !error && filteredJobs.length === 0 ? (
                    <div className="admin-jobs-state">
                        <div className="admin-jobs-empty-icon">⌕</div>

                        <h3>
                            {jobs.length === 0
                                ? "No jobs available"
                                : "No matching jobs found"}
                        </h3>

                        <p>
                            {jobs.length === 0
                                ? "Jobs posted by companies will appear here."
                                : "Try changing your search or filters."}
                        </p>

                        {jobs.length > 0 && (
                            <button
                                type="button"
                                className="admin-jobs-reset"
                                onClick={resetFilters}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : !error ? (
                    <div className="admin-jobs-table-wrapper">
                        <table className="admin-jobs-table">
                            <thead>
                                <tr>
                                    <th>Job Details</th>
                                    <th>Company</th>
                                    <th>Location</th>
                                    <th>Employment</th>
                                    <th>Salary</th>
                                    <th>Posted Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredJobs.map((job, index) => {
                                    const id = getJobId(job);
                                    const status = getJobStatus(job);

                                    return (
                                        <tr
                                            key={id ?? `job-${index}`}
                                        >
                                            <td>
                                                <div className="admin-jobs-title">
                                                    {getJobTitle(job)}
                                                </div>

                                                <small>
                                                    Job ID: {id ?? "N/A"}
                                                </small>
                                            </td>

                                            <td>
                                                {getCompanyName(job)}
                                            </td>

                                            <td>
                                                {getLocation(job)}
                                            </td>

                                            <td>
                                                {getEmploymentType(job)}
                                            </td>

                                            <td>
                                                {formatSalary(job)}
                                            </td>

                                            <td>
                                                {formatDate(getPostedDate(job))}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        "admin-jobs-status " +
                                                        status.toLowerCase()
                                                    }
                                                >
                                                    {status.replaceAll("_", " ")}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </section>
        </main>
    );
}

export default AdminJobs;