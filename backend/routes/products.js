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
    "inStock",
    "facets",
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
    const maxAge = Math.floor(TTL_MS / 1000);
    const swr = Math.floor((TTL_MS * 5) / 1000);
    if (cached) {
      res.set("X-Cache", "HIT");
      res.set(
        "Cache-Control",
        `public, max-age=${maxAge}, stale-while-revalidate=${swr}`
      );
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
      inStock,
      facets,
    } = req.query;
    const query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (isOnSale === "true") {
      query.isOnSale = true;
    }

    if (inStock === "true") {
      query.$or = [{ stock: { $gt: 0 } }, { "variants.stock": { $gt: 0 } }];
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

    if (facets === "true") {
      // Build aggregation for facets based on the same base query
      const matchStage = { $match: query };
      const facetPipeline = [
        matchStage,
        {
          $facet: {
            categories: [
              { $group: { _id: "$category", count: { $sum: 1 } } },
              { $project: { _id: 0, name: "$_id", count: 1 } },
              { $sort: { count: -1 } },
            ],
            onSale: [{ $match: { isOnSale: true } }, { $count: "count" }],
            inStock: [
              {
                $match: {
                  $or: [
                    { stock: { $gt: 0 } },
                    { "variants.stock": { $gt: 0 } },
                  ],
                },
              },
              { $count: "count" },
            ],
            priceBuckets: [
              {
                $bucket: {
                  groupBy: "$price",
                  boundaries: [0, 250, 500, 1000000000],
                  default: "other",
                  output: { count: { $sum: 1 } },
                },
              },
            ],
          },
        },
      ];

      try {
        const agg = await Product.aggregate(facetPipeline);
        const data = agg && agg[0] ? agg[0] : {};
        const pb = { under250: 0, between250and500: 0, over500: 0 };
        (data.priceBuckets || []).forEach((b) => {
          if (b._id === 0) pb.under250 = b.count; // first bucket 0-250
          else if (b._id === 250) pb.between250and500 = b.count; // 250-500
          else if (b._id === 500) pb.over500 += b.count; // 500+
        });
        payload.facets = {
          categories: data.categories || [],
          onSale: (data.onSale && data.onSale[0] && data.onSale[0].count) || 0,
          inStock:
            (data.inStock && data.inStock[0] && data.inStock[0].count) || 0,
          priceBuckets: pb,
        };
      } catch (e) {
        // Fail silently for facets to avoid breaking main response
        payload.facets = {
          categories: [],
          onSale: 0,
          inStock: 0,
          priceBuckets: { under250: 0, between250and500: 0, over500: 0 },
        };
      }
    }
    cacheSet(key, payload);
    res.set("X-Cache", "MISS");
    res.set(
      "Cache-Control",
      `public, max-age=${maxAge}, stale-while-revalidate=${swr}`
    );
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
    const maxAge = Math.floor(TTL_MS / 1000);
    const swr = Math.floor((TTL_MS * 5) / 1000);
    res.set(
      "Cache-Control",
      `public, max-age=${maxAge}, stale-while-revalidate=${swr}`
    );
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

      const b = req.body || {};
      if (b.originalPrice !== undefined)
        b.originalPrice = Number(b.originalPrice);
      if (b.salePrice !== undefined) b.salePrice = Number(b.salePrice);
      if (b.stock !== undefined) b.stock = parseInt(b.stock, 10);
      if (b.isOnSale) {
        b.price = Number(b.salePrice ?? b.price ?? b.originalPrice);
      } else {
        b.price = Number(b.originalPrice ?? b.price ?? 0);
      }

      const product = new Product(b);
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
    const b = { ...(req.body || {}) };
    if (b.originalPrice !== undefined)
      b.originalPrice = Number(b.originalPrice);
    if (b.salePrice !== undefined) b.salePrice = Number(b.salePrice);
    if (b.stock !== undefined) b.stock = parseInt(b.stock, 10);
    if (b.isOnSale !== undefined) {
      b.price = Number(
        b.isOnSale
          ? b.salePrice !== undefined
            ? b.salePrice
            : b.price
          : b.originalPrice !== undefined
          ? b.originalPrice
          : b.price
      );
    } else if (b.salePrice !== undefined || b.originalPrice !== undefined) {
      b.price = Number(
        b.salePrice !== undefined
          ? b.salePrice
          : b.originalPrice !== undefined
          ? b.originalPrice
          : b.price
      );
    }

    const product = await Product.findByIdAndUpdate(req.params.id, b, {
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
