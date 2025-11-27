const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const { auth, admin } = require("../middleware/Auth");
const { body, validationResult } = require("express-validator");
const { getCart, clearCart } = require("../utils/cartStorage");

const isCouponActiveNow = (coupon) => {
  const now = new Date();
  if (coupon.isActive === false) return false;
  if (coupon.startsAt && now < new Date(coupon.startsAt)) return false;
  if (coupon.endsAt && now > new Date(coupon.endsAt)) return false;
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false;
  return true;
};

const computeCouponDiscount = (coupon, subtotal) => {
  const sub = Number(subtotal || 0);
  if (coupon.minSubtotal && sub < coupon.minSubtotal) return 0;
  if (coupon.type === "percent") {
    return Math.max(0, Math.round((sub * coupon.value) / 100));
  }
  if (coupon.type === "fixed") {
    return Math.max(0, Math.min(sub, Math.round(coupon.value)));
  }
  return 0;
};

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post(
  "/",
  [auth],
  [
    body("shippingAddress.street").notEmpty().withMessage("Street is required"),
    body("shippingAddress.city").notEmpty().withMessage("City is required"),
    body("shippingAddress.state").notEmpty().withMessage("State is required"),
    body("shippingAddress.zipCode")
      .notEmpty()
      .withMessage("Zip code is required"),
    body("shippingAddress.country")
      .notEmpty()
      .withMessage("Country is required"),
    body("paymentMethod").notEmpty().withMessage("Payment method is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user._id.toString();
      const cart = getCart(userId);

      if (cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Validate stock and prepare order items
      const orderItems = [];
      for (const item of cart.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res
            .status(404)
            .json({ message: `Product ${item.productId} not found` });
        }
        if (product.stock < item.quantity) {
          return res
            .status(400)
            .json({ message: `Insufficient stock for ${product.name}` });
        }

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price: item.price,
        });
      }

      // Calculate prices
      let itemsPrice = cart.total;
      let discount = 0;
      let appliedCoupon = null;
      if (req.body && req.body.couponCode) {
        const code = String(req.body.couponCode || "")
          .trim()
          .toUpperCase();
        if (code) {
          const coupon = await Coupon.findOne({ code });
          if (coupon && isCouponActiveNow(coupon)) {
            const d = computeCouponDiscount(coupon, itemsPrice);
            if (d > 0) {
              discount = d;
              appliedCoupon = coupon;
            }
          }
        }
      }
      const netItems = Math.max(0, itemsPrice - discount);
      const taxPrice = netItems * 0.15; // 15% tax (VAT in South Africa)
      const shippingPrice = netItems > 500 ? 0 : 50; // Free shipping over R500
      const totalPrice = netItems + taxPrice + shippingPrice;

      // Create order
      const order = new Order({
        user: userId,
        orderItems,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        discount,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: false,
        paidAt: null,
      });

      // Update product stock
      for (const item of cart.items) {
        const updated = await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { new: true, projection: { name: 1, stock: 1 } }
        );
        const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || "5", 10);
        if (updated && updated.stock >= 0 && updated.stock <= threshold) {
          console.warn(
            `[LOW-STOCK] ${updated.name} (${updated._id}) stock low: ${updated.stock}`
          );
        }
      }

      // Clear cart
      clearCart(userId);

      await order.save();
      if (appliedCoupon) {
        try {
          await Coupon.updateOne(
            { _id: appliedCoupon._id },
            { $inc: { usedCount: 1 } }
          );
        } catch (_) {}
      }
      await order.populate("orderItems.product", "name image");

      // Save address to user's profile for future checkouts
      try {
        await User.findByIdAndUpdate(
          userId,
          {
            $set: {
              address: {
                street: req.body.shippingAddress.street,
                city: req.body.shippingAddress.city,
                state: req.body.shippingAddress.state,
                zipCode: req.body.shippingAddress.zipCode,
                country: req.body.shippingAddress.country,
              },
            },
          },
          { new: true, runValidators: true }
        );
      } catch (e) {
        console.warn("Failed to auto-save user address", e?.message || e);
      }

      res.status(201).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   POST /api/orders/guest
// @desc    Create new order as guest (no authentication)
// @access  Public
router.post(
  "/guest",
  [
    body("guestEmail").isEmail().withMessage("Valid email is required"),
    body("guestName").notEmpty().withMessage("Name is required"),
    body("shippingAddress.street").notEmpty().withMessage("Street is required"),
    body("shippingAddress.city").notEmpty().withMessage("City is required"),
    body("shippingAddress.state").notEmpty().withMessage("State is required"),
    body("shippingAddress.zipCode")
      .notEmpty()
      .withMessage("Zip code is required"),
    body("shippingAddress.country")
      .notEmpty()
      .withMessage("Country is required"),
    body("paymentMethod").notEmpty().withMessage("Payment method is required"),
    body("items").isArray({ min: 1 }).withMessage("Items are required"),
    body("items.*.productId").notEmpty().withMessage("Product ID is required"),
    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("items.*.price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { items, guestEmail, guestName, guestPhone } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Validate stock and prepare order items
      const orderItems = [];
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res
            .status(404)
            .json({ message: `Product ${item.productId} not found` });
        }
        if (product.stock < item.quantity) {
          return res
            .status(400)
            .json({ message: `Insufficient stock for ${product.name}` });
        }

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price: item.price,
        });
      }

      // Calculate prices
      let itemsPrice = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      let discount = 0;
      let appliedCoupon = null;
      if (req.body && req.body.couponCode) {
        const code = String(req.body.couponCode || "")
          .trim()
          .toUpperCase();
        if (code) {
          const coupon = await Coupon.findOne({ code });
          if (coupon && isCouponActiveNow(coupon)) {
            const d = computeCouponDiscount(coupon, itemsPrice);
            if (d > 0) {
              discount = d;
              appliedCoupon = coupon;
            }
          }
        }
      }
      const netItems = Math.max(0, itemsPrice - discount);
      const taxPrice = netItems * 0.15; // 15% tax (VAT in South Africa)
      const shippingPrice = netItems > 500 ? 0 : 50; // Free shipping over R500
      const totalPrice = netItems + taxPrice + shippingPrice;

      // Create order without user (guest order)
      const order = new Order({
        user: null,
        guestEmail,
        guestName,
        guestPhone: guestPhone || "",
        orderItems,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        discount,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: false,
        paidAt: null,
      });

      // Update product stock
      for (const item of items) {
        const updated = await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { new: true, projection: { name: 1, stock: 1 } }
        );
        const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || "5", 10);
        if (updated && updated.stock >= 0 && updated.stock <= threshold) {
          console.warn(
            `[LOW-STOCK] ${updated.name} (${updated._id}) stock low: ${updated.stock}`
          );
        }
      }

      await order.save();
      await order.populate("orderItems.product", "name image");

      res.status(201).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product", "name image price category")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "orderItems.product",
      "name image price description"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order or is admin
    if (
      order.user &&
      order.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin)
// @access  Private/Admin
router.get("/admin/all", [auth, admin], async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product", "name image category")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/admin/:id/paid", [auth, admin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const isPaid =
      req.body && typeof req.body.isPaid === "boolean" ? req.body.isPaid : true;
    order.isPaid = isPaid;
    order.paidAt = isPaid ? new Date() : null;
    await order.save();
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/admin/:id/delivered", [auth, admin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const isDelivered =
      req.body && typeof req.body.isDelivered === "boolean"
        ? req.body.isDelivered
        : true;
    order.isDelivered = isDelivered;
    order.deliveredAt = isDelivered ? new Date() : null;
    await order.save();
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
