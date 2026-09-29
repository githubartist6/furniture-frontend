import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    FaSearch,
    FaEye,
    FaShoppingBag,
    FaFilter,
    FaSyncAlt,
} from "react-icons/fa";

import { toast } from "react-toastify";

import "./AdminPages.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

// ============================================================
// ADMIN ORDERS
// ============================================================

const AdminOrders = () => {
    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [updatingOrder, setUpdatingOrder] =
        useState("");

    const [selectedOrder, setSelectedOrder] =
        useState(null);

    // Prevent overlapping background requests
    const requestInProgressRef =
        useRef(false);

    // =====================================
    // FETCH ORDERS
    // =====================================

    const fetchOrders = async (
        showToast = true,
        isBackgroundRefresh = false
    ) => {
        if (requestInProgressRef.current) {
            return;
        }

        requestInProgressRef.current =
            true;

        try {
            if (!isBackgroundRefresh) {
                setLoading(true);
            }

            setError("");

            const params =
                new URLSearchParams();

            if (search.trim()) {
                params.set(
                    "search",
                    search.trim()
                );
            }

            if (
                statusFilter &&
                statusFilter !== "All"
            ) {
                params.set(
                    "status",
                    statusFilter
                );
            }

            const queryString =
                params.toString();

            const response =
                await fetch(
                    `${API_URL}/api/admin/orders${queryString
                        ? `?${queryString}`
                        : ""
                    }`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            Accept:
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
                    "Admin Orders Error: Failed to parse server response:",
                    parseError
                );

                data = {};
            }

            // =====================================
            // API ERROR
            // =====================================

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to load orders. Please try again.";

                console.error(
                    "Admin Orders API Error:",
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

            // =====================================
            // INVALID RESPONSE
            // =====================================

            if (
                !data ||
                typeof data !==
                "object" ||
                !Array.isArray(
                    data.orders
                )
            ) {
                console.error(
                    "Admin Orders Error: Invalid orders response:",
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

            // =====================================
            // SUCCESS
            // =====================================

            setOrders(
                data.orders
            );

            setError("");
        } catch (error) {
            console.error(
                "Admin Orders Fetch Error:",
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
            requestInProgressRef.current =
                false;

            if (!isBackgroundRefresh) {
                setLoading(false);
            }
        }
    };

    // =====================================
    // AUTO REFRESH
    // =====================================

    useEffect(() => {
        const timer =
            setTimeout(() => {
                fetchOrders(
                    true,
                    false
                );
            }, 300);

        const interval =
            setInterval(() => {
                fetchOrders(
                    false,
                    true
                );
            }, 2000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };

        // fetchOrders intentionally uses
        // current search/status values.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        search,
        statusFilter,
    ]);

    // =====================================
    // FORMAT DATE
    // =====================================

    const formatDate = (
        date
    ) => {
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

    // =====================================
    // FORMAT CURRENCY
    // =====================================

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

    // =====================================
    // CUSTOMER NAME
    // =====================================

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

    // =====================================
    // CUSTOMER EMAIL
    // =====================================

    const getCustomerEmail = (
        order
    ) => {
        return (
            order?.userId?.email ||
            order?.email ||
            "-"
        );
    };

    // =====================================
    // STATUS CLASS
    // =====================================

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

    // =====================================
    // UPDATE ORDER STATUS
    // =====================================

    const updateOrderStatus = async (
        orderId,
        newStatus
    ) => {
        if (!orderId) {
            console.error(
                "Update Order Status Error: Order ID missing"
            );

            toast.error(
                "Unable to update order status."
            );

            return;
        }

        if (!newStatus) {
            console.error(
                "Update Order Status Error: New status missing"
            );

            toast.error(
                "Please select a valid order status."
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

                        credentials:
                            "include",

                        body: JSON.stringify({
                            status:
                                newStatus,
                        }),
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
                    "Update Order Status Error: Failed to parse server response:",
                    parseError
                );

                data = {};
            }

            // =====================================
            // API ERROR
            // =====================================

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to update order status. Please try again.";

                console.error(
                    "Update Order Status API Error:",
                    {
                        orderId,
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

            // =====================================
            // UPDATE TABLE
            // =====================================

            setOrders(
                (previousOrders) =>
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

            // =====================================
            // UPDATE MODAL
            // =====================================

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

            // =====================================
            // SUCCESS TOAST
            // =====================================

            toast.success(
                data?.message ||
                "Order status updated successfully."
            );
        } catch (error) {
            console.error(
                "Update Order Status Error:",
                error
            );

            toast.error(
                "Unable to update order status. Please try again."
            );
        } finally {
            setUpdatingOrder(
                ""
            );
        }
    };

    // =====================================
    // VIEW ORDER
    // =====================================

    const handleViewOrder = async (
        orderId
    ) => {
        if (!orderId) {
            console.error(
                "View Order Error: Order ID missing"
            );

            toast.error(
                "Unable to load order details."
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

                        credentials:
                            "include",

                        headers: {
                            Accept:
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
                    "View Order Error: Failed to parse server response:",
                    parseError
                );

                data = {};
            }

            // =====================================
            // API ERROR
            // =====================================

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to load order. Please try again.";

                console.error(
                    "View Order API Error:",
                    {
                        orderId,
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

            // =====================================
            // INVALID ORDER
            // =====================================

            if (
                !data?.order ||
                typeof data.order !==
                "object"
            ) {
                console.error(
                    "View Order Error: Order data missing:",
                    data
                );

                setSelectedOrder(
                    null
                );

                toast.error(
                    "Unable to load order details. Please try again."
                );

                return;
            }

            setSelectedOrder(
                data.order
            );
        } catch (error) {
            console.error(
                "View Order Error:",
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

    // =====================================
    // CLOSE MODAL
    // =====================================

    const closeModal = () => {
        setSelectedOrder(
            null
        );
    };

    // =====================================
    // LOADING
    // =====================================

    if (
        loading &&
        orders.length === 0
    ) {
        return (
            <div className="admin-page">
                <div className="admin-page-header">
                    <div>
                        <h1>
                            All Orders
                        </h1>

                        <p>
                            Manage all customer orders
                        </p>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-orders-loading">
                        <div className="admin-loading-spinner"></div>

                        <p>
                            Loading orders...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // =====================================
    // RENDER
    // =====================================

    return (
        <div className="admin-page">
            {/* =====================================
                PAGE HEADER
            ===================================== */}

            <div className="admin-page-header">
                <div>
                    <h1>
                        All Orders
                    </h1>

                    <p>
                        Manage all customer orders
                    </p>
                </div>
            </div>

            {/* =====================================
                FILTERS
            ===================================== */}

            <div className="admin-card admin-filter-card">
                {/* SEARCH */}

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

                {/* STATUS FILTER */}

                <div className="admin-filter-box">
                    <FaFilter />

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="All">
                            All Status
                        </option>

                        <option value="Order Placed">
                            Order Placed
                        </option>

                        <option value="Confirmed">
                            Confirmed
                        </option>

                        <option value="Processing">
                            Processing
                        </option>

                        <option value="Out for Delivery">
                            Out for Delivery
                        </option>

                        <option value="Delivered">
                            Delivered
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>
                    </select>
                </div>

                {/* REFRESH */}

                <button
                    type="button"
                    className="admin-refresh-button"
                    onClick={() =>
                        fetchOrders(
                            true,
                            false
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
                            fetchOrders(
                                true,
                                false
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
                            Orders
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
                                    Date
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
                                            No orders found
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

                                            {/* DATE */}

                                            <td>
                                                {formatDate(
                                                    order.orderDate ||
                                                    order.createdAt
                                                )}
                                            </td>

                                            {/* ITEMS */}

                                            <td>
                                                {Number(
                                                    order.totalItems ??
                                                    order
                                                        .items
                                                        ?.length ??
                                                    0
                                                )}
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

                                                    <option value="Out for Delivery">
                                                        Out for Delivery
                                                    </option>

                                                    <option value="Delivered">
                                                        Delivered
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
                                            Delivery Date
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
                                                selectedOrder.totalItems ??
                                                selectedOrder
                                                    .items
                                                    ?.length ??
                                                0
                                            )}
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

                                        <option value="Out for Delivery">
                                            Out for Delivery
                                        </option>

                                        <option value="Delivered">
                                            Delivered
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
                                                ) => {
                                                    const image =
                                                        Array.isArray(
                                                            item.image
                                                        )
                                                            ? item
                                                                .image[0]
                                                            : item.image;

                                                    return (
                                                        <div
                                                            className="admin-order-product"
                                                            key={
                                                                item.id ||
                                                                index
                                                            }
                                                        >
                                                            <div className="admin-order-product-image">
                                                                {image ? (
                                                                    <img
                                                                        src={
                                                                            image
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
                                                                    {item.name ||
                                                                        "Product"}
                                                                </strong>

                                                                <span>
                                                                    Qty:{" "}
                                                                    {Number(
                                                                        item.quantity ??
                                                                        0
                                                                    )}

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
                                                    );
                                                }
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

export default AdminOrders;