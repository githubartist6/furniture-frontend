import React, {
    useState,
} from "react";

import {
    useParams,
    Link,
    useNavigate,
} from "react-router-dom";

import {
    FaStar,
    FaShoppingCart,
    FaArrowLeft,
    FaCheck,
    FaMinus,
    FaPlus,
} from "react-icons/fa";

import { toast } from "react-toastify";

import products from "../Data/Furniture-Products.json";

import "./Product.css";

import {
    useCart,
} from "./Context/CartContext";


const Product = () => {

    const {
        id,
    } = useParams();

    const navigate =
        useNavigate();


    // =====================================
    // FIND PRODUCT
    // =====================================

    const product =
        products.find(
            (item) =>
                Number(item.id) ===
                Number(id)
        );


    const [
        selectedImage,
        setSelectedImage,
    ] = useState(
        product?.image?.[0] ||
        ""
    );


    const [
        selectedSize,
        setSelectedSize,
    ] = useState(
        product?.size?.[0] ||
        ""
    );


    const [
        quantity,
        setQuantity,
    ] = useState(1);


    const {
        addToCart,
    } = useCart();


    // =====================================
    // PRODUCT NOT FOUND
    // =====================================

    if (!product) {

        return (
            <div className="product-not-found">

                <h2>
                    Product Not Found
                </h2>

                <p>
                    Sorry, the product you are
                    looking for does not exist.
                </p>

                <Link
                    to="/"
                    className="back-home-btn"
                >
                    <FaArrowLeft />
                    Back To Home
                </Link>

            </div>
        );
    }


    // =====================================
    // QUANTITY INCREASE
    // =====================================

    const increaseQuantity =
        () => {

            setQuantity(
                (prev) =>
                    Math.min(
                        prev + 1,
                        13
                    )
            );

        };


    // =====================================
    // QUANTITY DECREASE
    // =====================================

    const decreaseQuantity =
        () => {

            setQuantity(
                (prev) =>
                    Math.max(
                        prev - 1,
                        1
                    )
            );

        };


    // =====================================
    // ADD TO CART
    // =====================================

    const handleAddToCart =
        () => {

            try {

                const result =
                    addToCart(
                        product,
                        quantity,
                        selectedSize
                    );


                // =================================
                // LOGIN REQUIRED / ADD FAILED
                // =================================

                if (
                    !result?.success
                ) {

                    console.error(
                        "Add To Cart Error:",
                        result
                    );


                    toast.error(
                        result?.message ||
                        "Please login to add products to cart."
                    );


                    navigate(
                        "/login"
                    );


                    return;
                }


                // =================================
                // SUCCESS
                // =================================

                toast.success(
                    `${product.name} - ${selectedSize
                        ? `Size ${selectedSize} `
                        : ""
                    }added to cart (${quantity})`
                );

            } catch (error) {

                // Technical details → Console only
                console.error(
                    "Handle Add To Cart Error:",
                    error
                );


                // User-facing message → Toastify
                toast.error(
                    "Unable to add this product to cart. Please try again."
                );
            }
        };


    // =====================================
    // RENDER
    // =====================================

    return (
        <section className="product-page">

            <div className="product-container">

                {/* LEFT SIDE */}

                <div className="product-left">

                    <div className="product-main-image">

                        {selectedImage ? (

                            <img
                                src={
                                    selectedImage
                                }
                                alt={
                                    product.name ||
                                    "Product"
                                }
                            />

                        ) : (

                            <div>
                                Product Image
                            </div>

                        )}

                    </div>


                    <div className="product-thumbnails">

                        {Array.isArray(
                            product.image
                        ) &&
                            product.image.map(
                                (
                                    image,
                                    index
                                ) => (

                                    <button
                                        type="button"
                                        key={index}
                                        className={
                                            selectedImage ===
                                                image
                                                ? "thumbnail active"
                                                : "thumbnail"
                                        }
                                        onClick={() =>
                                            setSelectedImage(
                                                image
                                            )
                                        }
                                    >

                                        <img
                                            src={
                                                image
                                            }
                                            alt={`${product.name} ${index +
                                                1
                                                }`}
                                        />

                                    </button>

                                )
                            )}

                    </div>

                </div>


                {/* RIGHT SIDE */}

                <div className="product-details">

                    <span className="product-category">
                        {
                            product.category
                        }
                    </span>


                    <h1>
                        {
                            product.name
                        }
                    </h1>


                    {/* RATING */}

                    <div className="product-rating">

                        <div className="stars">

                            {[1, 2, 3, 4, 5].map(
                                (star) => (

                                    <FaStar
                                        key={
                                            star
                                        }
                                    />

                                )
                            )}

                        </div>


                        <span>

                            {
                                product.rating
                            }{" "}

                            (
                            {
                                product.reviews
                            }{" "}
                            Reviews)

                        </span>

                    </div>


                    {/* PRICE */}

                    <div className="product-price">

                        <span className="current-price">
                            ₹
                            {
                                Number(
                                    product.price ||
                                    0
                                ).toLocaleString(
                                    "en-IN"
                                )
                            }
                        </span>


                        {product.oldPrice && (

                            <span className="old-price">

                                ₹
                                {
                                    Number(
                                        product.oldPrice
                                    ).toLocaleString(
                                        "en-IN"
                                    )
                                }

                            </span>

                        )}

                    </div>


                    {/* DESCRIPTION */}

                    <p className="product-description">
                        {
                            product.description
                        }
                    </p>


                    {/* SIZE */}

                    {Array.isArray(
                        product.size
                    ) &&
                        product.size.length >
                        0 && (

                            <div className="size-section">

                                <h3>
                                    Select Size
                                </h3>


                                <div className="size-options">

                                    {product.size.map(
                                        (
                                            size
                                        ) => (

                                            <button
                                                type="button"
                                                key={
                                                    size
                                                }
                                                className={
                                                    selectedSize ===
                                                        size
                                                        ? "size-btn active"
                                                        : "size-btn"
                                                }
                                                onClick={() =>
                                                    setSelectedSize(
                                                        size
                                                    )
                                                }
                                            >

                                                {selectedSize ===
                                                    size && (
                                                        <FaCheck />
                                                    )}

                                                {
                                                    size
                                                }

                                            </button>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                    {/* QUANTITY */}

                    <div className="quantity-section">

                        <h3>
                            Quantity
                        </h3>


                        <div className="quantity-box">

                            <button
                                type="button"
                                onClick={
                                    decreaseQuantity
                                }
                                disabled={
                                    quantity ===
                                    1
                                }
                                className="quantity-btn"
                            >
                                <FaMinus />
                            </button>


                            <span className="quantity-value">
                                {
                                    quantity
                                }
                            </span>


                            <button
                                type="button"
                                onClick={
                                    increaseQuantity
                                }
                                disabled={
                                    quantity ===
                                    13
                                }
                                className="quantity-btn"
                            >
                                <FaPlus />
                            </button>

                        </div>


                        <span className="quantity-limit">
                            Minimum 1 & Maximum 13
                        </span>

                    </div>


                    {/* BUTTON */}

                    <div className="product-actions">

                        <button
                            type="button"
                            className="add-cart-btn"
                            onClick={
                                handleAddToCart
                            }
                        >

                            <FaShoppingCart />

                            Add To Cart

                        </button>

                    </div>


                    {/* FEATURES */}

                    <div className="product-features">

                        <div className="feature-item">

                            <FaCheck />

                            <span>
                                Premium Quality
                            </span>

                        </div>


                        <div className="feature-item">

                            <FaCheck />

                            <span>
                                Secure Delivery
                            </span>

                        </div>


                        <div className="feature-item">

                            <FaCheck />

                            <span>
                                Easy Returns
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
};


export default Product;