
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { companyApi } from "../../services/companyApi";

const initialForm = {
    title: "",
    description: "",
    requiredSkills: "",
    minimumCgpa: "",
    maximumActiveBacklogs: "0",
    eligibleGraduationYears: "",
    salary: "",
    location: "",
    workMode: "ONSITE",
    vacancies: "1",
    applicationDeadline: "",
};

function toLocalDateTimeInput(value) {
    if (!value) return "";

    // Convert ISO LocalDateTime to the value format expected by datetime-local.
    return value.slice(0, 16);
}

function CompanyJobForm() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const editing = Boolean(jobId);

    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!editing) return;

        let cancelled = false;

        async function loadJob() {
            try {
                const job = await companyApi.getMyJob(jobId);

                if (cancelled) return;

                setForm({
                    title: job.title ?? "",
                    description: job.description ?? "",
                    requiredSkills: job.requiredSkills ?? "",
                    minimumCgpa: job.minimumCgpa ?? "",
                    maximumActiveBacklogs:
                        job.maximumActiveBacklogs ?? "",
                    eligibleGraduationYears:
                        job.eligibleGraduationYears ?? "",
                    salary: job.salary ?? "",
                    location: job.location ?? "",
                    workMode: job.workMode ?? "ONSITE",
                    vacancies: job.vacancies ?? "1",
                    applicationDeadline: toLocalDateTimeInput(
                        job.applicationDeadline
                    ),
                });
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Unable to load job.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadJob();

        return () => {
            cancelled = true;
        };
    }, [editing, jobId]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const deadline = new Date(form.applicationDeadline);

        if (
            !form.applicationDeadline ||
            Number.isNaN(deadline.getTime()) ||
            deadline <= new Date()
        ) {
            setError("Please select a future application deadline.");
            return;
        }

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            requiredSkills: form.requiredSkills.trim(),
            minimumCgpa:
                form.minimumCgpa === ""
                    ? null
                    : Number(form.minimumCgpa),
            maximumActiveBacklogs:
                form.maximumActiveBacklogs === ""
                    ? null
                    : Number(form.maximumActiveBacklogs),
            eligibleGraduationYears:
                form.eligibleGraduationYears.trim() || null,
            salary: form.salary === "" ? null : Number(form.salary),
            location: form.location.trim() || null,
            workMode: form.workMode,
            vacancies: Number(form.vacancies),
            // LocalDateTime expects a string such as 2027-01-31T17:00:00.
            applicationDeadline: `${form.applicationDeadline}:00`,
        };

        setSaving(true);

        try {
            if (editing) {
                await companyApi.updateJob(jobId, payload);
            } else {
                await companyApi.createJob(payload);
            }

            navigate("/company/jobs");
        } catch (err) {
            setError(err.message || "Unable to save job.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="page-loading">Loading job...</div>;
    }

    return (
        <section className="company-profile-page">
            <div className="company-page-title">
                <div>
                    <span className="company-kicker">RECRUITMENT</span>
                    <h1>{editing ? "Edit Job" : "Create Job Opening"}</h1>
                    <p>
                        Add the role details, eligibility criteria and
                        application deadline.
                    </p>
                </div>
                <Link to="/company/jobs" className="company-button">
                    Back to Jobs
                </Link>
            </div>

            {error && <div className="company-alert error">{error}</div>}

            <form className="job-form" onSubmit={handleSubmit}>
                <label>
                    Job title *
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        maxLength={150}
                        required
                    />
                </label>

                <label>
                    Job description *
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        maxLength={5000}
                        rows={6}
                        required
                    />
                </label>

                <label>
                    Required skills *
                    <textarea
                        name="requiredSkills"
                        value={form.requiredSkills}
                        onChange={handleChange}
                        maxLength={2000}
                        rows={3}
                        placeholder="Java, Spring Boot, SQL"
                        required
                    />
                </label>

                <div className="job-form-grid">
                    <label>
                        Minimum CGPA
                        <input
                            type="number"
                            name="minimumCgpa"
                            value={form.minimumCgpa}
                            onChange={handleChange}
                            min="0"
                            max="10"
                            step="0.01"
                        />
                    </label>

                    <label>
                        Maximum active backlogs
                        <input
                            type="number"
                            name="maximumActiveBacklogs"
                            value={form.maximumActiveBacklogs}
                            onChange={handleChange}
                            min="0"
                            max="100"
                        />
                    </label>

                    <label>
                        Eligible graduation years
                        <input
                            name="eligibleGraduationYears"
                            value={form.eligibleGraduationYears}
                            onChange={handleChange}
                            maxLength={100}
                            placeholder="2026, 2027"
                        />
                    </label>

                    <label>
                        Annual salary / package
                        <input
                            type="number"
                            name="salary"
                            value={form.salary}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="e.g. 450000"
                        />
                    </label>

                    <label>
                        Location
                        <input
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            maxLength={150}
                            placeholder="Pune"
                        />
                    </label>

                    <label>
                        Work mode *
                        <select
                            name="workMode"
                            value={form.workMode}
                            onChange={handleChange}
                            required
                        >
                            <option value="ONSITE">On-site</option>
                            <option value="HYBRID">Hybrid</option>
                            <option value="REMOTE">Remote</option>
                        </select>
                    </label>

                    <label>
                        Number of vacancies *
                        <input
                            type="number"
                            name="vacancies"
                            value={form.vacancies}
                            onChange={handleChange}
                            min="1"
                            max="100000"
                            required
                        />
                    </label>

                    <label>
                        Application deadline *
                        <input
                            type="datetime-local"
                            name="applicationDeadline"
                            value={form.applicationDeadline}
                            onChange={handleChange}
                            min={toLocalDateTimeInput(
                                new Date(Date.now() + 60000).toISOString()
                            )}
                            required
                        />
                    </label>
                </div>

                <p className="job-form-hint">
                    Saving creates or updates the job. Publishing is a
                    separate action from the job list.
                </p>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="company-button primary"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : editing
                              ? "Save Changes"
                              : "Create Draft"}
                    </button>

                    <Link to="/company/jobs" className="company-button">
                        Cancel
                    </Link>
                </div>
            </form>
        </section>
    );
}

export default CompanyJobForm;
