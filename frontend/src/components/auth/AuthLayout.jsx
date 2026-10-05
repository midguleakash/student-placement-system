import "./AuthLayout.css";

function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="auth-page">

            <div className="auth-container">

                <div className="auth-header">

                    <h1>
                        {title}
                    </h1>

                    <p>
                        {subtitle}
                    </p>

                </div>

                <div className="auth-content">
                    {children}
                </div>

            </div>

        </div>
    );
}

export default AuthLayout;