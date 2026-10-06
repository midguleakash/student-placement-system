import CompanySidebar from "../../components/company/CompanySidebar";
import CompanyHeader from "../../components/company/CompanyHeader";
import CompanyStats from "../../components/company/CompanyStats";
import RecentJobs from "../../components/company/RecentJobs";
import RecentApplications from "../../components/company/RecentApplications";

import "../../components/company/CompanyDashboard.css";

function CompanyDashboard() {
    return (
        <div className="company-dashboard">

            <CompanySidebar />

            <div className="company-main">

                <CompanyHeader />

                <div className="company-content">

                    <div className="company-welcome">
                        <h1>Welcome, ABC Technologies</h1>
                        <p>
                            Manage your job openings, candidates and recruitment process.
                        </p>
                    </div>

                    <CompanyStats />

                    <div className="company-dashboard-grid">
                        <RecentJobs />
                        <RecentApplications />
                    </div>

                </div>

            </div>

        </div>
    );
}

export default CompanyDashboard;