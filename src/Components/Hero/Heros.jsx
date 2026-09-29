import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    FaArrowRight,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";

import "./Heros.css";


const heroImages = [
    "/Sofas.jpeg",
    "/Beds.jpeg",
    "/Chairs.jpeg",
    "/Tables.jpeg",
];


const Heros = () => {

    // Extra first image for smooth infinite loop
    const slides = [
        ...heroImages,
        heroImages[0],
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    const [isTransitioning, setIsTransitioning] = useState(true);


    // ==========================================
    // AUTO SLIDER
    // ==========================================

    useEffect(() => {

        const interval = setInterval(() => {

            setCurrentSlide((prev) => prev + 1);

        }, 3000);

        return () => clearInterval(interval);

    }, []);


    // ==========================================
    // INFINITE LOOP RESET
    // ==========================================

    useEffect(() => {

        if (currentSlide === heroImages.length) {

            const resetTimer = setTimeout(() => {

                setIsTransitioning(false);

                setCurrentSlide(0);

            }, 850);


            return () => clearTimeout(resetTimer);
        }

    }, [currentSlide]);


    // ==========================================
    // RE-ENABLE TRANSITION
    // ==========================================

    useEffect(() => {

        if (!isTransitioning) {

            const timer = setTimeout(() => {

                setIsTransitioning(true);

            }, 50);

            return () => clearTimeout(timer);

        }

    }, [isTransitioning]);


    // ==========================================
    // NEXT
    // ==========================================

    const nextSlide = () => {

        if (currentSlide >= heroImages.length) {
            return;
        }

        setCurrentSlide((prev) => prev + 1);

    };


    // ==========================================
    // PREVIOUS
    // ==========================================

    const previousSlide = () => {

        if (currentSlide === 0) {

            setIsTransitioning(false);

            setCurrentSlide(heroImages.length - 1);

            setTimeout(() => {
                setIsTransitioning(true);
            }, 50);

            return;
        }

        setCurrentSlide((prev) => prev - 1);

    };


    // ==========================================
    // DOT
    // ==========================================

    const goToSlide = (index) => {

        setCurrentSlide(index);

    };


    return (

        <section className="hero-section">


            {/* ==================================
                BACKGROUND IMAGE SLIDER
            ================================== */}

            <div className="hero-slider">

                <div
                    className="hero-track"
                    style={{
                        transform: `translateX(-${currentSlide * 100}%)`,
                        transition: isTransitioning
                            ? "transform 0.85s cubic-bezier(0.65, 0, 0.35, 1)"
                            : "none",
                    }}
                >

                    {slides.map((image, index) => (

                        <div
                            className="hero-slide"
                            key={index}
                            style={{
                                backgroundImage: `url("${image}")`,
                            }}
                        />

                    ))}

                </div>

            </div>



            {/* ==================================
                DARK OVERLAY
            ================================== */}

            <div className="hero-overlay"></div>



            {/* ==================================
                FIXED CONTENT
            ================================== */}

            <div className="hero-container">

                <div className="hero-content">

                    <span className="hero-subtitle">
                        PREMIUM FURNITURE COLLECTION
                    </span>


                    <h1 className="hero-title">

                        Stylish Furniture

                        <br />

                        <span>
                            for Modern Living.
                        </span>

                    </h1>


                    <p className="hero-description">

                        Transform your space with our premium furniture

                        <br className="desktop-only" />

                        designed for comfort, style and lasting quality.

                    </p>


                    <div className="hero-buttons">

                        <Link
                            to="/product"
                            className="hero-btn shop-btn"
                        >

                            <span>
                                SHOP NOW
                            </span>

                            <FaArrowRight />

                        </Link>


                        <Link
                            to="/about"
                            className="hero-btn explore-btn"
                        >

                            <span>
                                EXPLORE COLLECTION
                            </span>

                            <FaArrowRight />

                        </Link>

                    </div>

                </div>

            </div>



            {/* ==================================
                PREVIOUS BUTTON
            ================================== */}

            <button
                type="button"
                className="hero-arrow hero-prev"
                onClick={previousSlide}
                aria-label="Previous slide"
            >

                <FaChevronLeft />

            </button>



            {/* ==================================
                NEXT BUTTON
            ================================== */}

            <button
                type="button"
                className="hero-arrow hero-next"
                onClick={nextSlide}
                aria-label="Next slide"
            >

                <FaChevronRight />

            </button>



            {/* ==================================
                DOTS
            ================================== */}

            <div className="hero-dots">

                {heroImages.map((_, index) => (

                    <button
                        type="button"
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`hero-dot ${index ===
                            (currentSlide === heroImages.length
                                ? 0
                                : currentSlide)
                            ? "active"
                            : ""
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />

                ))}

            </div>


        </section>
    );
};


export default Heros;