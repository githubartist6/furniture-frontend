import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    FaShoppingBag,
    FaCheckCircle,
    FaClock,
    FaTruck,
    FaShippingFast,
    FaRupeeSign,
    FaArrowUp,
    FaArrowRight,
    FaBoxOpen,
    FaUser,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import "./AdminPages.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

// ============================================================
// ADMIN DASHBOARD
// ============================================================

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // =====================================
    // ORDER OVERVIEW RANGE
    // =====================================

    const [overviewRange, setOverviewRange] =
        useState("7days");

    // =====================================
    // REQUEST CONTROL
    // =====================================

    const requestInProgressRef =
        useRef(false);

    const isMountedRef =
        useRef(true);

    // =====================================
    // FETCH DASHBOARD
    // =====================================

    const fetchDashboard = useCallback(
        async (
            range = overviewRange,
            showToast = true,
            isBackgroundRefresh = false
        ) => {
            if (
                requestInProgressRef.current
            ) {
                return;
            }

            requestInProgressRef.current =
                true;

            try {
                // Do not show full loading screen
                // during background refresh
                if (!isBackgroundRefresh) {
                    setLoading(true);
                }

                setError("");

                const response =
                    await fetch(
                        `${API_URL}/api/admin/dashboard?range=${encodeURIComponent(
                            range
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
                        "Dashboard Fetch Error: Failed to parse server response:",
                        parseError
                    );

                    data = {};
                }

                // =====================================
                // COMPONENT UNMOUNT CHECK
                // =====================================

                if (
                    !isMountedRef.current
                ) {
                    return;
                }

                // =====================================
                // API ERROR
                // =====================================

                if (!response.ok) {
                    const serverMessage =
                        data?.message ||
                        "Failed to load dashboard. Please try again.";

                    // Technical details -> Console
                    console.error(
                        "Dashboard API Error:",
                        {
                            status:
                                response.status,

                            statusText:
                                response.statusText,

                            serverMessage,
                        }
                    );

                    setError(
                        "Unable to load dashboard"
                    );

                    // User-facing message -> Toastify
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
                    "object"
                ) {
                    console.error(
                        "Dashboard Fetch Error: Invalid dashboard response:",
                        data
                    );

                    setError(
                        "Unable to load dashboard"
                    );

                    if (showToast) {
                        toast.error(
                            "Unable to load dashboard data. Please try again."
                        );
                    }

                    return;
                }

                // =====================================
                // SUCCESS
                // =====================================

                setDashboard(data);
                setError("");
            } catch (error) {
                // =====================================
                // TECHNICAL ERROR -> CONSOLE ONLY
                // =====================================

                console.error(
                    "Dashboard Fetch Error:",
                    error
                );

                if (
                    !isMountedRef.current
                ) {
                    return;
                }

                setError(
                    "Unable to load dashboard"
                );

                // =====================================
                // USER MESSAGE -> TOASTIFY ONLY
                // =====================================

                if (showToast) {
                    toast.error(
                        "Unable to connect to the server. Please try again."
                    );
                }
            } finally {
                requestInProgressRef.current =
                    false;

                if (
                    isMountedRef.current &&
                    !isBackgroundRefresh
                ) {
                    setLoading(false);
                }
            }
        },
        [overviewRange]
    );

    // =====================================
    // INITIAL FETCH + AUTO REFRESH
    // =====================================

    useEffect(() => {
        isMountedRef.current =
            true;

        // =====================================
        // INITIAL FETCH
        // =====================================

        fetchDashboard(
            overviewRange,
            true,
            false
        );

        // =====================================
        // AUTO REFRESH EVERY 2 SECONDS
        // No Toastify during background refresh
        // =====================================

        const interval =
            setInterval(() => {
                fetchDashboard(
                    overviewRange,
                    false,
                    true
                );
            }, 2000);

        // =====================================
        // CLEANUP
        // =====================================

        return () => {
            isMountedRef.current =
                false;

            clearInterval(
                interval
            );
        };
    }, [
        overviewRange,
        fetchDashboard,
    ]);

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
    // STATUS CLASS
    // =====================================

    const getStatusClass = (
        status
    ) => {
        switch (status) {
            case "Order Placed":
                return "order-status pending";

            case "Confirmed":
                return "order-status confirmed";

            case "Processing":
                return "order-status processing";

            case "Out for Delivery":
                return "order-status out-delivery";

            case "Delivered":
                return "order-status delivered";

            case "Cancelled":
                return "order-status cancelled";

            default:
                return "order-status";
        }
    };

    // =====================================
    // LOADING
    // =====================================

    if (
        loading &&
        !dashboard
    ) {
        return (
            <div className="admin-page">
                <div className="admin-dashboard-loading">
                    <div className="admin-loading-spinner"></div>

                    <p>
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    // =====================================
    // ERROR
    // =====================================

    if (
        error &&
        !dashboard
    ) {
        return (
            <div className="admin-page">
                <div className="admin-dashboard-error">
                    <FaBoxOpen />

                    <h3>
                        Unable to load dashboard
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            fetchDashboard(
                                overviewRange,
                                true,
                                false
                            )
                        }
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // =====================================
    // SAFE DATA
    // =====================================

    const stats =
        dashboard?.stats || {};

    const totalOrders =
        Number(
            stats.totalOrders ?? 0
        );

    const deliveredOrders =
        Number(
            stats.deliveredOrders ?? 0
        );

    const pendingOrders =
        Number(
            stats.pendingOrders ?? 0
        );

    const upcomingOrders =
        Number(
            stats.upcomingOrders ?? 0
        );

    const todayOrders =
        Number(
            stats.todayOrders ?? 0
        );

    const outForDeliveryOrders =
        Number(
            stats.outForDeliveryOrders ?? 0
        );

    const processingOrders =
        Number(
            stats.processingOrders ?? 0
        );

    const totalRevenue =
        Number(
            stats.totalRevenue ?? 0
        );

    const todaysOrders =
        Array.isArray(
            dashboard?.todaysOrders
        )
            ? dashboard.todaysOrders
            : [];

    const orderOverview =
        Array.isArray(
            dashboard?.orderOverview
        )
            ? dashboard.orderOverview
            : [];

    // =====================================
    // MAX ORDERS FOR GRAPH
    // =====================================

    const maxOrders =
        Math.max(
            ...orderOverview.map(
                (item) =>
                    Number(
                        item?.orders ?? 0
                    )
            ),
            1
        );

    // =====================================
    // DELIVERED PERCENTAGE
    // =====================================

    const deliveredPercentage =
        totalOrders > 0
            ? Math.min(
                100,
                Math.max(
                    0,
                    Math.round(
                        (
                            deliveredOrders /
                            totalOrders
                        ) *
                        100
                    )
                )
            )
            : 0;

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
                        Dashboard
                    </h1>

                    <p>
                        Welcome back! Here's what's
                        happening with your store.
                    </p>
                </div>

                <div className="admin-date-box">
                    <span>
                        Today
                    </span>

                    <strong>
                        {new Date().toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            }
                        )}
                    </strong>
                </div>
            </div>

            {/* =====================================
                MAIN STATISTICS
            ===================================== */}

            <div className="admin-stats-grid">
                {/* TOTAL ORDERS */}

                <div className="admin-stat-card">
                    <div className="admin-stat-top">
                        <div className="admin-stat-icon orders">
                            <FaShoppingBag />
                        </div>

                        <span className="admin-stat-badge">
                            <FaArrowUp />

                            Orders
                        </span>
                    </div>

                    <div className="admin-stat-number">
                        {totalOrders}
                    </div>

                    <p>
                        Total Orders
                    </p>
                </div>

                {/* DELIVERED */}

                <div className="admin-stat-card">
                    <div className="admin-stat-top">
                        <div className="admin-stat-icon delivered">
                            <FaCheckCircle />
                        </div>

                        <span className="admin-stat-badge">
                            Delivered
                        </span>
                    </div>

                    <div className="admin-stat-number">
                        {deliveredOrders}
                    </div>

                    <p>
                        Delivered Orders
                    </p>
                </div>

                {/* PENDING */}

                <div className="admin-stat-card">
                    <div className="admin-stat-top">
                        <div className="admin-stat-icon pending">
                            <FaClock />
                        </div>

                        <span className="admin-stat-badge">
                            Pending
                        </span>
                    </div>

                    <div className="admin-stat-number">
                        {pendingOrders}
                    </div>

                    <p>
                        Pending Orders
                    </p>
                </div>

                {/* UPCOMING */}

                <div className="admin-stat-card">
                    <div className="admin-stat-top">
                        <div className="admin-stat-icon delivery">
                            <FaTruck />
                        </div>

                        <span className="admin-stat-badge">
                            In Progress
                        </span>
                    </div>

                    <div className="admin-stat-number">
                        {upcomingOrders}
                    </div>

                    <p>
                        Upcoming Orders
                    </p>
                </div>
            </div>

            {/* =====================================
                SMALL STATS
            ===================================== */}

            <div className="admin-small-stats">
                {/* TODAY'S ORDERS */}

                <div className="admin-small-stat">
                    <div className="admin-small-icon">
                        <FaShoppingBag />
                    </div>

                    <div>
                        <span>
                            Today's Orders
                        </span>

                        <strong>
                            {todayOrders}
                        </strong>
                    </div>
                </div>

                {/* OUT FOR DELIVERY */}

                <div className="admin-small-stat">
                    <div className="admin-small-icon">
                        <FaShippingFast />
                    </div>

                    <div>
                        <span>
                            Out for Delivery
                        </span>

                        <strong>
                            {outForDeliveryOrders}
                        </strong>
                    </div>
                </div>

                {/* REVENUE */}

                <div className="admin-small-stat">
                    <div className="admin-small-icon">
                        <FaRupeeSign />
                    </div>

                    <div>
                        <span>
                            Total Revenue
                        </span>

                        <strong>
                            {formatCurrency(
                                totalRevenue
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            {/* =====================================
                GRAPH + STATUS
            ===================================== */}

            <div className="admin-dashboard-grid">
                {/* =================================
                    ORDER OVERVIEW
                ================================= */}

                <div className="admin-card">
                    <div className="admin-card-header">
                        <div>
                            <h2>
                                Order Overview
                            </h2>

                            <p>
                                {dashboard?.overviewLabel ||
                                    "Orders received in the last 7 days"}
                            </p>
                        </div>

                        <select
                            value={
                                overviewRange
                            }
                            onChange={(e) =>
                                setOverviewRange(
                                    e.target.value
                                )
                            }
                        >
                            <option value="today">
                                Today
                            </option>

                            <option value="yesterday">
                                Yesterday
                            </option>

                            <option value="7days">
                                Last 7 Days
                            </option>

                            <option value="30days">
                                Last 30 Days
                            </option>

                            <option value="2months">
                                2 Months
                            </option>

                            <option value="6months">
                                6 Months
                            </option>

                            <option value="1year">
                                1 Year
                            </option>

                            <option value="2years">
                                2 Years
                            </option>

                            <option value="3years">
                                3 Years
                            </option>

                            <option value="4years">
                                4 Years
                            </option>

                            <option value="5years">
                                5 Years
                            </option>
                        </select>
                    </div>

                    <div className="admin-real-chart">
                        <div className="admin-chart-y-axis">
                            <span>
                                {maxOrders}
                            </span>

                            <span>
                                {Math.ceil(
                                    maxOrders *
                                    0.75
                                )}
                            </span>

                            <span>
                                {Math.ceil(
                                    maxOrders *
                                    0.5
                                )}
                            </span>

                            <span>
                                {Math.ceil(
                                    maxOrders *
                                    0.25
                                )}
                            </span>

                            <span>
                                0
                            </span>
                        </div>

                        <div className="admin-chart-area">
                            <div className="admin-chart-grid-lines">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                            <div className="admin-chart-bars">
                                {orderOverview.map(
                                    (
                                        item,
                                        index
                                    ) => {
                                        const itemOrders =
                                            Number(
                                                item?.orders ??
                                                0
                                            );

                                        const height =
                                            itemOrders >
                                                0
                                                ? Math.max(
                                                    (
                                                        itemOrders /
                                                        maxOrders
                                                    ) *
                                                    100,
                                                    8
                                                )
                                                : 0;

                                        return (
                                            <div
                                                className="admin-chart-column"
                                                key={
                                                    item?.date ||
                                                    item?.day ||
                                                    index
                                                }
                                            >
                                                <div className="admin-chart-value">
                                                    {
                                                        itemOrders
                                                    }
                                                </div>

                                                <div
                                                    className="admin-chart-bar"
                                                    style={{
                                                        height: `${height}%`,
                                                    }}
                                                    title={`${itemOrders} orders`}
                                                ></div>

                                                <span>
                                                    {item?.day ||
                                                        "-"}
                                                </span>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* =================================
                    ORDER STATUS
                ================================= */}

                <div className="admin-card">
                    <div className="admin-card-header">
                        <div>
                            <h2>
                                Order Status
                            </h2>

                            <p>
                                Current order breakdown
                            </p>
                        </div>
                    </div>

                    <div className="status-overview">
                        <div className="status-progress">
                            <div
                                className="status-progress-fill"
                                style={{
                                    width: `${deliveredPercentage}%`,
                                }}
                            ></div>
                        </div>

                        <div className="status-list">
                            <div>
                                <span>
                                    <i className="status-dot pending-dot"></i>
                                    Pending
                                </span>

                                <strong>
                                    {pendingOrders}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    <i className="status-dot processing-dot"></i>
                                    Processing
                                </span>

                                <strong>
                                    {processingOrders}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    <i className="status-dot delivery-dot"></i>
                                    Out for Delivery
                                </span>

                                <strong>
                                    {
                                        outForDeliveryOrders
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    <i className="status-dot delivered-dot"></i>
                                    Delivered
                                </span>

                                <strong>
                                    {deliveredOrders}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================
                TODAY'S ORDERS
            ===================================== */}

            <div className="admin-card admin-today-orders">
                <div className="admin-card-header">
                    <div>
                        <h2>
                            Today's Orders
                        </h2>

                        <p>
                            All orders received today
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-view-all"
                        onClick={() =>
                            navigate(
                                "/admin/orders"
                            )
                        }
                    >
                        View All

                        <FaArrowRight />
                    </button>
                </div>

                {todaysOrders.length >
                    0 ? (
                    <div className="admin-today-orders-list">
                        {todaysOrders.map(
                            (
                                order,
                                index
                            ) => (
                                <div
                                    className="admin-today-order"
                                    key={
                                        order?._id ||
                                        order?.orderId ||
                                        index
                                    }
                                >
                                    <div className="admin-order-product-icon">
                                        <FaShoppingBag />
                                    </div>

                                    <div className="admin-today-order-info">
                                        <strong>
                                            {order?.orderId ||
                                                "-"}
                                        </strong>

                                        <span>
                                            <FaUser />

                                            {getCustomerName(
                                                order
                                            )}
                                        </span>
                                    </div>

                                    <div className="admin-today-order-items">
                                        <span>
                                            Items
                                        </span>

                                        <strong>
                                            {Number(
                                                order?.totalItems ??
                                                order
                                                    ?.items
                                                    ?.length ??
                                                0
                                            )}
                                        </strong>
                                    </div>

                                    <div className="admin-today-order-total">
                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                order?.total
                                            )}
                                        </strong>
                                    </div>

                                    <div
                                        className={getStatusClass(
                                            order?.status
                                        )}
                                    >
                                        {order?.status ||
                                            "Unknown"}
                                    </div>

                                    <div className="admin-today-order-date">
                                        {formatDate(
                                            order?.orderDate ||
                                            order?.createdAt
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <div className="admin-empty-orders">
                        <div className="admin-empty-icon">
                            <FaShoppingBag />
                        </div>

                        <h3>
                            No orders today
                        </h3>

                        <p>
                            New orders will appear here
                            when customers place them.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;