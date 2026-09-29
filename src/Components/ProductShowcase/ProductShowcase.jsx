import React from "react";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import "./ProductShowcase.css";
import { Link } from "react-router-dom";

const productFeatures = [
    {
        number: "01",
        title: "Smart Design",
        text: "Maximum utility with a clean and premium appearance.",
    },
    {
        number: "02",
        title: "Integrated Power",
        text: "Built-in power and USB ports for modern workspaces.",
    },
    {
        number: "03",
        title: "Hidden Storage",
        text: "Keep your workspace clean with smart hidden compartments.",
    },
    {
        number: "04",
        title: "Soft Close",
        text: "Smooth and silent drawers with premium soft-close mechanism.",
    },
];

const ProductShowcase = () => {
    return (
        <section className="product-showcase">

            {/* =====================================
                TOP HEADING
            ===================================== */}

            <div className="showcase-heading">

                <span className="showcase-subtitle">
                    PREMIUM WORKSPACE
                </span>

                <h2>
                    Designed for
                    <span> Modern Living.</span>
                </h2>

                <p>
                    Every detail is carefully crafted to combine
                    functionality, comfort and timeless elegance.
                </p>

            </div>


            {/* =====================================
                MAIN SHOWCASE
            ===================================== */}

            <div className="showcase-container">


                {/* =================================
                    LEFT PRODUCT IMAGE
                ================================= */}

                <div className="showcase-main-image">

                    <img
                        src="/Sofas.jpeg"
                        alt="Premium Executive Desk"
                    />

                    <div className="image-overlay-text">

                        <span>
                            2400 × 1000 MM
                        </span>

                        <h3>
                            SMART DESIGN.
                            <br />
                            MAXIMUM UTILITY.
                        </h3>

                    </div>

                </div>


                {/* =================================
                    CENTER FEATURES
                ================================= */}

                <div className="showcase-features">

                    {productFeatures.map((feature) => (

                        <div
                            className="feature-item"
                            key={feature.number}
                        >

                            <div className="feature-number">
                                {feature.number}
                            </div>

                            <div className="feature-content">

                                <h3>
                                    {feature.title}
                                </h3>

                                <p>
                                    {feature.text}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>


                {/* =================================
                    RIGHT PRODUCT INFO
                ================================= */}

                <div className="showcase-info">

                    <div className="info-image">

                        <img
                            src="/Tables.jpeg"
                            alt="Premium desk detail"
                        />

                    </div>


                    <div className="info-content">

                        <span className="info-label">
                            SIGNATURE D+d FRAME
                        </span>

                        <h3>
                            A unique identity.
                            <br />
                            A timeless design.
                        </h3>

                        <p>
                            Crafted with premium materials
                            and refined finishing for a
                            sophisticated workspace.
                        </p>

                    </div>


                    {/* MATERIALS */}

                    <div className="materials">

                        <h4>
                            PREMIUM MATERIALS
                        </h4>

                        <div className="material-list">

                            <span>
                                <FaCheck />
                                Walnut
                            </span>

                            <span>
                                <FaCheck />
                                Matte Black
                            </span>

                            <span>
                                <FaCheck />
                                Brushed Champagne Gold
                            </span>

                            <span>
                                <FaCheck />
                                Marble
                            </span>

                        </div>

                    </div>


                    {/* BUTTON */}

                    <button className="view-product-btn">

                        <Link to="/product" className="button-link">VIEW PRODUCT</Link>

                        <FaArrowRight />

                    </button>

                </div>


            </div>

        </section>
    );
};

export default ProductShowcase;