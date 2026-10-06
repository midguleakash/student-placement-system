function StudentStats() {

    const stats = [
        {
            title: "Profile",
            value: "85%"
        },
        {
            title: "Job Openings",
            value: "24"
        },
        {
            title: "Applications",
            value: "6"
        },
        {
            title: "Interviews",
            value: "2"
        }
    ];

    return (
        <div className="student-stats">

            {stats.map((stat) => (

                <div
                    className="student-stat-card"
                    key={stat.title}
                >

                    <p>{stat.title}</p>

                    <h2>{stat.value}</h2>

                </div>

            ))}

        </div>
    );
}

export default StudentStats;