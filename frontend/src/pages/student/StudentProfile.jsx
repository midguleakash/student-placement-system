
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { studentApi } from "../../services/studentApi";
import { useStudentProfile } from "../../context/StudentProfileContext";
import StatusBadge from "../../components/student/StatusBadge";

const emptyForm = {
    firstName: "",
    lastName: "",
    phone: "",
    branch: "",
    graduationYear: "",
    cgpa: "",
    activeBacklogs: "0",
    skills: "",
    resumeUrl: "",
};

function StudentProfile() {
    const { profile, setProfile, loading, refreshProfile } =
        useStudentProfile();

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!profile) return;

        setForm({
            firstName: profile.firstName ?? "",
            lastName: profile.lastName ?? "",
            phone: profile.phone ?? "",
            branch: profile.branch ?? "",
            graduationYear: profile.graduationYear ?? "",
            cgpa: profile.cgpa ?? "",
            activeBacklogs: profile.activeBacklogs ?? "0",
            skills: profile.skills ?? "",
            resumeUrl: profile.resumeUrl ?? "",
        });
    }, [profile]);

    const status = profile?.profileStatus || "INCOMPLETE";
    const locked = status === "PENDING" || status === "APPROVED";
    const rejected = status === "REJECTED";

    function handleChange(event) {
        const { name, value } = event.target;

        setForm(previous => ({
            ...previous,
            [name]: value,
        }));
    }

    async function saveProfile(event) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const saved = await studentApi.saveProfile({
                ...form,
                graduationYear: Number(form.graduationYear),
                cgpa: Number(form.cgpa),
                activeBacklogs: Number(form.activeBacklogs),
            });

            setProfile(saved);
            setMessage("Your profile has been saved.");
            await refreshProfile();
        } catch (err) {
            setError(err.message || "Unable to save profile.");
        } finally {
            setSaving(false);
        }
    }

    async function submitProfile() {
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const saved = await studentApi.saveProfile({
                ...form,
                graduationYear: Number(form.graduationYear),
                cgpa: Number(form.cgpa),
                activeBacklogs: Number(form.activeBacklogs),
            });

            setProfile(saved);

            const submitted = await studentApi.submitProfile();

            setProfile(submitted);
            setMessage("Your profile has been submitted for approval.");
            await refreshProfile();
        } catch (err) {
            setError(err.message || "Unable to submit profile.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="page-loading">Loading profile...</div>;
    }

    return (
        <div className="student-page">
            <section className="page-title-row">
                <div>
                    <span className="section-kicker">YOUR INFORMATION</span>
                    <h1>My Profile</h1>
                    <p>
                        View your details and manage profile submission.
                    </p>
                </div>

                <StatusBadge status={status} />
            </section>

            {message && (
                <div className="notice notice-success">{message}</div>
            )}

            {error && (
                <div className="notice notice-error">{error}</div>
            )}

            {rejected && profile?.rejectionRemarks && (
                <div className="notice notice-error">
                    <strong>Admin remarks:</strong>{" "}
                    {profile.rejectionRemarks}
                </div>
            )}

            {status === "PENDING" && (
                <div className="notice notice-warning">
                    Your profile is awaiting admin approval. Editing is
                    disabled while the review is in progress.
                </div>
            )}

            {status === "APPROVED" && (
                <div className="notice notice-success">
                    Your profile is approved. Your placement options are
                    now available, subject to job eligibility.
                </div>
            )}

            <form className="profile-form-card" onSubmit={saveProfile}>
                <div className="form-section-heading">
                    <h2>Personal information</h2>
                    <p>Enter your name and contact details.</p>
                </div>

                <div className="form-grid">
                    <label>
                        First name *
                        <input
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                            maxLength={100}
                            disabled={locked}
                        />
                    </label>

                    <label>
                        Last name *
                        <input
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            required
                            maxLength={100}
                            disabled={locked}
                        />
                    </label>

                    <label>
                        Phone *
                        <input
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            maxLength={20}
                            disabled={locked}
                        />
                    </label>

                    <label>
                        Branch *
                        <input
                            name="branch"
                            placeholder="Information Technology"
                            value={form.branch}
                            onChange={handleChange}
                            required
                            maxLength={150}
                            disabled={locked}
                        />
                    </label>
                </div>

                <div className="form-section-heading">
                    <h2>Academic information</h2>
                    <p>Provide your academic details.</p>
                </div>

                <div className="form-grid">
                    <label>
                        Graduation year *
                        <input
                            name="graduationYear"
                            type="number"
                            min="2000"
                            max="2100"
                            value={form.graduationYear}
                            onChange={handleChange}
                            required
                            disabled={locked}
                        />
                    </label>

                    <label>
                        CGPA *
                        <input
                            name="cgpa"
                            type="number"
                            min="0"
                            max="10"
                            step="0.01"
                            value={form.cgpa}
                            onChange={handleChange}
                            required
                            disabled={locked}
                        />
                    </label>

                    <label>
                        Active backlogs *
                        <input
                            name="activeBacklogs"
                            type="number"
                            min="0"
                            value={form.activeBacklogs}
                            onChange={handleChange}
                            required
                            disabled={locked}
                        />
                    </label>
                </div>

                <div className="form-section-heading">
                    <h2>Skills and resume</h2>
                    <p>Help companies understand your skills.</p>
                </div>

                <label>
                    Skills *
                    <textarea
                        name="skills"
                        value={form.skills}
                        onChange={handleChange}
                        placeholder="Java, Spring Boot, React, MySQL"
                        rows={4}
                        maxLength={2000}
                        required
                        disabled={locked}
                    />
                </label>

                <label>
                    Resume URL *
                    <input
                        name="resumeUrl"
                        type="url"
                        value={form.resumeUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/resume.pdf"
                        maxLength={1000}
                        required
                        disabled={locked}
                    />
                </label>

                {!locked && (
                    <div className="form-actions">
                        <button
                            className="button button-secondary"
                            type="submit"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save progress"}
                        </button>

                        <button
                            className="button button-primary"
                            type="button"
                            disabled={saving}
                            onClick={submitProfile}
                        >
                            {saving ? "Processing..." : "Submit for approval"}
                        </button>
                    </div>
                )}

                {locked && (
                    <div className="form-actions">
                        <Link
                            to="/student/dashboard"
                            className="button button-primary"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                )}
            </form>
        </div>
    );
}

export default StudentProfile;
