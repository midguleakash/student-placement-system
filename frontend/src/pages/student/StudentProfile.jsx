
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
    hasResume: false,
};

function StudentProfile() {
    const { profile, setProfile, loading, refreshProfile } =
        useStudentProfile();

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [uploadingResume, setUploadingResume] = useState(false);

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
            hasResume: profile.hasResume ?? false,
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

    function validateGraduationYear() {
        const year = Number(form.graduationYear);

        if (
            !form.graduationYear ||
            !Number.isInteger(year) ||
            year < 2020 ||
            year > 2100
        ) {
            setError("Graduation year must be between 2020 and 2100.");
            setMessage("");
            return false;
        }

        return true;
    }

    function getProfilePayload() {
        const { hasResume, ...profileData } = form;

        return {
            ...profileData,
            graduationYear: Number(form.graduationYear),
            cgpa: Number(form.cgpa),
            activeBacklogs: Number(form.activeBacklogs),
        };
    }


    async function saveProfile(event) {
        event.preventDefault();

        if (!validateGraduationYear()) return;

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const saved = await studentApi.saveProfile(getProfilePayload());
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
        if (!validateGraduationYear()) return;

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const saved = await studentApi.saveProfile(getProfilePayload());

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


    async function handleResumeUpload(event) {
        const file = event.target.files?.[0];

        if (!file) return;

        // Allow the same file to be selected again after an error.
        event.target.value = "";

        setError("");
        setMessage("");

        if (
            file.type !== "application/pdf" ||
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            setError("Please select a PDF file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Resume size must not exceed 5 MB.");
            return;
        }

        setUploadingResume(true);

        try {
            const updated = await studentApi.uploadResume(file);

            setProfile(updated);

            setForm(previous => ({
                ...previous,
                hasResume: updated.hasResume ?? false,
            }));

            setMessage("Resume uploaded successfully.");

            await refreshProfile();
        } catch (err) {
            setError(err.message || "Unable to upload resume.");
        } finally {
            setUploadingResume(false);
        }
    }

    async function handleViewResume() {
        const previewWindow = window.open("", "_blank");

        if (!previewWindow) {
            setError("Please allow pop-ups to view your resume.");
            return;
        }

        previewWindow.document.title = "Loading resume...";
        setError("");

        try {
            const blob = await studentApi.getMyResume();

            if (blob.type !== "application/pdf") {
                throw new Error("The server did not return a PDF.");
            }

            const pdfUrl = URL.createObjectURL(blob);
            previewWindow.location.href = pdfUrl;

            // Keep the Blob URL alive while the PDF viewer loads.
            window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
        } catch (err) {
            previewWindow.close();
            setError(err.message || "Unable to open your resume.");
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
                    Your student profile is approved. Register for placements separately
                    and wait for admin approval to unlock jobs and applications.
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
                            maxLength={10}
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
                            min="2020"
                            max="2100"
                            value={form.graduationYear}
                            onChange={handleChange}
                            required
                            disabled={locked}
                            onInvalid={(event) => {
                                const input = event.currentTarget;

                                if (input.validity.rangeUnderflow) {
                                    input.setCustomValidity(
                                        "Graduation year must be 2020 or later."
                                    );
                                } else if (input.validity.rangeOverflow) {
                                    input.setCustomValidity(
                                        "Graduation year cannot be later than 2100."
                                    );
                                } else {
                                    input.setCustomValidity("");
                                }
                            }}
                            onInput={(event) => {
                                event.currentTarget.setCustomValidity("");
                            }}
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

                <div className="resume-upload-section">
                    <label htmlFor="resumeFile">
                        Upload Resume (PDF, maximum 5 MB) *
                    </label>

                    {!locked && (
                        <input
                            id="resumeFile"
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleResumeUpload}
                            disabled={uploadingResume || saving}
                            required={!form.hasResume}
                        />
                    )}

                    {uploadingResume && (
                        <p className="stat-footnote">
                            Uploading resume...
                        </p>
                    )}

                    {form.hasResume && (
                        <div className="resume-file-info">
                            <span>PDF resume uploaded</span>

                            <button
                                type="button"
                                className="text-link"
                                onClick={handleViewResume}
                            >
                                View Resume ↗
                            </button>
                        </div>
                    )}

                    {!form.hasResume && !locked && !uploadingResume && (
                        <p className="stat-footnote">
                            Select a PDF file to upload your resume.
                        </p>
                    )}
                </div>


                {!locked && (
                    <div className="form-actions">
                        <button
                            className="button button-secondary"
                            type="submit"
                            disabled={saving || uploadingResume}
                        >
                            {saving ? "Saving..." : "Save progress"}
                        </button>

                        <button
                            className="button button-primary"
                            type="button"
                            disabled={saving || uploadingResume}
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
