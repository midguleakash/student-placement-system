
export default function RecentJobs() {
    return (
        <section className="admin-panel">
            <div className="admin-panel-header">
                <div>
                    <h2>Recent Job Openings</h2>
                    <p>Latest jobs posted by companies.</p>
                </div>
            </div>

            <div className="admin-empty-state">
                <div>💼</div>
                <strong>No job data loaded</strong>
                <p>Job openings will appear here after API integration.</p>
            </div>
        </section>
    );
}
