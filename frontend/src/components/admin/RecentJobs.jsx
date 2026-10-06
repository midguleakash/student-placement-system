import { Link } from "react-router-dom";

function RecentJobs() {

    const jobs = [
        {
            position: "Java Developer",
            company: "ABC Technologies",
            location: "Pune",
            openings: 10,
            status: "Active"
        },
        {
            position: "React Developer",
            company: "XYZ Solutions",
            location: "Mumbai",
            openings: 8,
            status: "Active"
        },
        {
            position: "Backend Developer",
            company: "Tech Solutions",
            location: "Pune",
            openings: 5,
            status: "Closed"
        }
    ];

    return (
        <section className="dashboard-section">

            <div className="section-title">

                <h3>Recent Job Openings</h3>

                <Link to="/admin/jobs">
                    View All
                </Link>

            </div>

            <div className="admin-job-list">

                {jobs.map((job) => (

                    <div
                        className="admin-job-item"
                        key={`${job.company}-${job.position}`}
                    >

                        <div>

                            <h4>{job.position}</h4>

                            <p>
                                {job.company} · {job.location}
                            </p>

                            <span>
                                {job.openings} openings
                            </span>

                        </div>

                        <span
                            className={
                                job.status === "Active"
                                    ? "status active"
                                    : "status closed"
                            }
                        >
                            {job.status}
                        </span>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default RecentJobs;