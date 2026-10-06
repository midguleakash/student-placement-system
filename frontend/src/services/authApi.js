const API_BASE_URL = "http://localhost:8080";


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


    const data = await response.text();


    if (!response.ok) {
        throw new Error(data);
    }


    return data;
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


    const data = await response.text();


    if (!response.ok) {
        throw new Error(data);
    }


    return data;
};