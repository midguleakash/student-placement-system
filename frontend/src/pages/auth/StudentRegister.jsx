import { useState } from "react";

import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/auth/FormInput";

import "../../components/auth/AuthForm.css";

function StudentRegister() {

    const [formData, setFormData] = useState({
        registrationNumber: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (event) => {

        event.preventDefault();

        console.log("Student Registration:", formData);

        // Later:
        // studentApi.register(formData)
    };

    return (
        <AuthLayout
            title="Student Registration"
            subtitle="Create your student account"
        >

            <form onSubmit={handleSubmit}>

                <FormInput
                    label="Registration Number"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="Enter registration number"
                />

                <FormInput
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                />

                <FormInput
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                />

                <FormInput
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                />

                <FormInput
                    label="Phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                />

                <FormInput
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                />

                <FormInput
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                />

                <button
                    type="submit"
                    className="auth-submit"
                >
                    Create Student Account
                </button>

            </form>

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