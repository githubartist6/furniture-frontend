import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import { toast } from "react-toastify";


const CartContext =
    createContext();


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


export const CartProvider = ({
    children,
}) => {

    const [cart, setCart] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const cartRef =
        useRef([]);


    const setCartValue = (
        newCart
    ) => {
        cartRef.current =
            newCart;

        setCart(
            newCart
        );
    };


    // =====================================
    // CHECK LOGIN
    // =====================================

    const isLoggedIn = () => {

        try {

            const savedUser =
                localStorage.getItem(
                    "user"
                );

            if (!savedUser) {
                return false;
            }

            const user =
                JSON.parse(
                    savedUser
                );

            return Boolean(
                user &&
                typeof user ===
                "object"
            );

        } catch (error) {

            console.error(
                "Cart Auth Check Error:",
                error
            );

            localStorage.removeItem(
                "user"
            );

            return false;
        }
    };


    // =====================================
    // LOAD CART
    // =====================================

    const loadCart = async () => {

        if (!isLoggedIn()) {

            setCartValue([]);

            setLoading(false);

            return;
        }


        try {

            setLoading(true);


            const response =
                await fetch(
                    `${API_URL}/api/cart`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Content-Type":
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
                    "Load Cart Error: Failed to parse server response:",
                    parseError
                );

                data = {};
            }


            // =====================================
            // SESSION ERROR
            // =====================================

            if (
                response.status ===
                401
            ) {

                console.error(
                    "Load Cart Authentication Error:",
                    {
                        status:
                            response.status,
                        message:
                            data?.message ||
                            "Authentication failed",
                    }
                );

                setCartValue([]);

                toast.error(
                    data?.message ||
                    "Your login session has expired. Please login again."
                );

                return;
            }


            // =====================================
            // API ERROR
            // =====================================

            if (!response.ok) {

                const serverMessage =
                    data?.message ||
                    "Unable to load your cart. Please try again.";

                console.error(
                    "Load Cart API Error:",
                    {
                        status:
                            response.status,
                        statusText:
                            response.statusText,
                        message:
                            serverMessage,
                    }
                );

                setCartValue([]);

                toast.error(
                    serverMessage
                );

                return;
            }


            // =====================================
            // VALIDATE RESPONSE
            // =====================================

            if (
                !data ||
                typeof data !==
                "object"
            ) {

                console.error(
                    "Load Cart Error: Invalid server response"
                );

                setCartValue([]);

                toast.error(
                    "Unable to load your cart. Please try again."
                );

                return;
            }


            // =====================================
            // SET CART
            // =====================================

            setCartValue(
                Array.isArray(
                    data.items
                )
                    ? data.items
                    : []
            );

        } catch (error) {

            // Technical details → Console only
            console.error(
                "Cart Fetch Error:",
                error
            );

            setCartValue([]);

            // User-facing message → Toastify
            toast.error(
                "Unable to connect to the server. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================
    // AUTH CHANGE
    // =====================================

    useEffect(() => {

        loadCart();


        const handleAuthChange =
            () => {
                loadCart();
            };


        window.addEventListener(
            "authChanged",
            handleAuthChange
        );


        return () => {

            window.removeEventListener(
                "authChanged",
                handleAuthChange
            );

        };

    }, []);


    // =====================================
    // SYNC CART TO BACKEND
    // =====================================

    const syncCartToBackend =
        async (newCart) => {

            if (!isLoggedIn()) {

                setCartValue([]);

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/cart`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify({
                                    items:
                                        newCart,
                                }),
                        }
                    );


                let data = {};

                try {

                    data =
                        await response.json();

                } catch (parseError) {

                    console.error(
                        "Save Cart Error: Failed to parse server response:",
                        parseError
                    );

                    data = {};
                }


                // =====================================
                // SESSION ERROR
                // =====================================

                if (
                    response.status ===
                    401
                ) {

                    console.error(
                        "Save Cart Authentication Error:",
                        {
                            status:
                                response.status,
                            message:
                                data?.message ||
                                "Authentication failed",
                        }
                    );

                    setCartValue([]);

                    toast.error(
                        data?.message ||
                        "Your login session has expired. Please login again."
                    );

                    return;
                }


                // =====================================
                // API ERROR
                // =====================================

                if (!response.ok) {

                    const serverMessage =
                        data?.message ||
                        "Unable to save your cart. Please try again.";

                    console.error(
                        "Save Cart API Error:",
                        {
                            status:
                                response.status,
                            statusText:
                                response.statusText,
                            message:
                                serverMessage,
                        }
                    );

                    toast.error(
                        serverMessage
                    );

                    return;
                }


            } catch (error) {

                // Technical details → Console only
                console.error(
                    "Cart Sync Error:",
                    error
                );

                // User-facing message → Toastify
                toast.error(
                    "Unable to save your cart. Please try again."
                );
            }
        };


    // =====================================
    // ADD TO CART
    // =====================================

    const addToCart = (
        product,
        quantity = 1,
        selectedSize = ""
    ) => {

        if (!isLoggedIn()) {

            toast.error(
                "Please login to add products to cart"
            );

            return {
                success: false,
                message:
                    "Please login to add products to cart",
            };
        }


        if (
            !product ||
            product.id ===
            undefined ||
            product.id ===
            null
        ) {

            console.error(
                "Add To Cart Error: Invalid product data",
                product
            );

            toast.error(
                "Unable to add this product to cart."
            );

            return {
                success: false,
                message:
                    "Unable to add this product to cart.",
            };
        }


        let safeQuantity =
            Number(quantity);


        if (
            !Number.isFinite(
                safeQuantity
            ) ||
            safeQuantity < 1
        ) {
            safeQuantity = 1;
        }


        safeQuantity =
            Math.floor(
                safeQuantity
            );


        if (
            safeQuantity > 13
        ) {
            safeQuantity = 13;
        }


        const currentCart =
            cartRef.current;


        const existingIndex =
            currentCart.findIndex(
                (item) =>
                    String(
                        item.id
                    ) ===
                    String(
                        product.id
                    ) &&
                    String(
                        item.selectedSize ||
                        ""
                    ) ===
                    String(
                        selectedSize ||
                        ""
                    )
            );


        let newCart;


        if (
            existingIndex !==
            -1
        ) {

            newCart =
                [
                    ...currentCart,
                ];


            const existingQuantity =
                Number(
                    newCart[
                        existingIndex
                    ].quantity
                ) || 0;


            const newQuantity =
                existingQuantity +
                safeQuantity;


            newCart[
                existingIndex
            ] = {

                ...newCart[
                existingIndex
                ],

                quantity:
                    newQuantity >
                        13
                        ? 13
                        : newQuantity,

            };

        } else {

            newCart = [

                ...currentCart,

                {
                    id:
                        product.id,

                    name:
                        product.name ||
                        "Product",

                    category:
                        product.category ||
                        "",

                    image:
                        Array.isArray(
                            product.image
                        )
                            ? product.image
                            : product.image
                                ? [
                                    product.image,
                                ]
                                : [],

                    price:
                        Number(
                            product.price
                        ) >= 0
                            ? Number(
                                product.price
                            )
                            : 0,

                    oldPrice:
                        product.oldPrice ??
                        null,

                    selectedSize:
                        selectedSize ||
                        "",

                    quantity:
                        safeQuantity,
                },

            ];
        }


        setCartValue(
            newCart
        );


        syncCartToBackend(
            newCart
        );


        return {
            success: true,
            message:
                "Added to cart",
        };
    };


    // =====================================
    // INCREASE QUANTITY
    // =====================================

    const increaseQuantity = (
        id,
        selectedSize = ""
    ) => {

        const currentCart =
            cartRef.current;


        const newCart =
            currentCart.map(
                (item) => {

                    if (
                        String(
                            item.id
                        ) ===
                        String(
                            id
                        ) &&
                        String(
                            item.selectedSize ||
                            ""
                        ) ===
                        String(
                            selectedSize ||
                            ""
                        )
                    ) {

                        const quantity =
                            Number(
                                item.quantity
                            ) || 1;


                        return {

                            ...item,

                            quantity:
                                quantity >=
                                    13
                                    ? 13
                                    : quantity +
                                    1,

                        };
                    }


                    return item;
                }
            );


        setCartValue(
            newCart
        );


        syncCartToBackend(
            newCart
        );
    };


    // =====================================
    // DECREASE QUANTITY
    // =====================================

    const decreaseQuantity = (
        id,
        selectedSize = ""
    ) => {

        const currentCart =
            cartRef.current;


        const newCart =
            currentCart.map(
                (item) => {

                    if (
                        String(
                            item.id
                        ) ===
                        String(
                            id
                        ) &&
                        String(
                            item.selectedSize ||
                            ""
                        ) ===
                        String(
                            selectedSize ||
                            ""
                        )
                    ) {

                        const quantity =
                            Number(
                                item.quantity
                            ) || 1;


                        return {

                            ...item,

                            quantity:
                                quantity <=
                                    1
                                    ? 1
                                    : quantity -
                                    1,

                        };
                    }


                    return item;
                }
            );


        setCartValue(
            newCart
        );


        syncCartToBackend(
            newCart
        );
    };


    // =====================================
    // REMOVE FROM CART
    // =====================================

    const removeFromCart = (
        id,
        selectedSize = ""
    ) => {

        const currentCart =
            cartRef.current;


        const newCart =
            currentCart.filter(
                (item) =>
                    !(
                        String(
                            item.id
                        ) ===
                        String(
                            id
                        ) &&
                        String(
                            item.selectedSize ||
                            ""
                        ) ===
                        String(
                            selectedSize ||
                            ""
                        )
                    )
            );


        setCartValue(
            newCart
        );


        syncCartToBackend(
            newCart
        );
    };


    // =====================================
    // CLEAR CART
    // =====================================

    const clearCart =
        async () => {

            setCartValue([]);


            if (
                !isLoggedIn()
            ) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/cart`,
                        {
                            method:
                                "DELETE",

                            credentials:
                                "include",

                            headers: {
                                "Content-Type":
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
                        "Clear Cart Error: Failed to parse server response:",
                        parseError
                    );

                    data = {};
                }


                // =====================================
                // SESSION ERROR
                // =====================================

                if (
                    response.status ===
                    401
                ) {

                    console.error(
                        "Clear Cart Authentication Error:",
                        {
                            status:
                                response.status,
                            message:
                                data?.message ||
                                "Authentication failed",
                        }
                    );

                    setCartValue([]);

                    toast.error(
                        data?.message ||
                        "Your login session has expired. Please login again."
                    );

                    return;
                }


                // =====================================
                // API ERROR
                // =====================================

                if (!response.ok) {

                    const serverMessage =
                        data?.message ||
                        "Unable to clear your cart. Please try again.";

                    console.error(
                        "Clear Cart API Error:",
                        {
                            status:
                                response.status,
                            statusText:
                                response.statusText,
                            message:
                                serverMessage,
                        }
                    );

                    toast.error(
                        serverMessage
                    );

                    return;
                }


            } catch (error) {

                // Technical details → Console only
                console.error(
                    "Clear Cart Error:",
                    error
                );

                // User-facing message → Toastify
                toast.error(
                    "Unable to clear your cart. Please try again."
                );
            }
        };


    // =====================================
    // TOTAL QUANTITY
    // =====================================

    const totalQuantity =
        cart.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity ||
                    0
                ),
            0
        );


    // =====================================
    // TOTAL PRICE
    // =====================================

    const totalPrice =
        cart.reduce(
            (total, item) =>
                total +
                Number(
                    item.price ||
                    0
                ) *
                Number(
                    item.quantity ||
                    0
                ),
            0
        );


    // =====================================
    // PROVIDER
    // =====================================

    return (
        <CartContext.Provider
            value={{
                cart,

                loading,

                addToCart,

                increaseQuantity,

                decreaseQuantity,

                removeFromCart,

                clearCart,

                totalQuantity,

                totalPrice,

                refreshCart:
                    loadCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};


export const useCart = () =>
    useContext(
        CartContext
    );