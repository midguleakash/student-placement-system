
import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import "../components/admin/AdminDashboard.css";

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="admin-layout">
            {sidebarOpen && (
                <button
                    className="admin-overlay"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <AdminSidebar
                open={sidebarOpen}
                onNavigate={() => setSidebarOpen(false)}
            />

            <div className="admin-main">
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
