function AdminHeader() {
    return (
        <header className="admin-header">

            <div>
                <h2>Admin Dashboard</h2>
            </div>

            <div className="admin-header-actions">

                <button className="notification-btn">
                    🔔
                </button>

                <div className="admin-user">

                    <div className="admin-avatar">
                        A
                    </div>

                    <div>
                        <strong>Admin</strong>
                        <span>Placement Officer</span>
                    </div>

                </div>

            </div>

        </header>
    );
}

export default AdminHeader;