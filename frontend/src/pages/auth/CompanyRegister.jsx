import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/auth/FormInput";
import OtpVerification from "../../components/auth/OtpVerification";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

import { registerCompany } from "../../services/authApi";

import "../../components/auth/AuthForm.css";

function CompanyRegister() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [otpVerified, setOtpVerified] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const emailValid =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            formData.email.trim()
        );

    const passwordValid =
        formData.password.length >= 8 &&
        formData.password.length <= 72;

    const confirmPasswordValid =
        formData.confirmPassword !== "" &&
        formData.password === formData.confirmPassword;

    const canSendOtp =
        emailValid &&
        passwordValid &&
        confirmPasswordValid;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        if (name === "email") {
            setOtpVerified(false);
            setMessage("");
            setError("");
        }
    };

    const handleOtpVerified = () => {
        setOtpVerified(true);
        setError("");
        setMessage("Company email verified successfully.");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!canSendOtp) {
            setError("Please enter valid registration details.");
            return;
        }

        if (!otpVerified) {
            setError("Please verify your email using OTP.");
            return;
        }

        setLoading(true);

        try {
            const data = await registerCompany({
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            });

            if (!data.token || data.role !== "COMPANY") {
                throw new Error(
                    "Invalid registration response. Expected a JWT and COMPANY role."
                );
            }

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("role", data.role);

            if (data.userId != null) {
                sessionStorage.setItem(
                    "userId",
                    String(data.userId)
                );
            }

            navigate("/company/dashboard", {
                replace: true
            });
        } catch (err) {
            setError(
                err.message || "Company registration failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <AuthLayout
                title="Company Registration"
                subtitle="Create your company account"
            >
                <form onSubmit={handleSubmit}>
                    <FormInput
                        label="Official Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter official company email"
                    />

                    {formData.email && !emailValid && (
                        <p className="field-error">
                            Please enter a valid email address.
                        </p>
                    )}

                    <FormInput
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create password"
                    />

                    {formData.password && !passwordValid && (
                        <p className="field-error">
                            Password must contain 8 to 72 characters.
                        </p>
                    )}

                    <FormInput
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                    />

                    {formData.confirmPassword &&
                        !confirmPasswordValid && (
                            <p className="field-error">
                                Passwords do not match.
                            </p>
                        )}

                    <OtpVerification
                        email={formData.email.trim().toLowerCase()}
                        registrationData={{
                            email: formData.email.trim().toLowerCase()
                        }}
                        canSendOtp={canSendOtp}
                        onVerified={handleOtpVerified}
                        onError={setError}
                        onMessage={setMessage}
                    />

                    {message && (
                        <div
                            className="form-message success-message"
                            role="status"
                        >
                            {message}
                        </div>
                    )}

                    {error && (
                        <div
                            className="form-message error-message"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={
                            !canSendOtp ||
                            !otpVerified ||
                            loading
                        }
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Company Account"}
                    </button>
                </form>

                <div className="auth-link">
                    Already have an account?
                    <br />
                    <Link to="/login">Login</Link>
                </div>
            </AuthLayout>

            <Footer />
        </>
    );
}

export default CompanyRegister;