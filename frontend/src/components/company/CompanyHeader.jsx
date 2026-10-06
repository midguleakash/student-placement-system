function CompanyHeader() {
    return (
        <header className="company-header">

            <div>
                <h2>Company Dashboard</h2>
            </div>

            <div className="company-header-actions">

                <button className="notification-btn">
                    🔔
                </button>

                <div className="company-user">
                    <div className="company-avatar">
                        A
                    </div>

                    <div>
                        <strong>ABC Technologies</strong>
                        <span>Company</span>
                    </div>
                </div>

            </div>

        </header>
    );
}

export default CompanyHeader;