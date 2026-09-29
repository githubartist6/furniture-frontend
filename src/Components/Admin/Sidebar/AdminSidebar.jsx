import React from "react";

import {
    FaTachometerAlt,
    FaShoppingBag,
    FaClock,
    FaTruck,
    FaShippingFast,
    FaCheckCircle,
    FaSignOutAlt,
    FaTimes,
    FaBoxOpen,
} from "react-icons/fa";

import {
    NavLink,
    useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import "./AdminSidebar.css";

const AdminSidebar = ({
    sidebarOpen,
    setSidebarOpen,
}) => {
    const navigate = useNavigate();

    // ======================================================
    // CLOSE SIDEBAR
    // ======================================================

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    // ======================================================
    // ADMIN LOGOUT
    // ======================================================

    const handleLogout = async () => {
        const API_URL = (
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000"
        ).replace(/\/+$/, "");

        let logoutSuccessful = false;

        try {
            const response = await fetch(
                `${API_URL}/api/admin/logout`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch (parseError) {
                console.error(
                    "Admin Logout Response Parse Error:",
                    parseError
                );
            }

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to logout from the server.";

                console.error(
                    "Admin Logout API Error:",
                    {
                        status: response.status,
                        statusText: response.statusText,
                        serverMessage,
                    }
                );

                toast.error(serverMessage);
            } else {
                logoutSuccessful = true;

                toast.success(
                    data?.message ||
                    "Logged out successfully."
                );
            }
        } catch (error) {
            console.error(
                "Admin Logout Error:",
                error
            );

            toast.error(
                "Unable to contact the server. You have been logged out locally."
            );
        } finally {
            // ==================================================
            // ALWAYS CLEAR LOCAL AUTH DATA
            // ==================================================

            localStorage.removeItem("user");
            localStorage.removeItem(
                "isLoggedIn"
            );
            localStorage.removeItem("token");
            localStorage.removeItem(
                "authToken"
            );

            window.dispatchEvent(
                new Event("authChanged")
            );

            setSidebarOpen(false);

            navigate("/login", {
                replace: true,
            });
        }
    };

    // ======================================================
    // MENU ITEMS
    // ======================================================

    const menuItems = [
        {
            path: "/admin",
            label: "Dashboard",
            icon: <FaTachometerAlt />,
            end: true,
        },
        {
            path: "/admin/orders",
            label: "All Orders",
            icon: <FaShoppingBag />,
        },
        {
            path: "/admin/pending",
            label: "Pending Orders",
            icon: <FaClock />,
        },
        {
            path: "/admin/delivery",
            label: "In Delivery",
            icon: <FaTruck />,
        },
        {
            path: "/admin/out-for-delivery",
            label: "Out for Delivery",
            icon: <FaShippingFast />,
        },
        {
            path: "/admin/delivered",
            label: "Delivered Orders",
            icon: <FaCheckCircle />,
        },
    ];

    // ======================================================
    // RENDER
    // ======================================================

    return (
        <>
            {/* Overlay */}

            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}

            <aside
                className={`admin-sidebar ${sidebarOpen
                        ? "admin-sidebar-open"
                        : ""
                    }`}
            >
                {/* Logo */}

                <div className="admin-sidebar-logo">
                    <div className="admin-logo-icon">
                        <FaBoxOpen />
                    </div>

                    <div className="admin-logo-text">
                        <h2>Furniture</h2>

                        <span>
                            Admin Panel
                        </span>
                    </div>

                    <button
                        type="button"
                        className="admin-sidebar-close"
                        onClick={closeSidebar}
                        aria-label="Close sidebar"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Menu */}

                <nav className="admin-sidebar-menu">
                    <p className="admin-menu-title">
                        MAIN MENU
                    </p>

                    {menuItems.map(
                        (item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({
                                    isActive,
                                }) =>
                                    `admin-menu-link ${isActive
                                        ? "active"
                                        : ""
                                    }`
                                }
                                onClick={
                                    closeSidebar
                                }
                            >
                                <span className="admin-menu-icon">
                                    {item.icon}
                                </span>

                                <span className="admin-menu-label">
                                    {item.label}
                                </span>
                            </NavLink>
                        )
                    )}
                </nav>

                {/* Bottom */}

                <div className="admin-sidebar-bottom">
                    <button
                        type="button"
                        className="admin-logout-button"
                        onClick={
                            handleLogout
                        }
                    >
                        <span>
                            <FaSignOutAlt />
                        </span>

                        <span>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;