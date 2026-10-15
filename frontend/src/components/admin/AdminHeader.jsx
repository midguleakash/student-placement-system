
import { useNavigate } from "react-router-dom";

export default function AdminHeader({ onMenuClick }) {
    const navigate = useNavigate();

    return (
        <header className="admin-topbar">
            <div className="admin-topbar-left">
                <button
                    className="admin-menu-toggle"
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                >
                    ☰
                </button>

                <div>
                    <div className="admin-breadcrumb">
                        Workspace / Administration
                    </div>
                    <h3>Admin Dashboard</h3>
                </div>
            </div>

            <div className="admin-topbar-right">
                <span className="admin-live-indicator">
                    <span /> Admin workspace
                </span>

                <div className="admin-avatar">A</div>

                <div className="admin-user-info">
                    <strong>Administrator</strong>
                    <span>System Admin</span>
                </div>

                <button
                    className="admin-profile-button"
                    onClick={() => navigate("/admin")}
                >
                    Overview
                </button>
            </div>
        </header>
    );
}
