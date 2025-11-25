const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { auth, admin } = require("../middleware/Auth");
const { body, validationResult } = require("express-validator");
const { getCart, clearCart } = require("../utils/cartStorage");

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
      const itemsPrice = cart.total;
      const taxPrice = itemsPrice * 0.15; // 15% tax (VAT in South Africa)
      const shippingPrice = itemsPrice > 500 ? 0 : 50; // Free shipping over R500
      const totalPrice = itemsPrice + taxPrice + shippingPrice;

      // Create order
      const order = new Order({
        user: userId,
        orderItems,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: false,
        paidAt: null,
      });

      // Update product stock
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear cart
      clearCart(userId);

      await order.save();
      await order.populate("orderItems.product", "name image");

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
      const itemsPrice = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const taxPrice = itemsPrice * 0.15; // 15% tax (VAT in South Africa)
      const shippingPrice = itemsPrice > 500 ? 0 : 50; // Free shipping over R500
      const totalPrice = itemsPrice + taxPrice + shippingPrice;

      // Create order without user (guest order)
      const order = new Order({
        user: null,
        guestEmail,
        guestName,
        guestPhone: guestPhone || "",
        orderItems,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: false,
        paidAt: null,
      });

      // Update product stock
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
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
      .populate("orderItems.product", "name image price")
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
      .populate("orderItems.product", "name image")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
