import { Link } from "react-router-dom";

function ProfileProgress() {

    const percentage = 85;

    return (
        <section className="profile-progress">

            <div className="profile-progress-header">

                <div>
                    <h3>Profile Completion</h3>

                    <p>
                        Complete your profile to improve your eligibility
                        for job openings.
                    </p>
                </div>

                <strong>
                    {percentage}%
                </strong>

            </div>

            <div className="progress-bar">

                <div
                    className="progress-value"
                    style={{ width: `${percentage}%` }}
                ></div>

            </div>

            <Link to="/student/profile">
                Complete Profile
            </Link>

        </section>
    );
}

export default ProfileProgress;