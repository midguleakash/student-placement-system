import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-container">

                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    Student Placement
                </Link>

                {/* Navigation Links */}
                <div className="navbar-links">
                    <Link to="/">Home</Link>
                    <Link to="/jobs">Jobs</Link>
                    <Link to="/companies">Companies</Link>
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
                </div>

                {/* Authentication Buttons */}
                <div className="navbar-buttons">
                    <Link to="/login" className="login-btn">
                        Login
                    </Link>

                    <Link to="/student/register" className="register-btn">
                        Register
                    </Link>
                </div>

            </div>
        </nav>
    );
}

export default Navbar;