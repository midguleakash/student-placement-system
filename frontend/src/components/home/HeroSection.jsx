// import "./HeroSection.css";

function HeroSection() {
    return (
        <section className="hero">

            <div className="hero-content">

                <p className="hero-tag">
                    STUDENT PLACEMENT MANAGEMENT SYSTEM
                </p>

                <h1>
                    Connect Students
                    <br />
                    With Their <span>Career Opportunities</span>
                </h1>

                <p className="hero-description">
                    A complete platform that connects students,
                    companies and placement teams to make the
                    recruitment process simple and organized.
                </p>

                <div className="hero-buttons">

                    <a href="/jobs" className="primary-btn">
                        Explore Jobs
                    </a>

                    <a
                        href="/student/register"
                        className="secondary-btn"
                    >
                        Register as Student
                    </a>

                </div>

            </div>

            <div className="hero-image">

                <div className="hero-card">

                    <div className="hero-card-icon">
                        🎓
                    </div>

                    <h3>
                        Build Your Career
                    </h3>

                    <p>
                        Discover opportunities and
                        connect with leading companies.
                    </p>

                </div>

            </div>

        </section>
    );
}

export default HeroSection;