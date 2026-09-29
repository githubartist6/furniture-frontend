import React, { useState } from "react";
import "./Sofas.css";
import { Link } from "react-router-dom";
import { FaArrowRight, FaSortAmountDown } from "react-icons/fa";

import products from "../../Data/Furniture-Products.json";

const Sofas = () => {

    // Default Low to High
    const [sortOrder, setSortOrder] = useState("low-high");

    // JSON se sirf Sofa products
    const sofaProducts = products.filter((product) =>
        product.category?.toLowerCase().includes("sofa")
    );

    // Price ke according sorting
    const sortedSofas = [...sofaProducts].sort((a, b) => {

        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;

        if (sortOrder === "low-high") {
            return priceA - priceB;
        }

        return priceB - priceA;
    });

    return (
        <section className="sofas">

            <div className="sofas-container">

                {/* ================================
                    HEADING
                ================================= */}

                <div className="sofas-heading">

                    <span>OUR SOFA COLLECTION</span>

                    <h2>All Sofas</h2>

                    <p>
                        Discover our complete sofa collection designed
                        for comfort, style and modern living.
                    </p>

                </div>


                {/* ================================
                    FILTER / SORT
                ================================= */}

                <div className="sofas-toolbar">

                    <div className="sofas-count">

                        <strong>
                            {sortedSofas.length}
                        </strong>

                        <span>
                            Sofas Available
                        </span>

                    </div>


                    <div className="sofas-sort">

                        <FaSortAmountDown />

                        <label htmlFor="sofa-sort">
                            Sort By:
                        </label>

                        <select
                            id="sofa-sort"
                            value={sortOrder}
                            onChange={(e) =>
                                setSortOrder(e.target.value)
                            }
                        >

                            <option value="low-high">
                                Price: Low to High
                            </option>

                            <option value="high-low">
                                Price: High to Low
                            </option>

                        </select>

                    </div>

                </div>


                {/* ================================
                    SOFA PRODUCTS
                ================================= */}

                <div className="sofas-grid">

                    {sortedSofas.map((product) => (

                        <Link
                            to={`/product/${product.id}`}
                            className="sofa-card"
                            key={product.id}
                        >

                            {/* Image */}

                            <div className="sofa-image">

                                <img
                                    src={product.image?.[0]}
                                    alt={product.name}
                                />

                                <span className="sofa-view">

                                    View Product

                                    <FaArrowRight />

                                </span>

                            </div>


                            {/* Content */}

                            <div className="sofa-content">

                                <span className="sofa-category">
                                    {product.category}
                                </span>

                                <h3>
                                    {product.name}
                                </h3>


                                {/* Price */}

                                <div className="sofa-price">

                                    <strong>
                                        ₹{product.price}
                                    </strong>

                                    {product.oldPrice && (
                                        <del>
                                            ₹{product.oldPrice}
                                        </del>
                                    )}

                                </div>

                            </div>

                        </Link>

                    ))}

                </div>


                {/* No Sofa */}

                {sortedSofas.length === 0 && (

                    <div className="no-sofas">

                        <h3>
                            No Sofa Found
                        </h3>

                        <p>
                            Furniture-Products.json me sofa product available nahi hai.
                        </p>

                    </div>

                )}

            </div>

        </section>
    );
};

export default Sofas;