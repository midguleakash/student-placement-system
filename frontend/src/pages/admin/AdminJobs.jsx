
import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/adminApi";
import "./AdminStudents.css";

const initialFilters = {
    title: "",
    companyId: "",
    status: "",
    location: "",
    workMode: "",
    salaryMin: "",
    salaryMax: "",
    createdFrom: "",
    createdTo: "",
    publishedFrom: "",
    publishedTo: "",
    deadlineFrom: "",
    deadlineTo: "",
    graduationYear: "",
    activeBacklogs: "",
    requiredSkills: "",
    vacanciesMin: "",
    vacanciesMax: "",
};

const statuses = ["DRAFT", "PUBLISHED", "CLOSED", "CANCELLED"];
const workModes = ["ONSITE", "HYBRID", "REMOTE"];

function includesText(value, search) {
    return String(value ?? "")
        .toLowerCase()
        .includes(search.trim().toLowerCase());
}

function dateMatches(value, from, to) {
    if (!value) return !from && !to;

    const date = String(value).slice(0, 10);

    return (!from || date >= from) && (!to || date <= to);
}

function AdminJobs() {
    const [jobs, setJobs] = useState([]);
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadJobs() {
            try {
                setLoading(true);
                setError("");

                const data = await adminApi.getAllJobs();

                if (active) {
                    setJobs(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (active) {
                    setError(err.message || "Unable to load jobs.");
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadJobs();

        return () => {
            active = false;
        };
    }, []);

    function updateFilter(event) {
        const { name, value } = event.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    const companies = useMemo(() => {
        return [...new Set(
            jobs.map((job) => job.companyId).filter((id) => id != null)
        )].sort((a, b) => Number(a) - Number(b));
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const salary = Number(job.salary);
            const vacancies = Number(job.vacancies);
            const backlogs = Number(job.maximumActiveBacklogs);
            const graduationYears = String(
                job.eligibleGraduationYears ?? ""
            );

            return (
                includesText(job.title, filters.title) &&
                (!filters.companyId ||
                    String(job.companyId) === filters.companyId) &&
                (!filters.status || job.status === filters.status) &&
                includesText(job.location, filters.location) &&
                (!filters.workMode || job.workMode === filters.workMode) &&
                (!filters.salaryMin ||
                    (Number.isFinite(salary) &&
                        salary >= Number(filters.salaryMin))) &&
                (!filters.salaryMax ||
                    (Number.isFinite(salary) &&
                        salary <= Number(filters.salaryMax))) &&
                dateMatches(
                    job.createdAt,
                    filters.createdFrom,
                    filters.createdTo
                ) &&
                dateMatches(
                    job.publishedAt,
                    filters.publishedFrom,
                    filters.publishedTo
                ) &&
                dateMatches(
                    job.applicationDeadline,
                    filters.deadlineFrom,
                    filters.deadlineTo
                ) &&
                (!filters.graduationYear ||
                    graduationYears.includes(filters.graduationYear)) &&
                (!filters.activeBacklogs ||
                    (Number.isFinite(backlogs) &&
                        backlogs <= Number(filters.activeBacklogs))) &&
                includesText(job.requiredSkills, filters.requiredSkills) &&
                (!filters.vacanciesMin ||
                    (Number.isFinite(vacancies) &&
                        vacancies >= Number(filters.vacanciesMin))) &&
                (!filters.vacanciesMax ||
                    (Number.isFinite(vacancies) &&
                        vacancies <= Number(filters.vacanciesMax)))
            );
        });
    }, [jobs, filters]);

    function resetFilters() {
        setFilters(initialFilters);
    }

    const countByStatus = (status) =>
        jobs.filter((job) => job.status === status).length;

    if (loading) {
        return <div className="admin-jobs-page">Loading jobs...</div>;
    }

    if (error) {
        return (
            <div className="admin-jobs-page">
                <h2>Job Openings</h2>
                <p className="admin-jobs-error">{error}</p>
                <button onClick={() => window.location.reload()}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="admin-jobs-page">
            <div className="admin-jobs-heading">
                <div>
                    <h2>Job Openings</h2>
                    <p>
                        Monitor job openings posted by all companies.
                    </p>
                </div>
                <span className="admin-jobs-total">
                    {filteredJobs.length} of {jobs.length} jobs
                </span>
            </div>

            <div className="admin-job-stats">
                <div className="admin-job-stat">
                    <span>Total jobs</span>
                    <strong>{jobs.length}</strong>
                </div>
                <div className="admin-job-stat">
                    <span>Published</span>
                    <strong>{countByStatus("PUBLISHED")}</strong>
                </div>
                <div className="admin-job-stat">
                    <span>Drafts</span>
                    <strong>{countByStatus("DRAFT")}</strong>
                </div>
                <div className="admin-job-stat">
                    <span>Closed / Cancelled</span>
                    <strong>
                        {countByStatus("CLOSED") +
                            countByStatus("CANCELLED")}
                    </strong>
                </div>
            </div>

            <section className="admin-job-filter-panel">
                <div className="admin-job-filter-heading">
                    <div>
                        <h3>Search and filters</h3>
                        <p>Combine filters to narrow down job records.</p>
                    </div>
                    <button
                        type="button"
                        className="admin-job-reset"
                        onClick={resetFilters}
                    >
                        Reset filters
                    </button>
                </div>

                <div className="admin-job-filter-grid">
                    <label>
                        Job title
                        <input
                            name="title"
                            value={filters.title}
                            onChange={updateFilter}
                            placeholder="Search title"
                        />
                    </label>

                    <label>
                        Company ID
                        <select
                            name="companyId"
                            value={filters.companyId}
                            onChange={updateFilter}
                        >
                            <option value="">All companies</option>
                            {companies.map((id) => (
                                <option key={id} value={id}>
                                    Company #{id}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Status
                        <select
                            name="status"
                            value={filters.status}
                            onChange={updateFilter}
                        >
                            <option value="">All statuses</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Location
                        <input
                            name="location"
                            value={filters.location}
                            onChange={updateFilter}
                            placeholder="Search location"
                        />
                    </label>

                    <label>
                        Work mode
                        <select
                            name="workMode"
                            value={filters.workMode}
                            onChange={updateFilter}
                        >
                            <option value="">All modes</option>
                            {workModes.map((mode) => (
                                <option key={mode} value={mode}>
                                    {mode}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Required skills
                        <input
                            name="requiredSkills"
                            value={filters.requiredSkills}
                            onChange={updateFilter}
                            placeholder="e.g. Java, SQL"
                        />
                    </label>

                    <label>
                        Minimum salary
                        <input
                            type="number"
                            min="0"
                            name="salaryMin"
                            value={filters.salaryMin}
                            onChange={updateFilter}
                        />
                    </label>

                    <label>
                        Maximum salary
                        <input
                            type="number"
                            min="0"
                            name="salaryMax"
                            value={filters.salaryMax}
                            onChange={updateFilter}
                        />
                    </label>

                    <label>
                        Eligible graduation year
                        <input
                            name="graduationYear"
                            value={filters.graduationYear}
                            onChange={updateFilter}
                            placeholder="e.g. 2026"
                        />
                    </label>

                    <label>
                        Maximum active backlogs
                        <input
                            type="number"
                            min="0"
                            name="activeBacklogs"
                            value={filters.activeBacklogs}
                            onChange={updateFilter}
                        />
                    </label>

                    <label>
                        Minimum vacancies
                        <input
                            type="number"
                            min="0"
                            name="vacanciesMin"
                            value={filters.vacanciesMin}
                            onChange={updateFilter}
                        />
                    </label>

                    <label>
                        Maximum vacancies
                        <input
                            type="number"
                            min="0"
                            name="vacanciesMax"
                            value={filters.vacanciesMax}
                            onChange={updateFilter}
                        />
                    </label>

                    <label>
                        Created from
                        <input
                            type="date"
                            name="createdFrom"
                            value={filters.createdFrom}
                            onChange={updateFilter}
                        />
                    </label>

                    <label>
                        Created to
                        <input
                            type="date"
                            name="createdTo"
                            value={filters.createdTo}
                            onChange={updateFilter}
                        />
                    </label>

                    <label>
                        Published from
                        <input
                            type="date"
                            name="publishedFrom"
                            value={filters.publishedFrom}
                            onChange={updateFilter}
                        />
                    </label>

                    <label>
                        Published to
                        <input
                            type="date"
                            name="publishedTo"
                            value={filters.publishedTo}
                            onChange={updateFilter}
                        />
                    </label>

                    <label>
                        Deadline from
                        <input
                            type="date"
                            name="deadlineFrom"
                            value={filters.deadlineFrom}
                            onChange={updateFilter}
                        />
                    </label>

                    <label>
                        Deadline to
                        <input
                            type="date"
                            name="deadlineTo"
                            value={filters.deadlineTo}
                            onChange={updateFilter}
                        />
                    </label>
                </div>
            </section>

            <section className="admin-job-table-panel">
                <div className="admin-job-table-heading">
                    <h3>All jobs</h3>
                    <span>{filteredJobs.length} results</span>
                </div>

                {filteredJobs.length === 0 ? (
                    <div className="admin-job-empty">
                        No jobs match the selected filters.
                    </div>
                ) : (
                    <div className="admin-job-table-scroll">
                        <table className="admin-job-table">
                            <thead>
                                <tr>
                                    <th>Job</th>
                                    <th>Company ID</th>
                                    <th>Location</th>
                                    <th>Salary</th>
                                    <th>Vacancies</th>
                                    <th>Deadline</th>
                                    <th>Status</th>
                                    <th>Work mode</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredJobs.map((job) => (
                                    <tr key={job.id}>
                                        <td>
                                            <strong>{job.title}</strong>
                                            <small>
                                                {job.requiredSkills || "—"}
                                            </small>
                                        </td>
                                        <td>
                                            {job.companyId ?? "—"}
                                        </td>
                                        <td>{job.location || "—"}</td>
                                        <td>{job.salary ?? "—"}</td>
                                        <td>{job.vacancies ?? "—"}</td>
                                        <td>
                                            {job.applicationDeadline
                                                ? new Date(
                                                      job.applicationDeadline
                                                  ).toLocaleString()
                                                : "—"}
                                        </td>
                                        <td>
                                            <span
                                                className={`admin-job-status status-${String(
                                                    job.status ?? ""
                                                ).toLowerCase()}`}
                                            >
                                                {job.status ?? "UNKNOWN"}
                                            </span>
                                        </td>
                                        <td>{job.workMode || "—"}</td>
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

export default AdminJobs;
