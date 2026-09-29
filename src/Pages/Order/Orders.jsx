import React, {
    useEffect,
    useState,
} from "react";

import {
    FaBoxOpen,
    FaShoppingBag,
    FaTruck,
    FaClock,
    FaCheckCircle,
    FaCog,
    FaShippingFast,
    FaTimesCircle,
} from "react-icons/fa";

import {
    useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import "./Orders.css";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


const Orders = () => {

    const navigate = useNavigate();

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================
    // FORMAT DATE
    // =====================================

    const formatDate = (date) => {

        if (!date) {
            return "";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    // =====================================
    // STATUS STYLE
    // =====================================

    const getStatusStyle = (status) => {

        switch (status) {

            case "Order Placed":
                return {
                    icon: <FaClock />,
                    className:
                        "status-order-placed",
                };

            case "Confirmed":
                return {
                    icon: <FaCheckCircle />,
                    className:
                        "status-confirmed",
                };

            case "Processing":
                return {
                    icon: <FaCog />,
                    className:
                        "status-processing",
                };

            case "Out for Delivery":
                return {
                    icon: <FaShippingFast />,
                    className:
                        "status-out-delivery",
                };

            case "Delivered":
                return {
                    icon: <FaCheckCircle />,
                    className:
                        "status-delivered",
                };

            case "Cancelled":
                return {
                    icon: <FaTimesCircle />,
                    className:
                        "status-cancelled",
                };

            default:
                return {
                    icon: <FaClock />,
                    className:
                        "status-default",
                };
        }
    };


    // =====================================
    // FETCH ORDERS
    // =====================================

    const fetchOrders = async () => {

        try {

            setLoading(true);
            setError("");

            const savedUser =
                localStorage.getItem("user");


            // =====================================
            // NO LOCAL USER
            // =====================================

            if (!savedUser) {

                console.error(
                    "Orders Auth Error: User data not found in localStorage"
                );

                setOrders([]);

                toast.error(
                    "Please login to view your orders."
                );

                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );

                return;
            }


            // =====================================
            // VALIDATE LOCAL USER
            // =====================================

            try {

                const parsedUser =
                    JSON.parse(savedUser);

                if (
                    !parsedUser ||
                    typeof parsedUser !==
                    "object"
                ) {

                    console.error(
                        "Orders Auth Error: Invalid user data in localStorage"
                    );

                    localStorage.removeItem(
                        "user"
                    );

                    setOrders([]);

                    toast.error(
                        "Your login session is invalid. Please login again."
                    );

                    navigate(
                        "/login",
                        {
                            replace: true,
                        }
                    );

                    return;
                }

            } catch (parseError) {

                console.error(
                    "Orders Auth JSON Parse Error:",
                    parseError
                );

                localStorage.removeItem(
                    "user"
                );

                setOrders([]);

                toast.error(
                    "Your login session is invalid. Please login again."
                );

                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );

                return;
            }


            // =====================================
            // API REQUEST
            // =====================================

            const response =
                await fetch(
                    `${API_URL}/api/orders`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                    }
                );


            // =====================================
            // SAFE JSON PARSE
            // =====================================

            let data = {};

            try {

                data =
                    await response.json();

            } catch (parseError) {

                console.error(
                    "Orders API Error: Failed to parse server response:",
                    parseError
                );

                data = {};
            }


            // =====================================
            // TECHNICAL API LOG
            // =====================================

            console.log(
                "Orders Status:",
                response.status
            );

            console.log(
                "Orders Response:",
                data
            );


            // =====================================
            // SESSION ERROR
            // =====================================

            if (
                response.status === 401
            ) {

                console.error(
                    "Orders Authentication Error:",
                    {
                        status:
                            response.status,
                        message:
                            data?.message ||
                            "Authentication failed",
                    }
                );

                setOrders([]);

                setError(
                    "Unable to verify your login session."
                );

                toast.error(
                    data?.message ||
                    "Your login session has expired. Please login again."
                );

                return;
            }


            // =====================================
            // OTHER API ERROR
            // =====================================

            if (!response.ok) {

                const serverMessage =
                    data?.message ||
                    "Unable to load orders. Please try again.";

                console.error(
                    "Orders API Error:",
                    {
                        status:
                            response.status,
                        statusText:
                            response.statusText,
                        message:
                            serverMessage,
                    }
                );

                setOrders([]);

                setError(
                    "Unable to load orders."
                );

                toast.error(
                    serverMessage
                );

                return;
            }


            // =====================================
            // VALIDATE RESPONSE
            // =====================================

            if (
                !data ||
                typeof data !== "object"
            ) {

                console.error(
                    "Orders Error: Invalid server response"
                );

                setOrders([]);

                setError(
                    "Unable to load orders."
                );

                toast.error(
                    "Unable to load orders. Please try again."
                );

                return;
            }


            // =====================================
            // SET ORDERS
            // =====================================

            setOrders(
                Array.isArray(
                    data.orders
                )
                    ? data.orders
                    : []
            );

            setError("");

        } catch (error) {

            // Technical details → Console only
            console.error(
                "Fetch Orders Error:",
                error
            );

            setOrders([]);

            setError(
                "Unable to load orders."
            );

            // User-facing message → Toastify
            toast.error(
                "Unable to connect to the server. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================
    // LOAD ON PAGE OPEN
    // =====================================

    useEffect(() => {

        fetchOrders();

    }, []);


    // =====================================
    // LOADING
    // =====================================

    if (loading) {

        return (
            <div className="orders-loading">
                Loading orders...
            </div>
        );
    }


    // =====================================
    // ERROR
    // =====================================

    if (error) {

        return (
            <div className="no-orders">

                <FaBoxOpen />

                <h2>
                    Unable to Load Orders
                </h2>

                <p>
                    {error}
                </p>

                <button
                    type="button"
                    onClick={fetchOrders}
                >
                    <FaShoppingBag />
                    Try Again
                </button>

            </div>
        );
    }


    // =====================================
    // NO ORDERS
    // =====================================

    if (orders.length === 0) {

        return (
            <div className="no-orders">

                <FaBoxOpen />

                <h2>
                    No Orders Yet
                </h2>

                <p>
                    You haven't placed any
                    orders yet.
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/product"
                        )
                    }
                >
                    <FaShoppingBag />
                    Start Shopping
                </button>

            </div>
        );
    }


    // =====================================
    // ORDERS
    // =====================================

    return (
        <div className="orders-page">

            <div className="orders-container">

                <div className="orders-header">

                    <h1>
                        My Orders
                    </h1>

                    <p>
                        {orders.length}{" "}
                        {orders.length === 1
                            ? "order"
                            : "orders"}{" "}
                        found
                    </p>

                </div>


                <div className="orders-list">

                    {orders.map((order) => {

                        const status =
                            order.status ||
                            "Processing";

                        const statusStyle =
                            getStatusStyle(
                                status
                            );

                        return (
                            <div
                                className="order-card"
                                key={
                                    order.orderId ||
                                    order._id
                                }
                            >

                                {/* ORDER TOP */}

                                <div className="order-top">

                                    <div>

                                        <h3>
                                            Order #
                                            {
                                                order.orderId ||
                                                "-"
                                            }
                                        </h3>

                                        <p>
                                            {formatDate(
                                                order.orderDate ||
                                                order.createdAt
                                            )}
                                        </p>

                                    </div>

                                    <span
                                        className={`order-status ${statusStyle.className}`}
                                    >
                                        {statusStyle.icon}
                                        {status}
                                    </span>

                                </div>


                                {/* DELIVERY DATE */}

                                {order.deliveryDate && (
                                    <div className="delivery-date">

                                        <FaTruck />

                                        <div>

                                            <span>
                                                Expected Delivery
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    order.deliveryDate
                                                )}
                                            </strong>

                                        </div>

                                    </div>
                                )}


                                {/* ITEMS */}

                                <div className="order-items">

                                    {(
                                        Array.isArray(
                                            order.items
                                        )
                                            ? order.items
                                            : []
                                    ).map(
                                        (
                                            item,
                                            index
                                        ) => (

                                            <div
                                                className="order-item"
                                                key={`${order.orderId || order._id}-${index}`}
                                            >

                                                <div className="order-item-image">

                                                    {Array.isArray(
                                                        item.image
                                                    )
                                                        ? item.image[0]
                                                            ? (
                                                                <img
                                                                    src={
                                                                        item.image[0]
                                                                    }
                                                                    alt={
                                                                        item.name ||
                                                                        "Product"
                                                                    }
                                                                />
                                                            )
                                                            : (
                                                                <FaBoxOpen />
                                                            )
                                                        : item.image
                                                            ? (
                                                                <img
                                                                    src={
                                                                        item.image
                                                                    }
                                                                    alt={
                                                                        item.name ||
                                                                        "Product"
                                                                    }
                                                                />
                                                            )
                                                            : (
                                                                <FaBoxOpen />
                                                            )}

                                                </div>


                                                <div className="order-item-info">

                                                    <h4>
                                                        {
                                                            item.name ||
                                                            "Product"
                                                        }
                                                    </h4>

                                                    <p>
                                                        {
                                                            item.category ||
                                                            ""
                                                        }
                                                    </p>

                                                    {item.selectedSize && (
                                                        <span>
                                                            Size:{" "}
                                                            {
                                                                item.selectedSize
                                                            }
                                                        </span>
                                                    )}

                                                    <span>
                                                        Qty:{" "}
                                                        {Number(
                                                            item.quantity ||
                                                            0
                                                        )}
                                                    </span>

                                                </div>


                                                <div className="order-item-price">

                                                    ₹
                                                    {Number(
                                                        item.itemTotal ||
                                                        0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>


                                {/* FOOTER */}

                                <div className="order-footer">

                                    <div>

                                        <span>
                                            {
                                                Number(
                                                    order.totalItems ||
                                                    0
                                                )
                                            }{" "}
                                            {
                                                Number(
                                                    order.totalItems ||
                                                    0
                                                ) === 1
                                                    ? "item"
                                                    : "items"
                                            }
                                        </span>

                                    </div>


                                    <div className="order-total">

                                        <span>
                                            Total:
                                        </span>

                                        <strong>
                                            ₹
                                            {Number(
                                                order.total ||
                                                0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>

        </div>
    );
};


export default Orders;