import { Link } from "react-router-dom";

function RecentJobs() {

    const jobs = [
        {
            position: "Java Developer",
            location: "Pune",
            openings: 12,
            status: "Active"
        },
        {
            position: "React Developer",
            location: "Mumbai",
            openings: 8,
            status: "Active"
        },
        {
            position: "Backend Developer",
            location: "Pune",
            openings: 5,
            status: "Closed"
        }
    ];

    return (
        <section className="dashboard-section">

            <div className="section-title">

                <h3>Recent Job Openings</h3>

                <Link to="/company/jobs">
                    View All
                </Link>

            </div>

            <div className="job-list">

                {jobs.map((job) => (

                    <div className="job-item" key={job.position}>

                        <div>
                            <h4>{job.position}</h4>

                            <p>
                                {job.location} · {job.openings} openings
                            </p>
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