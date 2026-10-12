
function LogoutButton() {
    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");

        window.location.href = "/login";
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
}

export default LogoutButton;
