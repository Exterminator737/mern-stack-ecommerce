const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { auth, admin } = require("../middleware/Auth");
const { body, validationResult } = require("express-validator");

// Simple in-memory cache for products list
const productsCache = new Map();
const TTL_MS = parseInt(process.env.PRODUCTS_CACHE_TTL_MS || "60000", 10);
const cacheKeyFor = (query) => {
  const keys = [
    "category",
    "search",
    "page",
    "limit",
    "sort",
    "minPrice",
    "maxPrice",
    "isOnSale",
  ];
  const obj = {};
  for (const k of keys) if (query[k] !== undefined) obj[k] = String(query[k]);
  return JSON.stringify(obj);
};
const cacheGet = (key) => {
  const now = Date.now();
  const hit = productsCache.get(key);
  if (hit && hit.exp > now) return hit.data;
  if (hit) productsCache.delete(key);
  return null;
};
const cacheSet = (key, data) => {
  productsCache.set(key, { data, exp: Date.now() + TTL_MS });
};
const cacheClear = () => productsCache.clear();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get("/", async (req, res) => {
  try {
    const key = cacheKeyFor(req.query || {});
    const cached = cacheGet(key);
    if (cached) {
      res.set("X-Cache", "HIT");
      return res.json(cached);
    }
    const {
      category,
      search,
      page = 1,
      limit = 12,
      sort,
      minPrice,
      maxPrice,
      isOnSale,
    } = req.query;
    const query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (isOnSale === "true") {
      query.isOnSale = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default: Newest
    if (sort === "price_asc") {
      sortOptions = { price: 1 };
    } else if (sort === "price_desc") {
      sortOptions = { price: -1 };
    } else if (sort === "oldest") {
      sortOptions = { createdAt: 1 };
    } else if (sort === "popularity") {
      sortOptions = { numReviews: -1, rating: -1 };
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Product.countDocuments(query);

    const payload = {
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    };
    cacheSet(key, payload);
    res.set("X-Cache", "MISS");
    res.json(payload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/products/suggest
// @desc    Get real-time search suggestions (product names and categories)
// @access  Public
router.get("/suggest", async (req, res) => {
  try {
    const { q = "", limit = 5 } = req.query;
    const trimmed = String(q || "").trim();

    if (!trimmed) {
      return res.json({ suggestions: [] });
    }

    const lim = Math.min(parseInt(limit, 10) || 5, 10);

    // Product name suggestions
    const nameDocs = await Product.find({
      name: { $regex: trimmed, $options: "i" },
    })
      .select("name")
      .limit(lim);

    // Category suggestions
    const categoryDocs = await Product.distinct("category", {
      category: { $regex: trimmed, $options: "i" },
    });

    // Build unique suggestions with type
    const seen = new Set();
    const suggestions = [];

    for (const c of categoryDocs) {
      const key = `category:${c}`;
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push({ type: "category", text: c });
      }
    }

    for (const d of nameDocs) {
      const key = `product:${d.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push({ type: "product", text: d.name });
      }
    }

    res.json({ suggestions: suggestions.slice(0, lim) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Admin
router.post(
  "/",
  [auth, admin],
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("category").notEmpty().withMessage("Category is required"),
    body("stock")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = new Product(req.body);
      await product.save();
      cacheClear();
      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put("/:id", [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    cacheClear();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    cacheClear();
    res.json({ message: "Product removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Create new review
// @access  Private
router.post("/:id/reviews", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user.id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: "Product already reviewed" });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user.id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      cacheClear();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
