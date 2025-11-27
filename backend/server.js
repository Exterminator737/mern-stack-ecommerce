const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const compression = require("compression");
let helmet = null;
let rateLimit = null;
try {
  helmet = require("helmet");
} catch (e) {}
try {
  rateLimit = require("express-rate-limit");
} catch (e) {}

dotenv.config();

const app = express();

// Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = FRONTEND_URL.split(",").map((s) => s.trim());
app.set("trust proxy", 1);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.set("etag", "strong");

if (helmet) {
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
}

if (rateLimit) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
}

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/wishlists", require("./routes/wishlist"));
app.use("/api/payfast", require("./routes/payfast"));
app.use("/api/coupons", require("./routes/coupons"));

// SEO endpoints
app.get("/robots.txt", (req, res) => {
  const host = `${req.protocol}://${req.get("host")}`;
  const sitemapUrl = process.env.SITEMAP_URL || `${host}/sitemap.xml`;
  res
    .type("text/plain")
    .send(`User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n`);
});

app.get("/sitemap.xml", (req, res) => {
  const host = `${req.protocol}://${req.get("host")}`;
  const base = process.env.SITEMAP_URL || host;
  const urls = ["/", "/products"];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
    .map(
      (u) =>
        `\n  <url><loc>${base}${u}</loc><changefreq>daily</changefreq><priority>${
          u === "/" ? "1.0" : "0.8"
        }</priority></url>`
    )
    .join("")}\n</urlset>`;
  res.type("application/xml").send(xml);
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
