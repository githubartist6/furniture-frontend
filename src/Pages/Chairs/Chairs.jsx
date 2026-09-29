import React, { useState } from "react";
import "../Sofas/Sofas.css";
import { Link } from "react-router-dom";
import { FaArrowRight, FaSortAmountDown } from "react-icons/fa";

import products from "../../Data/Furniture-Products.json";

const Chairs = () => {

    // Default Low to High
    const [sortOrder, setSortOrder] = useState("low-high");

    // JSON se sirf Chairs products
    const chairsProducts = products.filter((product) =>
        product.category?.toLowerCase().includes("chair")
    );

    // Price ke according sorting
    const sortedChairs = [...chairsProducts].sort((a, b) => {

        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;

        if (sortOrder === "low-high") {
            return priceA - priceB;
        }

        return priceB - priceA;
    });

    return (
        <section className="beds">

            <div className="beds-container">

                {/* ================================
                    HEADING
                ================================= */}

                <div className="beds-heading">

                    <span>OUR BED COLLECTION</span>

                    <h2>All Chairs</h2>

                    <p>
                        Discover our complete bed collection designed
                        for comfort, style and modern living.
                    </p>

                </div>


                {/* ================================
                    FILTER / SORT
                ================================= */}

                <div className="beds-toolbar">

                    <div className="beds-count">

                        <strong>
                            {sortedChairs.length}
                        </strong>

                        <span>
                            Chairs Available
                        </span>

                    </div>


                    <div className="beds-sort">

                        <FaSortAmountDown />

                        <label htmlFor="chairs-sort">
                            Sort By:
                        </label>

                        <select
                            id="chairs-sort"
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
                    CHAIRS PRODUCTS
                ================================= */}

                <div className="beds-grid">

                    {sortedChairs.map((product) => (

                        <Link
                            to={`/product/${product.id}`}
                            className="bed-card"
                            key={product.id}
                        >

                            {/* Image */}

                            <div className="bed-image">

                                <img
                                    src={product.image?.[0]}
                                    alt={product.name}
                                />

                                <span className="bed-view">

                                    View Product

                                    <FaArrowRight />

                                </span>

                            </div>


                            {/* Content */}

                            <div className="bed-content">

                                <span className="bed-category">
                                    {product.category}
                                </span>

                                <h3>
                                    {product.name}
                                </h3>


                                {/* Price */}

                                <div className="bed-price">

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


                {/* No Chairs */}

                {sortedChairs.length === 0 && (

                    <div className="no-beds">

                        <h3>
                            No Chairs Found
                        </h3>

                        <p>
                            Furniture-Products.json me Chairs
                            product available nahi hai.
                        </p>

                    </div>

                )}

            </div>

        </section>
    );
};

export default Chairs;