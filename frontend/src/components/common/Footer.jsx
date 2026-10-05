import "./Footer.css";

function Footer() {
    return (
        <footer className="footer">

            <div className="footer-container">

                <div className="footer-section">
                    <h3>Student Placement</h3>

                    <p>
                        A platform connecting students,
                        companies and placement teams.
                    </p>
                </div>

                <div className="footer-section">
                    <h4>Quick Links</h4>

                    <a href="/">Home</a>
                    <a href="/jobs">Jobs</a>
                    <a href="/companies">Companies</a>
                    <a href="/about">About</a>
                </div>

                <div className="footer-section">
                    <h4>For Students</h4>

                    <a href="/student/register">Register</a>
                    <a href="/jobs">Find Jobs</a>
                    <a href="/student/login">Student Login</a>
                </div>

                <div className="footer-section">
                    <h4>Contact</h4>

                    <p>Email: placement@example.com</p>
                    <p>Phone: +91 9876543210</p>
                </div>

            </div>

            <div className="footer-bottom">
                <p>
                    © 2026 Student Placement System. All rights reserved.
                </p>
            </div>

        </footer>
    );
}

export default Footer;