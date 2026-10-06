import { useState } from "react";

import {
    sendRegistrationOtp,
    verifyRegistrationOtp
} from "../../services/authApi.js";

function OtpVerification({
    email,
    registrationData,
    onVerified,
    onError,
    onMessage
}) {

    const [otp, setOtp] = useState("");

    const [otpSent, setOtpSent] = useState(false);

    const [otpVerified, setOtpVerified] = useState(false);

    const [loading, setLoading] = useState(false);


    // ======================================
    // SEND OTP
    // ======================================

    const handleSendOtp = async () => {

        onError("");
        onMessage("");

        setLoading(true);


        try {

            await sendRegistrationOtp(
                registrationData
            );


            setOtpSent(true);

            onMessage(
                "OTP sent successfully. Please check your email."
            );


        } catch (error) {

            onError(
                error.message ||
                "Failed to send OTP."
            );


        } finally {

            setLoading(false);
        }
    };


    // ======================================
    // VERIFY OTP
    // ======================================

    const handleVerifyOtp = async () => {

        onError("");
        onMessage("");


        if (!otp) {

            onError(
                "Please enter the OTP."
            );

            return;
        }


        if (otp.length !== 6) {

            onError(
                "OTP must contain 6 digits."
            );

            return;
        }


        setLoading(true);


        try {

            await verifyRegistrationOtp(
                email,
                otp
            );


            setOtpVerified(true);


            onMessage(
                "Email verified successfully."
            );


            // Tell parent component
            onVerified();


        } catch (error) {

            onError(
                error.message ||
                "Invalid or expired OTP."
            );


        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="otp-section">


            {/* ============================== */}
            {/* SEND OTP BUTTON */}
            {/* ============================== */}

            <button
                type="button"
                className="auth-submit"
                onClick={handleSendOtp}
                disabled={
                    loading ||
                    otpSent ||
                    !email
                }
            >

                {otpSent
                    ? "OTP Sent"
                    : loading
                        ? "Sending OTP..."
                        : "Send OTP"
                }

            </button>


            {/* ============================== */}
            {/* OTP SECTION */}
            {/* ============================== */}

            {otpSent && (

                <div className="otp-input-section">

                    <div className="form-group">

                        <label htmlFor="otp">
                            Enter OTP
                        </label>


                        <input
                            id="otp"
                            type="text"
                            value={otp}
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            disabled={otpVerified}
                            onChange={(event) => {

                                const value =
                                    event.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 6);

                                setOtp(value);
                            }}
                        />

                    </div>


                    {/* ============================== */}
                    {/* VERIFY OTP BUTTON */}
                    {/* ============================== */}

                    <button
                        type="button"
                        className="auth-submit"
                        onClick={handleVerifyOtp}
                        disabled={
                            loading ||
                            otpVerified
                        }
                    >

                        {otpVerified
                            ? "OTP Verified ✓"
                            : loading
                                ? "Verifying..."
                                : "Verify OTP"
                        }

                    </button>

                </div>
            )}

        </div>
    );
}

export default OtpVerification;