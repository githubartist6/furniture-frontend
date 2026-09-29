import React, { useEffect, useState } from "react";
import {
    useNavigate,
    useLocation,
} from "react-router-dom";

import {
    FaMapMarkerAlt,
    FaHome,
    FaBriefcase,
    FaPhoneAlt,
    FaUser,
    FaEdit,
    FaTrash,
    FaPlus,
    FaArrowLeft,
    FaCheckCircle,
    FaTimes,
} from "react-icons/fa";

import { toast } from "react-toastify";

import "./Address.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

const emptyForm = {
    name: "",
    phone: "",
    pincode: "",
    location: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
    alternatePhone: "",
    addressType: "Home",
};

// =====================================
// ADDRESS HELPERS
// =====================================

// Backend currently uses address as an array.
// This helper safely handles both array and object
// responses so the frontend does not break.
const getFirstAddress = (addressData) => {
    if (Array.isArray(addressData)) {
        return addressData.length > 0
            ? addressData[0]
            : null;
    }

    if (
        addressData &&
        typeof addressData === "object"
    ) {
        return addressData;
    }

    return null;
};

const addressToForm = (address) => {
    if (!address) {
        return { ...emptyForm };
    }

    return {
        name: address.name || "",
        phone: address.phone || "",
        pincode: address.pincode || "",
        location: address.location || "",
        address: address.address || "",
        city: address.city || "",
        state: address.state || "",
        landmark: address.landmark || "",
        alternatePhone:
            address.alternatePhone || "",
        addressType:
            address.addressType || "Home",
    };
};

