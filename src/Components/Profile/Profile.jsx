import React, {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaEdit,
    FaSave,
    FaTimes,
    FaArrowLeft,
} from "react-icons/fa";

import { toast } from "react-toastify";

import "./Profile.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

// ==========================================
// USERNAME REGEX
// ==========================================

const usernameRegex =
    /^[A-Za-z0-9_@-]+$/;

// ==========================================
// GET USER FROM LOCAL STORAGE
// ==========================================

const getUserFromStorage = () => {
    try {
        const savedUser =
            localStorage.getItem("user");

        if (!savedUser) {
            return null;
        }

        const parsedUser =
            JSON.parse(savedUser);

        if (
            !parsedUser ||
            typeof parsedUser !== "object"
        ) {
            console.error(
                "User Storage Error: Invalid user data in localStorage"
            );

            localStorage.removeItem("user");

            return null;
        }

        return parsedUser;
    } catch (error) {
        console.error(
            "User Storage Error:",
            error
        );

        localStorage.removeItem("user");

        return null;
    }
};

// ==========================================
// PROFILE COMPONENT
// ==========================================

const Profile = () => {
    const navigate = useNavigate();

    const [user, setUser] =
        useState(null);

    const [formData, setFormData] =
        useState({
            username: "",
            name: "",
            email: "",
            phone: "",
        });

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [editing, setEditing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    // ==========================================
    // SET USER DATA
    // ==========================================

    const setUserData = (userData) => {
        if (!userData) {
            return;
        }

        setUser(userData);

        setFormData({
            username:
                userData.username || "",

            name:
                userData.name || "",

            email:
                userData.email || "",

            phone:
                userData.phone || "",
        });
    };

    // ==========================================
    // LOAD PROFILE
    // ==========================================

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const savedUser =
                getUserFromStorage();

            // ======================================
            // NO USER
            // ======================================

            if (!savedUser) {
                navigate("/login", {
                    replace: true,
                });

                return;
            }

            // Show local user immediately
            setUserData(savedUser);

            // ======================================
            // GET LATEST USER
            // ======================================

            const response =
                await fetch(
                    `${API_URL}/api/auth/profile`,
                    {
                        method: "GET",

                        credentials:
                            "include",

                        headers: {
                            Accept:
                                "application/json",
                        },
                    }
                );

            let data = {};

            try {
                data =
                    await response.json();
            } catch (parseError) {
                console.error(
                    "GET Profile JSON Parse Error:",
                    parseError
                );

                data = {};
            }

            console.log(
                "GET Profile Status:",
                response.status
            );

            console.log(
                "GET Profile Response:",
                data
            );

            // ======================================
            // SUCCESS
            // ======================================

            if (
                response.ok &&
                data.user
            ) {
                setUserData(
                    data.user
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        data.user
                    )
                );

                window.dispatchEvent(
                    new Event(
                        "authChanged"
                    )
                );

                return;
            }

            // ======================================
            // AUTH ERROR
            // ======================================

            if (
                response.status === 401
            ) {
                console.error(
                    "Profile GET Authentication Error:",
                    {
                        status:
                            response.status,
                        serverMessage:
                            data?.message,
                    }
                );

                toast.error(
                    data?.message ||
                    "Your login session has expired. Please login again."
                );

                localStorage.removeItem(
                    "user"
                );

                navigate("/login", {
                    replace: true,
                });

                return;
            }

            // ======================================
            // OTHER API ERROR
            // ======================================

            if (!response.ok) {
                console.error(
                    "Profile GET API Error:",
                    {
                        status:
                            response.status,
                        statusText:
                            response.statusText,
                        serverMessage:
                            data?.message,
                    }
                );

                toast.error(
                    data?.message ||
                    "Unable to load your profile. Please try again."
                );
            }
        } catch (error) {
            // Technical details ONLY in console
            console.error(
                "Profile Load Error:",
                error
            );

            toast.error(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // LOAD PROFILE
    // ==========================================

    useEffect(() => {
        loadProfile();
    }, []);

    // ==========================================
    // INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        let updatedValue =
            value;

        // Phone: digits only + max 10
        if (name === "phone") {
            updatedValue =
                value
                    .replace(/\D/g, "")
                    .slice(0, 10);
        }

        setFormData((prev) => ({
            ...prev,
            [name]:
                updatedValue,
        }));

        setError("");
        setSuccess("");
    };

    // ==========================================
    // EDIT PROFILE
    // ==========================================

    const handleEdit = () => {
        setEditing(true);
        setError("");
        setSuccess("");
    };

    // ==========================================
    // CANCEL EDIT
    // ==========================================

    const handleCancel = () => {
        if (!user) {
            return;
        }

        setFormData({
            username:
                user.username || "",

            name:
                user.name || "",

            email:
                user.email || "",

            phone:
                user.phone || "",
        });

        setEditing(false);
        setError("");
        setSuccess("");
    };

    // ==========================================
    // SAVE PROFILE
    // ==========================================

    const handleSave = async (e) => {
        e.preventDefault();

        if (saving) {
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            // ======================================
            // PREPARE DATA
            // ======================================

            const username =
                formData.username
                    .trim();

            const name =
                formData.name
                    .trim();

            const email =
                formData.email
                    .trim()
                    .toLowerCase();

            const phone =
                formData.phone
                    .trim();

            // ======================================
            // USERNAME REQUIRED
            // ======================================

            if (!username) {
                setError(
                    "Username is required."
                );

                toast.error(
                    "Username is required."
                );

                return;
            }

            // ======================================
            // USERNAME VALIDATION
            // ======================================

            if (
                !usernameRegex.test(
                    username
                )
            ) {
                const message =
                    "Username can contain only letters, numbers, _, - and @. Spaces and other special characters are not allowed.";

                setError(message);

                toast.error(message);

                return;
            }

            // ======================================
            // NAME VALIDATION
            // ======================================

            if (!name) {
                setError(
                    "Name is required."
                );

                toast.error(
                    "Name is required."
                );

                return;
            }

            // ======================================
            // EMAIL VALIDATION
            // ======================================

            if (!email) {
                setError(
                    "Email is required."
                );

                toast.error(
                    "Email is required."
                );

                return;
            }

            // ======================================
            // PHONE VALIDATION
            // ======================================

            if (
                phone &&
                !/^[6-9]\d{9}$/.test(
                    phone
                )
            ) {
                const message =
                    "Please enter a valid 10-digit Indian phone number.";

                setError(message);

                toast.error(message);

                return;
            }

            // ======================================
            // PAYLOAD
            // ======================================

            const payload = {
                username,
                name,
                email,
                phone,
            };

            console.log(
                "Updating profile:",
                payload
            );

            // ======================================
            // UPDATE PROFILE
            // ======================================

            const response =
                await fetch(
                    `${API_URL}/api/auth/profile`,
                    {
                        method: "PUT",

                        credentials:
                            "include",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Accept:
                                "application/json",
                        },

                        body:
                            JSON.stringify(
                                payload
                            ),
                    }
                );

            let data = {};

            try {
                data =
                    await response.json();
            } catch (parseError) {
                console.error(
                    "PUT Profile JSON Parse Error:",
                    parseError
                );

                data = {};
            }

            console.log(
                "PUT Profile Status:",
                response.status
            );

            console.log(
                "PUT Profile Response:",
                data
            );

            // ======================================
            // 401
            // ======================================

            if (
                response.status === 401
            ) {
                console.error(
                    "Profile Update Authentication Error:",
                    {
                        status:
                            response.status,
                        serverMessage:
                            data?.message,
                    }
                );

                const message =
                    data?.message ||
                    "Your login session could not be verified. Please login again.";

                setError(message);

                toast.error(message);

                localStorage.removeItem(
                    "user"
                );

                window.dispatchEvent(
                    new Event(
                        "authChanged"
                    )
                );

                navigate("/login", {
                    replace: true,
                });

                return;
            }

            // ======================================
            // OTHER ERROR
            // ======================================

            if (!response.ok) {
                console.error(
                    "Profile Update API Error:",
                    {
                        status:
                            response.status,
                        statusText:
                            response.statusText,
                        serverMessage:
                            data?.message,
                    }
                );

                const message =
                    data?.message ||
                    "Profile update failed. Please try again.";

                setError(message);

                toast.error(message);

                return;
            }

            // ======================================
            // USER DATA CHECK
            // ======================================

            if (!data.user) {
                console.error(
                    "Profile Update Error: Updated user data missing from server response",
                    data
                );

                const message =
                    "Updated profile data was not received from the server.";

                setError(message);

                toast.error(message);

                return;
            }

            // ======================================
            // UPDATED USER
            // ======================================

            const updatedUser =
                data.user;

            // ======================================
            // UPDATE STATE
            // ======================================

            setUser(
                updatedUser
            );

            setFormData({
                username:
                    updatedUser.username ||
                    "",

                name:
                    updatedUser.name ||
                    "",

                email:
                    updatedUser.email ||
                    "",

                phone:
                    updatedUser.phone ||
                    "",
            });

            // ======================================
            // UPDATE LOCAL STORAGE
            // ======================================

            localStorage.setItem(
                "user",
                JSON.stringify(
                    updatedUser
                )
            );

            // ======================================
            // UPDATE NAVBAR
            // ======================================

            window.dispatchEvent(
                new Event(
                    "authChanged"
                )
            );

            // ======================================
            // SUCCESS
            // ======================================

            setEditing(false);

            setSuccess(
                "Profile updated successfully."
            );

            toast.success(
                data?.message ||
                "Profile updated successfully."
            );
        } catch (error) {
            // Technical details ONLY in console
            console.error(
                "Update Profile Error:",
                error
            );

            const message =
                "Unable to update profile. Please try again.";

            setError(message);

            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="profile-page">

                <div className="profile-loading">

                    <div className="profile-spinner"></div>

                    <p>
                        Loading profile...
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================
    // NO USER
    // ==========================================

    if (!user) {
        return (
            <div className="profile-page">

                <div className="profile-container">

                    <div className="profile-message profile-error">
                        Please login to view your profile.
                    </div>

                    <button
                        type="button"
                        className="profile-back-btn"
                        onClick={() =>
                            navigate(
                                "/login"
                            )
                        }
                    >
                        Login
                    </button>

                </div>

            </div>
        );
    }

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="profile-page">

            <div className="profile-container">

                {/* BACK BUTTON */}

                <button
                    type="button"
                    className="profile-back-btn"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    <FaArrowLeft />

                    Back to Home
                </button>

                {/* HEADER */}

                <div className="profile-header">

                    <div className="profile-avatar-large">

                        {(
                            user.name ||
                            user.username ||
                            "U"
                        )
                            .charAt(0)
                            .toUpperCase()}

                    </div>

                    <div className="profile-header-info">

                        <span className="profile-label">
                            MY ACCOUNT
                        </span>

                        <h1>
                            {user.name ||
                                user.username ||
                                "User"}
                        </h1>

                        <p>
                            {user.email || ""}
                        </p>

                    </div>

                    {!editing && (
                        <button
                            type="button"
                            className="profile-edit-btn"
                            onClick={
                                handleEdit
                            }
                        >
                            <FaEdit />

                            Edit Profile
                        </button>
                    )}

                </div>

                {/* ERROR */}

                {error && (
                    <div className="profile-message profile-error">
                        {error}
                    </div>
                )}

                {/* SUCCESS */}

                {success && (
                    <div className="profile-message profile-success">
                        {success}
                    </div>
                )}

                {/* PROFILE FORM */}

                <form
                    className="profile-card"
                    onSubmit={
                        handleSave
                    }
                >

                    <div className="profile-card-title">

                        <div>

                            <h2>
                                Personal Information
                            </h2>

                            <p>
                                Manage your account information
                            </p>

                        </div>

                    </div>

                    {/* USERNAME */}

                    <div className="profile-form-group">

                        <label htmlFor="username">
                            Username
                        </label>

                        <div className="profile-input-wrapper">

                            <FaUser className="profile-input-icon" />

                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={
                                    formData.username
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    !editing
                                }
                                placeholder="Enter username"
                                required
                                pattern="[A-Za-z0-9_@-]+"
                                title="Only letters, numbers, _, - and @ are allowed. Spaces and other special characters are not allowed."
                                autoComplete="username"
                            />

                        </div>

                        {editing && (
                            <small className="profile-input-help">
                                Only letters, numbers,
                                _ , - and @ are allowed.
                                No spaces.
                            </small>
                        )}

                    </div>

                    {/* NAME */}

                    <div className="profile-form-group">

                        <label htmlFor="name">
                            Full Name
                        </label>

                        <div className="profile-input-wrapper">

                            <FaUser className="profile-input-icon" />

                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={
                                    formData.name
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    !editing
                                }
                                placeholder="Enter your name"
                                required
                            />

                        </div>

                    </div>

                    {/* EMAIL */}

                    <div className="profile-form-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <div className="profile-input-wrapper">

                            <FaEnvelope className="profile-input-icon" />

                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    !editing
                                }
                                placeholder="Enter email"
                                required
                                autoComplete="email"
                            />

                        </div>

                    </div>

                    {/* PHONE */}

                    <div className="profile-form-group">

                        <label htmlFor="phone">
                            Phone Number
                        </label>

                        <div className="profile-input-wrapper">

                            <FaPhone className="profile-input-icon" />

                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={
                                    formData.phone
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    !editing
                                }
                                placeholder="Enter phone number"
                                maxLength="10"
                                inputMode="numeric"
                                autoComplete="tel"
                            />

                        </div>

                    </div>

                    {/* ACTION BUTTONS */}

                    {editing && (
                        <div className="profile-action-buttons">

                            <button
                                type="button"
                                className="profile-cancel-btn"
                                onClick={
                                    handleCancel
                                }
                                disabled={
                                    saving
                                }
                            >
                                <FaTimes />

                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="profile-save-btn"
                                disabled={
                                    saving
                                }
                            >
                                <FaSave />

                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}

                            </button>

                        </div>
                    )}

                </form>

                {/* ACCOUNT INFO */}

                <div className="account-info-card">

                    <h3>
                        Account Information
                    </h3>

                    <div className="account-info-row">

                        <span>
                            Account Type
                        </span>

                        <strong>
                            {user.isAdmin
                                ? "Administrator"
                                : "Customer"}
                        </strong>

                    </div>

                    <div className="account-info-row">

                        <span>
                            Account Status
                        </span>

                        <strong className="account-active">
                            Active
                        </strong>

                    </div>

                    {user.createdAt && (
                        <div className="account-info-row">

                            <span>
                                Member Since
                            </span>

                            <strong>
                                {new Date(
                                    user.createdAt
                                ).toLocaleDateString(
                                    "en-IN",
                                    {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    }
                                )}
                            </strong>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
};

export default Profile;