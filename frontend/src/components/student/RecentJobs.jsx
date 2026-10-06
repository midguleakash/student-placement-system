import { Link } from "react-router-dom";

function RecentJobs() {

    const jobs = [
        {
            position: "Java Developer",
            company: "ABC Technologies",
            location: "Pune",
            package: "5 LPA",
            status: "Apply"
        },
        {
            position: "React Developer",
            company: "XYZ Solutions",
            location: "Mumbai",
            package: "6 LPA",
            status: "Apply"
        },
        {
            position: "Backend Developer",
            company: "Tech Solutions",
            location: "Pune",
            package: "5.5 LPA",
            status: "Applied"
        }
    ];

    return (
        <section className="dashboard-section">

            <div className="section-title">

                <h3>Recent Job Openings</h3>

                <Link to="/jobs">
                    View All
                </Link>

            </div>

            <div className="student-job-list">

                {jobs.map((job) => (

                    <div
                        className="student-job-item"
                        key={`${job.company}-${job.position}`}
                    >

                        <div>

                            <h4>
                                {job.position}
                            </h4>

                            <p>
                                {job.company} · {job.location}
                            </p>

                            <span>
                                {job.package}
                            </span>

                        </div>

                        {job.status === "Applied" ? (

                            <button
                                className="applied-btn"
                                disabled
                            >
                                Applied
                            </button>

                        ) : (

                            <Link
                                to="/jobs"
                                className="apply-btn"
                            >
                                Apply
                            </Link>

                        )}

                    </div>

                ))}

            </div>

        </section>
    );
}

export default RecentJobs;