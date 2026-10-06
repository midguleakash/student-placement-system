import { Link } from "react-router-dom";

function RecentApplications() {

    const applications = [
        {
            student: "Akash Midgule",
            position: "Java Developer",
            status: "Shortlisted"
        },
        {
            student: "Rahul Patil",
            position: "React Developer",
            status: "Reviewing"
        },
        {
            student: "Sneha More",
            position: "Backend Developer",
            status: "Selected"
        }
    ];

    return (
        <section className="dashboard-section">

            <div className="section-title">

                <h3>Recent Applications</h3>

                <Link to="/company/applications">
                    View All
                </Link>

            </div>

            <div className="application-list">

                {applications.map((application) => (

                    <div
                        className="application-item"
                        key={`${application.student}-${application.position}`}
                    >

                        <div className="student-info">

                            <div className="student-avatar">
                                {application.student.charAt(0)}
                            </div>

                            <div>
                                <h4>{application.student}</h4>
                                <p>{application.position}</p>
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