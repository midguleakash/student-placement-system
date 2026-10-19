
import { NavLink, useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { useCompanyProfile } from "../../context/CompanyProfileContext";

function CompanySidebar() {
    const navigate = useNavigate();
    const { profile } = useCompanyProfile();

    const status = profile?.profileStatus || "INCOMPLETE";
    const approved = status === "APPROVED";

    const links = [
        { label: "Dashboard", path: "/company/dashboard", icon: "⌂" },
        { label: "Company Profile", path: "/company/profile", icon: "▤" },
        { label: "Job Openings", path: "/company/jobs", icon: "▣" },
        { label: "Applications", path: "/company/applications", icon: "♙" },
    ];

    function logout() {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("userId");

        navigate("/login", { replace: true });
    }

    return (
        <aside className="company-sidebar">
            <div className="company-brand">
                <div className="company-brand-icon">P</div>
                <div>
                    <strong>PlaceTrack</strong>
                    <small>Recruitment Portal</small>
                </div>
            </div>

            <div className="company-sidebar-profile">
                <div className="company-avatar">
                    {(profile?.companyName || "C").charAt(0).toUpperCase()}
                </div>

                <strong>{profile?.companyName || "Your Company"}</strong>
                <StatusBadge status={status} />
            </div>

            <p className="company-menu-label">WORKSPACE</p>

            <nav className="company-nav">
                {links.map((link) => {
                    const restricted =
                        !approved &&
                        ["/company/jobs", "/company/applications"].includes(
                            link.path
                        );

                    return (
                        <NavLink
                            key={link.path}
                            to={restricted ? "/company/profile" : link.path}
                            end
                            className={({ isActive }) =>
                                `company-nav-link ${isActive && !restricted ? "active" : ""
                                }`
                            }
                        >
                            <span className="company-nav-icon">{link.icon}</span>
                            <span>{link.label}</span>

                            {restricted && (
                                <span className="nav-lock">Locked</span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="company-sidebar-bottom">
                <button
                    type="button"
                    className="company-logout"
                    onClick={logout}
                >
                    ↪ Logout
                </button>
            </div>
        </aside>
    );
}

export default CompanySidebar;
