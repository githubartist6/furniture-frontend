import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaCouch,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from "react-icons/fa";

import { toast } from "react-toastify";

import "./Login.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();

  // =====================================
  // STATES
  // =====================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  // =====================================
  // INPUT CHANGE
  // =====================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================
  // LOGIN
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // =====================================
      // BASIC VALIDATION
      // =====================================

      const email =
        formData.email
          .trim()
          .toLowerCase();

      const password =
        formData.password;

      if (!email) {
        const message =
          "Email is required.";

        setError(message);
        toast.error(message);

        return;
      }

      if (!password) {
        const message =
          "Password is required.";

        setError(message);
        toast.error(message);

        return;
      }

      // =====================================
      // API REQUEST
      // =====================================

      const response =
        await fetch(
          `${API_URL}/api/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            // Backend JWT cookie
            // browser me save/send hogi
            credentials: "include",

            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

      // =====================================
      // SAFE RESPONSE PARSING
      // =====================================

      let data = {};

      try {
        data =
          await response.json();
      } catch (parseError) {
        console.error(
          "Login Response JSON Parse Error:",
          parseError
        );

        data = {};
      }

      console.log(
        "Login Status:",
        response.status
      );

      console.log(
        "Login Response:",
        data
      );

      // =====================================
      // LOGIN ERROR
      // =====================================

      if (!response.ok) {
        const serverMessage =
          data?.message ||
          "Invalid email or password.";

        // Technical details ONLY console
        console.error(
          "Login API Error:",
          {
            status:
              response.status,

            statusText:
              response.statusText,

            serverMessage,
          }
        );

        // User-facing message
        setError(serverMessage);

        toast.error(serverMessage);

        return;
      }

      // =====================================
      // USER CHECK
      // =====================================

      if (
        !data?.user ||
        typeof data.user !== "object"
      ) {
        console.error(
          "Login Error: User data missing from successful response",
          data
        );

        const message =
          "Login response was incomplete. Please try again.";

        setError(message);

        toast.error(message);

        return;
      }

      // =====================================
      // LOGIN SUCCESS
      // =====================================

      console.log(
        "Login Successfully"
      );

      console.log(
        "Logged User:",
        data.user
      );

      // =====================================
      // SAVE USER
      // =====================================

      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user
        )
      );

      // Keep compatibility with
      // existing application code
      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      // =====================================
      // SAVE TOKEN IF BACKEND RETURNS IT
      // =====================================

      if (data?.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      // =====================================
      // UPDATE NAVBAR / CART CONTEXT
      // =====================================

      window.dispatchEvent(
        new Event(
          "authChanged"
        )
      );

      // =====================================
      // SUCCESS TOAST
      // =====================================

      toast.success(
        data?.message ||
        "Login successful."
      );

      // =====================================
      // CLEAR FORM
      // =====================================

      setFormData({
        email: "",
        password: "",
      });

      setShowPassword(false);

      // =====================================
      // ADMIN CHECK
      // =====================================

      if (
        data.user?.isAdmin === true
      ) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      // =====================================
      // TECHNICAL ERROR
      // =====================================

      console.error(
        "Login Error:",
        error
      );

      // =====================================
      // USER-FACING ERROR
      // =====================================

      const message =
        "Unable to connect to the server. Please try again.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div className="furniture-login-page">
      <div className="furniture-login-container">

        {/* =====================================
            LEFT SECTION
        ===================================== */}

        <div className="furniture-login-left">

          {/* BRAND */}

          <div className="furniture-brand">

            <div className="furniture-logo">
              <FaCouch />
            </div>

            <div className="brand-text">
              <h2>
                FURNITURE
              </h2>

              <span>
                Luxury Living
              </span>
            </div>

          </div>

          {/* WELCOME */}

          <div className="welcome-content">

            <span className="welcome-label">
              WELCOME BACK
            </span>

            <h1>
              Make Your
              <br />
              Home <span>Beautiful.</span>
            </h1>

            <p>
              Login to explore our premium furniture
              collections and create a beautiful,
              comfortable home.
            </p>

          </div>

          {/* FOOTER */}

          <div className="left-footer">
            <span>
              Premium Quality
            </span>

            <span>
              •
            </span>

            <span>
              Modern Design
            </span>
          </div>

        </div>

        {/* =====================================
            RIGHT SECTION
        ===================================== */}

        <div className="furniture-login-right">

          <div className="login-card">

            {/* MOBILE LOGO */}

            <div className="mobile-logo">

              <div className="furniture-logo">
                <FaCouch />
              </div>

            </div>

            {/* HEADING */}

            <div className="login-heading">

              <h2>
                Welcome Back
              </h2>

              <p>
                Login to continue to your account
              </p>

            </div>

            {/* ERROR MESSAGE */}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* LOGIN FORM */}

            <form
              onSubmit={handleSubmit}
            >

              {/* EMAIL */}

              <div className="form-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="input-wrapper">

                  <FaEnvelope
                    className="input-icon"
                  />

                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="logininput"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    disabled={loading}
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="form-group">

                <div className="password-top">

                  <label htmlFor="password">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                  >
                    Forgot Password?
                  </Link>

                </div>

                <div className="input-wrapper">

                  <FaLock
                    className="input-icon"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    id="password"
                    name="password"
                    className="logininput"
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />

                  {/* SHOW PASSWORD */}

                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() =>
                      setShowPassword(
                        (prev) =>
                          !prev
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>

                </div>

              </div>

              {/* REMEMBER ME */}

              <div className="remember-row">

                <label>

                  <input
                    type="checkbox"
                    disabled={loading}
                  />

                  <span>
                    Remember me
                  </span>

                </label>

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >

                {loading ? (
                  <span>
                    LOGGING IN...
                  </span>
                ) : (
                  <>
                    <span>
                      LOGIN
                    </span>

                    <FaArrowRight />
                  </>
                )}

              </button>

            </form>

            {/* SIGNUP */}

            <div className="signup-section">

              <span>
                Don't have an account?
              </span>

              <Link to="/signup">
                Create Account
              </Link>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;