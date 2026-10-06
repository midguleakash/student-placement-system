import { useState } from "react";

import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/auth/FormInput";
import OtpVerification from "../../components/auth/OtpVerification";

import "../../components/auth/AuthForm.css";

function StudentRegister() {

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [otpVerified, setOtpVerified] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    // =====================================
    // FORM CHANGE
    // =====================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });


        // If email changes,
        // previous OTP verification is invalid.

        if (name === "email") {
            setOtpVerified(false);
            setMessage("");
            setError("");
        }
    };


    // =====================================
    // OTP VERIFIED
    // =====================================

    const handleOtpVerified = () => {

        setOtpVerified(true);

        setError("");

        setMessage(
            "Email verified successfully. You can now create your account."
        );
    };


    // =====================================
    // FINAL REGISTRATION
    // =====================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setMessage("");
        setError("");


        // OTP must be verified

        if (!otpVerified) {

            setError(
                "Please verify your email before creating your account."
            );

            return;
        }


        // Password validation

        if (
            formData.password !==
            formData.confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        setLoading(true);


        try {

            const response = await fetch(
                "http://localhost:8080/api/auth/register/complete",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        firstName:
                            formData.firstName,

                        lastName:
                            formData.lastName,

                        email:
                            formData.email,

                        phone:
                            formData.phone,

                        password:
                            formData.password
                    })
                }
            );


            const data = await response.text();


            if (!response.ok) {
                throw new Error(data);
            }


            setMessage(data);


            // Clear form

            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: ""
            });


            setOtpVerified(false);


        } catch (error) {

            setError(
                error.message ||
                "Registration failed."
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <AuthLayout
            title="Student Registration"
            subtitle="Create your student account"
        >

            <form onSubmit={handleSubmit}>

                {/* ================================= */}
                {/* FIRST NAME */}
                {/* ================================= */}

                <FormInput
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                />


                {/* ================================= */}
                {/* LAST NAME */}
                {/* ================================= */}

                <FormInput
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                />


                {/* ================================= */}
                {/* EMAIL */}
                {/* ================================= */}

                <FormInput
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                />


                {/* ================================= */}
                {/* PHONE */}
                {/* ================================= */}

                <FormInput
                    label="Phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                />


                {/* ================================= */}
                {/* PASSWORD */}
                {/* ================================= */}

                <FormInput
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                />


                {/* ================================= */}
                {/* CONFIRM PASSWORD */}
                {/* ================================= */}

                <FormInput
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                />


                {/* ================================= */}
                {/* OTP COMPONENT */}
                {/* ================================= */}

                <OtpVerification
                    email={formData.email}
                    registrationData={{
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        password: formData.password
                    }}
                    onVerified={handleOtpVerified}
                    onError={setError}
                    onMessage={setMessage}
                />


                {/* ================================= */}
                {/* MESSAGE */}
                {/* ================================= */}

                {message && (

                    <p className="success-message">
                        {message}
                    </p>

                )}


                {error && (

                    <p className="error-message">
                        {error}
                    </p>

                )}


                {/* ================================= */}
                {/* CREATE ACCOUNT */}
                {/* ================================= */}

                <button
                    type="submit"
                    className="auth-submit"
                    disabled={
                        !otpVerified ||
                        loading
                    }
                >

                    {loading
                        ? "Creating Account..."
                        : "Create Student Account"
                    }

                </button>

            </form>


            {/* ================================= */}
            {/* LOGIN LINK */}
            {/* ================================= */}

            <div className="auth-link">

                Already have an account?

                <br />

                <a href="/login">
                    Login
                </a>

            </div>

        </AuthLayout>
    );
}

export default StudentRegister;