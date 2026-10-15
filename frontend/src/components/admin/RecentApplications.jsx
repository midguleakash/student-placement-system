
export default function RecentApplications() {
    return (
        <section className="admin-panel">
            <div className="admin-panel-header">
                <div>
                    <h2>Recent Applications</h2>
                    <p>Latest student application activity.</p>
                </div>
            </div>

            <div className="admin-empty-state">
                <div>📄</div>
                <strong>No application data loaded</strong>
                <p>
                    Application statuses will appear here after
                    API integration.
                </p>
            </div>
        </section>
    );
}
