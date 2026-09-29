import React, { useState } from "react";
import "./AllProduct.css";
import { Link } from "react-router-dom";
import { FaArrowRight, FaSearch } from "react-icons/fa";
import products from "../Data/Furniture-Products.json";

const AllProduct = () => {

    const [search, setSearch] = useState("");

    /* ================================
       SEARCH PRODUCTS
    ================================= */

    const searchText = search.toLowerCase().trim();

    const matchingProducts = products.filter((product) => {

        if (!searchText) {
            return false;
        }

        return (
            product.name?.toLowerCase().includes(searchText) ||
            product.category?.toLowerCase().includes(searchText) ||
            product.description?.toLowerCase().includes(searchText)
        );
    });


    /* ================================
       OTHER PRODUCTS
    ================================= */

    const otherProducts = products.filter((product) => {

        return !matchingProducts.some(
            (item) => Number(item.id) === Number(product.id)
        );

    });


    /* ================================
       FINAL PRODUCTS
       Maximum 8 products
    ================================= */

    let displayProducts = [];

    if (searchText) {

        // Pehle matching products
        displayProducts = [
            ...matchingProducts,
            ...otherProducts
        ].slice(0, 8);

    } else {

        // Normal condition
        displayProducts = products.slice(0, 8);

    }


    return (
        <section className="all-product">

            <div className="all-product-container">

                {/* ================================
                    HEADING
                ================================= */}

                <div className="all-product-heading">

                    <span>OUR COLLECTION</span>

                    <h2>All Products</h2>

                    <p>
                        Explore our complete furniture collection and
                        find the perfect product for your home.
                    </p>

                </div>


                {/* ================================
                    SEARCH
                ================================= */}

                <div className="all-product-search">

                    <FaSearch />

                    <input
                        type="text"
                        value={search}
                        placeholder="Search product by name..."
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {search && (
                        <button
                            type="button"
                            className="clear-search"
                            onClick={() => setSearch("")}
                        >
                            ×
                        </button>
                    )}

                </div>


                {/* ================================
                    SEARCH RESULT INFO
                ================================= */}

                {searchText && (
                    <div className="search-info">

                        <span>
                            Showing results for:
                        </span>

                        <strong>
                            "{search}"
                        </strong>

                        <small>
                            {matchingProducts.length} related product
                            {matchingProducts.length !== 1 ? "s" : ""}
                        </small>

                    </div>
                )}


                {/* ================================
                    PRODUCTS
                ================================= */}

                <div className="all-product-grid">

                    {displayProducts.map((product) => (

                        <Link
                            to={`/product/${product.id}`}
                            className="all-product-card"
                            key={product.id}
                        >

                            {/* Image */}

                            <div className="all-product-image">

                                <img
                                    src={product.image?.[0]}
                                    alt={product.name}
                                />

                                <span className="product-view">

                                    View Product

                                    <FaArrowRight />

                                </span>

                            </div>


                            {/* Content */}

                            <div className="all-product-content">

                                <span className="all-product-category">
                                    {product.category}
                                </span>

                                <h3>
                                    {product.name}
                                </h3>


                                <div className="all-product-bottom">

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


                {/* ================================
                    NO RELATED PRODUCT
                ================================= */}

                {searchText &&
                    matchingProducts.length === 0 && (

                        <div className="no-search-result">

                            <h3>
                                No Related Product Found
                            </h3>

                            <p>
                                "{search}" se related product nahi mila.
                                Neeche other products show kiye gaye hain.
                            </p>

                        </div>

                    )}

            </div>

        </section>
    );
};

export default AllProduct;