import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaCouch,
  FaUser,
  FaUserTag,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from "react-icons/fa";

import { toast } from "react-toastify";

import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    phone: "",
    password: "",
  });

  // =====================================
  // INPUT CHANGE
  // =====================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================
  // SIGNUP
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setSuccess("");

    const API_URL =
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000";

    try {
      const response = await fetch(
        `${API_URL}/api/auth/signup`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            username: formData.username.trim(),
            name: formData.fullname.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            password: formData.password,
          }),
        }
      );

      // =====================================
      // SAFE JSON PARSE
      // =====================================

      let data = {};

      try {
        data = await response.json();
      } catch (parseError) {
        console.error(
          "Signup Response Parse Error:",
          parseError
        );
      }

      // =====================================
      // API ERROR
      // =====================================

      if (!response.ok) {
        const serverMessage =
          data?.message ||
          "Unable to create your account. Please try again.";

        // Technical details only in console
        console.error("Signup API Error:", {
          status: response.status,
          statusText: response.statusText,
          message: serverMessage,
        });

        // User-facing message only through Toastify
        toast.error(serverMessage);

        setError(serverMessage);

        return;
      }

      // =====================================
      // SUCCESS
      // =====================================

      console.log("Signup Successful:", data);

      const successMessage =
        data?.message ||
        "Account created successfully. Please login.";

      toast.success(successMessage);

      setSuccess(successMessage);

      setFormData({
        username: "",
        fullname: "",
        email: "",
        phone: "",
        password: "",
      });

      setShowPassword(false);

      // Login page par redirect
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      // Technical error only in console
      console.error("Signup Error:", error);

      const userMessage =
        "Unable to connect to the server. Please try again.";

      // User-facing message only through Toastify
      toast.error(userMessage);

      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="furniture-signup-page">
      <div className="furniture-signup-container">

        {/* LEFT SECTION */}

        <div className="furniture-signup-left">
          <div className="signup-brand">
            <div className="signup-logo">
              <FaCouch />
            </div>

            <div>
              <h2>FURNITURE</h2>
              <span>Luxury Living</span>
            </div>
          </div>

          <div className="signup-welcome">
            <span className="signup-small-title">
              JOIN OUR FAMILY
            </span>

            <h1>
              Create Your
              <br />
              <span>Perfect Space.</span>
            </h1>

            <p>
              Create your account and discover premium furniture
              designed to make your home beautiful, comfortable
              and unique.
            </p>
          </div>

          <div className="signup-left-footer">
            <span>Premium Furniture</span>
            <span>•</span>
            <span>Modern Lifestyle</span>
          </div>
        </div>

        {/* RIGHT SECTION */}

        <div className="furniture-signup-right">
          <div className="signup-card">

            {/* MOBILE LOGO */}

            <div className="mobile-signup-logo">
              <div className="signup-logo">
                <FaCouch />
              </div>
            </div>

            {/* HEADING */}

            <div className="signup-heading">
              <h2>Create Account</h2>

              <p>
                Sign up to start your furniture journey
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="signup-error">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="signup-success">
                {success}
              </div>
            )}

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              {/* USERNAME */}

              <div className="signup-form-group">
                <label htmlFor="username">
                  Username
                </label>

                <div className="signup-input">
                  <FaUserTag className="signup-input-icon" />

                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* FULL NAME */}

              <div className="signup-form-group">
                <label htmlFor="fullname">
                  Full Name
                </label>

                <div className="signup-input">
                  <FaUser className="signup-input-icon" />

                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div className="signup-form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="signup-input">
                  <FaEnvelope className="signup-input-icon" />

                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* PHONE */}

              <div className="signup-form-group">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <div className="signup-input">
                  <FaUser className="signup-input-icon" />

                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="signup-form-group">
                <label htmlFor="password">
                  Password
                </label>

                <div className="signup-input">
                  <FaLock className="signup-input-icon" />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="signup-eye-btn"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>

              {/* TERMS */}

              <div className="signup-terms">
                <label>
                  <input
                    type="checkbox"
                    required
                  />

                  <span>
                    I agree to the Terms & Conditions
                  </span>
                </label>
              </div>

              {/* BUTTON */}

              <button
                type="submit"
                className="signup-button"
                disabled={loading}
              >
                {loading ? (
                  <span>CREATING...</span>
                ) : (
                  <>
                    <span>CREATE ACCOUNT</span>
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* LOGIN */}

            <div className="login-link-section">
              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;