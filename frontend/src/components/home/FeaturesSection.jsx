// import "./FeaturesSection.css";

function FeaturesSection() {
    return (
        <section className="features-section">

            <div className="section-heading">

                <p className="section-tag">
                    FEATURES
                </p>

                <h2>
                    Everything You Need
                </h2>

                <p>
                    Manage the complete placement process
                    from registration to final selection.
                </p>

            </div>

            <div className="features-container">

                <div className="feature-card">
                    <div className="feature-icon">
                        👤
                    </div>

                    <h3>
                        Student Profiles
                    </h3>

                    <p>
                        Manage education, skills, experience,
                        resume and career preferences.
                    </p>
                </div>


                <div className="feature-card">
                    <div className="feature-icon">
                        💼
                    </div>

                    <h3>
                        Job Opportunities
                    </h3>

                    <p>
                        Find job openings based on your skills,
                        qualification and career interests.
                    </p>
                </div>


                <div className="feature-card">
                    <div className="feature-icon">
                        📋
                    </div>

                    <h3>
                        Easy Applications
                    </h3>

                    <p>
                        Apply for eligible jobs and prevent
                        duplicate applications.
                    </p>
                </div>


                <div className="feature-card">
                    <div className="feature-icon">
                        📊
                    </div>

                    <h3>
                        Application Tracking
                    </h3>

                    <p>
                        Track your application, interview and
                        selection status in one place.
                    </p>
                </div>

            </div>

        </section>
    );
}

export default FeaturesSection;