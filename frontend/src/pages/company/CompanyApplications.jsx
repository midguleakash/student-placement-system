
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { Link } from "react-router-dom";

import { useCompanyProfile } from "../../context/CompanyProfileContext";
import { companyApi } from "../../services/companyApi";
import StatusBadge from "../../components/company/StatusBadge";

import "./CompanyDashboard.css";
import "./CompanyApplications.css";

const INITIAL_FILTERS = {
    search: "",
    status: "",
    appliedFrom: "",
    appliedTo: "",
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

function getApplicationId(item) {
    return item.id ?? item.applicationId;
}

function getJobId(item) {
    return item.jobId ?? item.job?.id;
}

function getJobTitle(item) {
    return item.jobTitle ?? item.job?.title ?? item.title ?? "Untitled job";
}

function getStudentName(item) {
    return (
        item.studentName ??
        item.fullName ??
        item.student?.fullName ??
        item.student?.name ??
        item.name ??
        `Student #${item.studentUserId ?? item.studentId ?? "—"}`
    );
}

function getStudentEmail(item) {
    return (
        item.studentEmail ??
        item.email ??
        item.student?.email ??
        "Email unavailable"
    );
}


function filterApplications(applications, filters) {
    const search = String(filters.search ?? "")
        .trim()
        .toLowerCase();

    return applications.filter((item) => {
        const searchableText = [
            getStudentName(item),
            getStudentEmail(item),
            getApplicationId(item),
            getJobTitle?.(item) ?? item.jobTitle ?? item.job?.title ?? "",
            getStatus(item),
        ]
            .filter((value) => value != null)
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            search === "" || searchableText.includes(search);

        const status = getStatus(item);

        const matchesStatus =
            !filters.status || status === filters.status;

        const appliedDate = item.appliedAt
            ? new Date(item.appliedAt)
            : null;

        const validDate =
            appliedDate && !Number.isNaN(appliedDate.getTime());

        const matchesFrom =
            !filters.appliedFrom ||
            (validDate &&
                appliedDate >= new Date(
                    `${filters.appliedFrom}T00:00:00`
                ));

        const matchesTo =
            !filters.appliedTo ||
            (validDate &&
                appliedDate <= new Date(
                    `${filters.appliedTo}T23:59:59.999`
                ));

        return (
            matchesSearch &&
            matchesStatus &&
            matchesFrom &&
            matchesTo
        );
    });
}


function getStatus(item) {
    return String(item.status ?? "APPLIED").toUpperCase();
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleString();
}

function getRecords(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.applications)) return result.applications;
    if (Array.isArray(result?.content)) return result.content;
    return [];
}

function CompanyApplications() {
    const { profile } = useCompanyProfile();
    const approved = profile?.profileStatus === "APPROVED";

    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        applied: 0,
        shortlisted: 0,
        rejected: 0,
    });

    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const filteredApplications = useMemo(
        () => filterApplications(applications, filters),
        [applications, filters]
    );
    const [showFilters, setShowFilters] = useState(true);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState("");
    const [statsError, setStatsError] = useState("");

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
            setApplications(getRecords(result));
        } catch (err) {
            setError(err.message || "Unable to load applications.");
            setApplications([]);
        } finally {
            setLoading(false);
        }
    }, [approved]);

    const loadStats = useCallback(async () => {
        if (!approved) {
            setStats({
                total: 0,
                applied: 0,
                shortlisted: 0,
                rejected: 0,
            });
            setStatsLoading(false);
            return;
        }

        setStatsLoading(true);
        setStatsError("");

        try {
            const result = await companyApi.getApplicationStats();

            setStats({
                total: Number(result?.total ?? 0),
                applied: Number(result?.applied ?? 0),
                shortlisted: Number(result?.shortlisted ?? 0),
                rejected: Number(result?.rejected ?? 0),
            });
        } catch (err) {
            setStatsError(
                err.message || "Unable to load application statistics."
            );
        } finally {
            setStatsLoading(false);
        }
    }, [approved]);

    useEffect(() => {
        loadApplications();
    }, [loadApplications]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const counts = useMemo(() => ({
        total: stats.total,
        applied: stats.applied,
        shortlisted: stats.shortlisted,
        rejected: stats.rejected,
    }), [stats]);

    function updateFilter(event) {
        const { name, value } = event.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function clearFilters() {
        setFilters({ ...INITIAL_FILTERS });
    }

    async function refresh() {
        await Promise.all([loadApplications(), loadStats()]);
    }

    if (!approved) {
        return (
            <section className="company-profile-page">
                <div className="company-page-state">
                    <h1>Applications are locked</h1>
                    <p>
                        Your company profile must be approved before
                        you can manage student applications.
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
                    <h1>All Applications</h1>
                    <p>
                        Review and manage applications across all your jobs.
                    </p>
                </div>

                <button
                    type="button"
                    className="company-button"
                    onClick={refresh}
                    disabled={loading || statsLoading}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="company-alert error" role="alert">
                    {error}
                </div>
            )}

            {statsError && (
                <div className="company-alert error" role="alert">
                    {statsError}
                </div>
            )}

            <div className="company-application-stats">
                <article className="company-application-stat">
                    <span>Total Applications</span>
                    <strong>{statsLoading ? "…" : counts.total}</strong>
                </article>

                <article className="company-application-stat">
                    <span>New / Applied</span>
                    <strong>{statsLoading ? "…" : counts.applied}</strong>
                </article>

                <article className="company-application-stat">
                    <span>Shortlisted</span>
                    <strong>{statsLoading ? "…" : counts.shortlisted}</strong>
                </article>

                <article className="company-application-stat">
                    <span>Rejected</span>
                    <strong>{statsLoading ? "…" : counts.rejected}</strong>
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
                            onClick={clearFilters}
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

                        <label>
                            Application status
                            <select
                                name="status"
                                value={filters.status}
                                onChange={updateFilter}
                            >
                                <option value="">All statuses</option>
                                {STATUSES.map((status) => (
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
                        {loading
                            ? "Loading applications..."
                            : `Showing ${filteredApplications.length} filtered applications`}
                    </span>
                </div>
            </section>

            {loading ? (
                <div className="company-page-loading">
                    Loading applications...
                </div>
            ) : filteredApplications.length === 0 ? (
                <div className="company-empty-state">
                    <h3>No applications found</h3>
                    <p>
                        Try changing your filters, or clear them to see
                        more applications.
                    </p>
                    <button
                        type="button"
                        className="company-button"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="company-application-list">
                    {filteredApplications.map((item) => {
                        const id = getApplicationId(item);
                        const jobId = getJobId(item);

                        return (
                            <article
                                className="company-application-card"
                                key={id ?? `${jobId}-${getStudentEmail(item)}`}
                            >
                                <div className="company-application-card-main">
                                    <div className="company-application-avatar">
                                        {getStudentName(item).charAt(0).toUpperCase()}
                                    </div>

                                    <div className="company-application-person">
                                        <h3>{getStudentName(item)}</h3>
                                        <p>{getStudentEmail(item)}</p>
                                        <p>
                                            Applied for:{" "}
                                            <strong>{getJobTitle(item)}</strong>
                                        </p>
                                        <p>
                                            Application ID: {id ?? "—"}
                                            {" · "}
                                            Applied: {formatDate(item.appliedAt)}
                                        </p>

                                        {item.statusRemarks && (
                                            <p>Remarks: {item.statusRemarks}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="company-application-card-actions">
                                    <StatusBadge status={getStatus(item)} />

                                    {jobId != null && (
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
