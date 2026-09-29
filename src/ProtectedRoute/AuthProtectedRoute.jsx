import React, {
    useEffect,
} from "react";

import {
    Navigate,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";


const AuthProtectedRoute = ({
    children,
}) => {
    const location = useLocation();
    const navigate = useNavigate();


    /* =========================================
       CHECK USER LOGIN
    ========================================= */

    const getLoggedUser = () => {
        try {
            const savedUser =
                localStorage.getItem("user");

            if (!savedUser) {
                return null;
            }

            const parsedUser =
                JSON.parse(savedUser);

            if (
                !parsedUser ||
                typeof parsedUser !== "object"
            ) {
                console.error(
                    "Auth Check Error: Invalid user data"
                );

                localStorage.removeItem("user");

                return null;
            }

            return parsedUser;

        } catch (error) {
            // Technical details → Console only
            console.error(
                "Auth Check JSON Parse Error:",
                error
            );

            localStorage.removeItem("user");

            // User-facing message → Toastify
            toast.error(
                "Your login session is invalid. Please login again."
            );

            return null;
        }
    };


    const user = getLoggedUser();


    /* =========================================
       BLOCK BROWSER BACK BUTTON
    ========================================= */

    useEffect(() => {

        if (!user) {
            return;
        }

        window.history.pushState(
            null,
            "",
            window.location.href
        );

        const handlePopState = () => {

            const currentUser =
                getLoggedUser();

            if (currentUser) {

                navigate(
                    "/",
                    {
                        replace: true,
                    }
                );

            }

        };

        window.addEventListener(
            "popstate",
            handlePopState
        );

        return () => {

            window.removeEventListener(
                "popstate",
                handlePopState
            );

        };

    }, [navigate, user]);


    /* =========================================
       ALREADY LOGGED IN
    ========================================= */

    if (user) {

        return (
            <Navigate
                to="/"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );

    }


    /* =========================================
       NOT LOGGED IN
    ========================================= */

    return children;
};


export default AuthProtectedRoute;