const Address = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [address, setAddress] = useState(null);

    const [formData, setFormData] =
        useState({ ...emptyForm });

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [isEditing, setIsEditing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    // =====================================
    // GET ADDRESS
    // =====================================

    const loadAddress = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/auth/address`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch (parseError) {
                console.error(
                    "Address Response Parse Error:",
                    parseError
                );
            }

            // =====================================
            // UNAUTHORIZED
            // =====================================

            if (response.status === 401) {
                console.error(
                    "Get Address Unauthorized:",
                    {
                        status: response.status,
                        message: data?.message,
                    }
                );

                toast.error(
                    data?.message ||
                    "Please login to view your address."
                );

                navigate("/login");
                return;
            }

            // =====================================
            // API ERROR
            // =====================================

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to load address. Please try again.";

                console.error(
                    "Address Load API Error:",
                    {
                        status: response.status,
                        statusText:
                            response.statusText,
                        message: serverMessage,
                    }
                );

                toast.error(serverMessage);

                setError(
                    "Unable to load your address."
                );

                return;
            }

            // =====================================
            // ADDRESS DATA
            // =====================================

            const savedAddress =
                getFirstAddress(data?.address);

            console.log(
                "Address Loaded Successfully:",
                savedAddress
            );

            if (savedAddress) {
                setAddress(savedAddress);
                setFormData(
                    addressToForm(savedAddress)
                );
            } else {
                setAddress(null);
                setFormData({
                    ...emptyForm,
                });
            }
        } catch (error) {
            // Technical details only in console
            console.error(
                "Address Load Error:",
                error
            );

            const userMessage =
                "Unable to connect to the server. Please try again.";

            toast.error(userMessage);

            setError(
                "Unable to load your address."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================
    // LOAD ADDRESS ON PAGE LOAD
    // =====================================

    useEffect(() => {
        loadAddress();
    }, []);

    // =====================================
    // HANDLE INPUT
    // =====================================

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        // Phone
        if (name === "phone") {
            const numbersOnly =
                value
                    .replace(/\D/g, "")
                    .slice(0, 10);

            setFormData((prev) => ({
                ...prev,
                [name]: numbersOnly,
            }));

            setError("");
            setSuccess("");

            return;
        }

        // Alternate phone
        if (
            name === "alternatePhone"
        ) {
            const numbersOnly =
                value
                    .replace(/\D/g, "")
                    .slice(0, 10);

            setFormData((prev) => ({
                ...prev,
                [name]: numbersOnly,
            }));

            setError("");
            setSuccess("");

            return;
        }

        // Pincode
        if (name === "pincode") {
            const numbersOnly =
                value
                    .replace(/\D/g, "")
                    .slice(0, 6);

            setFormData((prev) => ({
                ...prev,
                [name]: numbersOnly,
            }));

            setError("");
            setSuccess("");

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    // =====================================
    // VALIDATION
    // =====================================

    const validateForm = () => {
        if (!formData.name.trim()) {
            return "Please enter your name";
        }

        if (
            !/^[6-9]\d{9}$/.test(
                formData.phone
            )
        ) {
            return "Please enter a valid 10-digit mobile number";
        }

        if (
            !/^\d{6}$/.test(
                formData.pincode
            )
        ) {
            return "Please enter a valid 6-digit pincode";
        }

        if (
            !formData.location.trim()
        ) {
            return "Please enter your location";
        }

        if (
            !formData.address.trim()
        ) {
            return "Please enter your area and street address";
        }

        if (!formData.city.trim()) {
            return "Please enter city / district / town";
        }

        if (!formData.state.trim()) {
            return "Please enter your state";
        }

        if (!formData.addressType) {
            return "Please select address type";
        }

        if (
            formData.alternatePhone &&
            !/^[6-9]\d{9}$/.test(
                formData.alternatePhone
            )
        ) {
            return "Please enter a valid alternate phone number";
        }

        if (
            formData.alternatePhone &&
            formData.alternatePhone ===
            formData.phone
        ) {
            return "Alternate phone cannot be same as primary phone";
        }

        return "";
    };

    // =====================================
    // SAVE ADDRESS
    // =====================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving) {
            return;
        }

        setError("");
        setSuccess("");

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);

            // User-facing validation message
            toast.error(validationError);

            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                `${API_URL}/api/auth/address`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    credentials: "include",

                    body: JSON.stringify(
                        formData
                    ),
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch (parseError) {
                console.error(
                    "Save Address Response Parse Error:",
                    parseError
                );
            }

            // =====================================
            // UNAUTHORIZED
            // =====================================

            if (response.status === 401) {
                console.error(
                    "Save Address Unauthorized:",
                    {
                        status: response.status,
                        message: data?.message,
                    }
                );

                toast.error(
                    data?.message ||
                    "Please login to save your address."
                );

                navigate("/login");
                return;
            }

            // =====================================
            // API ERROR
            // =====================================

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to save address. Please try again.";

                console.error(
                    "Save Address API Error:",
                    {
                        status: response.status,
                        statusText:
                            response.statusText,
                        message: serverMessage,
                    }
                );

                toast.error(serverMessage);

                setError(
                    "Unable to save your address."
                );

                return;
            }

            // =====================================
            // GET SAVED ADDRESS
            // =====================================

            const savedAddress =
                getFirstAddress(data?.address);

            if (savedAddress) {
                setAddress(savedAddress);

                setFormData(
                    addressToForm(savedAddress)
                );
            } else {
                // If backend only returns message,
                // keep the submitted form as the address.
                setAddress({
                    ...formData,
                });
            }

            setIsEditing(false);

            const successMessage =
                data?.message ||
                "Address saved successfully";

            console.log(
                "Address Saved Successfully:",
                data
            );

            toast.success(successMessage);

            setSuccess(successMessage);

            // =====================================
            // RETURN TO CART
            // =====================================

            const returnTo =
                location.state?.from;

            if (returnTo) {
                setTimeout(() => {
                    navigate(returnTo, {
                        replace: true,
                    });
                }, 700);

                return;
            }

            // Normal address page
            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (error) {
            // Technical details only in console
            console.error(
                "Save Address Error:",
                error
            );

            const userMessage =
                "Unable to connect to the server. Please try again.";

            toast.error(userMessage);

            setError(
                "Unable to save your address."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================
    // EDIT ADDRESS
    // =====================================

    const handleEdit = () => {
        if (!address) {
            setFormData({
                ...emptyForm,
            });
        } else {
            setFormData(
                addressToForm(address)
            );
        }

        setError("");
        setSuccess("");
        setIsEditing(true);
    };

    // =====================================
    // CANCEL EDIT
    // =====================================

    const handleCancel = () => {
        if (address) {
            setFormData(
                addressToForm(address)
            );
        } else {
            setFormData({
                ...emptyForm,
            });
        }

        setError("");
        setSuccess("");
        setIsEditing(false);
    };

    // =====================================
    // DELETE ADDRESS
    // =====================================

    const handleDelete = async () => {
        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this address?"
            );

        if (!confirmDelete) {
            return;
        }

        if (deleting) {
            return;
        }

        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/api/auth/address`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch (parseError) {
                console.error(
                    "Delete Address Response Parse Error:",
                    parseError
                );
            }

            // =====================================
            // UNAUTHORIZED
            // =====================================

            if (response.status === 401) {
                console.error(
                    "Delete Address Unauthorized:",
                    {
                        status: response.status,
                        message: data?.message,
                    }
                );

                toast.error(
                    data?.message ||
                    "Please login to delete your address."
                );

                navigate("/login");
                return;
            }

            // =====================================
            // API ERROR
            // =====================================

            if (!response.ok) {
                const serverMessage =
                    data?.message ||
                    "Unable to delete address. Please try again.";

                console.error(
                    "Delete Address API Error:",
                    {
                        status: response.status,
                        statusText:
                            response.statusText,
                        message: serverMessage,
                    }
                );

                toast.error(serverMessage);

                setError(
                    "Unable to delete your address."
                );

                return;
            }

            console.log(
                "Address Deleted Successfully:",
                data
            );

            setAddress(null);

            setFormData({
                ...emptyForm,
            });

            setIsEditing(false);

            const successMessage =
                data?.message ||
                "Address deleted successfully";

            toast.success(successMessage);

            setSuccess(successMessage);

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (error) {
            // Technical details only in console
            console.error(
                "Delete Address Error:",
                error
            );

            const userMessage =
                "Unable to connect to the server. Please try again.";

            toast.error(userMessage);

            setError(
                "Unable to delete your address."
            );
        } finally {
            setDeleting(false);
        }
    };

    // =====================================
    // ADDRESS TYPE ICON
    // =====================================

    const getAddressIcon = (type) => {
        if (type === "Work") {
            return <FaBriefcase />;
        }

        if (type === "Other") {
            return <FaMapMarkerAlt />;
        }

        return <FaHome />;
    };

    // =====================================
    // LOADING
    // =====================================

    if (loading) {
        return (
            <div className="address-page">
                <div className="address-container">
                    <div className="address-loading">
                        <div className="address-spinner"></div>

                        <p>
                            Loading your address...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // =====================================
    // FORM
    // =====================================

    if (isEditing) {
        return (
            <div className="address-page">
                <div className="address-container">

                    <button
                        type="button"
                        className="address-back-btn"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        <FaArrowLeft />
                        Back
                    </button>

                    <div className="address-header">

                        <div className="address-header-icon">
                            <FaMapMarkerAlt />
                        </div>

                        <div>
                            <h1>
                                {address
                                    ? "Edit Address"
                                    : "Add New Address"}
                            </h1>

                            <p>
                                {address
                                    ? "Update your delivery address"
                                    : "Add an address for faster checkout"}
                            </p>
                        </div>

                    </div>

                    {error && (
                        <div className="address-message address-error">

                            <span>
                                {error}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setError("")
                                }
                            >
                                <FaTimes />
                            </button>

                        </div>
                    )}

                    {success && (
                        <div className="address-message address-success">

                            <FaCheckCircle />

                            <span>
                                {success}
                            </span>

                        </div>
                    )}

                    <form
                        className="address-form-card"
                        onSubmit={handleSubmit}
                    >

                        {/* CONTACT INFORMATION */}

                        <div className="form-section">

                            <div className="section-title">

                                <FaUser />

                                <div>
                                    <h2>
                                        Contact Information
                                    </h2>

                                    <p>
                                        Enter the details of the person receiving the order.
                                    </p>
                                </div>

                            </div>

                            <div className="form-grid">

                                <div className="form-group">

                                    <label>
                                        Full Name{" "}
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        className="addressinput"
                                        value={
                                            formData.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter full name"
                                        autoComplete="name"
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Mobile Number{" "}
                                        <span>*</span>
                                    </label>

                                    <div className="input-with-prefix">

                                        <span>
                                            +91
                                        </span>

                                        <input
                                            type="tel"
                                            name="phone"
                                            className="addressinput"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="10-digit mobile number"
                                            maxLength="10"
                                            inputMode="numeric"
                                            autoComplete="tel"
                                        />

                                    </div>

                                </div>

                                <div className="form-group">

                                    <label>
                                        Alternate Phone
                                        <small>
                                            Optional
                                        </small>
                                    </label>

                                    <div className="input-with-prefix">

                                        <span>
                                            +91
                                        </span>

                                        <input
                                            type="tel"
                                            name="alternatePhone"
                                            className="addressinput"
                                            value={
                                                formData.alternatePhone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Alternate mobile number"
                                            maxLength="10"
                                            inputMode="numeric"
                                        />

                                    </div>

                                </div>

                            </div>
                        </div>

                        {/* ADDRESS DETAILS */}

                        <div className="form-section">

                            <div className="section-title">

                                <FaMapMarkerAlt />

                                <div>
                                    <h2>
                                        Address Details
                                    </h2>

                                    <p>
                                        Where should we deliver your order?
                                    </p>
                                </div>

                            </div>

                            <div className="form-grid">

                                <div className="form-group">

                                    <label>
                                        Pincode{" "}
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="pincode"
                                        className="addressinput"
                                        value={
                                            formData.pincode
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="6-digit pincode"
                                        maxLength="6"
                                        inputMode="numeric"
                                        autoComplete="postal-code"
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Location{" "}
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="location"
                                        className="addressinput"
                                        value={
                                            formData.location
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Area / locality"
                                    />

                                </div>

                                <div className="form-group form-group-full">

                                    <label>
                                        Area & Street Address{" "}
                                        <span>*</span>
                                    </label>

                                    <textarea
                                        name="address"
                                        className="addressinput"
                                        value={
                                            formData.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="House no., building, street, area..."
                                        rows="3"
                                        autoComplete="street-address"
                                    ></textarea>

                                </div>

                                <div className="form-group">

                                    <label>
                                        City / District / Town{" "}
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        className="addressinput"
                                        value={
                                            formData.city
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter city / district / town"
                                        autoComplete="address-level2"
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        State{" "}
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="state"
                                        className="addressinput"
                                        value={
                                            formData.state
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter state"
                                        autoComplete="address-level1"
                                    />

                                </div>

                                <div className="form-group form-group-full">

                                    <label>
                                        Landmark
                                        <small>
                                            Optional
                                        </small>
                                    </label>

                                    <input
                                        type="text"
                                        name="landmark"
                                        className="addressinput"
                                        value={
                                            formData.landmark
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="E.g. Near school, temple, market..."
                                    />

                                </div>

                            </div>
                        </div>

                        {/* ADDRESS TYPE */}

                        <div className="form-section">

                            <div className="section-title">

                                <FaHome />

                                <div>
                                    <h2>
                                        Address Type
                                    </h2>

                                    <p>
                                        Select a label for this address.
                                    </p>
                                </div>

                            </div>

                            <div className="address-type-options">

                                <label
                                    className={`address-type-option ${formData.addressType ===
                                            "Home"
                                            ? "selected"
                                            : ""
                                        }`}
                                >

                                    <input
                                        type="radio"
                                        name="addressType"
                                        value="Home"
                                        checked={
                                            formData.addressType ===
                                            "Home"
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <FaHome />

                                    <div>
                                        <strong>
                                            Home
                                        </strong>

                                        <span>
                                            My home address
                                        </span>
                                    </div>

                                </label>

                                <label
                                    className={`address-type-option ${formData.addressType ===
                                            "Work"
                                            ? "selected"
                                            : ""
                                        }`}
                                >

                                    <input
                                        type="radio"
                                        name="addressType"
                                        value="Work"
                                        checked={
                                            formData.addressType ===
                                            "Work"
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <FaBriefcase />

                                    <div>
                                        <strong>
                                            Work
                                        </strong>

                                        <span>
                                            My office address
                                        </span>
                                    </div>

                                </label>

                                <label
                                    className={`address-type-option ${formData.addressType ===
                                            "Other"
                                            ? "selected"
                                            : ""
                                        }`}
                                >

                                    <input
                                        type="radio"
                                        name="addressType"
                                        value="Other"
                                        checked={
                                            formData.addressType ===
                                            "Other"
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <FaMapMarkerAlt />

                                    <div>
                                        <strong>
                                            Other
                                        </strong>

                                        <span>
                                            Another address
                                        </span>
                                    </div>

                                </label>

                            </div>
                        </div>

                        {/* FORM ACTIONS */}

                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-address-btn"
                                onClick={
                                    handleCancel
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-address-btn"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="button-spinner"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaCheckCircle />

                                        {address
                                            ? "Update Address"
                                            : "Save Address"}
                                    </>
                                )}
                            </button>

                        </div>

                    </form>
                </div>
            </div>
        );
    }

    // =====================================
    // SAVED ADDRESS / EMPTY STATE
    // =====================================

    return (
        <div className="address-page">

            <div className="address-container">

                <button
                    type="button"
                    className="address-back-btn"
                    onClick={() =>
                        navigate(-1)
                    }
                >
                    <FaArrowLeft />
                    Back
                </button>

                <div className="address-header">

                    <div className="address-header-icon">
                        <FaMapMarkerAlt />
                    </div>

                    <div>

                        <h1>
                            My Address
                        </h1>

                        <p>
                            Manage your delivery address
                        </p>

                    </div>

                </div>

                {error && (
                    <div className="address-message address-error">

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                        >
                            <FaTimes />
                        </button>

                    </div>
                )}

                {success && (
                    <div className="address-message address-success">

                        <FaCheckCircle />

                        <span>
                            {success}
                        </span>

                    </div>
                )}

                {/* NO ADDRESS */}

                {!address ? (
                    <div className="no-address-card">

                        <div className="no-address-icon">
                            <FaMapMarkerAlt />
                        </div>

                        <h2>
                            No Address Added
                        </h2>

                        <p>
                            You haven't added a delivery address yet.
                            Add your address to make checkout faster.
                        </p>

                        <button
                            type="button"
                            className="add-address-btn"
                            onClick={() => {
                                setFormData({
                                    ...emptyForm,
                                });

                                setError("");
                                setSuccess("");
                                setIsEditing(true);
                            }}
                        >
                            <FaPlus />
                            Add New Address
                        </button>

                    </div>
                ) : (
                    /* SAVED ADDRESS */

                    <div className="saved-address-card">

                        <div className="saved-address-top">

                            <div className="saved-address-title">

                                <div className="saved-address-type-icon">
                                    {getAddressIcon(
                                        address.addressType
                                    )}
                                </div>

                                <div>

                                    <h2>
                                        {address.addressType ||
                                            "Home"}
                                    </h2>

                                    <span>
                                        Saved Address
                                    </span>

                                </div>

                            </div>

                            <div className="saved-address-actions">

                                <button
                                    type="button"
                                    className="edit-address-btn"
                                    onClick={
                                        handleEdit
                                    }
                                >
                                    <FaEdit />

                                    <span>
                                        Edit
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className="delete-address-btn"
                                    onClick={
                                        handleDelete
                                    }
                                    disabled={
                                        deleting
                                    }
                                >
                                    <FaTrash />

                                    <span>
                                        {deleting
                                            ? "Deleting..."
                                            : "Delete"}
                                    </span>
                                </button>

                            </div>

                        </div>

                        <div className="saved-address-body">

                            <div className="saved-name-row">

                                <FaUser />

                                <strong>
                                    {address.name}
                                </strong>

                            </div>

                            <div className="saved-phone-row">

                                <FaPhoneAlt />

                                <span>
                                    +91{" "}
                                    {address.phone}
                                </span>

                                {address.alternatePhone && (
                                    <>
                                        <span className="phone-separator">
                                            |
                                        </span>

                                        <span>
                                            +91{" "}
                                            {
                                                address.alternatePhone
                                            }
                                        </span>
                                    </>
                                )}

                            </div>

                            <div className="saved-address-text">

                                <FaMapMarkerAlt />

                                <div>

                                    <p>
                                        {
                                            address.address
                                        }
                                    </p>

                                    <p>
                                        {
                                            address.location
                                        }
                                        ,{" "}
                                        {
                                            address.city
                                        }
                                        ,{" "}
                                        {
                                            address.state
                                        }{" "}
                                        -{" "}
                                        <strong>
                                            {
                                                address.pincode
                                            }
                                        </strong>
                                    </p>

                                    {address.landmark && (
                                        <p className="saved-landmark">

                                            <strong>
                                                Landmark:
                                            </strong>{" "}

                                            {
                                                address.landmark
                                            }

                                        </p>
                                    )}

                                </div>

                            </div>

                        </div>

                        <div className="address-ready">

                            <FaCheckCircle />

                            <span>
                                This address is ready for delivery
                            </span>

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default Address;