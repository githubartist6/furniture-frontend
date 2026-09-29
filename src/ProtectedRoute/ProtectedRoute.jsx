import React from "react";
import {
    Navigate,
    useLocation,
} from "react-router-dom";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    const savedUser =
        localStorage.getItem("user");

    console.log(
        "ProtectedRoute user:",
        savedUser
    );

    if (!savedUser) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );
    }

    try {
        const user =
            JSON.parse(savedUser);

        if (
            !user ||
            typeof user !== "object"
        ) {
            console.error(
                "ProtectedRoute Error: Invalid user data in localStorage"
            );

            localStorage.removeItem("user");

            toast.error(
                "Your login session is invalid. Please login again."
            );

            return (
                <Navigate
                    to="/login"
                    replace
                    state={{
                        from: location.pathname,
                    }}
                />
            );
        }

        return children;
    } catch (error) {
        // Technical error → Console only
        console.error(
            "ProtectedRoute JSON Parse Error:",
            error
        );

        localStorage.removeItem("user");

        // User-facing message → Toastify
        toast.error(
            "Your login session is invalid. Please login again."
        );

        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );
    }
};

export default ProtectedRoute;