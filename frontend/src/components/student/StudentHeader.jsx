function StudentHeader() {
    return (
        <header className="student-header">

            <div>
                <h2>Student Dashboard</h2>
            </div>

            <div className="student-header-actions">

                <button className="notification-btn">
                    🔔
                </button>

                <div className="student-user">

                    <div className="student-avatar">
                        A
                    </div>

                    <div>
                        <strong>Akash Midgule</strong>
                        <span>Student</span>
                    </div>

                </div>

            </div>

        </header>
    );
}

export default StudentHeader;