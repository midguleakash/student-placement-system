
const stats = [
    { label: "Total Students", value: "—", icon: "🎓", color: "blue" },
    { label: "Companies", value: "—", icon: "🏢", color: "purple" },
    { label: "Active Jobs", value: "—", icon: "💼", color: "green" },
    { label: "Applications", value: "—", icon: "📄", color: "orange" },
];

export default function AdminStats() {
    return (
        <section className="admin-stats-grid">
            {stats.map((stat) => (
                <article className="admin-stat-card" key={stat.label}>
                    <div className="admin-stat-top">
                        <span className={`admin-stat-icon ${stat.color}`}>
                            {stat.icon}
                        </span>
                    </div>

                    <p>{stat.label}</p>
                    <h2>{stat.value}</h2>
                    <span className="admin-stat-footnote">
                        Waiting for backend integration
                    </span>
                </article>
            ))}
        </section>
    );
}
