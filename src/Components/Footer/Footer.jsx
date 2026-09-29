import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import {
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaYoutube,
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt
} from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="footer">

            <div className="footer-container">

                {/* ================= BRAND ================= */}
                <div className="footer-box footer-brand">

                    <Link to="/" className="footer-logo">
                        <img
                            src="https://png.pngtree.com/png-clipart/20250626/original/pngtree-furniture-logo-transparent-image-free-online-download-png-image_21238326.png"
                            alt="Furniture Logo"
                        />
                        <span>FURNITURE</span>
                    </Link>

                    <p>
                        Premium furniture designed to make your
                        home beautiful, comfortable and stylish.
                    </p>

                    <div className="footer-social">

                        <a href="#" aria-label="Facebook">
                            <FaFacebookF />
                        </a>

                        <a href="#" aria-label="Instagram">
                            <FaInstagram />
                        </a>

                        <a href="#" aria-label="Twitter">
                            <FaTwitter />
                        </a>

                        <a href="#" aria-label="Youtube">
                            <FaYoutube />
                        </a>

                    </div>

                </div>


                {/* ================= QUICK LINKS ================= */}
                <div className="footer-box">

                    <h3>Quick Links</h3>

                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>

                        <li>
                            <Link to="/product">All Products</Link>
                        </li>

                        <li>
                            <Link to="/sofas">Sofas</Link>
                        </li>

                        <li>
                            <Link to="/beds">Beds</Link>
                        </li>

                        <li>
                            <Link to="/tables">Tables</Link>
                        </li>
                    </ul>

                </div>


                {/* ================= CATEGORIES ================= */}
                <div className="footer-box">

                    <h3>Categories</h3>

                    <ul>
                        <li>
                            <Link to="/chairs">Chairs</Link>
                        </li>

                        <li>
                            <Link to="/wardrobes">Wardrobes</Link>
                        </li>

                        <li>
                            <Link to="/cart">Shopping Cart</Link>
                        </li>
                    </ul>

                </div>


                {/* ================= CONTACT ================= */}
                <div className="footer-box footer-contact">

                    <h3>Contact Us</h3>

                    <div className="footer-contact-item">
                        <FaPhoneAlt />
                        <a href="tel:+917667363767">
                            +91 76673 63767
                        </a>
                    </div>

                    <div className="footer-contact-item">
                        <FaEnvelope />
                        <a href="mailto:info@furniture.com">
                            info@furniture.com
                        </a>
                    </div>

                    <div className="footer-contact-item">
                        <FaMapMarkerAlt />
                        <span>
                            India
                        </span>
                    </div>

                </div>


                {/* ================= DEVELOPER ================= */}
                <div className="footer-box footer-developer">

                    <h3>Website Developer</h3>

                    <p>
                        This website is designed and developed by
                    </p>

                    <h4>jkcoder01</h4>

                    <a
                        href="tel:+917667363767"
                        className="developer-contact"
                    >
                        <FaPhoneAlt />
                        +91 76673 63767
                    </a>

                </div>

            </div>


            {/* ================= BOTTOM ================= */}

            <div className="footer-bottom">

                <p>
                    © {new Date().getFullYear()} FURNITURE.
                    All Rights Reserved.
                </p>

                <p>
                    Developed by{" "}
                    <strong>jkcoder01</strong>
                </p>

            </div>

        </footer>
    );
};

export default Footer;