
function StatusBadge({ status }) {
    const currentStatus = status || "INCOMPLETE";

    const labels = {
        INCOMPLETE: "Profile Incomplete",
        PENDING: "Awaiting Approval",
        APPROVED: "Approved",
        REJECTED: "Rejected",
    };

    return (
        <span
            className={`company-status status-${currentStatus.toLowerCase()}`}
        >
            {labels[currentStatus] || currentStatus}
        </span>
    );
}

export default StatusBadge;
