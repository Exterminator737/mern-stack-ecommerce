const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, trim: true },
    attributes: [
      {
        name: { type: String, required: true, trim: true },
        value: { type: String, required: true, trim: true },
      },
    ],
    price: { type: Number, min: 0 },
    originalPrice: { type: Number, min: 0 },
    salePrice: { type: Number, min: 0 },
    isOnSale: { type: Boolean, default: false },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    saleStartDate: {
      type: Date,
    },
    saleEndDate: {
      type: Date,
    },
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Books", "Home", "Sports", "Other"],
    },
    specifications: [
      {
        label: { type: String, required: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true },
        type: {
          type: String,
          enum: ["text", "list", "boolean", "number", "link"],
          default: "text",
        },
      },
    ],
    image: {
      type: String,
      default: "https://via.placeholder.com/300",
    },
    images: [
      {
        type: String,
      },
    ],
    // Optional variant list; when present, stock/price can be overridden per variant
    variants: [variantSchema],
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("hasVariants").get(function () {
  return Array.isArray(this.variants) && this.variants.length > 0;
});

productSchema.virtual("effectiveStock").get(function () {
  if (Array.isArray(this.variants) && this.variants.length > 0) {
    return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  return this.stock || 0;
});

productSchema.virtual("salePercentage").get(function () {
  if (this.isOnSale && this.originalPrice && this.price < this.originalPrice) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }
  return 0;
});

// Pre-save hook to enforce sale logic
productSchema.pre("save", function (next) {
  // If originalPrice is not set, use the current price as original
  if (!this.originalPrice) {
    this.originalPrice = this.price;
  }

  // Logic: If is_on_sale is false -> ignore sale_price and use original_price
  if (!this.isOnSale) {
    this.price = this.originalPrice;
  } else {
    // If on sale, check if we have a valid sale price
    if (this.salePrice && this.salePrice < this.originalPrice) {
      this.price = this.salePrice;
    } else {
      // Safety fallback: if sale price is missing or invalid, turn off sale
      this.isOnSale = false;
      this.price = this.originalPrice;
    }
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
