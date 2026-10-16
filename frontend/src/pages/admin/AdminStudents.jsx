
import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/adminApi";
import "./AdminStudents.css";

export default function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionId, setActionId] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [resumeLoadingId, setResumeLoadingId] = useState(null);

    async function loadStudents() {
        try {
            setLoading(true);
            setError("");

            const data = await adminApi.getAllStudents();
            setStudents(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Unable to load students.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStudents();
    }, []);

    const counts = useMemo(() => ({
        ALL: students.length,
        PENDING: students.filter(
            s => s.profileStatus === "PENDING"
        ).length,
        APPROVED: students.filter(
            s => s.profileStatus === "APPROVED"
        ).length,
        REJECTED: students.filter(
            s => s.profileStatus === "REJECTED"
        ).length,
    }), [students]);

    const filteredStudents = useMemo(() => {
        const term = search.trim().toLowerCase();

        return students.filter(student => {
            const name =
                `${student.firstName || ""} ${student.lastName || ""}`
                    .toLowerCase();

            const matchesSearch =
                !term ||
                name.includes(term) ||
                String(student.id ?? "").includes(term) ||
                String(student.userId ?? "").includes(term) ||
                (student.branch || "").toLowerCase().includes(term);

            const matchesStatus =
                statusFilter === "ALL" ||
                student.profileStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [students, search, statusFilter]);

    async function handleApprove(student) {
        const confirmed = window.confirm(
            `Approve ${student.firstName || "this student's"} profile?`
        );

        if (!confirmed) return;

        try {
            setActionId(student.id);
            setError("");

            await adminApi.approveStudent(student.id);
            await loadStudents();
        } catch (err) {
            setError(err.message || "Unable to approve student.");
        } finally {
            setActionId(null);
        }
    }

    async function handleReject(student) {
        const remarks = window.prompt(
            `Enter rejection remarks for ${student.firstName || "this student"}:`
        );

        if (remarks === null) return;

        if (!remarks.trim()) {
            setError("Rejection remarks are required.");
            return;
        }

        try {
            setActionId(student.id);
            setError("");

            await adminApi.rejectStudent(student.id, remarks.trim());
            await loadStudents();
        } catch (err) {
            setError(err.message || "Unable to reject student.");
        } finally {
            setActionId(null);
        }
    }

    async function handleViewResume(student) {
        // Open a tab immediately to avoid browser popup blocking.
        const resumeWindow = window.open("about:blank", "_blank");

        if (!resumeWindow) {
            setError("Allow pop-ups to view the resume.");
            return;
        }

        try {
            setResumeLoadingId(student.id);
            setError("");

            const pdfBlob = await adminApi.getStudentResume(student.id);
            const pdfUrl = URL.createObjectURL(pdfBlob);

            resumeWindow.location.href = pdfUrl;

            // Release the temporary object URL after the PDF has had time to load.
            window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
        } catch (err) {
            resumeWindow.close();
            setError(err.message || "Unable to open the student's resume.");
        } finally {
            setResumeLoadingId(null);
        }
    }

    return (
        <section className="admin-students-page">
            <div className="students-page-heading">
                <div>
                    <p className="admin-eyebrow">ADMINISTRATION</p>
                    <h1>Students</h1>
                    <p>
                        Manage student profiles and review registrations.
                    </p>
                </div>

                <button
                    className="students-refresh-btn"
                    onClick={loadStudents}
                    disabled={loading}
                >
                    Refresh
                </button>
            </div>

            <div className="students-stat-grid">
                {[
                    ["Total Students", "ALL"],
                    ["Pending", "PENDING"],
                    ["Approved", "APPROVED"],
                    ["Rejected", "REJECTED"],
                ].map(([label, key]) => (
                    <button
                        key={key}
                        className={`students-stat-card ${statusFilter === key ? "selected" : ""
                            }`}
                        onClick={() => setStatusFilter(key)}
                    >
                        <span>{label}</span>
                        <strong>{counts[key]}</strong>
                    </button>
                ))}
            </div>

            <div className="students-table-panel">
                <div className="students-toolbar">
                    <div>
                        <h2>Student Directory</h2>
                        <p>Search and review registered students.</p>
                    </div>

                    <div className="students-filters">
                        <input
                            type="search"
                            placeholder="Search name, ID, branch..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            aria-label="Search students"
                        />

                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            aria-label="Filter by profile status"
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
                        Loading students...
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="students-message">
                        <strong>No students found</strong>
                        <p>Try changing the search or status filter.</p>
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
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student.id}>
                                        <td>
                                            <div className="student-name">
                                                {[
                                                    student.firstName,
                                                    student.lastName,
                                                ].filter(Boolean).join(" ") ||
                                                    "Name not provided"}
                                            </div>
                                            <small>
                                                Profile ID: {student.id}
                                            </small>
                                        </td>

                                        <td>{student.branch || "—"}</td>
                                        <td>{student.graduationYear || "—"}</td>
                                        <td>{student.cgpa ?? "—"}</td>

                                        <td>
                                            <span
                                                className={`student-status ${(student.profileStatus || "INCOMPLETE")
                                                    .toLowerCase()
                                                    }`}
                                            >
                                                {student.profileStatus || "INCOMPLETE"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="student-actions">
                                                <button
                                                    className="student-view-btn"
                                                    onClick={() =>
                                                        setSelectedStudent(student)
                                                    }
                                                >
                                                    View
                                                </button>

                                                {student.profileStatus === "PENDING" && (
                                                    <>
                                                        <button
                                                            className="student-approve-btn"
                                                            disabled={actionId === student.id}
                                                            onClick={() =>
                                                                handleApprove(student)
                                                            }
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            className="student-reject-btn"
                                                            disabled={actionId === student.id}
                                                            onClick={() =>
                                                                handleReject(student)
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

            {selectedStudent && (
                <div
                    className="student-modal-backdrop"
                    onClick={() => setSelectedStudent(null)}
                >
                    <section
                        className="student-detail-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="student-detail-title"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="student-modal-heading">
                            <h2 id="student-detail-title">Student Details</h2>
                            <button
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

                            <dt>Name</dt>
                            <dd>
                                {[selectedStudent.firstName, selectedStudent.lastName]
                                    .filter(Boolean).join(" ") || "—"}
                            </dd>

                            <dt>Phone</dt>
                            <dd>{selectedStudent.phone || "—"}</dd>

                            <dt>Branch</dt>
                            <dd>{selectedStudent.branch || "—"}</dd>

                            <dt>Graduation Year</dt>
                            <dd>{selectedStudent.graduationYear || "—"}</dd>

                            <dt>CGPA</dt>
                            <dd>{selectedStudent.cgpa ?? "—"}</dd>

                            <dt>Active Backlogs</dt>
                            <dd>{selectedStudent.activeBacklogs ?? "—"}</dd>

                            <dt>Skills</dt>
                            <dd>{selectedStudent.skills || "—"}</dd>

                            <dt>Status</dt>
                            <dd>{selectedStudent.profileStatus || "INCOMPLETE"}</dd>

                            <dt>Rejection Remarks</dt>
                            <dd>{selectedStudent.rejectionRemarks || "—"}</dd>

                            <dt>Resume</dt>
                            <dd>
                                {selectedStudent.hasResume ? (
                                    <button
                                        className="student-view-btn"
                                        disabled={resumeLoadingId === selectedStudent.id}
                                        onClick={() => handleViewResume(selectedStudent)}
                                    >
                                        {resumeLoadingId === selectedStudent.id
                                            ? "Opening..."
                                            : "View Resume (PDF)"}
                                    </button>
                                ) : (
                                    "Resume not uploaded"
                                )}
                            </dd>
                        </dl>



                        {selectedStudent.profileStatus === "PENDING" && (
                            <div className="student-modal-actions">
                                <button
                                    className="student-approve-btn"
                                    disabled={actionId === selectedStudent.id}
                                    onClick={() => handleApprove(selectedStudent)}
                                >
                                    Approve
                                </button>
                                <button
                                    className="student-reject-btn"
                                    disabled={actionId === selectedStudent.id}
                                    onClick={() => handleReject(selectedStudent)}
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
