import AuthLayout from "../../components/auth/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";

import "../../components/auth/AuthForm.css";

function Login() {
    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Login to your Student Placement account"
        >

            <LoginForm />

            <div className="auth-link">

                Don't have an account?

                <br />

                <a href="/student/register">
                    Register as Student
                </a>

                {" | "}

                <a href="/company/register">
                    Register Company
                </a>

            </div>

        </AuthLayout>
    );
}

export default Login;