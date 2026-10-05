// import "./RoleSection.css";

function RoleSection() {
    return (
        <section className="roles-section">

            <div className="section-heading">

                <p className="section-tag">
                    OUR PLATFORM
                </p>

                <h2>
                    Built For Everyone
                </h2>

                <p>
                    Our platform provides dedicated features
                    for students, companies and placement teams.
                </p>

            </div>

            <div className="roles-container">

                {/* Student */}

                <div className="role-card">

                    <div className="role-icon">
                        🎓
                    </div>

                    <h3>
                        Students
                    </h3>

                    <p>
                        Create your profile, explore job openings,
                        apply for suitable opportunities and track
                        your applications and interviews.
                    </p>

                    <a href="/student/register">
                        Get Started →
                    </a>

                </div>


                {/* Company */}

                <div className="role-card">

                    <div className="role-icon">
                        🏢
                    </div>

                    <h3>
                        Companies
                    </h3>

                    <p>
                        Post job requirements, find eligible
                        candidates, manage applications and
                        conduct the recruitment process.
                    </p>

                    <a href="/company/register">
                        Register Company →
                    </a>

                </div>


                {/* Placement Team */}

                <div className="role-card">

                    <div className="role-icon">
                        👨‍💼
                    </div>

                    <h3>
                        Placement Team
                    </h3>

                    <p>
                        Manage students, companies, job openings,
                        applications, interviews and placement
                        records from one platform.
                    </p>

                    <a href="/login">
                        Admin Login →
                    </a>

                </div>

            </div>

        </section>
    );
}

export default RoleSection;