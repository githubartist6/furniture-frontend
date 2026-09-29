import React, {
  useEffect,
  useState,
} from "react";

import {
  FaMinus,
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaShoppingCart,
  FaCheckCircle,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import { useCart } from "./CartContext";

import "./Cart.css";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


const Cart = () => {

  const {
    cart,
    loading,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalQuantity,
    totalPrice,
  } = useCart();


  const navigate =
    useNavigate();


  const [
    checkoutLoading,
    setCheckoutLoading,
  ] = useState(false);


  // ==========================================
  // CHECK LOGIN
  // ==========================================

  useEffect(() => {

    const savedUser =
      localStorage.getItem("user");


    if (!savedUser) {

      navigate(
        "/login",
        {
          replace: true,
        }
      );

    }

  }, [navigate]);


  // ==========================================
  // CHECK ADDRESS + PLACE ORDER
  // ==========================================

  const handleCheckout =
    async () => {

      const savedUser =
        localStorage.getItem(
          "user"
        );


      // ------------------------------------------
      // 1. CHECK LOGIN
      // ------------------------------------------

      if (!savedUser) {

        toast.error(
          "Please login to place your order."
        );

        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }


      // ------------------------------------------
      // 2. CHECK CART
      // ------------------------------------------

      if (
        !Array.isArray(cart) ||
        cart.length === 0
      ) {

        toast.error(
          "Your cart is empty."
        );

        return;
      }


      try {

        setCheckoutLoading(
          true
        );


        // ========================================
        // 3. CHECK SAVED ADDRESS
        // ========================================

        const addressResponse =
          await fetch(
            `${API_URL}/api/auth/address`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );


        // ========================================
        // SAFE JSON PARSE
        // ========================================

        let addressData = {};

        try {

          addressData =
            await addressResponse.json();

        } catch (parseError) {

          console.error(
            "Address API Parse Error:",
            parseError
          );

          addressData = {};

        }


        console.log(
          "Address Response:",
          addressData
        );


        // ----------------------------------------
        // LOGIN SESSION EXPIRED
        // ----------------------------------------

        if (
          addressResponse.status ===
          401
        ) {

          console.error(
            "Address Authentication Error:",
            {
              status:
                addressResponse.status,
              message:
                addressData?.message ||
                "Authentication failed",
            }
          );


          toast.error(
            addressData?.message ||
            "Your login session has expired. Please login again."
          );


          navigate(
            "/login",
            {
              replace: true,
            }
          );


          return;
        }


        // ----------------------------------------
        // ADDRESS API ERROR
        // ----------------------------------------

        if (
          !addressResponse.ok
        ) {

          const serverMessage =
            addressData?.message ||
            "Unable to verify your delivery address. Please try again.";


          console.error(
            "Address API Error:",
            {
              status:
                addressResponse.status,
              statusText:
                addressResponse.statusText,
              message:
                serverMessage,
            }
          );


          toast.error(
            serverMessage
          );


          return;
        }


        // ========================================
        // CHECK COMPLETE ADDRESS
        // ========================================

        const savedAddresses =
          Array.isArray(
            addressData?.address
          )
            ? addressData.address
            : [];


        const address =
          savedAddresses.length > 0
            ? savedAddresses[0]
            : null;


        const hasCompleteAddress =
          Boolean(
            address &&
            address.name &&
            address.phone &&
            address.pincode &&
            address.location &&
            address.address &&
            address.city &&
            address.state &&
            address.addressType
          );


        // ----------------------------------------
        // NO / INCOMPLETE ADDRESS
        // ----------------------------------------

        if (
          !hasCompleteAddress
        ) {

          toast.error(
            "Please add your delivery address before placing the order."
          );


          navigate(
            "/address",
            {
              state: {
                from: "/cart",
              },
            }
          );


          return;
        }


        // ========================================
        // 4. ADDRESS EXISTS → PLACE ORDER
        // ========================================

        const response =
          await fetch(
            `${API_URL}/api/orders`,
            {
              method: "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );


        // ========================================
        // SAFE JSON PARSE
        // ========================================

        let data = {};

        try {

          data =
            await response.json();

        } catch (parseError) {

          console.error(
            "Order API Parse Error:",
            parseError
          );

          data = {};

        }


        console.log(
          "Order Response:",
          data
        );


        // ----------------------------------------
        // LOGIN SESSION EXPIRED
        // ----------------------------------------

        if (
          response.status ===
          401
        ) {

          console.error(
            "Order Authentication Error:",
            {
              status:
                response.status,
              message:
                data?.message ||
                "Authentication failed",
            }
          );


          toast.error(
            data?.message ||
            "Your login session has expired. Please login again."
          );


          navigate(
            "/login",
            {
              replace: true,
            }
          );


          return;
        }


        // ----------------------------------------
        // BACKEND ADDRESS PROTECTION
        // ----------------------------------------

        if (
          data?.code ===
          "ADDRESS_REQUIRED"
        ) {

          toast.error(
            "Please add your delivery address before placing the order."
          );


          navigate(
            "/address",
            {
              state: {
                from: "/cart",
              },
            }
          );


          return;
        }


        // ----------------------------------------
        // OTHER ORDER ERROR
        // ----------------------------------------

        if (
          !response.ok
        ) {

          const serverMessage =
            data?.message ||
            "Unable to place your order. Please try again.";


          console.error(
            "Place Order API Error:",
            {
              status:
                response.status,
              statusText:
                response.statusText,
              message:
                serverMessage,
            }
          );


          toast.error(
            serverMessage
          );


          return;
        }


        // ========================================
        // 5. ORDER SUCCESS
        // ========================================

        /*
          Backend already clears MongoDB cart.
          clearCart() clears frontend cart.
        */

        await clearCart();


        const orderId =
          data?.order?.orderId ||
          "N/A";


        toast.success(
          `Order placed successfully! Order ID: ${orderId}`
        );


        navigate(
          "/orders"
        );

      } catch (error) {

        // Technical details → Console only
        console.error(
          "Checkout Error:",
          error
        );


        // User-facing message → Toastify
        toast.error(
          "Something went wrong while placing your order. Please try again."
        );

      } finally {

        setCheckoutLoading(
          false
        );

      }
    };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="cart-loading">
        Loading cart...
      </div>
    );

  }


  // ==========================================
  // EMPTY CART
  // ==========================================

  if (
    cart.length === 0
  ) {

    return (
      <div className="empty-cart">

        <FaShoppingCart />

        <h2>
          Your Cart is Empty
        </h2>

        <p>
          Looks like you haven't added
          anything to your cart yet.
        </p>

        <Link
          to="/product"
          className="continue-shopping"
        >
          <FaArrowLeft />
          Continue Shopping
        </Link>

      </div>
    );

  }


  // ==========================================
  // CART PAGE
  // ==========================================

  return (
    <div className="cart-page">

      <div className="cart-container">

        {/* CART HEADER */}

        <div className="cart-header">

          <div>

            <h1>
              Shopping Cart
            </h1>

            <p>
              {totalQuantity}{" "}
              {totalQuantity === 1
                ? "item"
                : "items"}{" "}
              in your cart
            </p>

          </div>


          <Link
            to="/product"
            className="back-shopping"
          >
            <FaArrowLeft />
            Continue Shopping
          </Link>

        </div>


        {/* CART CONTENT */}

        <div className="cart-content">

          {/* CART ITEMS */}

          <div className="cart-items">

            {cart.map(
              (item) => (

                <div
                  className="cart-item"
                  key={`${item.id}-${item.selectedSize}`}
                >

                  {/* IMAGE */}

                  <div className="cart-item-image">

                    {(
                      Array.isArray(
                        item.image
                      )
                        ? item.image[0]
                        : item.image
                    ) ? (

                      <img
                        src={
                          Array.isArray(
                            item.image
                          )
                            ? item.image[0]
                            : item.image
                        }
                        alt={
                          item.name ||
                          "Product"
                        }
                      />

                    ) : (

                      <FaShoppingCart />

                    )}

                  </div>


                  {/* INFO */}

                  <div className="cart-item-info">

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      {item.category}
                    </p>

                    {item.selectedSize && (
                      <span className="cart-size">
                        Size:{" "}
                        {item.selectedSize}
                      </span>
                    )}

                    <div className="cart-item-price">

                      ₹
                      {Number(
                        item.price || 0
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </div>

                  </div>


                  {/* QUANTITY */}

                  <div className="cart-quantity">

                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(
                          item.id,
                          item.selectedSize
                        )
                      }
                      disabled={
                        checkoutLoading
                      }
                    >
                      <FaMinus />
                    </button>


                    <span>
                      {Number(
                        item.quantity || 0
                      )}
                    </span>


                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(
                          item.id,
                          item.selectedSize
                        )
                      }
                      disabled={
                        checkoutLoading
                      }
                    >
                      <FaPlus />
                    </button>

                  </div>


                  {/* ITEM TOTAL */}

                  <div className="cart-item-total">

                    ₹
                    {(
                      Number(
                        item.price || 0
                      ) *
                      Number(
                        item.quantity || 0
                      )
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </div>


                  {/* REMOVE */}

                  <button
                    type="button"
                    className="remove-cart-item"
                    onClick={() =>
                      removeFromCart(
                        item.id,
                        item.selectedSize
                      )
                    }
                    title="Remove"
                    disabled={
                      checkoutLoading
                    }
                  >
                    <FaTrash />
                  </button>

                </div>

              )
            )}

          </div>


          {/* ORDER SUMMARY */}

          <div className="cart-summary">

            <h2>
              Order Summary
            </h2>


            <div className="summary-row">

              <span>
                Items ({totalQuantity})
              </span>

              <span>
                ₹
                {Number(
                  totalPrice || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>


            <div className="summary-row">

              <span>
                Delivery
              </span>

              <span className="free">
                FREE
              </span>

            </div>


            <div className="summary-divider" />


            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹
                {Number(
                  totalPrice || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>


            {/* PLACE ORDER */}

            <button
              type="button"
              className="checkout-btn"
              onClick={
                handleCheckout
              }
              disabled={
                checkoutLoading
              }
            >

              <FaCheckCircle />

              {checkoutLoading
                ? "Checking Address..."
                : "Place Order"}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
};


export default Cart;