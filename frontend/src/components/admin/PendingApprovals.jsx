import { Link } from "react-router-dom";

function PendingApprovals() {

    const approvals = [
        {
            type: "Student",
            name: "Rahul Patil",
            email: "rahul@example.com",
            action: "Review"
        },
        {
            type: "Student",
            name: "Sneha More",
            email: "sneha@example.com",
            action: "Review"
        },
        {
            type: "Company",
            name: "ABC Technologies",
            email: "hr@abc.com",
            action: "Review"
        }
    ];

    return (
        <section className="pending-approvals">

            <div className="section-title">

                <h3>Pending Approvals</h3>

                <Link to="/admin/approvals">
                    View All
                </Link>

            </div>

            <div className="approval-list">

                {approvals.map((approval) => (

                    <div
                        className="approval-item"
                        key={`${approval.type}-${approval.email}`}
                    >

                        <div className="approval-info">

                            <div className="approval-avatar">
                                {approval.name.charAt(0)}
                            </div>

                            <div>

                                <h4>{approval.name}</h4>

                                <p>
                                    {approval.type} · {approval.email}
                                </p>

                            </div>

                        </div>

                        <Link
                            to="/admin/approvals"
                            className="review-btn"
                        >
                            {approval.action}
                        </Link>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default PendingApprovals;