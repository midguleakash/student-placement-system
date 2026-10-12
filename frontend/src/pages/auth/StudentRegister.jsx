import { useState } from "react";

import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/auth/FormInput";
import OtpVerification from "../../components/auth/OtpVerification";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

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



    const emailValid =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            formData.email.trim()
        );

    const phoneValid =
        /^[6-9]\d{9}$/.test(formData.phone.trim());

    const passwordValid =
        formData.password.length >= 8 &&
        formData.password.length <= 72;

    const confirmPasswordValid =
        formData.confirmPassword !== "" &&
        formData.password === formData.confirmPassword;

    const isFormFilled =
        formData.firstName.trim() !== "" &&
        formData.lastName.trim() !== "" &&
        emailValid &&
        phoneValid &&
        passwordValid &&
        confirmPasswordValid;


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


            const data = await response.json();


            // Handle backend errors
            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.detail ||
                    data.error ||
                    "Registration failed. Please try again."
                );
            }



            // Display only the success message
            setMessage(
                data.message || "Student account created successfully."
            );

            setError("");


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

            setMessage("");

        } finally {

            setLoading(false);
        }
    };


    return (
        <>
            <Navbar />
            
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

                    {formData.email && !emailValid && (
                        <p className="field-error">
                            Please enter a valid email address.
                        </p>
                    )}


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


                    {formData.phone && !phoneValid && (
                        <p className="field-error">
                            Enter a valid 10-digit Indian mobile number.
                        </p>
                    )}



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


                    {formData.password && !passwordValid && (
                        <p className="field-error">
                            Password must contain 8 to 72 characters.
                        </p>
                    )}



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


                    {formData.confirmPassword && !confirmPasswordValid && (
                        <p className="field-error">
                            Passwords do not match.
                        </p>
                    )}



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
                        canSendOtp={isFormFilled}
                        onVerified={handleOtpVerified}
                        onError={setError}
                        onMessage={setMessage}
                    />


                    {/* ================================= */}
                    {/* MESSAGE */}
                    {/* ================================= */}


                    {message && (
                        <div className="form-message success-message" role="status">
                            <span aria-hidden="true">✓</span>
                            <span>{message}</span>
                        </div>
                    )}

                    {error && (
                        <div className="form-message error-message" role="alert">
                            <span aria-hidden="true">!</span>
                            <span>{error}</span>
                        </div>
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

            <Footer />
        </>
    );
}

export default StudentRegister;