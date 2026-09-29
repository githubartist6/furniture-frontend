import React from "react";
import {
    FaBuilding,
    FaMapMarkerAlt,
    FaUsers,
    FaArrowDown,
    FaCheckCircle,
} from "react-icons/fa";

import "./About.css";


// ==================================================
// PARTNER COMPANIES
// ==================================================

const partnerCompanies = [
    {
        id: 1,
        name: "D+D DESIGN",
        type: "Design & Innovation",
        description:
            "Responsible for product design, concepts and creative innovation.",
    },
    {
        id: 2,
        name: "D+D FURNITURE",
        type: "Furniture Manufacturing",
        description:
            "Handles premium furniture production and quality manufacturing.",
    },
    {
        id: 3,
        name: "D+D INTERIORS",
        type: "Interior Solutions",
        description:
            "Creates complete workspace and interior solutions for clients.",
    },
    {
        id: 4,
        name: "D+D TRADING",
        type: "Sales & Distribution",
        description:
            "Manages sales, distribution and business relationships.",
    },
];


// ==================================================
// ABOUT COMPONENT
// ==================================================

const About = () => {

    return (
        <main className="about-page">


            {/* ==================================================
                ABOUT HERO
            ================================================== */}

            <section className="about-hero">

                <div className="about-hero-overlay"></div>

                <div className="about-hero-content">

                    <span className="about-small-title">
                        ABOUT OUR COMPANY
                    </span>

                    <h1>
                        Four Companies.
                        <br />
                        <span>One Vision.</span>
                    </h1>

                    <p>
                        A Mumbai-based business group bringing
                        design, manufacturing, interiors and
                        distribution together under one vision.
                    </p>

                </div>

            </section>



            {/* ==================================================
                INTRODUCTION
            ================================================== */}

            <section className="about-introduction">

                <div className="about-intro-container">

                    <div className="about-intro-left">

                        <span className="section-label">
                            WHO WE ARE
                        </span>

                        <h2>
                            Built Together,
                            <br />
                            <span>Growing Together.</span>
                        </h2>

                    </div>


                    <div className="about-intro-right">

                        <p>
                            Our company is built on the strength of
                            four specialized businesses working
                            together as one organization.
                        </p>

                        <p>
                            Each company brings its own expertise,
                            while our combined experience allows us
                            to deliver premium furniture and
                            workspace solutions from concept to
                            completion.
                        </p>

                        <div className="location-box">

                            <FaMapMarkerAlt />

                            <div>
                                <strong>
                                    MUMBAI, INDIA
                                </strong>

                                <span>
                                    Head Office & Operations
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

            </section>



            {/* ==================================================
                COMPANY TREE
            ================================================== */}

            <section className="company-tree-section">

                <div className="tree-heading">

                    <span className="section-label">
                        OUR BUSINESS STRUCTURE
                    </span>

                    <h2>
                        Four Companies.
                        <span> One Company.</span>
                    </h2>

                    <p>
                        Four specialized businesses working
                        together to create one powerful organization.
                    </p>

                </div>


                {/* ==================================================
                    TREE STRUCTURE
                ================================================== */}

                <div className="company-tree">


                    {/* TOP PARTNER COMPANIES */}

                    <div className="partner-companies">

                        {partnerCompanies.map((company) => (

                            <div
                                className="company-card"
                                key={company.id}
                            >

                                <div className="company-icon">
                                    <FaBuilding />
                                </div>

                                <span className="company-number">
                                    0{company.id}
                                </span>

                                <h3>
                                    {company.name}
                                </h3>

                                <strong>
                                    {company.type}
                                </strong>

                                <p>
                                    {company.description}
                                </p>

                            </div>

                        ))}

                    </div>


                    {/* TREE CONNECTOR */}

                    <div className="tree-connector">

                        <div className="horizontal-line"></div>

                        <div className="vertical-line"></div>

                        <div className="connector-arrow">
                            <FaArrowDown />
                        </div>

                    </div>


                    {/* MAIN COMPANY */}

                    <div className="main-company">

                        <div className="main-company-icon">
                            <FaUsers />
                        </div>

                        <div className="main-company-content">

                            <span>
                                CENTRAL ORGANIZATION
                            </span>

                            <h3>
                                D+D GROUP
                            </h3>

                            <p>
                                One unified company bringing
                                together design, manufacturing,
                                interiors and distribution.
                            </p>

                            <div className="main-company-location">

                                <FaMapMarkerAlt />

                                Mumbai, Maharashtra, India

                            </div>

                        </div>

                    </div>


                    {/* BOTTOM CONNECTOR */}

                    <div className="bottom-connector">

                        <div></div>

                    </div>


                    {/* OPERATIONS */}

                    <div className="operations-card">

                        <div className="operations-icon">
                            <FaCheckCircle />
                        </div>

                        <div>

                            <span>
                                OUR COMMON GOAL
                            </span>

                            <h3>
                                Premium Furniture &
                                Workspace Solutions
                            </h3>

                            <p>
                                One team, one vision and one
                                commitment to quality.
                            </p>

                        </div>

                    </div>

                </div>

            </section>



            {/* ==================================================
                VALUES
            ================================================== */}

            <section className="about-values">

                <div className="values-container">

                    <div className="values-heading">

                        <span className="section-label">
                            OUR APPROACH
                        </span>

                        <h2>
                            Strength in
                            <span> Collaboration.</span>
                        </h2>

                    </div>


                    <div className="values-grid">

                        <div className="value-card">

                            <span>01</span>

                            <h3>
                                One Vision
                            </h3>

                            <p>
                                All four businesses work toward
                                the same long-term vision.
                            </p>

                        </div>


                        <div className="value-card">

                            <span>02</span>

                            <h3>
                                Specialized Expertise
                            </h3>

                            <p>
                                Each company focuses on its
                                own area of expertise.
                            </p>

                        </div>


                        <div className="value-card">

                            <span>03</span>

                            <h3>
                                Premium Quality
                            </h3>

                            <p>
                                Quality remains at the center
                                of everything we create.
                            </p>

                        </div>


                        <div className="value-card">

                            <span>04</span>

                            <h3>
                                Mumbai Based
                            </h3>

                            <p>
                                Our central operations are
                                managed from Mumbai, India.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
};


export default About;