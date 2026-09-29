import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import "./App.css";

import ScrollToTop from "./ScrollToTop";

import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";

import Home from "./Home/Home";

import Product from "./Pages/Product";
import AllProduct from "./Pages/AllProduct";
import Cart from "./Pages/Context/Cart";
import Orders from "./Pages/Order/Orders";

import Sofas from "./Pages/Sofas/Sofas";
import Beds from "./Pages/Beds/Beds";
import Tables from "./Pages/Tables/Tables";
import Chairs from "./Pages/Chairs/Chairs";
import Wardrobes from "./Pages/Wardrobes/Wardrobes";

import Profile from "./Components/Profile/Profile";
import Address from "./Components/Profile/Address/Address";

import Login from "./Components/Login/Login";
import Signup from "./Components/Signup/Signup";
import ForgotPassword from "./Components/ForgotPassword/ForgotPassword";

import About from "./Pages/About/About";

import AuthProtectedRoute from "./ProtectedRoute/AuthProtectedRoute";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";

import Admin from "./Components/Admin/Admin";
import NotFound from "./Components/NotFound/NotFound";


/* =========================================
   MAIN APP CONTENT
========================================= */

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith("/admin");


  return (
    <>
      <ScrollToTop />

      {/* Normal website Navbar */}
      {!isAdminRoute && <Navbar />}


      <Routes>

        {/* =========================
                    PUBLIC ROUTES
                ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={
            <AuthProtectedRoute>
              <Login />
            </AuthProtectedRoute>}
        />

        <Route
          path="/signup"
          element={
            <AuthProtectedRoute>
              <Signup />
            </AuthProtectedRoute>}
        />

        <Route
          path="/forgot-password"
          element={
            <AuthProtectedRoute>
              <ForgotPassword />
            </AuthProtectedRoute>}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/product"
          element={<AllProduct />}
        />

        <Route
          path="/product/:id"
          element={<Product />}
        />

        <Route
          path="/sofas"
          element={<Sofas />}
        />

        <Route
          path="/beds"
          element={<Beds />}
        />

        <Route
          path="/tables"
          element={<Tables />}
        />

        <Route
          path="/chairs"
          element={<Chairs />}
        />

        <Route
          path="/wardrobes"
          element={<Wardrobes />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />


        {/* =========================
                    PROTECTED USER ROUTES
                ========================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/address"
          element={
            <ProtectedRoute>
              <Address />
            </ProtectedRoute>
          }
        />


        {/* =========================
                    ADMIN ROUTES
                ========================= */}

        <Route
          path="/admin/*"
          element={<Admin />}
        />

        {/* NOTFOUND ROUTES */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>


      {/* Normal website Footer */}
      {!isAdminRoute && <Footer />}
    </>
  );
};


/* =========================================
   APP
========================================= */

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;