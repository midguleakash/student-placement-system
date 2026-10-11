const API_BASE_URL = "http://localhost:8080";

// STEP 1: Handle backend response
const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong."
        );
    }

    return data;
};

// ======================================
// SEND OTP
// ======================================

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


// ======================================
// VERIFY OTP
// ======================================

export const verifyRegistrationOtp = async (
    email,
    otp
) => {

    const response = await fetch(
        `${API_BASE_URL}/api/auth/register/verify-otp`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                otp
            })
        }
    );


    return handleResponse(response);
};