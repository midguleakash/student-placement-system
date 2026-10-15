
import { NavLink } from "react-router-dom";
import { logout } from "../../utils/auth";

const links = [
    { label: "Overview", path: "/admin", icon: "▦", end: true },
    { label: "Students", path: "/admin/students", icon: "♙" },
    { label: "Companies", path: "/admin/companies", icon: "▤" },
    { label: "Job Openings", path: "/admin/jobs", icon: "▣" },
    { label: "Applications", path: "/admin/applications", icon: "☷" },
];

export default function AdminSidebar({ open, onNavigate }) {
    return (
        <aside className={`admin-sidebar ${open ? "open" : ""}`}>
            <div className="admin-brand">
                <div className="admin-brand-icon">P</div>
                <div>
                    <h2>PlaceTrack</h2>
                    <span>Placement Management</span>
                </div>
            </div>

            <p className="admin-menu-label">ADMIN WORKSPACE</p>

            <nav className="admin-nav">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.end}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            `admin-nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        <span className="admin-nav-icon">{link.icon}</span>
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="admin-sidebar-bottom">
                <div className="admin-help-card">
                    <strong>Placement Administration</strong>
                    <p>Manage student and company placement activities.</p>
                </div>

                <button className="admin-logout" onClick={logout}>
                    <span>↪</span> Logout
                </button>
            </div>
        </aside>
    );
}
