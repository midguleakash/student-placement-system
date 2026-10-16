
import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/adminApi";
import "./AdminStudents.css";

export default function AdminCompanies() {
    const [companies, setCompanies] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionId, setActionId] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);

    async function loadCompanies() {
        try {
            setLoading(true);
            setError("");

            const data = await adminApi.getAllCompanies();
            setCompanies(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Unable to load companies.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCompanies();
    }, []);

    const counts = useMemo(() => ({
        ALL: companies.length,
        PENDING: companies.filter(
            company => company.profileStatus === "PENDING"
        ).length,
        APPROVED: companies.filter(
            company => company.profileStatus === "APPROVED"
        ).length,
        REJECTED: companies.filter(
            company => company.profileStatus === "REJECTED"
        ).length,
    }), [companies]);

    const filteredCompanies = useMemo(() => {
        const term = search.trim().toLowerCase();

        return companies.filter(company => {
            const matchesSearch = [
                company.companyName,
                company.industry,
                company.companyEmail,
                company.contactPerson,
                company.phone,
                company.address,
                company.id,
                company.userId,
            ].some(value =>
                String(value ?? "").toLowerCase().includes(term)
            );

            const matchesStatus =
                statusFilter === "ALL" ||
                company.profileStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [companies, search, statusFilter]);

    async function handleApprove(company) {
        const confirmed = window.confirm(
            `Approve ${company.companyName || "this company"}?`
        );

        if (!confirmed) return;

        try {
            setActionId(company.id);
            setError("");

            await adminApi.approveCompany(company.id);
            setSelectedCompany(null);
            await loadCompanies();
        } catch (err) {
            setError(err.message || "Unable to approve company.");
        } finally {
            setActionId(null);
        }
    }

    async function handleReject(company) {
        const remarks = window.prompt(
            `Enter rejection remarks for ${
                company.companyName || "this company"
            }:`
        );

        if (remarks === null) return;

        if (!remarks.trim()) {
            setError("Rejection remarks are required.");
            return;
        }

        try {
            setActionId(company.id);
            setError("");

            await adminApi.rejectCompany(company.id, remarks.trim());
            setSelectedCompany(null);
            await loadCompanies();
        } catch (err) {
            setError(err.message || "Unable to reject company.");
        } finally {
            setActionId(null);
        }
    }

    return (
        <section className="admin-students-page">
            {/* Page heading - same as AdminStudents */}
            <div className="students-page-heading">
                <div>
                    <p className="admin-eyebrow">ADMINISTRATION</p>
                    <h1>Companies</h1>
                    <p>
                        Manage company profiles and review registrations.
                    </p>
                </div>

                <button
                    className="students-refresh-btn"
                    onClick={loadCompanies}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            {/* Statistics cards - same as AdminStudents */}
            <div className="students-stat-grid">
                {[
                    ["Total Companies", "ALL"],
                    ["Pending", "PENDING"],
                    ["Approved", "APPROVED"],
                    ["Rejected", "REJECTED"],
                ].map(([label, key]) => (
                    <button
                        key={key}
                        className={`students-stat-card ${
                            statusFilter === key ? "selected" : ""
                        }`}
                        onClick={() => setStatusFilter(key)}
                    >
                        <span>{label}</span>
                        <strong>{counts[key]}</strong>
                    </button>
                ))}
            </div>

            {/* Directory panel - same as AdminStudents */}
            <div className="students-table-panel">
                <div className="students-toolbar">
                    <div>
                        <h2>Company Directory</h2>
                        <p>
                            Search and review registered companies.
                        </p>
                    </div>

                    <div className="students-filters">
                        <input
                            type="search"
                            placeholder="Search company, ID, industry..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            aria-label="Search companies"
                        />

                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            aria-label="Filter by company status"
                        >
                            <option value="ALL">All statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="INCOMPLETE">Incomplete</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="students-error" role="alert">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="students-message">
                        Loading companies...
                    </div>
                ) : filteredCompanies.length === 0 ? (
                    <div className="students-message">
                        <strong>No companies found</strong>
                        <p>
                            Try changing the search or status filter.
                        </p>
                    </div>
                ) : (
                    <div className="students-table-wrapper">
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Industry</th>
                                    <th>Contact Person</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCompanies.map(company => (
                                    <tr key={company.id}>
                                        <td>
                                            <div className="student-name">
                                                {company.companyName ||
                                                    "Name not provided"}
                                            </div>
                                            <small>
                                                Profile ID: {company.id}
                                            </small>
                                        </td>

                                        <td>
                                            {company.industry || "—"}
                                        </td>

                                        <td>
                                            {company.contactPerson || "—"}
                                        </td>

                                        <td>
                                            {company.companyEmail || "—"}
                                        </td>

                                        <td>
                                            <span
                                                className={`student-status ${
                                                    (
                                                        company.profileStatus ||
                                                        "INCOMPLETE"
                                                    ).toLowerCase()
                                                }`}
                                            >
                                                {company.profileStatus ||
                                                    "INCOMPLETE"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="student-actions">
                                                <button
                                                    className="student-view-btn"
                                                    onClick={() =>
                                                        setSelectedCompany(company)
                                                    }
                                                >
                                                    View
                                                </button>

                                                {company.profileStatus ===
                                                    "PENDING" && (
                                                    <>
                                                        <button
                                                            className="student-approve-btn"
                                                            disabled={
                                                                actionId === company.id
                                                            }
                                                            onClick={() =>
                                                                handleApprove(company)
                                                            }
                                                        >
                                                            {actionId === company.id
                                                                ? "Processing..."
                                                                : "Approve"}
                                                        </button>

                                                        <button
                                                            className="student-reject-btn"
                                                            disabled={
                                                                actionId === company.id
                                                            }
                                                            onClick={() =>
                                                                handleReject(company)
                                                            }
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Company details modal - same structure as student modal */}
            {selectedCompany && (
                <div
                    className="student-modal-backdrop"
                    onClick={() => setSelectedCompany(null)}
                >
                    <section
                        className="student-detail-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="company-detail-title"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="student-modal-heading">
                            <h2 id="company-detail-title">
                                Company Details
                            </h2>

                            <button
                                onClick={() => setSelectedCompany(null)}
                                aria-label="Close company details"
                            >
                                ×
                            </button>
                        </div>

                        <dl className="student-detail-list">
                            <dt>Profile ID</dt>
                            <dd>{selectedCompany.id ?? "—"}</dd>

                            <dt>User ID</dt>
                            <dd>{selectedCompany.userId ?? "—"}</dd>

                            <dt>Company Name</dt>
                            <dd>{selectedCompany.companyName || "—"}</dd>

                            <dt>Industry</dt>
                            <dd>{selectedCompany.industry || "—"}</dd>

                            <dt>Contact Person</dt>
                            <dd>{selectedCompany.contactPerson || "—"}</dd>

                            <dt>Company Email</dt>
                            <dd>{selectedCompany.companyEmail || "—"}</dd>

                            <dt>Phone</dt>
                            <dd>{selectedCompany.phone || "—"}</dd>

                            <dt>Website</dt>
                            <dd>{selectedCompany.website || "—"}</dd>

                            <dt>Address</dt>
                            <dd>{selectedCompany.address || "—"}</dd>

                            <dt>Description</dt>
                            <dd>{selectedCompany.description || "—"}</dd>

                            <dt>Status</dt>
                            <dd>
                                <span
                                    className={`student-status ${
                                        (
                                            selectedCompany.profileStatus ||
                                            "INCOMPLETE"
                                        ).toLowerCase()
                                    }`}
                                >
                                    {selectedCompany.profileStatus ||
                                        "INCOMPLETE"}
                                </span>
                            </dd>

                            <dt>Submitted At</dt>
                            <dd>{selectedCompany.submittedAt || "—"}</dd>

                            <dt>Reviewed At</dt>
                            <dd>{selectedCompany.reviewedAt || "—"}</dd>

                            <dt>Rejection Remarks</dt>
                            <dd>
                                {selectedCompany.rejectionRemarks || "—"}
                            </dd>
                        </dl>

                        {selectedCompany.profileStatus === "PENDING" && (
                            <div className="student-modal-actions">
                                <button
                                    className="student-approve-btn"
                                    disabled={actionId === selectedCompany.id}
                                    onClick={() =>
                                        handleApprove(selectedCompany)
                                    }
                                >
                                    {actionId === selectedCompany.id
                                        ? "Processing..."
                                        : "Approve"}
                                </button>

                                <button
                                    className="student-reject-btn"
                                    disabled={actionId === selectedCompany.id}
                                    onClick={() =>
                                        handleReject(selectedCompany)
                                    }
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </section>
    );
}
