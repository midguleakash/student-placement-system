
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/adminApi";
import "./AdminStudents.css";

const PLACEMENT_STATUSES = [
    "NOT_REGISTERED",
    "PENDING",
    "APPROVED",
    "REJECTED",
];

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString();
}

function StatusBadge({ status, type }) {
    const value = status || (type === "profile" ? "INCOMPLETE" : "NOT_REGISTERED");

    return (
        <span className={`student-status ${value.toLowerCase()}`}>
            {type === "profile" ? "Profile: " : "Placement: "}
            {value.replaceAll("_", " ")}
        </span>
    );
}

export default function AdminPlacementRegistrations() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionId, setActionId] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const loadStudents = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await adminApi.getAllStudents();
            setStudents(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Unable to load student registrations.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    const counts = useMemo(() => {
        const result = { ALL: students.length };

        for (const status of PLACEMENT_STATUSES) {
            result[status] = students.filter(
                student =>
                    (student.placementRegistrationStatus || "NOT_REGISTERED") === status
            ).length;
        }

        return result;
    }, [students]);

    const filteredStudents = useMemo(() => {
        const term = search.trim().toLowerCase();

        return students.filter(student => {
            const placementStatus =
                student.placementRegistrationStatus || "NOT_REGISTERED";

            const matchesSearch = [
                student.id,
                student.userId,
                student.firstName,
                student.lastName,
                student.phone,
                student.branch,
                student.graduationYear,
                student.cgpa,
                student.skills,
                student.profileStatus,
                placementStatus,
            ].some(value =>
                String(value ?? "").toLowerCase().includes(term)
            );

            const matchesStatus =
                statusFilter === "ALL" ||
                placementStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [students, search, statusFilter]);

    async function handleApprove(student) {
        if (!window.confirm(
            `Approve placement registration for ${student.firstName || "this student"} ${student.lastName || ""}?`
        )) {
            return;
        }

        setActionId(student.id);
        setError("");

        try {
            await adminApi.approvePlacementRegistration(student.id);
            setSelectedStudent(null);
            await loadStudents();
        } catch (err) {
            setError(err.message || "Unable to approve placement registration.");
        } finally {
            setActionId(null);
        }
    }

    async function handleReject(student) {
        const remarks = window.prompt(
            `Enter placement registration rejection remarks for ${student.firstName || "this student"}:`
        );

        if (remarks === null) return;

        if (!remarks.trim()) {
            setError("Placement rejection remarks are required.");
            return;
        }

        setActionId(student.id);
        setError("");

        try {
            await adminApi.rejectPlacementRegistration(
                student.id,
                remarks.trim()
            );

            setSelectedStudent(null);
            await loadStudents();
        } catch (err) {
            setError(err.message || "Unable to reject placement registration.");
        } finally {
            setActionId(null);
        }
    }

    async function handleViewResume(student) {
        try {
            const pdf = await adminApi.getStudentResume(student.id);

            if (pdf.type !== "application/pdf") {
                throw new Error("The server did not return a PDF.");
            }

            const url = URL.createObjectURL(pdf);
            const preview = window.open(url, "_blank");

            if (!preview) {
                URL.revokeObjectURL(url);
                throw new Error("Allow pop-ups to view the student resume.");
            }

            window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (err) {
            setError(err.message || "Unable to open student resume.");
        }
    }

    return (
        <section className="admin-students-page">
            <div className="students-page-heading">
                <div>
                    <p className="admin-eyebrow">ADMINISTRATION</p>
                    <h1>Placement Registrations</h1>
                    <p>
                        Review placement registration separately from student
                        profile approval.
                    </p>
                </div>

                <button
                    className="students-refresh-btn"
                    onClick={loadStudents}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            <div className="students-stat-grid">
                {[
                    ["All Students", "ALL"],
                    ["Not Registered", "NOT_REGISTERED"],
                    ["Pending Placement", "PENDING"],
                    ["Placement Approved", "APPROVED"],
                    ["Placement Rejected", "REJECTED"],
                ].map(([label, key]) => (
                    <button
                        key={key}
                        type="button"
                        className={`students-stat-card ${
                            statusFilter === key ? "selected" : ""
                        }`}
                        onClick={() => setStatusFilter(key)}
                    >
                        <span>{label}</span>
                        <strong>{counts[key] ?? 0}</strong>
                    </button>
                ))}
            </div>

            <div className="students-table-panel">
                <div className="students-toolbar">
                    <div>
                        <h2>Student Placement Directory</h2>
                        <p>
                            Profile approval and placement registration have
                            independent statuses.
                        </p>
                    </div>

                    <div className="students-filters">
                        <input
                            type="search"
                            placeholder="Search student, ID, branch..."
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            aria-label="Search students"
                        />

                        <select
                            value={statusFilter}
                            onChange={event => setStatusFilter(event.target.value)}
                            aria-label="Filter placement registration status"
                        >
                            <option value="ALL">All placement statuses</option>
                            <option value="NOT_REGISTERED">Not registered</option>
                            <option value="PENDING">Pending placement approval</option>
                            <option value="APPROVED">Placement approved</option>
                            <option value="REJECTED">Placement rejected</option>
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
                        Loading student registrations...
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="students-message">
                        <strong>No students found</strong>
                        <p>Try another search or placement status.</p>
                    </div>
                ) : (
                    <div className="students-table-wrapper">
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Branch</th>
                                    <th>Graduation</th>
                                    <th>CGPA</th>
                                    <th>Profile Approval</th>
                                    <th>Placement Approval</th>
                                    <th>Registered At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStudents.map(student => {
                                    const placementStatus =
                                        student.placementRegistrationStatus ||
                                        "NOT_REGISTERED";

                                    const pending = placementStatus === "PENDING";

                                    return (
                                        <tr key={student.id}>
                                            <td>
                                                <div className="student-name">
                                                    {`${student.firstName || ""} ${student.lastName || ""}`.trim() ||
                                                        "Name not provided"}
                                                </div>
                                                <small>
                                                    Profile ID: {student.id}
                                                    {" | "}User ID: {student.userId ?? "—"}
                                                </small>
                                            </td>

                                            <td>{student.branch || "—"}</td>
                                            <td>{student.graduationYear ?? "—"}</td>
                                            <td>{student.cgpa ?? "—"}</td>

                                            <td>
                                                <StatusBadge
                                                    status={student.profileStatus}
                                                    type="profile"
                                                />
                                            </td>

                                            <td>
                                                <StatusBadge
                                                    status={placementStatus}
                                                    type="placement"
                                                />
                                            </td>

                                            <td>
                                                {formatDate(student.placementRegisteredAt)}
                                            </td>

                                            <td>
                                                <div className="student-actions">
                                                    <button
                                                        type="button"
                                                        className="student-view-btn"
                                                        onClick={() =>
                                                            setSelectedStudent(student)
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    {pending && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="student-approve-btn"
                                                                disabled={actionId === student.id}
                                                                onClick={() =>
                                                                    handleApprove(student)
                                                                }
                                                            >
                                                                {actionId === student.id
                                                                    ? "Processing..."
                                                                    : "Approve Placement"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="student-reject-btn"
                                                                disabled={actionId === student.id}
                                                                onClick={() =>
                                                                    handleReject(student)
                                                                }
                                                            >
                                                                Reject Placement
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedStudent && (
                <div
                    className="student-modal-backdrop"
                    onClick={() => setSelectedStudent(null)}
                >
                    <section
                        className="student-detail-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="placement-student-detail-title"
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="student-modal-heading">
                            <h2 id="placement-student-detail-title">
                                Student Placement Details
                            </h2>

                            <button
                                type="button"
                                onClick={() => setSelectedStudent(null)}
                                aria-label="Close student details"
                            >
                                ×
                            </button>
                        </div>

                        <dl className="student-detail-list">
                            <dt>Profile ID</dt>
                            <dd>{selectedStudent.id ?? "—"}</dd>

                            <dt>User ID</dt>
                            <dd>{selectedStudent.userId ?? "—"}</dd>

                            <dt>First Name</dt>
                            <dd>{selectedStudent.firstName || "—"}</dd>

                            <dt>Last Name</dt>
                            <dd>{selectedStudent.lastName || "—"}</dd>

                            <dt>Phone</dt>
                            <dd>{selectedStudent.phone || "—"}</dd>

                            <dt>Branch</dt>
                            <dd>{selectedStudent.branch || "—"}</dd>

                            <dt>Graduation Year</dt>
                            <dd>{selectedStudent.graduationYear ?? "—"}</dd>

                            <dt>CGPA</dt>
                            <dd>{selectedStudent.cgpa ?? "—"}</dd>

                            <dt>Active Backlogs</dt>
                            <dd>{selectedStudent.activeBacklogs ?? "—"}</dd>

                            <dt>Skills</dt>
                            <dd>{selectedStudent.skills || "—"}</dd>

                            <dt>Resume</dt>
                            <dd>
                                {selectedStudent.hasResume ? (
                                    <button
                                        type="button"
                                        className="student-view-btn"
                                        onClick={() =>
                                            handleViewResume(selectedStudent)
                                        }
                                    >
                                        View Resume (PDF)
                                    </button>
                                ) : "Not uploaded"}
                            </dd>

                            <dt>Student Profile Status</dt>
                            <dd>
                                <StatusBadge
                                    status={selectedStudent.profileStatus}
                                    type="profile"
                                />
                            </dd>

                            <dt>Profile Submitted At</dt>
                            <dd>{formatDate(selectedStudent.profileSubmittedAt)}</dd>

                            <dt>Profile Reviewed At</dt>
                            <dd>{formatDate(selectedStudent.profileReviewedAt)}</dd>

                            <dt>Profile Rejection Remarks</dt>
                            <dd>{selectedStudent.rejectionRemarks || "—"}</dd>

                            <dt>Placement Registration Status</dt>
                            <dd>
                                <StatusBadge
                                    status={selectedStudent.placementRegistrationStatus}
                                    type="placement"
                                />
                            </dd>

                            <dt>Placement Registered At</dt>
                            <dd>{formatDate(selectedStudent.placementRegisteredAt)}</dd>

                            <dt>Placement Reviewed At</dt>
                            <dd>{formatDate(selectedStudent.placementReviewedAt)}</dd>

                            <dt>Placement Rejection Remarks</dt>
                            <dd>
                                {selectedStudent.placementRejectionRemarks || "—"}
                            </dd>
                        </dl>

                        {selectedStudent.placementRegistrationStatus === "PENDING" && (
                            <div className="student-modal-actions">
                                <button
                                    type="button"
                                    className="student-approve-btn"
                                    disabled={actionId === selectedStudent.id}
                                    onClick={() => handleApprove(selectedStudent)}
                                >
                                    Approve Placement
                                </button>

                                <button
                                    type="button"
                                    className="student-reject-btn"
                                    disabled={actionId === selectedStudent.id}
                                    onClick={() => handleReject(selectedStudent)}
                                >
                                    Reject Placement
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </section>
    );
}
