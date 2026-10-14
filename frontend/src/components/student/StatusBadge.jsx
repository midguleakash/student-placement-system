
function StatusBadge({ status = "INCOMPLETE" }) {
    const normalized = status.toUpperCase();

    const labels = {
        INCOMPLETE: "Profile incomplete",
        PENDING: "Pending approval",
        APPROVED: "Approved",
        REJECTED: "Changes required",
    };

    return (
        <span className={`status-badge status-${normalized.toLowerCase()}`}>
            {labels[normalized] || normalized}
        </span>
    );
}

export default StatusBadge;
