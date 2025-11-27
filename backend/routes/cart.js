const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const { auth } = require("../middleware/Auth");
const { getCart, setCart, clearCart } = require("../utils/cartStorage");

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const cart = getCart(req.user._id.toString());

    // Populate product details
    const populatedCart = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId);
        let variant = null;
        if (product && item.variantId) {
          try {
            variant = product.variants?.id(item.variantId) || null;
            if (!variant && Array.isArray(product.variants)) {
              variant =
                product.variants.find(
                  (v) => String(v._id) === String(item.variantId)
                ) || null;
            }
          } catch (_) {}
        }
        return {
          ...item,
          product: product || null,
          variant: variant || null,
        };
      })
    );

    res.json({
      items: populatedCart,
      total: cart.total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { productId, quantity, variantId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    let unitPrice = product.price;
    if (variantId) {
      const variant =
        product.variants?.id(variantId) ||
        (Array.isArray(product.variants)
          ? product.variants.find((v) => String(v._id) === String(variantId))
          : null);
      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }
      if (variant.stock < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      unitPrice = variant.isOnSale
        ? variant.salePrice ??
          variant.price ??
          variant.originalPrice ??
          product.price
        : variant.originalPrice ?? variant.price ?? product.price;
    } else {
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      unitPrice = product.price;
    }

    const userId = req.user._id.toString();
    let cart = getCart(userId);

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        String(item.variantId || "") === String(variantId || "")
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        variantId: variantId || undefined,
        quantity,
        price: unitPrice,
      });
    }

    // Calculate total
    cart.total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    setCart(userId, cart);
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/cart/:productId
// @desc    Update cart item quantity
// @access  Private
router.put("/:productId", auth, async (req, res) => {
  try {
    const { quantity, variantId } = req.body;
    const userId = req.user._id.toString();
    let cart = getCart(userId);

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === req.params.productId &&
        String(item.variantId || "") === String(variantId || "")
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate stock against product or variant
      const product = await Product.findById(cart.items[itemIndex].productId);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      if (cart.items[itemIndex].variantId) {
        const variant =
          product.variants?.id(cart.items[itemIndex].variantId) ||
          (Array.isArray(product.variants)
            ? product.variants.find(
                (v) => String(v._id) === String(cart.items[itemIndex].variantId)
              )
            : null);
        if (!variant)
          return res.status(404).json({ message: "Variant not found" });
        if (variant.stock < quantity)
          return res.status(400).json({ message: "Insufficient stock" });
      } else if (product.stock < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      cart.items[itemIndex].quantity = quantity;
    }

    // Calculate total
    cart.total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    setCart(userId, cart);
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  Private
router.delete("/:productId", auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    let cart = getCart(userId);
    const variantId = req.query.variantId || req.body?.variantId;

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === req.params.productId &&
          String(item.variantId || "") === String(variantId || "")
        )
    );

    // Calculate total
    cart.total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    setCart(userId, cart);
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete("/", auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    clearCart(userId);
    res.json({ message: "Cart cleared" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
