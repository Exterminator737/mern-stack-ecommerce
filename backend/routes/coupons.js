const express = require("express");
const router = express.Router();
const { auth, admin } = require("../middleware/Auth");
const { body, validationResult, query } = require("express-validator");
const Coupon = require("../models/Coupon");

const isActiveNow = (coupon) => {
  const now = new Date();
  if (coupon.isActive === false) return false;
  if (coupon.startsAt && now < new Date(coupon.startsAt)) return false;
  if (coupon.endsAt && now > new Date(coupon.endsAt)) return false;
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false;
  return true;
};

const computeDiscount = (coupon, subtotal) => {
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

// Admin: create coupon
router.post(
  "/",
  [
    auth,
    admin,
    body("code").trim().notEmpty(),
    body("type").isIn(["percent", "fixed"]),
    body("value").isFloat({ min: 0 }),
    body("minSubtotal").optional().isFloat({ min: 0 }),
    body("usageLimit").optional().isInt({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
      const dto = req.body;
      dto.code = String(dto.code).toUpperCase();
      const existing = await Coupon.findOne({ code: dto.code });
      if (existing)
        return res.status(400).json({ message: "Coupon code already exists" });
      const coupon = new Coupon(dto);
      await coupon.save();
      res.status(201).json(coupon);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Admin: list coupons
router.get("/", [auth, admin], async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: update coupon
router.put("/:id", [auth, admin], async (req, res) => {
  try {
    const updated = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Coupon not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: delete coupon
router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// Public: validate coupon for a subtotal
router.get(
  "/validate",
  [query("code").notEmpty(), query("subtotal").optional().isFloat({ min: 0 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
      const code = String(req.query.code).toUpperCase().trim();
      const subtotal = Number(req.query.subtotal || 0);
      const coupon = await Coupon.findOne({ code });
      if (!coupon)
        return res
          .status(404)
          .json({ valid: false, message: "Coupon not found" });
      if (!isActiveNow(coupon))
        return res
          .status(400)
          .json({ valid: false, message: "Coupon is not active" });
      const discount = computeDiscount(coupon, subtotal);
      if (discount <= 0)
        return res
          .status(400)
          .json({ valid: false, message: "Coupon not applicable to subtotal" });
      res.json({
        valid: true,
        coupon: {
          id: coupon._id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
        },
        discount,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
