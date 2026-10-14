
import { useState } from "react";

import { companyApi } from "../../services/companyApi";
import { useCompanyProfile } from "../../context/CompanyProfileContext";
import StatusBadge from "../../components/company/StatusBadge";

const emptyProfile = {
    companyName: "",
    industry: "",
    website: "",
    contactPerson: "",
    phone: "",
    companyEmail: "",
    address: "",
    description: "",
};

function CompanyProfile() {
    const { profile, refreshProfile, setProfile } = useCompanyProfile();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const formProfile = { ...emptyProfile, ...(profile || {}) };
    const status = formProfile.profileStatus || "INCOMPLETE";
    const locked = status === "PENDING" || status === "APPROVED";

    const [values, setValues] = useState(() => ({
        ...emptyProfile,
        ...(profile || {}),
    }));

    // Keep the form synchronized if the context is refreshed.
    // The key on the page route can also be used if remounting is preferred.
    const [lastProfile, setLastProfile] = useState(profile);

    if (lastProfile !== profile) {
        setLastProfile(profile);
        setValues({ ...emptyProfile, ...(profile || {}) });
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((previous) => ({ ...previous, [name]: value }));
    }

    function getPayload() {
        return {
            companyName: values.companyName.trim(),
            industry: values.industry.trim(),
            website: values.website.trim(),
            contactPerson: values.contactPerson.trim(),
            phone: values.phone.trim(),
            companyEmail: values.companyEmail.trim(),
            address: values.address.trim(),
            description: values.description.trim(),
        };
    }

    async function handleSave(event) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const saved = await companyApi.saveProfile(getPayload());
            setProfile(saved);
            setValues({ ...emptyProfile, ...saved });
            setMessage("Company profile saved successfully.");
        } catch (err) {
            setError(err.message || "Unable to save profile.");
        } finally {
            setSaving(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!event.currentTarget.reportValidity()) return;

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await companyApi.saveProfile(getPayload());
            const submitted = await companyApi.submitProfile();

            setProfile(submitted);
            setValues({ ...emptyProfile, ...submitted });

            await refreshProfile().catch(() => {});

            setMessage("Profile submitted. Please wait for admin approval.");
        } catch (err) {
            setError(err.message || "Unable to submit profile.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="company-profile-page">
            <div className="company-page-title">
                <div>
                    <span className="company-kicker">COMPANY SETTINGS</span>
                    <h1>Company Profile</h1>
                    <p>Provide accurate information for campus recruitment.</p>
                </div>

                <StatusBadge status={status} />
            </div>

            {error && <div className="company-alert error">{error}</div>}
            {message && <div className="company-alert success">{message}</div>}

            {status === "PENDING" && (
                <div className="company-alert info">
                    Your profile is under review. Editing is disabled until
                    the admin completes the review.
                </div>
            )}

            {status === "REJECTED" && (
                <div className="company-alert error">
                    <strong>Changes required</strong>
                    <p>
                        {formProfile.rejectionRemarks ||
                            "Review your details and resubmit your profile."}
                    </p>
                </div>
            )}

            {status === "APPROVED" && (
                <div className="company-alert success">
                    Your company has been approved. Job posting is available.
                </div>
            )}

            <form className="company-profile-card" onSubmit={handleSubmit}>
                <div className="company-form-heading">
                    <h2>Company information</h2>
                    <p>Fields marked with * are required.</p>
                </div>

                <fieldset disabled={locked || saving} className="company-fieldset">
                    <div className="company-form-grid">
                        <label className="company-field">
                            Company Name *
                            <input
                                name="companyName"
                                value={values.companyName}
                                onChange={handleChange}
                                required
                                maxLength={150}
                                placeholder="ABC Technologies"
                            />
                        </label>

                        <label className="company-field">
                            Industry *
                            <select
                                name="industry"
                                value={values.industry}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select industry</option>
                                <option>Information Technology</option>
                                <option>Software Development</option>
                                <option>Finance</option>
                                <option>Manufacturing</option>
                                <option>Healthcare</option>
                                <option>Education</option>
                                <option>Other</option>
                            </select>
                        </label>

                        <label className="company-field">
                            Official Website
                            <input
                                name="website"
                                type="url"
                                value={values.website}
                                onChange={handleChange}
                                placeholder="https://example.com"
                            />
                        </label>

                        <label className="company-field">
                            Contact Person *
                            <input
                                name="contactPerson"
                                value={values.contactPerson}
                                onChange={handleChange}
                                required
                                maxLength={100}
                                placeholder="HR or recruiter name"
                            />
                        </label>

                        <label className="company-field">
                            Contact Phone *
                            <input
                                name="phone"
                                type="tel"
                                value={values.phone}
                                onChange={handleChange}
                                required
                                pattern="[0-9+() -]{10,20}"
                                placeholder="Contact number"
                            />
                        </label>

                        <label className="company-field">
                            Company Email *
                            <input
                                name="companyEmail"
                                type="email"
                                value={values.companyEmail}
                                onChange={handleChange}
                                required
                                placeholder="hr@example.com"
                            />
                        </label>

                        <label className="company-field full-width">
                            Company Address *
                            <textarea
                                name="address"
                                value={values.address}
                                onChange={handleChange}
                                rows={3}
                                maxLength={500}
                                required
                                placeholder="Office address"
                            />
                        </label>

                        <label className="company-field full-width">
                            Company Description *
                            <textarea
                                name="description"
                                value={values.description}
                                onChange={handleChange}
                                rows={5}
                                maxLength={3000}
                                required
                                placeholder="Describe your organization and recruitment needs."
                            />
                        </label>
                    </div>
                </fieldset>

                {!locked && (
                    <div className="company-form-footer">
                        <p>
                            Check your details before submitting for approval.
                        </p>

                        <div className="company-form-actions">
                            <button
                                type="button"
                                className="company-button secondary"
                                disabled={saving}
                                onClick={handleSave}
                            >
                                Save Draft
                            </button>

                            <button
                                type="submit"
                                className="company-button primary"
                                disabled={saving}
                            >
                                {saving
                                    ? "Processing..."
                                    : status === "REJECTED"
                                      ? "Resubmit for Approval"
                                      : "Submit for Approval"}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}

export default CompanyProfile;
