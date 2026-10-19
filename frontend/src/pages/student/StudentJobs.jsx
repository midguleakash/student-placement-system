
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { studentApi } from "../../services/studentApi";
import "./StudentProfile.css";

const initialFilters = {
    title: "",
    location: "",
    workMode: "",
    requiredSkills: "",
    minimumSalary: "",
    maximumSalary: "",
    minimumCgpa: "",
    maximumBacklogs: "",
    graduationYear: "",
    deadlineBefore: "",
};

function StudentJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [applyingId, setApplyingId] = useState(null);
    const [accessAllowed, setAccessAllowed] = useState(false);
    const [accessMessage, setAccessMessage] = useState("");
    const [filters, setFilters] = useState(initialFilters);
    const [showFilters, setShowFilters] = useState(false);

    const loadJobs = useCallback(async () => {
        setLoading(true);
        setError("");
        setAccessMessage("");

        try {
            const [profile, registration] = await Promise.all([
                studentApi.getMyProfile(),
                studentApi.getPlacementRegistration(),
            ]);

            const profileStatus = String(
                profile?.profileStatus ?? ""
            ).toUpperCase();

            const registrationStatus = String(
                registration?.placementRegistrationStatus ??
                registration?.status ??
                ""
            ).toUpperCase();

            if (profileStatus !== "APPROVED") {
                setAccessAllowed(false);
                setAccessMessage(
                    "Your student profile must be approved before you can access job openings."
                );
                setJobs([]);
                return;
            }

            if (registrationStatus !== "APPROVED") {
                setAccessAllowed(false);
                setAccessMessage(
                    "Your placement registration must be approved before you can access job openings."
                );
                setJobs([]);
                return;
            }

            setAccessAllowed(true);

            const result = await studentApi.getEligibleJobs();

            setJobs(
                Array.isArray(result)
                    ? result
                    : Array.isArray(result?.content)
                        ? result.content
                        : []
            );
        } catch (err) {
            setError(err.message || "Unable to load job openings.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    function handleFilterChange(event) {
        const { name, value } = event.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function resetFilters() {
        setFilters({ ...initialFilters });
    }

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const salary =
                job.salary == null || job.salary === ""
                    ? null
                    : Number(job.salary);

            const requiredCgpa =
                job.minimumCgpa == null || job.minimumCgpa === ""
                    ? null
                    : Number(job.minimumCgpa);

            const allowedBacklogs =
                job.maximumActiveBacklogs == null ||
                job.maximumActiveBacklogs === ""
                    ? null
                    : Number(job.maximumActiveBacklogs);

            const graduationYears = String(
                job.eligibleGraduationYears ?? ""
            );

            const deadline = job.applicationDeadline
                ? String(job.applicationDeadline).slice(0, 10)
                : "";

            const matchesTitle = String(job.title ?? "")
                .toLowerCase()
                .includes(filters.title.trim().toLowerCase());

            const matchesLocation = String(job.location ?? "")
                .toLowerCase()
                .includes(filters.location.trim().toLowerCase());

            const matchesWorkMode =
                !filters.workMode || job.workMode === filters.workMode;

            const matchesSkills = String(job.requiredSkills ?? "")
                .toLowerCase()
                .includes(filters.requiredSkills.trim().toLowerCase());

            const matchesMinimumSalary =
                !filters.minimumSalary ||
                (
                    salary !== null &&
                    Number.isFinite(salary) &&
                    salary >= Number(filters.minimumSalary)
                );

            const matchesMaximumSalary =
                !filters.maximumSalary ||
                (
                    salary !== null &&
                    Number.isFinite(salary) &&
                    salary <= Number(filters.maximumSalary)
                );

            const matchesCgpa =
                !filters.minimumCgpa ||
                (
                    requiredCgpa !== null &&
                    Number.isFinite(requiredCgpa) &&
                    requiredCgpa <= Number(filters.minimumCgpa)
                );

            const matchesBacklogs =
                !filters.maximumBacklogs ||
                (
                    allowedBacklogs !== null &&
                    Number.isFinite(allowedBacklogs) &&
                    allowedBacklogs >= Number(filters.maximumBacklogs)
                );

            const matchesGraduationYear =
                !filters.graduationYear ||
                graduationYears.includes(filters.graduationYear);

            const matchesDeadline =
                !filters.deadlineBefore ||
                (
                    Boolean(deadline) &&
                    deadline <= filters.deadlineBefore
                );

            return (
                matchesTitle &&
                matchesLocation &&
                matchesWorkMode &&
                matchesSkills &&
                matchesMinimumSalary &&
                matchesMaximumSalary &&
                matchesCgpa &&
                matchesBacklogs &&
                matchesGraduationYear &&
                matchesDeadline
            );
        });
    }, [jobs, filters]);

    async function handleApply(jobId) {
        const confirmed = window.confirm(
            "Are you sure you want to apply for this job?"
        );

        if (!confirmed) return;

        setApplyingId(jobId);
        setError("");
        setMessage("");

        try {
            await studentApi.applyForJob(jobId);

            setMessage("Application submitted successfully.");
            await loadJobs();
        } catch (err) {
            if (err.status === 409) {
                setMessage("");
                setError(
                    err.message ||
                    "You have already applied for this job."
                );
            } else {
                setError(
                    err.message ||
                    "Unable to submit your application."
                );
            }
        } finally {
            setApplyingId(null);
        }
    }

    function formatDate(value) {
        if (!value) return "Not specified";

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? value
            : date.toLocaleString("en-IN");
    }

    return (
        <div className="student-page">
            <section className="welcome-panel">
                <div>
                    <span className="section-kicker">
                        CAREER OPPORTUNITIES
                    </span>

                    <h1>Job Openings</h1>

                    <p>
                        Explore published jobs and find opportunities
                        that match your preferences.
                    </p>
                </div>
            </section>

            {loading ? (
                <section className="overview-card">
                    <p>Loading job openings...</p>
                </section>
            ) : !accessAllowed ? (
                <section className="overview-card">
                    <h2>Approval required</h2>
                    <p>{accessMessage}</p>

                    <Link
                        className="button button-secondary"
                        to="/student/dashboard"
                    >
                        Back to Dashboard
                    </Link>
                </section>
            ) : (
                <>
                    <section className="student-job-filters">
                        <div className="student-job-filter-heading">
                            <div>
                                <h2>Find Your Job</h2>
                                <p>
                                    Open the filters to find suitable
                                    opportunities.
                                </p>
                            </div>

                            <div className="student-job-filter-actions">
                                <button
                                    type="button"
                                    className="button button-secondary"
                                    onClick={() =>
                                        setShowFilters((previous) => !previous)
                                    }
                                    aria-expanded={showFilters}
                                    aria-controls="student-job-filter-fields"
                                >
                                    {showFilters
                                        ? "Hide Filters ▲"
                                        : "Show Filters ▼"}
                                </button>

                                <button
                                    type="button"
                                    className="button button-secondary"
                                    onClick={resetFilters}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        {showFilters && (
                            <div
                                className="student-job-filter-grid"
                                id="student-job-filter-fields"
                            >
                                <label>
                                    Job title
                                    <input
                                        name="title"
                                        value={filters.title}
                                        onChange={handleFilterChange}
                                        placeholder="e.g. Java Developer"
                                    />
                                </label>

                                <label>
                                    Location
                                    <input
                                        name="location"
                                        value={filters.location}
                                        onChange={handleFilterChange}
                                        placeholder="e.g. Pune"
                                    />
                                </label>

                                <label>
                                    Work mode
                                    <select
                                        name="workMode"
                                        value={filters.workMode}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">
                                            All work modes
                                        </option>
                                        <option value="ONSITE">
                                            On-site
                                        </option>
                                        <option value="HYBRID">
                                            Hybrid
                                        </option>
                                        <option value="REMOTE">
                                            Remote
                                        </option>
                                    </select>
                                </label>

                                <label>
                                    Required skills
                                    <input
                                        name="requiredSkills"
                                        value={filters.requiredSkills}
                                        onChange={handleFilterChange}
                                        placeholder="e.g. Java, SQL"
                                    />
                                </label>

                                <label>
                                    Minimum salary
                                    <input
                                        type="number"
                                        min="0"
                                        name="minimumSalary"
                                        value={filters.minimumSalary}
                                        onChange={handleFilterChange}
                                        placeholder="Minimum"
                                    />
                                </label>

                                <label>
                                    Maximum salary
                                    <input
                                        type="number"
                                        min="0"
                                        name="maximumSalary"
                                        value={filters.maximumSalary}
                                        onChange={handleFilterChange}
                                        placeholder="Maximum"
                                    />
                                </label>

                                <label>
                                    Your CGPA
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.01"
                                        name="minimumCgpa"
                                        value={filters.minimumCgpa}
                                        onChange={handleFilterChange}
                                        placeholder="e.g. 7.0"
                                    />
                                </label>

                                <label>
                                    Your active backlogs
                                    <input
                                        type="number"
                                        min="0"
                                        name="maximumBacklogs"
                                        value={filters.maximumBacklogs}
                                        onChange={handleFilterChange}
                                        placeholder="e.g. 0"
                                    />
                                </label>

                                <label>
                                    Graduation year
                                    <input
                                        type="number"
                                        name="graduationYear"
                                        value={filters.graduationYear}
                                        onChange={handleFilterChange}
                                        placeholder="e.g. 2026"
                                    />
                                </label>

                                <label>
                                    Deadline on or before
                                    <input
                                        type="date"
                                        name="deadlineBefore"
                                        value={filters.deadlineBefore}
                                        onChange={handleFilterChange}
                                    />
                                </label>
                            </div>
                        )}

                        <div className="student-job-filter-footer">
                            <span>
                                Showing {filteredJobs.length} of{" "}
                                {jobs.length} jobs
                            </span>

                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={loadJobs}
                                disabled={loading}
                            >
                                Refresh Jobs
                            </button>
                        </div>
                    </section>

                    {message && (
                        <div className="success-message" role="status">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-message" role="alert">
                            {error}
                        </div>
                    )}

                    {filteredJobs.length === 0 ? (
                        <section className="overview-card">
                            <h2>
                                {jobs.length === 0
                                    ? "No published jobs available"
                                    : "No jobs match your filters"}
                            </h2>

                            <p>
                                {jobs.length === 0
                                    ? "There are currently no published jobs available."
                                    : "Try changing your filters or clear them to see all available jobs."}
                            </p>

                            {jobs.length > 0 && (
                                <button
                                    type="button"
                                    className="button button-secondary"
                                    onClick={resetFilters}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </section>
                    ) : (
                        <section className="overview-card">
                            <div className="job-page-actions">
                                <h2>
                                    Available Jobs ({filteredJobs.length})
                                </h2>
                            </div>

                            <div className="student-job-list">
                                {filteredJobs.map((job) => {
                                    const jobId = job.id ?? job.jobId;

                                    return (
                                        <article
                                            className="student-job-card"
                                            key={jobId}
                                        >
                                            <div>
                                                <h3>
                                                    {job.title ?? job.jobTitle}
                                                </h3>

                                                <p>
                                                    {job.location ||
                                                        "Location not specified"}
                                                    {" · "}
                                                    {job.workMode ||
                                                        "Work mode not specified"}
                                                </p>
                                            </div>

                                            <p>{job.description}</p>

                                            <p>
                                                <strong>Required skills:</strong>{" "}
                                                {job.requiredSkills ||
                                                    "Not specified"}
                                            </p>

                                            <p>
                                                <strong>Minimum CGPA:</strong>{" "}
                                                {job.minimumCgpa ??
                                                    "Not specified"}
                                            </p>

                                            <p>
                                                <strong>
                                                    Maximum active backlogs:
                                                </strong>{" "}
                                                {job.maximumActiveBacklogs ??
                                                    "Not specified"}
                                            </p>

                                            <p>
                                                <strong>
                                                    Eligible graduation years:
                                                </strong>{" "}
                                                {job.eligibleGraduationYears ||
                                                    "Not specified"}
                                            </p>

                                            <p>
                                                <strong>Salary:</strong>{" "}
                                                {job.salary != null
                                                    ? job.salary
                                                    : "Not specified"}
                                            </p>

                                            <p>
                                                <strong>Vacancies:</strong>{" "}
                                                {job.vacancies ??
                                                    "Not specified"}
                                            </p>

                                            <p>
                                                <strong>
                                                    Application deadline:
                                                </strong>{" "}
                                                {formatDate(
                                                    job.applicationDeadline
                                                )}
                                            </p>

                                            <button
                                                type="button"
                                                className="button button-primary"
                                                disabled={
                                                    !jobId ||
                                                    applyingId === jobId ||
                                                    job.status !== "PUBLISHED"
                                                }
                                                onClick={() => handleApply(jobId)}
                                            >
                                                {applyingId === jobId
                                                    ? "Applying..."
                                                    : "Apply Now"}
                                            </button>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}

export default StudentJobs;
