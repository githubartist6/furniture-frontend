import React, { useEffect, useRef, useState } from "react";
import {
    FaArrowLeft,
    FaEnvelope,
    FaLock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./ForgotPassword.css";

const API_URL = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
).replace(/\/+$/, "");

const ForgotPassword = () => {
    const navigate = useNavigate();

    // ======================================================
    // STATES
    // ======================================================

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");

    const [otpBoxes, setOtpBoxes] = useState([
        "",
        "",
        "",
        "",
        "",
        "",
    ]);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetToken, setResetToken] = useState("");

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [resendTimer, setResendTimer] = useState(0);

    // ======================================================
    // REFS
    // ======================================================

    const otpInputRefs = useRef([]);
    const resendIntervalRef = useRef(null);
    const redirectTimeoutRef = useRef(null);

    // ======================================================
    // CLEANUP TIMERS
    // ======================================================

    useEffect(() => {
        return () => {
            if (resendIntervalRef.current) {
                clearInterval(resendIntervalRef.current);
            }

            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
            }
        };
    }, []);

    // ======================================================
    // HELPERS
    // ======================================================

    const clearMessages = () => {
        setError("");
        setSuccess("");
    };

    const startResendTimer = () => {
        if (resendIntervalRef.current) {
            clearInterval(resendIntervalRef.current);
        }

        setResendTimer(60);

        resendIntervalRef.current = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(resendIntervalRef.current);
                    resendIntervalRef.current = null;
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);
    };

    const parseResponse = async (response, context) => {
        try {
            return await response.json();
        } catch (parseError) {
            console.error(
                `${context} Response JSON Parse Error:`,
                parseError
            );

            return {};
        }
    };

    // ======================================================
    // OTP VALUE
    // ======================================================

    const getOtpValue = () => {
        return otpBoxes.join("");
    };

    // ======================================================
    // OTP CHANGE
    // ======================================================

    const handleOtpChange = (index, value) => {
        const digit = value.replace(/\D/g, "").slice(-1);

        const updatedOtp = [...otpBoxes];

        updatedOtp[index] = digit;

        setOtpBoxes(updatedOtp);

        // Move cursor to next box
        if (digit && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    // ======================================================
    // OTP KEYBOARD
    // ======================================================

    const handleOtpKeyDown = (index, event) => {
        // BACKSPACE
        if (event.key === "Backspace") {
            event.preventDefault();

            const updatedOtp = [...otpBoxes];

            // Current box has value
            if (updatedOtp[index]) {
                updatedOtp[index] = "";

                setOtpBoxes(updatedOtp);
                return;
            }

            // Current box empty -> previous box
            if (index > 0) {
                updatedOtp[index - 1] = "";

                setOtpBoxes(updatedOtp);

                otpInputRefs.current[index - 1]?.focus();
            }

            return;
        }

        // LEFT ARROW
        if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();

            otpInputRefs.current[index - 1]?.focus();

            return;
        }

        // RIGHT ARROW
        if (event.key === "ArrowRight" && index < 5) {
            event.preventDefault();

            otpInputRefs.current[index + 1]?.focus();

            return;
        }
    };

    // ======================================================
    // OTP PASTE
    // ======================================================

    const handleOtpPaste = (event) => {
        event.preventDefault();

        const pastedValue = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pastedValue) {
            return;
        }

        const updatedOtp = [
            "",
            "",
            "",
            "",
            "",
            "",
        ];

        pastedValue.split("").forEach((digit, index) => {
            updatedOtp[index] = digit;
        });

        setOtpBoxes(updatedOtp);

        const focusIndex = Math.min(
            pastedValue.length,
            5
        );

        otpInputRefs.current[focusIndex]?.focus();
    };

    // ======================================================
    // STEP 1 - SEND OTP
    // ======================================================

    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        clearMessages();

        const cleanEmail = email.trim().toLowerCase();

        // EMAIL VALIDATION
        if (!cleanEmail) {
            const message =
                "Please enter your email address.";

            setError(message);
            toast.error(message);

            return;
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                cleanEmail
            )
        ) {
            const message =
                "Please enter a valid email address.";

            setError(message);
            toast.error(message);

            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/forgot-password/request-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        email: cleanEmail,
                    }),
                }
            );

            const data = await parseResponse(
                response,
                "Send OTP"
            );

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to send OTP. Please try again.";

                setError(serverMessage);
                toast.error(serverMessage);

                return;
            }

            setEmail(cleanEmail);

            setSuccess(
                "OTP has been sent to your registered email address."
            );

            toast.success(
                data?.message ||
                "OTP sent successfully."
            );

            setOtpBoxes([
                "",
                "",
                "",
                "",
                "",
                "",
            ]);

            setStep(2);

            startResendTimer();

            setTimeout(() => {
                otpInputRefs.current[0]?.focus();
            }, 100);
        } catch (error) {
            console.error(
                "Send OTP Error:",
                error
            );

            const message =
                "Unable to connect to the server. Please try again.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // STEP 2 - VERIFY OTP
    // ======================================================

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        clearMessages();

        const cleanOtp = getOtpValue();

        if (!/^\d{6}$/.test(cleanOtp)) {
            const message =
                "Please enter the complete 6-digit OTP.";

            setError(message);
            toast.error(message);

            return;
        }

        if (!email.trim()) {
            const message =
                "Email session is missing. Please start again.";

            setError(message);
            toast.error(message);

            return;
        }

        setLoading(true);

        try {
            const cleanEmail =
                email.trim().toLowerCase();

            const response = await fetch(
                `${API_URL}/api/auth/forgot-password/verify-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        email: cleanEmail,
                        otp: cleanOtp,
                    }),
                }
            );

            const data = await parseResponse(
                response,
                "Verify OTP"
            );

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Invalid OTP. Please try again.";

                setError(serverMessage);
                toast.error(serverMessage);

                return;
            }

            if (!data?.resetToken) {
                const message =
                    "Password reset session could not be created. Please try again.";

                setError(message);
                toast.error(message);

                return;
            }

            setResetToken(data.resetToken);

            setSuccess(
                "OTP verified successfully. Create your new password."
            );

            toast.success(
                data?.message ||
                "OTP verified successfully."
            );

            setStep(3);
        } catch (error) {
            console.error(
                "Verify OTP Error:",
                error
            );

            const message =
                "Unable to connect to the server. Please try again.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // RESEND OTP
    // ======================================================

    const handleResendOTP = async () => {
        if (
            resendTimer > 0 ||
            resendLoading ||
            loading
        ) {
            return;
        }

        clearMessages();

        const cleanEmail =
            email.trim().toLowerCase();

        if (!cleanEmail) {
            const message =
                "Email session is missing. Please start again.";

            setError(message);
            toast.error(message);

            return;
        }

        setResendLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/forgot-password/request-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        email: cleanEmail,
                    }),
                }
            );

            const data = await parseResponse(
                response,
                "Resend OTP"
            );

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to resend OTP. Please try again.";

                setError(serverMessage);
                toast.error(serverMessage);

                return;
            }

            setOtpBoxes([
                "",
                "",
                "",
                "",
                "",
                "",
            ]);

            const remaining =
                data?.remainingOtpToday;

            let successMessage =
                "A new OTP has been sent to your email.";

            if (
                remaining !== undefined &&
                remaining !== null
            ) {
                const count = Number(remaining);

                if (Number.isFinite(count)) {
                    successMessage =
                        `New OTP sent successfully. ${count} OTP request${count === 1 ? "" : "s"
                        } remaining today.`;
                }
            }

            setSuccess(successMessage);

            toast.success(
                data?.message ||
                "A new OTP has been sent to your email."
            );

            startResendTimer();

            setTimeout(() => {
                otpInputRefs.current[0]?.focus();
            }, 100);
        } catch (error) {
            console.error(
                "Resend OTP Error:",
                error
            );

            const message =
                "Unable to connect to the server. Please try again.";

            setError(message);
            toast.error(message);
        } finally {
            setResendLoading(false);
        }
    };

    // ======================================================
    // CHANGE EMAIL
    // ======================================================

    const handleChangeEmail = () => {
        clearMessages();

        setOtpBoxes([
            "",
            "",
            "",
            "",
            "",
            "",
        ]);

        setResetToken("");
        setNewPassword("");
        setConfirmPassword("");

        if (resendIntervalRef.current) {
            clearInterval(
                resendIntervalRef.current
            );

            resendIntervalRef.current = null;
        }

        setResendTimer(0);
        setStep(1);
    };

    // ======================================================
    // STEP 3 - RESET PASSWORD
    // ======================================================

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        clearMessages();

        if (!newPassword) {
            const message =
                "Please enter a new password.";

            setError(message);
            toast.error(message);

            return;
        }

        if (newPassword.length < 6) {
            const message =
                "Password must be at least 6 characters.";

            setError(message);
            toast.error(message);

            return;
        }

        if (
            newPassword !== confirmPassword
        ) {
            const message =
                "Passwords do not match.";

            setError(message);
            toast.error(message);

            return;
        }

        if (!resetToken) {
            const message =
                "Password reset session is invalid. Please start again.";

            setError(message);
            toast.error(message);

            return;
        }

        if (!email.trim()) {
            const message =
                "Password reset session is incomplete. Please start again.";

            setError(message);
            toast.error(message);

            return;
        }

        setLoading(true);

        try {
            const cleanEmail =
                email.trim().toLowerCase();

            const response = await fetch(
                `${API_URL}/api/auth/forgot-password/reset`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        email: cleanEmail,
                        resetToken,
                        newPassword,
                    }),
                }
            );

            const data = await parseResponse(
                response,
                "Reset Password"
            );

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to reset password. Please try again.";

                setError(serverMessage);
                toast.error(serverMessage);

                return;
            }

            const successMessage =
                data?.message ||
                "Password reset successfully.";

            setSuccess(
                `${successMessage} Redirecting to login...`
            );

            toast.success(successMessage);

            setNewPassword("");
            setConfirmPassword("");
            setResetToken("");

            if (redirectTimeoutRef.current) {
                clearTimeout(
                    redirectTimeoutRef.current
                );
            }

            redirectTimeoutRef.current =
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
        } catch (error) {
            console.error(
                "Reset Password Error:",
                error
            );

            const message =
                "Unable to connect to the server. Please try again.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // RENDER
    // ======================================================

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-card">

                {/* BACK BUTTON */}

                <button
                    type="button"
                    className="forgot-back-btn"
                    onClick={() =>
                        navigate("/login")
                    }
                >
                    <FaArrowLeft />

                    <span>
                        Back to Login
                    </span>
                </button>

                {/* HEADER */}

                <div className="forgot-password-header">

                    {step === 1 && (
                        <>
                            <div className="forgot-icon">
                                <FaEnvelope />
                            </div>

                            <h1>
                                Forgot Password?
                            </h1>

                            <p>
                                Enter your registered
                                email address and
                                we'll send you an OTP.
                            </p>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="forgot-icon">
                                <FaEnvelope />
                            </div>

                            <h1>
                                Verify OTP
                            </h1>

                            <p>
                                Enter the 6-digit OTP
                                sent to{" "}
                                <strong>
                                    {email}
                                </strong>
                            </p>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="forgot-icon">
                                <FaLock />
                            </div>

                            <h1>
                                Create New Password
                            </h1>

                            <p>
                                Enter a new password
                                for your account.
                            </p>
                        </>
                    )}

                </div>

                {/* ERROR */}

                {error && (
                    <div className="forgot-message forgot-error">
                        {error}
                    </div>
                )}

                {/* SUCCESS */}

                {success && (
                    <div className="forgot-message forgot-success">
                        {success}
                    </div>
                )}

                {/* ==================================================
                    STEP 1
                ================================================== */}

                {step === 1 && (
                    <form
                        onSubmit={handleSendOTP}
                        className="forgot-password-form"
                    >
                        <div className="forgot-input-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="forgot-input-wrapper">
                                <FaEnvelope />

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your registered email"
                                    autoComplete="email"
                                    disabled={loading}
                                    required
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="forgot-primary-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Sending OTP..."
                                : "Send OTP"}
                        </button>
                    </form>
                )}

                {/* ==================================================
                    STEP 2 - OTP
                ================================================== */}

                {step === 2 && (
                    <form
                        onSubmit={handleVerifyOTP}
                        className="forgot-password-form"
                    >
                        <div className="forgot-input-group">

                            <label>
                                Enter OTP
                            </label>

                            <div className="forgot-otp-container">

                                {otpBoxes.map(
                                    (digit, index) => (
                                        <input
                                            key={index}
                                            ref={(element) => {
                                                otpInputRefs.current[
                                                    index
                                                ] = element;
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) =>
                                                handleOtpChange(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleOtpKeyDown(
                                                    index,
                                                    e
                                                )
                                            }
                                            onPaste={
                                                handleOtpPaste
                                            }
                                            disabled={
                                                loading
                                            }
                                            aria-label={`OTP digit ${index + 1
                                                }`}
                                            className="forgot-otp-box"
                                        />
                                    )
                                )}

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="forgot-primary-btn forgot-verify-btn"
                            disabled={
                                loading ||
                                getOtpValue().length !== 6
                            }
                        >
                            {loading
                                ? "Verifying..."
                                : getOtpValue().length === 6
                                    ? "Verify OTP"
                                    : "Verify OTP"}
                        </button>

                        <div className="forgot-secondary-actions">

                            <button
                                type="button"
                                onClick={
                                    handleResendOTP
                                }
                                disabled={
                                    resendTimer > 0 ||
                                    resendLoading ||
                                    loading
                                }
                                className="forgot-link-btn"
                            >
                                {resendLoading
                                    ? "Sending..."
                                    : resendTimer > 0
                                        ? `Resend OTP in ${resendTimer}s`
                                        : "Resend OTP"}
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleChangeEmail
                                }
                                className="forgot-link-btn"
                                disabled={
                                    loading ||
                                    resendLoading
                                }
                            >
                                Change Email
                            </button>

                        </div>
                    </form>
                )}

                {/* ==================================================
                    STEP 3
                ================================================== */}

                {step === 3 && (
                    <form
                        onSubmit={
                            handleResetPassword
                        }
                        className="forgot-password-form"
                    >
                        <div className="forgot-input-group">

                            <label htmlFor="newPassword">
                                New Password
                            </label>

                            <div className="forgot-input-wrapper">
                                <FaLock />

                                <input
                                    id="newPassword"
                                    type="password"
                                    value={
                                        newPassword
                                    }
                                    onChange={(e) =>
                                        setNewPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                    disabled={loading}
                                    minLength={6}
                                    required
                                />
                            </div>

                        </div>

                        <div className="forgot-input-group">

                            <label htmlFor="confirmPassword">
                                Confirm New Password
                            </label>

                            <div className="forgot-input-wrapper">
                                <FaLock />

                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={
                                        confirmPassword
                                    }
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                    disabled={loading}
                                    minLength={6}
                                    required
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="forgot-primary-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Resetting Password..."
                                : "Reset Password"}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default ForgotPassword;