import React, { useState } from "react";
import "../Sofas/Sofas.css";
import { Link } from "react-router-dom";
import { FaArrowRight, FaSortAmountDown } from "react-icons/fa";

import products from "../../Data/Furniture-Products.json";

const Tables = () => {

    // Default Low to High
    const [sortOrder, setSortOrder] = useState("low-high");

    // JSON se sirf Tables products
    const bedProducts = products.filter((product) =>
        product.category?.toLowerCase().includes("table")
    );

    // Price ke according sorting
    const sortedTables = [...bedProducts].sort((a, b) => {

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

                    <h2>All Tables</h2>

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
                            {sortedTables.length}
                        </strong>

                        <span>
                            Tables Available
                        </span>

                    </div>


                    <div className="beds-sort">

                        <FaSortAmountDown />

                        <label htmlFor="tables-sort">
                            Sort By:
                        </label>

                        <select
                            id="tables-sort"
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
                    BED PRODUCTS
                ================================= */}

                <div className="beds-grid">

                    {sortedTables.map((product) => (

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


                {/* No Tables */}

                {sortedTables.length === 0 && (

                    <div className="no-beds">

                        <h3>
                            No Tables Found
                        </h3>

                        <p>
                            Furniture-Products.json me table
                            product available nahi hai.
                        </p>

                    </div>

                )}

            </div>

        </section>
    );
};

export default Tables;