function CompanyStats() {

    const stats = [
        {
            title: "Active Jobs",
            value: "5"
        },
        {
            title: "Applications",
            value: "84"
        },
        {
            title: "Shortlisted",
            value: "21"
        },
        {
            title: "Hired",
            value: "8"
        }
    ];

    return (
        <div className="company-stats">

            {stats.map((stat) => (
                <div className="company-stat-card" key={stat.title}>

                    <p>{stat.title}</p>

                    <h2>{stat.value}</h2>

                </div>
            ))}

        </div>
    );
}

export default CompanyStats;