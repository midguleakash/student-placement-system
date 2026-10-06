function AdminStats() {

    const stats = [
        {
            title: "Total Students",
            value: "120"
        },
        {
            title: "Companies",
            value: "25"
        },
        {
            title: "Job Openings",
            value: "18"
        },
        {
            title: "Placements",
            value: "42"
        }
    ];

    return (
        <div className="admin-stats">

            {stats.map((stat) => (

                <div
                    className="admin-stat-card"
                    key={stat.title}
                >

                    <p>{stat.title}</p>

                    <h2>{stat.value}</h2>

                </div>

            ))}

        </div>
    );
}

export default AdminStats;