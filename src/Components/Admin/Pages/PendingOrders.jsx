import React, {
    useEffect,
    useState,
} from "react";

import {
    FaClock,
    FaShoppingBag,
    FaSearch,
    FaEye,
    FaSyncAlt,
} from "react-icons/fa";

import { toast } from "react-toastify";

import "./AdminPages.css";

const API_URL = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
).replace(/\/+$/, "");

const PendingOrders = () => {
    const [orders, setOrders] = useState([]);

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
       FETCH PENDING ORDERS
    ========================================= */

    const fetchPendingOrders = async (
        showToast = false
    ) => {
        try {
            setLoading(true);
            setError("");

            const params =
                new URLSearchParams();

            params.set(
                "status",
                "Order Placed"
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
                        headers: {
                            Accept:
                                "application/json",
                        },
                    }
                );

            let data = {};

            try {
                data =
                    await response.json();
            } catch (parseError) {
                console.error(
                    "Pending Orders Response Parse Error:",
                    parseError
                );
            }

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to load pending orders. Please try again.";

                console.error(
                    "Pending Orders API Error:",
                    {
                        status:
                            response.status,

                        statusText:
                            response.statusText,

                        serverMessage,
                    }
                );

                setError(
                    "Unable to load pending orders."
                );

                if (showToast) {
                    toast.error(
                        serverMessage
                    );
                }

                return;
            }

            if (!Array.isArray(data?.orders)) {
                console.error(
                    "Pending Orders Error: Invalid orders response",
                    data
                );

                setOrders([]);

                setError(
                    "Unable to load pending orders."
                );

                if (showToast) {
                    toast.error(
                        "Unable to load pending orders. Please try again."
                    );
                }

                return;
            }

            setOrders(data.orders);
        } catch (error) {
            console.error(
                "Pending Orders Fetch Error:",
                error
            );

            setError(
                "Unable to load pending orders."
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
                fetchPendingOrders(
                    true
                );
            }, 300);

        return () =>
            clearTimeout(timer);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    /* =========================================
       AUTO REFRESH EVERY 2 SECONDS
    ========================================= */

    useEffect(() => {
        const interval =
            setInterval(() => {
                fetchPendingOrders(
                    false
                );
            }, 2000);

        return () =>
            clearInterval(interval);

        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (!orderId || !newStatus) {
            console.error(
                "Update Pending Status Error: Missing orderId or status",
                {
                    orderId,
                    newStatus,
                }
            );

            toast.error(
                "Unable to update order status."
            );

            return;
        }

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

                            Accept:
                                "application/json",
                        },

                        credentials: "include",

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
                    "Update Status Response Parse Error:",
                    parseError
                );
            }

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to update order status. Please try again.";

                console.error(
                    "Update Pending Status API Error:",
                    {
                        status:
                            response.status,

                        statusText:
                            response.statusText,

                        serverMessage,
                    }
                );

                toast.error(
                    serverMessage
                );

                return;
            }

            /* =====================================
               REMOVE FROM PENDING LIST
            ===================================== */

            setOrders(
                (previousOrders) =>
                    previousOrders.filter(
                        (order) =>
                            order.orderId !==
                            orderId
                    )
            );

            /* =====================================
               UPDATE SELECTED ORDER
            ===================================== */

            if (
                selectedOrder &&
                selectedOrder !==
                "loading" &&
                selectedOrder.orderId ===
                orderId
            ) {
                setSelectedOrder(
                    (previous) => ({
                        ...previous,
                        status:
                            newStatus,
                    })
                );
            }

            toast.success(
                data?.message ||
                "Order status updated successfully."
            );
        } catch (error) {
            console.error(
                "Update Pending Status Error:",
                error
            );

            toast.error(
                "Unable to connect to the server. Please try again."
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
        if (!orderId) {
            console.error(
                "View Pending Order Error: Order ID missing"
            );

            toast.error(
                "Unable to open order details."
            );

            return;
        }

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
                        credentials: "include",
                        headers: {
                            Accept:
                                "application/json",
                        },
                    }
                );

            let data = {};

            try {
                data =
                    await response.json();
            } catch (parseError) {
                console.error(
                    "View Order Response Parse Error:",
                    parseError
                );
            }

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to load order details.";

                console.error(
                    "View Pending Order API Error:",
                    {
                        status:
                            response.status,

                        statusText:
                            response.statusText,

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
                    "View Pending Order Error: Order data missing",
                    data
                );

                setSelectedOrder(
                    null
                );

                toast.error(
                    "Order details could not be loaded."
                );

                return;
            }

            setSelectedOrder(
                data.order
            );
        } catch (error) {
            console.error(
                "View Pending Order Error:",
                error
            );

            setSelectedOrder(
                null
            );

            toast.error(
                "Unable to connect to the server. Please try again."
            );
        }
    };

    /* =========================================
       CLOSE MODAL
    ========================================= */

    const closeModal = () => {
        setSelectedOrder(null);
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
                            Pending Orders
                        </h1>

                        <p>
                            Orders waiting for confirmation
                        </p>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-orders-loading">
                        <div className="admin-loading-spinner"></div>

                        <p>
                            Loading pending orders...
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
                        Pending Orders
                    </h1>

                    <p>
                        Orders waiting for confirmation
                    </p>
                </div>

                <div className="admin-page-count pending-count">
                    <FaClock />

                    <strong>
                        {orders.length}
                    </strong>

                    <span>
                        Pending
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
                        fetchPendingOrders(
                            true
                        )
                    }
                    title="Refresh pending orders"
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
                            fetchPendingOrders(
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
                            Pending Orders
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
                            {orders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="admin-table-empty"
                                    >
                                        <FaShoppingBag />

                                        <span>
                                            No pending orders
                                        </span>
                                    </td>
                                </tr>
                            ) : (
                                orders.map(
                                    (order) => (
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
                                                    order.totalItems ||
                                                    0
                                                ) ||
                                                    (Array.isArray(
                                                        order.items
                                                    )
                                                        ? order
                                                            .items
                                                            .length
                                                        : 0)}
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
                                                        "Order Placed"
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
                                                    <option value="Order Placed">
                                                        Order Placed
                                                    </option>

                                                    <option value="Confirmed">
                                                        Confirmed
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
                                aria-label="Close order details"
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
                                                selectedOrder.totalItems ||
                                                0
                                            ) ||
                                                (Array.isArray(
                                                    selectedOrder.items
                                                )
                                                    ? selectedOrder
                                                        .items
                                                        .length
                                                    : 0)}
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
                                            "Order Placed"
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
                                        <option value="Order Placed">
                                            Order Placed
                                        </option>

                                        <option value="Confirmed">
                                            Confirmed
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
                                            selectedOrder.items
                                                .length > 0 ? (
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
                                            )
                                        ) : (
                                            <p>
                                                No product details available.
                                            </p>
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

export default PendingOrders;