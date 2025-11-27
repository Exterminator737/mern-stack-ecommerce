import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/currency";
import { Lock, ShieldCheck, CreditCard } from "lucide-react";

const Checkout = () => {
  const { isAuthenticated, user } = useAuth();
  const { cartItems, cartTotal, fetchCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    guestEmail: "",
    guestName: "",
    guestPhone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    paymentMethod: "Credit Card",
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    } else {
      // Pre-fill with user address if available
      if (user?.address) {
        setFormData((prev) => ({
          ...prev,
          ...user.address,
        }));
      }
      fetchCart();
    }
  }, [isAuthenticated, navigate, cartItems.length, user, fetchCart]);

  // Optional Google Places Autocomplete for address
  useEffect(() => {
    const key = process.env.REACT_APP_GOOGLE_PLACES_KEY;
    if (!key) return;
    if (window.google && window.google.maps && window.google.maps.places) {
      attachAutocomplete();
      return;
    }
    const scriptId = "google-places-autocomplete";
    if (document.getElementById(scriptId)) return;
    const s = document.createElement("script");
    s.id = scriptId;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    s.async = true;
    s.defer = true;
    s.onload = () => attachAutocomplete();
    document.body.appendChild(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const attachAutocomplete = () => {
    try {
      const input = document.getElementById("street");
      if (!input || !window.google || !window.google.maps?.places) return;
      const ac = new window.google.maps.places.Autocomplete(input, {
        types: ["address"],
        fields: ["address_components", "formatted_address"],
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        const comps = place.address_components || [];
        const getComp = (type) =>
          comps.find((c) => c.types.includes(type))?.long_name || "";
        const streetNumber = getComp("street_number");
        const route = getComp("route");
        const city =
          getComp("locality") ||
          getComp("sublocality") ||
          getComp("administrative_area_level_2");
        const state = getComp("administrative_area_level_1");
        const zip = getComp("postal_code");
        const country = getComp("country");
        setFormData((prev) => ({
          ...prev,
          street:
            [streetNumber, route].filter(Boolean).join(" ") || prev.street,
          city: city || prev.city,
          state: state || prev.state,
          zipCode: zip || prev.zipCode,
          country: country || prev.country,
        }));
      });
    } catch (_) {}
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNextStep = () => {
    // Basic client-side validation before moving to payment step
    if (
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode ||
      !formData.country
    ) {
      setError("Please complete your shipping address before continuing.");
      return;
    }

    if (!isAuthenticated) {
      if (!formData.guestName || !formData.guestEmail) {
        setError("Please provide your name and email to continue as a guest.");
        return;
      }
    }

    setError("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const shippingAddress = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };

      let res;

      if (isAuthenticated) {
        const orderData = {
          shippingAddress,
          paymentMethod: formData.paymentMethod,
          ...(discountAmount > 0 && couponCode ? { couponCode } : {}),
        };

        res = await axios.post("/api/orders", orderData);
      } else {
        const items = cartItems
          .filter((item) => item.product)
          .map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }));

        const orderData = {
          guestEmail: formData.guestEmail,
          guestName: formData.guestName,
          guestPhone: formData.guestPhone,
          shippingAddress,
          paymentMethod: formData.paymentMethod,
          items,
          ...(discountAmount > 0 && couponCode ? { couponCode } : {}),
        };

        res = await axios.post("/api/orders/guest", orderData);
      }

      if (formData.paymentMethod === "PayFast") {
        // Initiate PayFast payment
        const payFastRes = await axios.post("/api/payfast/pay", {
          orderId: res.data._id,
          amount: res.data.totalPrice,
          itemName: `Order #${res.data._id}`,
        });

        const { url, paymentData } = payFastRes.data;

        // Create hidden form and submit
        const form = document.createElement("form");
        form.method = "POST";
        form.action = url;

        Object.keys(paymentData).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = paymentData[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        if (isAuthenticated) {
          navigate(`/orders/${res.data._id}`);
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    const code = (couponCode || "").trim();
    if (!code) {
      setCouponMessage("Enter a coupon code");
      return;
    }
    try {
      setCouponApplying(true);
      setCouponMessage("");
      const res = await axios.get("/api/coupons/validate", {
        params: { code, subtotal: cartTotal },
      });
      if (res.data?.valid) {
        setDiscountAmount(res.data.discount || 0);
        setCouponMessage(`Coupon applied: -${res.data.discount}`);
      } else {
        setDiscountAmount(0);
        setCouponMessage(res.data?.message || "Invalid coupon");
      }
    } catch (e) {
      setDiscountAmount(0);
      setCouponMessage(e.response?.data?.message || "Invalid coupon");
    } finally {
      setCouponApplying(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  const netSubtotal = Math.max(0, cartTotal - discountAmount);
  const shippingPrice = netSubtotal > 500 ? 0 : 50;
  const taxPrice = netSubtotal * 0.15;
  const totalPrice = netSubtotal + shippingPrice + taxPrice;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4 text-sm font-medium">
            <div
              className={`flex items-center ${
                step === 1 ? "text-primary-600" : "text-gray-500"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border mr-2 ${
                  step === 1
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-300"
                }`}
              >
                1
              </span>
              <span>Shipping</span>
            </div>
            <span className="text-gray-400">/</span>
            <div
              className={`flex items-center ${
                step === 2 ? "text-primary-600" : "text-gray-500"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border mr-2 ${
                  step === 2
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-300"
                }`}
              >
                2
              </span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                  <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Shipping Address
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Where should we send your order?
                      </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                      <div className="grid grid-cols-6 gap-6">
                        {!isAuthenticated && (
                          <>
                            <div className="col-span-6 sm:col-span-3">
                              <label
                                htmlFor="guestName"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Full Name
                              </label>
                              <input
                                type="text"
                                name="guestName"
                                id="guestName"
                                value={formData.guestName}
                                onChange={handleChange}
                                required
                                autoComplete="name"
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border px-3"
                              />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                              <label
                                htmlFor="guestEmail"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Email
                              </label>
                              <input
                                type="email"
                                name="guestEmail"
                                id="guestEmail"
                                value={formData.guestEmail}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border px-3"
                              />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                              <label
                                htmlFor="guestPhone"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Phone
                              </label>
                              <input
                                type="tel"
                                name="guestPhone"
                                id="guestPhone"
                                value={formData.guestPhone}
                                onChange={handleChange}
                                autoComplete="tel"
                                inputMode="tel"
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border px-3"
                              />
                            </div>
                          </>
                        )}
                        <div className="col-span-6">
                          <label
                            htmlFor="street"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Street Address
                          </label>
                          <input
                            type="text"
                            name="street"
                            id="street"
                            value={formData.street}
                            onChange={handleChange}
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border px-3"
                          />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700"
                          >
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            id="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border px-3"
                          />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <label
                            htmlFor="state"
                            className="block text-sm font-medium text-gray-700"
                          >
                            State / Province
                          </label>
                          <input
                            type="text"
                            name="state"
                            id="state"
                            value={formData.state}
                            onChange={handleChange}
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border px-3"
                          />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <label
                            htmlFor="zipCode"
                            className="block text-sm font-medium text-gray-700"
                          >
                            ZIP / Postal Code
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border px-3"
                          />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <label
                            htmlFor="country"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Country
                          </label>
                          <input
                            type="text"
                            name="country"
                            id="country"
                            value={formData.country}
                            onChange={handleChange}
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border px-3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                  <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Payment
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Select your payment method.
                      </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                      <div className="col-span-6">
                        <label
                          htmlFor="paymentMethod"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Payment Method
                        </label>
                        <select
                          id="paymentMethod"
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-10"
                        >
                          <option value="Credit Card">Credit Card</option>
                          <option value="PayFast">PayFast</option>
                          <option value="PayPal">PayPal</option>
                          <option value="Cash on Delivery">
                            Cash on Delivery
                          </option>
                        </select>
                      </div>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Lock className="h-4 w-4 text-blue-600" />
                          <span>Secure checkout (SSL)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                          <span>Buyer protection</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CreditCard className="h-4 w-4 text-purple-600" />
                          <span>PayFast • Visa • MasterCard</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 w-full sm:w-auto"
                  >
                    Back
                  </button>
                )}
                <div className="ml-auto">
                  {step === 1 && (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 w-full sm:w-auto"
                    >
                      Continue to Payment
                    </button>
                  )}
                  {step === 2 && (
                    <button
                      type="submit"
                      disabled={loading}
                      className={`mt-0 sm:ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 w-full sm:w-auto ${
                        loading ? "opacity-75 cursor-wait" : ""
                      }`}
                    >
                      {loading ? "Processing..." : "Place Order"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-lg font-medium text-gray-900 p-6 border-b border-gray-200">
                Order Summary
              </h2>

              <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {cartItems.map(
                  (item) =>
                    item.product && (
                      <li key={item.productId} className="flex py-6 px-6">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>

                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>{item.product.name}</h3>
                              <p className="ml-4">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.product.category}
                            </p>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <p className="text-gray-500">Qty {item.quantity}</p>
                          </div>
                        </div>
                      </li>
                    )
                )}
              </ul>

              <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-lg">
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <p>Subtotal</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(cartTotal)}
                  </p>
                </div>
                {/* Coupon */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter code"
                      className="flex-1 h-10 px-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponApplying}
                      className="px-4 h-10 rounded-md bg-white border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      {couponApplying ? "Applying..." : "Apply"}
                    </button>
                  </div>
                  {couponMessage && (
                    <div className="mt-2 text-xs text-gray-600">
                      {couponMessage}
                    </div>
                  )}
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-700 mb-4">
                    <p>Discount</p>
                    <p className="font-medium">
                      - {formatCurrency(discountAmount)}
                    </p>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <p>Shipping</p>
                  <p className="font-medium text-gray-900">
                    {shippingPrice === 0
                      ? "FREE"
                      : formatCurrency(shippingPrice)}
                  </p>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <p>Tax (15%)</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(taxPrice)}
                  </p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900 pt-4 border-t border-gray-200">
                  <p>Total</p>
                  <p className="text-primary-600">
                    {formatCurrency(totalPrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
