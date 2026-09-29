import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import "./Navbar.css";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { BsCart3 } from "react-icons/bs";

import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

import { toast } from "react-toastify";

import { useCart } from "../../Pages/Context/CartContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const Navbar = () => {
  const navigate = useNavigate();

  // ==================================================
  // REFS
  // ==================================================

  const desktopProfileRef = useRef(null);
  const mobileProfileRef = useRef(null);

  // ==================================================
  // STATES
  // ==================================================

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ==================================================
  // CART
  // ==================================================

  const { totalQuantity } = useCart();

  // ==================================================
  // LOAD USER
  // ==================================================

  const loadUser = () => {
    try {
      const savedUser =
        localStorage.getItem("user");

      if (!savedUser) {
        setUser(null);
        return;
      }

      const parsedUser =
        JSON.parse(savedUser);

      if (
        !parsedUser ||
        typeof parsedUser !== "object"
      ) {
        console.error(
          "Navbar User Error: Invalid user data in localStorage"
        );

        localStorage.removeItem("user");

        setUser(null);

        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "Navbar User Loading Error:",
        error
      );

      localStorage.removeItem("user");

      setUser(null);

      toast.error(
        "Your login session is invalid. Please login again."
      );
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadUser();
  }, []);

  // ==================================================
  // AUTH CHANGE
  // ==================================================

  useEffect(() => {
    const handleAuthChange = () => {
      loadUser();

      // Close dropdown after login/logout
      setProfileOpen(false);
      setMenuOpen(false);
    };

    window.addEventListener(
      "authChanged",
      handleAuthChange
    );

    window.addEventListener(
      "storage",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "authChanged",
        handleAuthChange
      );

      window.removeEventListener(
        "storage",
        handleAuthChange
      );
    };
  }, []);

  // ==================================================
  // CLOSE DROPDOWN OUTSIDE
  // ==================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedDesktopProfile =
        desktopProfileRef.current?.contains(
          event.target
        );

      const clickedMobileProfile =
        mobileProfileRef.current?.contains(
          event.target
        );

      if (
        !clickedDesktopProfile &&
        !clickedMobileProfile
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ==================================================
  // CLOSE MENU
  // ==================================================

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = () => {
    closeMenu();

    navigate("/login");
  };

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    let logoutSuccessful = false;

    try {
      const response =
        await fetch(
          `${API_URL}/api/auth/logout`,
          {
            method: "POST",
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
          "Logout JSON Parse Error:",
          parseError
        );

        data = {};
      }

      console.log(
        "Logout Status:",
        response.status
      );

      console.log(
        "Logout Response:",
        data
      );

      if (!response.ok) {
        console.error(
          "Logout API Error:",
          {
            status:
              response.status,
            statusText:
              response.statusText,
            serverMessage:
              data?.message,
          }
        );

        /*
         * Even if server logout fails,
         * local login data will still be
         * cleared below.
         */

        toast.error(
          data?.message ||
          "Unable to complete server logout. You have been logged out locally."
        );
      } else {
        logoutSuccessful = true;
      }
    } catch (error) {
      // Technical details ONLY in console
      console.error(
        "Logout API Error:",
        error
      );

      /*
       * Local logout will still happen
       * even when API is unavailable.
       */

      toast.error(
        "Unable to contact the server. You have been logged out locally."
      );
    }

    // ==========================================
    // REMOVE LOGIN DATA
    // ==========================================

    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");

    // ==========================================
    // UPDATE NAVBAR
    // ==========================================

    setUser(null);
    setProfileOpen(false);
    setMenuOpen(false);

    // ==========================================
    // INFORM OTHER COMPONENTS
    // ==========================================

    window.dispatchEvent(
      new Event("authChanged")
    );

    // ==========================================
    // SUCCESS MESSAGE
    // ==========================================

    if (logoutSuccessful) {
      toast.success(
        "Logged out successfully."
      );
    }

    // ==========================================
    // GO HOME
    // ==========================================

    navigate("/", {
      replace: true,
    });
  };

  // ==================================================
  // USER NAME
  // ==================================================

  const getUserName = () => {
    if (!user) {
      return "Profile";
    }

    return (
      user.name ||
      user.fullName ||
      user.username ||
      user.email?.split("@")[0] ||
      "Profile"
    );
  };

  // ==================================================
  // USER INITIAL
  // ==================================================

  const getUserInitial = () => {
    const name = getUserName();

    return name
      .charAt(0)
      .toUpperCase();
  };

  // ==================================================
  // PROFILE DROPDOWN
  // ==================================================

  const ProfileDropdown = ({
    mobile = false,
  }) => {
    return (
      <div
        className={
          mobile
            ? "profile-dropdown mobile-profile-dropdown"
            : "profile-dropdown"
        }
      >
        {/* HEADER */}

        <div className="profile-dropdown-header">
          <div className="profile-large-icon">
            <FaUserCircle />
          </div>

          <div>
            <strong>
              {getUserName()}
            </strong>

            <span>
              {user?.email || ""}
            </span>
          </div>
        </div>

        {/* PROFILE */}

        <NavLink
          to="/profile"
          onClick={closeMenu}
        >
          <FaUser />
          <span>Profile</span>
        </NavLink>

        {/* ORDERS */}

        <NavLink
          to="/orders"
          onClick={closeMenu}
        >
          <FaBoxOpen />
          <span>My Orders</span>
        </NavLink>

        {/* ADDRESS */}

        <NavLink
          to="/address"
          onClick={closeMenu}
        >
          <FaMapMarkerAlt />
          <span>Address</span>
        </NavLink>

        {/* LOGOUT */}

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    );
  };

  // ==================================================
  // NAVBAR
  // ==================================================

  return (
    <header className="navbar">

      {/* ==================================================
          LOGO
      ================================================== */}

      <div className="nav-logo">

        <NavLink
          to="/"
          onClick={closeMenu}
        >
          <img
            src="https://png.pngtree.com/png-clipart/20250626/original/pngtree-furniture-logo-transparent-image-free-online-download-png-image_21238326.png"
            alt="Furniture Logo"
          />
        </NavLink>

        <p>
          FURNITURE
        </p>

      </div>

      {/* ==================================================
          MOBILE RIGHT CONTROLS
      ================================================== */}

      <div className="mobile-right-controls">

        {/* MOBILE LOGIN */}

        {!user && (
          <button
            type="button"
            className="mobile-login-btn"
            onClick={handleLogin}
          >
            Login
          </button>
        )}

        {/* MOBILE PROFILE */}

        {user && (
          <div
            className="mobile-profile-wrapper"
            ref={mobileProfileRef}
          >
            <button
              type="button"
              className="mobile-profile-btn"
              onClick={() =>
                setProfileOpen(
                  (prev) => !prev
                )
              }
            >
              <span className="profile-avatar">
                {getUserInitial()}
              </span>

              <span className="mobile-profile-name">
                {getUserName()}
              </span>
            </button>

            {profileOpen && (
              <ProfileDropdown mobile />
            )}
          </div>
        )}

        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() =>
            setMenuOpen(
              (prev) => !prev
            )
          }
          aria-label="Toggle Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <FaTimes />
          ) : (
            <FaBars />
          )}
        </button>

      </div>

      {/* ==================================================
          MENU + DESKTOP LOGIN/CART
      ================================================== */}

      <div
        className={`mobile-menu-wrapper ${menuOpen
            ? "show-menu"
            : ""
          }`}
      >

        {/* ==================================================
            NAV MENU
        ================================================== */}

        <nav className="nav-menu">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/product"
            className={({ isActive }) =>
              isActive
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Products
          </NavLink>

          <NavLink
            to="/sofas"
            className={({ isActive }) =>
              isActive
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Sofas
          </NavLink>

          <NavLink
            to="/beds"
            className={({ isActive }) =>
              isActive
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Beds
          </NavLink>

          <NavLink
            to="/tables"
            className={({ isActive }) =>
              isActive
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Tables
          </NavLink>

          <NavLink
            to="/chairs"
            className={({ isActive }) =>
              isActive
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Chairs
          </NavLink>

          <NavLink
            to="/wardrobes"
            className={({ isActive }) =>
              isActive
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            Wardrobes
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? "active"
                : ""
            }
            onClick={closeMenu}
          >
            About
          </NavLink>

        </nav>

        {/* ==================================================
            DESKTOP LOGIN + PROFILE + CART
        ================================================== */}

        <div className="nav-login-cart">

          {/* DESKTOP LOGIN */}

          {!user && (
            <button
              type="button"
              className="desktop-login-btn"
              onClick={handleLogin}
            >
              Login
            </button>
          )}

          {/* DESKTOP PROFILE */}

          {user && (
            <div
              className="desktop-profile"
              ref={desktopProfileRef}
            >
              <button
                type="button"
                className="profile-btn"
                onClick={() =>
                  setProfileOpen(
                    (prev) => !prev
                  )
                }
              >
                <span className="profile-avatar">
                  {getUserInitial()}
                </span>

                <span className="profile-text">
                  {getUserName()}
                </span>
              </button>

              {profileOpen && (
                <ProfileDropdown />
              )}
            </div>
          )}

          {/* CART */}

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive
                ? "cart-active"
                : "cart-icon"
            }
            onClick={closeMenu}
          >
            <BsCart3 size={25} />

            {totalQuantity > 0 && (
              <span className="nav-cart-count">
                {totalQuantity > 99
                  ? "99+"
                  : totalQuantity}
              </span>
            )}
          </NavLink>

        </div>

      </div>

    </header>
  );
};

export default Navbar;