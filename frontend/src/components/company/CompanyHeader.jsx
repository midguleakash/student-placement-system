
import { useLocation } from "react-router-dom";
import { useCompanyProfile } from "../../context/CompanyProfileContext";
import StatusBadge from "./StatusBadge";

function CompanyHeader() {
    const location = useLocation();
    const { profile } = useCompanyProfile();

    const titles = {
        "/company/dashboard": "Dashboard",
        "/company/profile": "Company Profile",
        "/company/jobs": "Job Openings",
        "/company/applications": "Applicants",
    };

    return (
        <header className="company-header">
            <div>
                <span className="company-header-eyebrow">
                    COMPANY WORKSPACE
                </span>
                <h2>{titles[location.pathname] || "Company Dashboard"}</h2>
            </div>

            <div className="company-header-right">
                <StatusBadge status={profile?.profileStatus} />

                <div className="company-header-user">
                    <div className="company-avatar small">
                        {(profile?.companyName || "C")
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div>
                        <strong>
                            {profile?.companyName || "Company Account"}
                        </strong>
                        <span>Recruiter</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default CompanyHeader;
