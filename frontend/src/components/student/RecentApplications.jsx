import { Link } from "react-router-dom";

function RecentApplications() {

    const applications = [
        {
            position: "Java Developer",
            company: "ABC Technologies",
            status: "Shortlisted"
        },
        {
            position: "React Developer",
            company: "XYZ Solutions",
            status: "Reviewing"
        },
        {
            position: "Backend Developer",
            company: "Tech Solutions",
            status: "Rejected"
        }
    ];

    return (
        <section className="dashboard-section">

            <div className="section-title">

                <h3>Recent Applications</h3>

                <Link to="/student/applications">
                    View All
                </Link>

            </div>

            <div className="application-list">

                {applications.map((application) => (

                    <div
                        className="student-application-item"
                        key={`${application.company}-${application.position}`}
                    >

                        <div className="student-application-info">

                            <div className="company-small-avatar">
                                {application.company.charAt(0)}
                            </div>

                            <div>

                                <h4>
                                    {application.position}
                                </h4>

                                <p>
                                    {application.company}
                                </p>

                            </div>

                        </div>

                        <span
                            className={`student-application-status ${application.status.toLowerCase()}`}
                        >
                            {application.status}
                        </span>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default RecentApplications;