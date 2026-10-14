
import { Link } from "react-router-dom";
import { useCompanyProfile } from "../../context/CompanyProfileContext";

function CompanyApplications() {
    const { profile } = useCompanyProfile();

    if (profile?.profileStatus !== "APPROVED") {
        return (
            <div className="company-profile-page">
                <div className="company-page-state">
                    <div className="company-state-icon">🔒</div>
                    <h1>Applicant management is locked</h1>
                    <p>
                        Admin approval is required before your company can
                        manage recruitment.
                    </p>
                    <Link
                        to="/company/profile"
                        className="company-button primary"
                    >
                        View Company Profile
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="company-profile-page">
            <div className="company-page-title">
                <div>
                    <span className="company-kicker">RECRUITMENT</span>
                    <h1>Applicants</h1>
                    <p>
                        Review students who apply to your published jobs.
                    </p>
                </div>
            </div>

            <div className="company-empty-state">
                <span>♙</span>
                <h3>Applicant management</h3>
                <p>
                    This page will display student applications, resumes,
                    AI-assisted skill matching, shortlisting, rejection,
                    interview rounds and final selection after the backend
                    recruitment APIs are implemented.
                </p>
            </div>
        </div>
    );
}

export default CompanyApplications;
