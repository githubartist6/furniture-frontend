import React, {
  useEffect,
  useState,
} from "react";

import {
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import {
  FaBars,
  FaUserShield,
} from "react-icons/fa";

import { toast } from "react-toastify";

import AdminSidebar from "./Sidebar/AdminSidebar";

import AdminDashboard from "./Pages/AdminDashboard";
import AdminOrders from "./Pages/AdminOrders";
import PendingOrders from "./Pages/PendingOrders";
import DeliveryOrders from "./Pages/DeliveryOrders";
import OutForDelivery from "./Pages/OutForDelivery";
import DeliveredOrders from "./Pages/DeliveredOrders";

import "./Admin.css";

// ============================================================
// API URL
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

// ============================================================
// ADMIN COMPONENT
// ============================================================

const Admin = () => {
  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [user, setUser] =
    useState(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  // ==========================================================
  // CHECK ADMIN ACCESS
  // ==========================================================

  useEffect(() => {
    let isMounted = true;

    const checkAdminAccess =
      async () => {
        try {
          const response =
            await fetch(
              `${API_URL}/api/admin/dashboard`,
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

          // ==========================================
          // SAFE JSON PARSE
          // ==========================================

          let data = {};

          try {
            data =
              await response.json();
          } catch (parseError) {
            console.error(
              "Admin Access Error: Failed to parse server response:",
              parseError
            );

            data = {};
          }

          // ==========================================
          // COMPONENT UNMOUNT CHECK
          // ==========================================

          if (!isMounted) {
            return;
          }

          // ==========================================
          // API ERROR
          // ==========================================

          if (!response.ok) {
            const serverMessage =
              data?.message ||
              "Admin access denied. Please login again.";

            // Technical details -> Console
            console.error(
              "Admin Access API Error:",
              {
                status:
                  response.status,

                statusText:
                  response.statusText,

                serverMessage,
              }
            );

            // User-facing message -> Toastify
            toast.error(
              serverMessage
            );

            setUser(null);

            navigate(
              "/",
              {
                replace: true,
              }
            );

            return;
          }

          // ==========================================
          // INVALID ADMIN RESPONSE
          // ==========================================

          if (
            !data ||
            typeof data !==
            "object"
          ) {
            console.error(
              "Admin Access Error: Invalid server response:",
              data
            );

            toast.error(
              "Unable to verify admin access. Please try again."
            );

            setUser(null);

            navigate(
              "/",
              {
                replace: true,
              }
            );

            return;
          }

          // ==========================================
          // ADMIN VALIDATION
          // ==========================================

          if (
            !data.admin ||
            data.admin.isAdmin !==
            true
          ) {
            console.error(
              "Admin Access Error: Admin privileges not found:",
              data.admin
            );

            toast.error(
              "Admin access required."
            );

            setUser(null);

            navigate(
              "/",
              {
                replace: true,
              }
            );

            return;
          }

          // ==========================================
          // ADMIN VERIFIED
          // ==========================================

          setUser(
            data.admin
          );
        } catch (error) {
          // ==========================================
          // TECHNICAL ERROR -> CONSOLE ONLY
          // ==========================================

          console.error(
            "Admin Access Error:",
            error
          );

          if (!isMounted) {
            return;
          }

          // ==========================================
          // USER MESSAGE -> TOASTIFY ONLY
          // ==========================================

          toast.error(
            "Unable to verify admin access. Please try again."
          );

          setUser(null);

          navigate(
            "/",
            {
              replace: true,
            }
          );
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

    checkAdminAccess();

    // ======================================================
    // CLEANUP
    // ======================================================

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>

        <p>
          Checking admin access...
        </p>
      </div>
    );
  }

  // ==========================================================
  // ACCESS DENIED
  // ==========================================================

  if (!user) {
    return null;
  }

  // ==========================================================
  // ADMIN LAYOUT
  // ==========================================================

  return (
    <div className="admin-layout">

      {/* =====================================================
                SIDEBAR
            ===================================================== */}

      <AdminSidebar
        sidebarOpen={
          sidebarOpen
        }
        setSidebarOpen={
          setSidebarOpen
        }
      />

      <main className="admin-main">

        {/* ===================================================
                    MOBILE HEADER
                =================================================== */}

        <header className="admin-mobile-header">

          <button
            type="button"
            className="admin-mobile-menu"
            onClick={() =>
              setSidebarOpen(
                true
              )
            }
            aria-label="Open admin menu"
            aria-expanded={
              sidebarOpen
            }
          >
            <FaBars />
          </button>

          <div className="admin-mobile-title">

            <FaUserShield />

            <span>
              Admin Panel
            </span>

          </div>

        </header>

        {/* ===================================================
                    DESKTOP TOPBAR
                =================================================== */}

        <div className="admin-topbar">

          <div>
            <h2>
              Furniture Admin
            </h2>

            <span>
              Manage your store
            </span>
          </div>

          <div className="admin-user-info">

            <FaUserShield />

            <div>

              <strong>
                {user.name ||
                  user.username ||
                  user.email ||
                  "Administrator"}
              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>

        </div>

        {/* ===================================================
                    ADMIN PAGE CONTENT
                =================================================== */}

        <div className="admin-content">

          <Routes>

            {/* /admin */}

            <Route
              index
              element={
                <AdminDashboard />
              }
            />

            {/* /admin/orders */}

            <Route
              path="orders"
              element={
                <AdminOrders />
              }
            />

            {/* /admin/pending */}

            <Route
              path="pending"
              element={
                <PendingOrders />
              }
            />

            {/* /admin/delivery */}

            <Route
              path="delivery"
              element={
                <DeliveryOrders />
              }
            />

            {/* /admin/out-for-delivery */}

            <Route
              path="out-for-delivery"
              element={
                <OutForDelivery />
              }
            />

            {/* /admin/delivered */}

            <Route
              path="delivered"
              element={
                <DeliveredOrders />
              }
            />

          </Routes>

        </div>

      </main>

    </div>
  );
};

export default Admin;