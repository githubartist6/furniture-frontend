import React from "react";

import {
    FaHome,
    FaArrowLeft,
    FaExclamationTriangle,
} from "react-icons/fa";

import {
    useNavigate,
} from "react-router-dom";

import "./NotFound.css";


const NotFound = () => {

    const navigate = useNavigate();

    return (
        <div className="not-found-page">

            <div className="not-found-container">

                {/* =================================
                    ICON
                ================================= */}

                <div className="not-found-icon">
                    <FaExclamationTriangle />
                </div>


                {/* =================================
                    404
                ================================= */}

                <div className="not-found-number">
                    404
                </div>


                {/* =================================
                    CONTENT
                ================================= */}

                <div className="not-found-content">

                    <h1>
                        Page Not Found
                    </h1>

                    <p>
                        Sorry, the page you're looking
                        for doesn't exist or may have
                        been moved.
                    </p>

                </div>


                {/* =================================
                    BUTTONS
                ================================= */}

                <div className="not-found-buttons">

                    {/* HOME */}

                    <button
                        type="button"
                        className="not-found-home-btn"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        <FaHome />

                        <span>
                            Go Home
                        </span>
                    </button>

                </div>

            </div>

        </div>
    );
};


export default NotFound;