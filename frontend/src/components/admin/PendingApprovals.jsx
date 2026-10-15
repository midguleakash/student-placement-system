
export default function PendingApprovals() {
    return (
        <section className="admin-panel">
            <div className="admin-panel-header">
                <div>
                    <h2>Pending Approvals</h2>
                    <p>Review student and company registrations.</p>
                </div>

                <span className="admin-count-badge">Pending</span>
            </div>

            <div className="admin-empty-state">
                <div>📋</div>
                <strong>Approval data not connected</strong>
                <p>
                    Pending student and company records will appear here
                    after API integration.
                </p>
            </div>
        </section>
    );
}
