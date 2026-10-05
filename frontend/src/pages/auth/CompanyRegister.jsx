import { useState } from "react";

import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/auth/FormInput";

import "../../components/auth/AuthForm.css";

function CompanyRegister() {

    const [formData, setFormData] = useState({
        companyName: "",
        email: "",
        phone: "",
        location: "",
        domain: "",
        headOffice: "",
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

        console.log("Company Registration:", formData);

        // Later:
        // authApi.companyRegister(formData)
    };

    return (
        <AuthLayout
            title="Company Registration"
            subtitle="Register your company with the placement platform"
        >

            <form onSubmit={handleSubmit}>

                <FormInput
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                />

                <FormInput
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter company email"
                />

                <FormInput
                    label="Phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter company phone"
                />

                <FormInput
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter company location"
                />

                <FormInput
                    label="Domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    placeholder="Example: IT, Finance, Manufacturing"
                />

                <FormInput
                    label="Head Office"
                    name="headOffice"
                    value={formData.headOffice}
                    onChange={handleChange}
                    placeholder="Enter head office"
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
                    Register Company
                </button>

            </form>

            <div className="auth-link">

                Already registered?

                <br />

                <a href="/login">
                    Login
                </a>

            </div>

        </AuthLayout>
    );
}

export default CompanyRegister;