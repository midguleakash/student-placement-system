import { Link } from "react-router-dom";

function RecentApplications() {

    const applications = [
        {
            student: "Akash Midgule",
            position: "Java Developer",
            company: "ABC Technologies",
            status: "Shortlisted"
        },
        {
            student: "Rahul Patil",
            position: "React Developer",
            company: "XYZ Solutions",
            status: "Reviewing"
        },
        {
            student: "Sneha More",
            position: "Backend Developer",
            company: "Tech Solutions",
            status: "Selected"
        }
    ];

    return (
        <section className="dashboard-section">

            <div className="section-title">

                <h3>Recent Applications</h3>

                <Link to="/admin/applications">
                    View All
                </Link>

            </div>

            <div className="admin-application-list">

                {applications.map((application) => (

                    <div
                        className="admin-application-item"
                        key={`${application.student}-${application.position}`}
                    >

                        <div className="admin-application-info">

                            <div className="student-avatar">
                                {application.student.charAt(0)}
                            </div>

                            <div>

                                <h4>
                                    {application.student}
                                </h4>

                                <p>
                                    {application.position}
                                </p>

                                <span>
                                    {application.company}
                                </span>

                            </div>

                        </div>

                        <span className="application-status">
                            {application.status}
                        </span>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default RecentApplications;