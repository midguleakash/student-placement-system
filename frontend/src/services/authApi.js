const API_BASE_URL = "http://localhost:8080";

// Handle backend response
const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.detail ||
            data.error ||
            "Something went wrong."
        );
    }

    return data;
};

// SEND OTP
export const sendRegistrationOtp = async (registrationData) => {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/register/send-otp`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registrationData)
        }
    );

    return handleResponse(response);
};

// VERIFY OTP
export const verifyRegistrationOtp = async (email, otp) => {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/register/verify-otp`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, otp })
        }
    );

    return handleResponse(response);
};

// LOGIN
export const loginUser = async (email, password) => {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email.trim(),
                password
            })
        }
    );

    const data = await handleResponse(response);

    if (!data.token || !data.role) {
        throw new Error("Invalid login response from server.");
    }

    return data;
};

// STUDENT REGISTRATION
export const registerStudent = async (studentData) => {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/register/complete`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        }
    );

    return handleResponse(response);
};

// COMPANY REGISTRATION
export const registerCompany = async (companyData) => {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/register/company/complete`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(companyData)
        }
    );

    return handleResponse(response);
};