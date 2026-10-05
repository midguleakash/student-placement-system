import { useState } from "react";

import FormInput from "./FormInput";
import FormSelect from "./FormSelect";

function LoginForm() {

    const [formData, setFormData] = useState({
        role: "",
        email: "",
        password: ""
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

        console.log("Login Data:", formData);

        // Later:
        // authApi.login(formData)
    };

    const roles = [
        {
            value: "STUDENT",
            label: "Student"
        },
        {
            value: "COMPANY",
            label: "Company"
        },
        {
            value: "ADMIN",
            label: "Admin"
        }
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

            <button
                type="submit"
                className="auth-submit"
            >
                Login
            </button>

        </form>
    );
}

export default LoginForm;