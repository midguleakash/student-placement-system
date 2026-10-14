
import { Outlet } from "react-router-dom";

import CompanySidebar from "../components/company/CompanySidebar";
import CompanyHeader from "../components/company/CompanyHeader";
import { CompanyProfileProvider, useCompanyProfile } from "../context/CompanyProfileContext";

import "../pages/company/CompanyDashboard.css";

function CompanyLayoutContent() {
    const { loading, error } = useCompanyProfile();

    if (loading) {
        return (
            <div className="company-page-loading">
                Loading company workspace...
            </div>
        );
    }

    return (
        <div className="company-dashboard">
            <CompanySidebar />

            <main className="company-main">
                <CompanyHeader />

                {error && (
                    <div className="company-alert error">
                        {error}
                    </div>
                )}

                <Outlet />
            </main>
        </div>
    );
}

function CompanyLayout() {
    return (
        <CompanyProfileProvider>
            <CompanyLayoutContent />
        </CompanyProfileProvider>
    );
}

export default CompanyLayout;
