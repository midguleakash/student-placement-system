
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import { loginUser } from "../../services/authApi";

function LoginForm() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        role: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!formData.role) {
            setError("Please select your role.");
            return;
        }

        try {
            setLoading(true);

            // Send email and password to Spring Boot
            const data = await loginUser(
                formData.email,
                formData.password
            );

            // Verify the selected role against the backend role
            if (data.role !== formData.role) {
                setError(
                    `This account belongs to the ${data.role} role. ` +
                    "Please select the correct role."
                );
                return;
            }

            // Save authentication details for this browser session
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("role", data.role);

            // Redirect according to the role returned by the backend
            const dashboardPaths = {
                STUDENT: "/student/dashboard",
                COMPANY: "/company/dashboard",
                ADMIN: "/admin/dashboard",
            };

            navigate(dashboardPaths[data.role] || "/login", {
                replace: true,
            });
        } catch (err) {
            setError(err.message || "Unable to log in.");
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { value: "STUDENT", label: "Student" },
        { value: "COMPANY", label: "Company" },
        { value: "ADMIN", label: "Admin" },
    ];

    return (
        <form onSubmit={handleSubmit}>
            <FormSelect
                label="Login As"
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={roles}
            />

            <FormInput
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
            />

            <FormInput
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
            />

            {error && (
                <p role="alert" className="auth-error">
                    {error}
                </p>
            )}

            <button
                type="submit"
                className="auth-submit"
                disabled={loading}
            >
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
}

export default LoginForm;
