import React from "react";
import "./FurnitureModes.css";

const furnitureModes = [
    {
        id: 1,
        image: "/Beds.jpeg",
        title: "EXECUTIVE DESK MODE",
        description: "A statement of leadership and focus.",
    },
    {
        id: 2,
        image: "/Sofas.jpeg",
        title: "MEETING TABLE MODE",
        description: "From solo work to team conversations.",
    },
    {
        id: 3,
        image: "/Chairs.jpeg",
        title: "REFRESHMENT STATION",
        description: "Coffee, connect, and recharge.",
    },
    {
        id: 4,
        image: "/Tables.jpeg",
        title: "STANDING WORK MODE",
        description: "Adjustable height for better productivity.",
    },
];

const FurnitureModes = () => {

    return (

        <section className="furniture-modes">

            <div className="furniture-modes-scroll">

                <div className="furniture-modes-container">

                    {furnitureModes.map((item) => (

                        <div
                            className="mode-card"
                            key={item.id}
                        >

                            {/* IMAGE */}

                            <div className="mode-image">

                                <img
                                    src={item.image}
                                    alt={item.title}
                                />

                            </div>


                            {/* CONTENT */}

                            <div className="mode-content">

                                <h3>

                                    <span className="mode-number">
                                        {item.id}.
                                    </span>

                                    {item.title}

                                </h3>


                                <p>
                                    {item.description}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </section>

    );
};

export default FurnitureModes;