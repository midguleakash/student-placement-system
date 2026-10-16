
import { useEffect, useState } from "react";
import { adminApi } from "../../services/adminApi";

const initialStats = [
    { label: "Total Students", icon: "🎓", color: "blue", value: "—" },
    { label: "Companies", icon: "🏢", color: "purple", value: "—" },
    { label: "Active Jobs", icon: "💼", color: "green", value: "—" },
    { label: "Applications", icon: "📄", color: "orange", value: "—" },
];

export default function AdminStats() {
    const [stats, setStats] = useState(initialStats);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadStats() {
            setLoading(true);
            setError("");

            try {
                const data = await adminApi.getDashboardStats();

                if (cancelled) return;

                setStats([
                    {
                        ...initialStats[0],
                        value: data.students.totalStudents ?? 0,
                    },
                    {
                        ...initialStats[1],
                        value: data.companies.totalCompanies ?? 0,
                    },
                    {
                        ...initialStats[2],
                        value: "—",
                    },
                    {
                        ...initialStats[3],
                        value: "—",
                    },
                ]);
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to load dashboard statistics.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadStats();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section>
            {error && (
                <div className="admin-stats-error" role="alert">
                    {error}
                    <button onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            )}

            <div className="admin-stats-grid">
                {stats.map((stat) => (
                    <article className="admin-stat-card" key={stat.label}>
                        <div className="admin-stat-top">
                            <span className={`admin-stat-icon ${stat.color}`}>
                                {stat.icon}
                            </span>
                        </div>

                        <p>{stat.label}</p>

                        <h2>
                            {loading && stat.value === "—"
                                ? "..."
                                : stat.value}
                        </h2>

                        <span className="admin-stat-footnote">
                            {stat.label === "Active Jobs" ||
                            stat.label === "Applications"
                                ? "API integration pending"
                                : loading
                                ? "Loading..."
                                : error
                                ? "Unable to load data"
                                : "Live database count"}
                        </span>
                    </article>
                ))}
            </div>
        </section>
    );
}
