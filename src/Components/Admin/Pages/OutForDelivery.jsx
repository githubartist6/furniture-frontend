import React, {
    useEffect,
    useState,
} from "react";

import {
    FaShippingFast,
    FaShoppingBag,
    FaSearch,
    FaEye,
    FaSyncAlt,
} from "react-icons/fa";

import { toast } from "react-toastify";

import "./AdminPages.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

const OutForDelivery = () => {
    const [orders, setOrders] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [updatingOrder, setUpdatingOrder] =
        useState("");

    const [selectedOrder, setSelectedOrder] =
        useState(null);

    /* =========================================
       FETCH OUT FOR DELIVERY ORDERS
    ========================================= */

    const fetchOutForDeliveryOrders =
        async (showToast = false) => {
            try {
                setLoading(true);
                setError("");

                const params =
                    new URLSearchParams();

                params.set(
                    "status",
                    "Out for Delivery"
                );

                if (search.trim()) {
                    params.set(
                        "search",
                        search.trim()
                    );
                }

                const response =
                    await fetch(
                        `${API_URL}/api/admin/orders?${params.toString()}`,
                        {
                            method: "GET",
                            credentials: "include",
                        }
                    );

                let data = {};

                try {
                    data =
                        await response.json();
                } catch (parseError) {
                    console.error(
                        "Out For Delivery JSON Parse Error:",
                        parseError
                    );
                }

                if (!response.ok) {
                    const serverMessage =
                        data?.message ||
                        "Unable to load out for delivery orders.";

                    console.error(
                        "Out For Delivery API Error:",
                        {
                            status:
                                response.status,
                            statusText:
                                response.statusText,
                            serverMessage,
                        }
                    );

                    setError(
                        "Unable to load orders"
                    );

                    if (showToast) {
                        toast.error(
                            serverMessage
                        );
                    }

                    return;
                }

                if (
                    !data ||
                    !Array.isArray(
                        data.orders
                    )
                ) {
                    console.error(
                        "Out For Delivery API Error: Invalid orders response",
                        data
                    );

                    setOrders([]);

                    setError(
                        "Unable to load orders"
                    );

                    if (showToast) {
                        toast.error(
                            "Unable to load orders. Please try again."
                        );
                    }

                    return;
                }

                setOrders(
                    data.orders
                );
            } catch (error) {
                console.error(
                    "Out For Delivery Fetch Error:",
                    error
                );

                setError(
                    "Unable to load orders"
                );

                if (showToast) {
                    toast.error(
                        "Unable to connect to the server. Please try again."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

    /* =========================================
       SEARCH
    ========================================= */

    useEffect(() => {
        const timer =
            setTimeout(() => {
                fetchOutForDeliveryOrders(
                    true
                );
            }, 300);

        return () =>
            clearTimeout(timer);
    }, [search]);

    /* =========================================
       AUTO REFRESH EVERY 2 SECONDS
    ========================================= */

    useEffect(() => {
        const refreshInterval =
            setInterval(() => {
                fetchOutForDeliveryOrders(
                    false
                );
            }, 2000);

        return () =>
            clearInterval(
                refreshInterval
            );
    }, [search]);

    /* =========================================
       FORMAT DATE
    ========================================= */

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "-";
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

    /* =========================================
       FORMAT CURRENCY
    ========================================= */

    const formatCurrency = (
        amount
    ) => {
        const numericAmount =
            Number(amount);

        if (
            !Number.isFinite(
                numericAmount
            )
        ) {
            return "₹0";
        }

        return `₹${numericAmount.toLocaleString(
            "en-IN"
        )}`;
    };

    /* =========================================
       CUSTOMER NAME
    ========================================= */

    const getCustomerName = (
        order
    ) => {
        return (
            order?.userId?.name ||
            order?.userId?.username ||
            order?.email ||
            "Customer"
        );
    };

    /* =========================================
       CUSTOMER EMAIL
    ========================================= */

    const getCustomerEmail = (
        order
    ) => {
        return (
            order?.userId?.email ||
            order?.email ||
            "-"
        );
    };

    /* =========================================
       STATUS CLASS
    ========================================= */

    const getStatusClass = (
        status
    ) => {
        switch (status) {
            case "Order Placed":
                return "admin-order-status pending";

            case "Confirmed":
                return "admin-order-status confirmed";

            case "Processing":
                return "admin-order-status processing";

            case "Out for Delivery":
                return "admin-order-status out-delivery";

            case "Delivered":
                return "admin-order-status delivered";

            case "Cancelled":
                return "admin-order-status cancelled";

            default:
                return "admin-order-status";
        }
    };

    /* =========================================
       UPDATE ORDER STATUS
    ========================================= */

    const updateOrderStatus = async (
        orderId,
        newStatus
    ) => {
        try {
            setUpdatingOrder(
                orderId
            );

            const response =
                await fetch(
                    `${API_URL}/api/admin/orders/${encodeURIComponent(
                        orderId
                    )}/status`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        credentials:
                            "include",

                        body: JSON.stringify({
                            status:
                                newStatus,
                        }),
                    }
                );

            let data = {};

            try {
                data =
                    await response.json();
            } catch (parseError) {
                console.error(
                    "Update Order JSON Parse Error:",
                    parseError
                );
            }

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to update order status.";

                console.error(
                    "Update Out For Delivery Status API Error:",
                    {
                        status:
                            response.status,
                        statusText:
                            response.statusText,
                        orderId,
                        newStatus,
                        serverMessage,
                    }
                );

                toast.error(
                    serverMessage
                );

                return;
            }

            if (
                newStatus !==
                "Out for Delivery"
            ) {
                setOrders(
                    (
                        previousOrders
                    ) =>
                        previousOrders.filter(
                            (order) =>
                                order.orderId !==
                                orderId
                        )
                );
            } else {
                setOrders(
                    (
                        previousOrders
                    ) =>
                        previousOrders.map(
                            (order) =>
                                order.orderId ===
                                    orderId
                                    ? {
                                        ...order,
                                        status:
                                            newStatus,
                                    }
                                    : order
                        )
                );
            }

            /* Update opened modal */

            if (
                selectedOrder?.orderId ===
                orderId
            ) {
                setSelectedOrder(
                    (previous) => {
                        if (
                            !previous ||
                            previous ===
                            "loading"
                        ) {
                            return previous;
                        }

                        return {
                            ...previous,
                            status:
                                newStatus,
                        };
                    }
                );
            }

            toast.success(
                data?.message ||
                "Order status updated successfully."
            );
        } catch (error) {
            console.error(
                "Update Out For Delivery Status Error:",
                error
            );

            toast.error(
                "Unable to update order status. Please try again."
            );
        } finally {
            setUpdatingOrder("");
        }
    };

    /* =========================================
       VIEW ORDER
    ========================================= */

    const handleViewOrder = async (
        orderId
    ) => {
        try {
            setSelectedOrder(
                "loading"
            );

            const response =
                await fetch(
                    `${API_URL}/api/admin/orders/${encodeURIComponent(
                        orderId
                    )}`,
                    {
                        method: "GET",
                        credentials:
                            "include",
                    }
                );

            let data = {};

            try {
                data =
                    await response.json();
            } catch (parseError) {
                console.error(
                    "View Order JSON Parse Error:",
                    parseError
                );
            }

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to load order.";

                console.error(
                    "View Out For Delivery Order API Error:",
                    {
                        status:
                            response.status,
                        statusText:
                            response.statusText,
                        orderId,
                        serverMessage,
                    }
                );

                setSelectedOrder(
                    null
                );

                toast.error(
                    serverMessage
                );

                return;
            }

            if (!data?.order) {
                console.error(
                    "View Order Error: Order data missing",
                    data
                );

                setSelectedOrder(
                    null
                );

                toast.error(
                    "Unable to load order details."
                );

                return;
            }

            setSelectedOrder(
                data.order
            );
        } catch (error) {
            console.error(
                "View Out For Delivery Order Error:",
                error
            );

            setSelectedOrder(
                null
            );

            toast.error(
                "Unable to load order. Please try again."
            );
        }
    };

    /* =========================================
       CLOSE MODAL
    ========================================= */

    const closeModal = () => {
        setSelectedOrder(
            null
        );
    };

    /* =========================================
       LOADING
    ========================================= */

    if (
        loading &&
        orders.length === 0
    ) {
        return (
            <div className="admin-page">
                <div className="admin-page-header">
                    <div>
                        <h1>
                            Out for Delivery
                        </h1>

                        <p>
                            Orders currently on the way
                        </p>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-orders-loading">
                        <div className="admin-loading-spinner"></div>

                        <p>
                            Loading delivery orders...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            {/* =====================================
                PAGE HEADER
            ===================================== */}

            <div className="admin-page-header">
                <div>
                    <h1>
                        Out for Delivery
                    </h1>

                    <p>
                        Orders currently on the way
                    </p>
                </div>

                <div className="admin-page-count out-count">
                    <FaShippingFast />

                    <strong>
                        {orders.length}
                    </strong>

                    <span>
                        On the Way
                    </span>
                </div>
            </div>

            {/* =====================================
                SEARCH + REFRESH
            ===================================== */}

            <div className="admin-card admin-filter-card">
                <div className="admin-search-box">
                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search by Order ID..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />
                </div>

                <button
                    type="button"
                    className="admin-refresh-button"
                    onClick={() =>
                        fetchOutForDeliveryOrders(
                            true
                        )
                    }
                    title="Refresh orders"
                >
                    <FaSyncAlt />

                    <span>
                        Refresh
                    </span>
                </button>
            </div>

            {/* =====================================
                ERROR
            ===================================== */}

            {error && (
                <div className="admin-orders-error">
                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            fetchOutForDeliveryOrders(
                                true
                            )
                        }
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* =====================================
                ORDERS TABLE
            ===================================== */}

            <div className="admin-card">
                <div className="admin-table-header">
                    <div>
                        <h2>
                            Out for Delivery
                        </h2>

                        <p>
                            {orders.length}{" "}
                            {orders.length === 1
                                ? "order"
                                : "orders"}{" "}
                            found
                        </p>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-orders-table">
                        <thead>
                            <tr>
                                <th>
                                    Order ID
                                </th>

                                <th>
                                    Customer
                                </th>

                                <th>
                                    Order Date
                                </th>

                                <th>
                                    Items
                                </th>

                                <th>
                                    Total
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.length ===
                                0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="admin-table-empty"
                                    >
                                        <FaShoppingBag />

                                        <span>
                                            No orders out for delivery
                                        </span>
                                    </td>
                                </tr>
                            ) : (
                                orders.map(
                                    (
                                        order
                                    ) => (
                                        <tr
                                            key={
                                                order._id ||
                                                order.orderId
                                            }
                                        >
                                            {/* ORDER ID */}

                                            <td>
                                                <strong className="admin-order-id">
                                                    {
                                                        order.orderId
                                                    }
                                                </strong>
                                            </td>

                                            {/* CUSTOMER */}

                                            <td>
                                                <div className="admin-customer-cell">
                                                    <strong>
                                                        {getCustomerName(
                                                            order
                                                        )}
                                                    </strong>

                                                    <span>
                                                        {getCustomerEmail(
                                                            order
                                                        )}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* ORDER DATE */}

                                            <td>
                                                {formatDate(
                                                    order.orderDate ||
                                                    order.createdAt
                                                )}
                                            </td>

                                            {/* ITEMS */}

                                            <td>
                                                {Number(
                                                    order.totalItems
                                                ) ||
                                                    order
                                                        .items
                                                        ?.length ||
                                                    0}
                                            </td>

                                            {/* TOTAL */}

                                            <td>
                                                <strong>
                                                    {formatCurrency(
                                                        order.total
                                                    )}
                                                </strong>
                                            </td>

                                            {/* STATUS */}

                                            <td>
                                                <select
                                                    className={getStatusClass(
                                                        order.status
                                                    )}
                                                    value={
                                                        order.status ||
                                                        "Out for Delivery"
                                                    }
                                                    disabled={
                                                        updatingOrder ===
                                                        order.orderId
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateOrderStatus(
                                                            order.orderId,
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                >
                                                    <option value="Out for Delivery">
                                                        Out for Delivery
                                                    </option>

                                                    <option value="Delivered">
                                                        Delivered
                                                    </option>

                                                    <option value="Processing">
                                                        Processing
                                                    </option>

                                                    <option value="Cancelled">
                                                        Cancelled
                                                    </option>
                                                </select>
                                            </td>

                                            {/* ACTION */}

                                            <td>
                                                <button
                                                    type="button"
                                                    className="admin-view-order-button"
                                                    onClick={() =>
                                                        handleViewOrder(
                                                            order.orderId
                                                        )
                                                    }
                                                    title="View order"
                                                >
                                                    <FaEye />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =====================================
                ORDER DETAILS MODAL
            ===================================== */}

            {selectedOrder && (
                <div
                    className="admin-order-modal-overlay"
                    onClick={
                        closeModal
                    }
                >
                    <div
                        className="admin-order-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        {/* MODAL HEADER */}

                        <div className="admin-order-modal-header">
                            <div>
                                <h2>
                                    Order Details
                                </h2>

                                {selectedOrder !==
                                    "loading" && (
                                        <p>
                                            {
                                                selectedOrder.orderId
                                            }
                                        </p>
                                    )}
                            </div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={
                                    closeModal
                                }
                            >
                                ×
                            </button>
                        </div>

                        {/* MODAL LOADING */}

                        {selectedOrder ===
                            "loading" ? (
                            <div className="admin-modal-loading">
                                <div className="admin-loading-spinner"></div>

                                <p>
                                    Loading order...
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* CUSTOMER */}

                                <div className="admin-order-detail-section">
                                    <h3>
                                        Customer
                                    </h3>

                                    <div className="admin-order-customer-detail">
                                        <strong>
                                            {getCustomerName(
                                                selectedOrder
                                            )}
                                        </strong>

                                        <span>
                                            {getCustomerEmail(
                                                selectedOrder
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* ORDER INFO */}

                                <div className="admin-order-detail-grid">
                                    <div>
                                        <span>
                                            Order Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedOrder.orderDate ||
                                                selectedOrder.createdAt
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Expected Delivery
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedOrder.deliveryDate
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Total Items
                                        </span>

                                        <strong>
                                            {Number(
                                                selectedOrder.totalItems
                                            ) ||
                                                selectedOrder
                                                    .items
                                                    ?.length ||
                                                0}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedOrder.total
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                {/* STATUS */}

                                <div className="admin-order-detail-section">
                                    <h3>
                                        Order Status
                                    </h3>

                                    <select
                                        className={getStatusClass(
                                            selectedOrder.status
                                        )}
                                        value={
                                            selectedOrder.status ||
                                            "Out for Delivery"
                                        }
                                        disabled={
                                            updatingOrder ===
                                            selectedOrder.orderId
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            updateOrderStatus(
                                                selectedOrder.orderId,
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        <option value="Out for Delivery">
                                            Out for Delivery
                                        </option>

                                        <option value="Delivered">
                                            Delivered
                                        </option>

                                        <option value="Processing">
                                            Processing
                                        </option>

                                        <option value="Cancelled">
                                            Cancelled
                                        </option>
                                    </select>
                                </div>

                                {/* PRODUCTS */}

                                <div className="admin-order-detail-section">
                                    <h3>
                                        Products
                                    </h3>

                                    <div className="admin-order-products">
                                        {Array.isArray(
                                            selectedOrder.items
                                        ) &&
                                            selectedOrder.items.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <div
                                                        className="admin-order-product"
                                                        key={
                                                            item.id ||
                                                            index
                                                        }
                                                    >
                                                        <div className="admin-order-product-image">
                                                            {item.image ? (
                                                                <img
                                                                    src={
                                                                        Array.isArray(
                                                                            item.image
                                                                        )
                                                                            ? item
                                                                                .image[0]
                                                                            : item.image
                                                                    }
                                                                    alt={
                                                                        item.name ||
                                                                        "Product"
                                                                    }
                                                                />
                                                            ) : (
                                                                <FaShoppingBag />
                                                            )}
                                                        </div>

                                                        <div className="admin-order-product-info">
                                                            <strong>
                                                                {
                                                                    item.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                Qty:{" "}
                                                                {
                                                                    item.quantity
                                                                }

                                                                {item.selectedSize
                                                                    ? ` • Size: ${item.selectedSize}`
                                                                    : ""}
                                                            </span>
                                                        </div>

                                                        <strong className="admin-order-product-price">
                                                            {formatCurrency(
                                                                item.itemTotal
                                                            )}
                                                        </strong>
                                                    </div>
                                                )
                                            )}
                                    </div>
                                </div>

                                {/* TOTALS */}

                                <div className="admin-order-total-box">
                                    <div>
                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedOrder.subtotal
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Delivery
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedOrder.delivery
                                            )}
                                        </strong>
                                    </div>

                                    <div className="grand-total">
                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedOrder.total
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OutForDelivery;