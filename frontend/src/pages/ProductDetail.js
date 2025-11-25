import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { formatCurrency } from "../utils/currency";
import {
  Minus,
  Plus,
  Check,
  AlertCircle,
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  Lock,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import SaleBadge from "../components/SaleBadge";
import Reviews from "../components/Reviews/Reviews";
import ProductSpecifications from "../components/ProductSpecifications";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const {
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    wishlists,
    createWishlist,
  } = useWishlist();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Carousel State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Review State - Handled by Reviews component now

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/products/${id}`);
      setProduct(res.data);

      // Prefer a real images array; fallback to the single image field
      const imgs =
        Array.isArray(res.data.images) && res.data.images.length > 0
          ? res.data.images
          : [res.data.image];
      setImages(imgs);

      // Fetch similar products
      fetchSimilarProducts(res.data.category, res.data._id);
    } catch (error) {
      console.error("Error fetching product:", error);
      navigate("/products");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProduct();
    setActiveImageIndex(0);
  }, [fetchProduct]);

  const fetchSimilarProducts = async (category, currentId) => {
    try {
      const res = await axios.get(`/api/products?category=${category}&limit=4`);
      setSimilarProducts(
        res.data.products.filter((p) => p._id !== currentId).slice(0, 4)
      );
    } catch (error) {
      console.error("Error fetching similar products:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsAdding(true);
    const result = await addToCart(product._id, quantity);
    setIsAdding(false);

    if (result.success) {
      setMessage("Product added to cart!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(result.message || "Failed to add to cart");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const existingListId = isInWishlist(product._id);
    if (existingListId) {
      await removeFromWishlist(existingListId, product._id);
    } else {
      let targetListId;
      if (wishlists.length > 0) {
        targetListId = wishlists[0]._id;
      } else {
        const res = await createWishlist("My Wishlist", "Default wishlist");
        if (res.success) targetListId = res.data._id;
      }

      if (targetListId) {
        await addToWishlist(targetListId, product._id);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden lg:flex lg:gap-8 p-6 lg:p-8 mb-8">
          {/* Image Carousel */}
          <div className="lg:w-1/2 pt-4 flex flex-col-reverse lg:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:h-[500px] pb-2 lg:pb-0 lg:w-24 flex-shrink-0 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    activeImageIndex === idx
                      ? "border-primary-600"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt={`View ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative flex-1 h-[500px] rounded-lg overflow-hidden bg-gray-50 group">
              <img
                src={images[activeImageIndex]}
                alt={product.name}
                loading="eager"
                fetchpriority="high"
                className="w-full h-full object-contain object-center mix-blend-multiply transition-transform duration-300 group-hover:scale-110"
                onClick={() => setIsLightboxOpen(true)}
                role="button"
                aria-label="Open image viewer"
              />
              {/* Carousel Controls */}
              <button
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  )
                }
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </button>
              <button
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-8 lg:mt-0 lg:w-1/2">
            <div className="border-b border-gray-200 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    {product.category}
                  </p>
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.round(product.rating || 0)
                              ? "fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.numReviews} reviews)
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleToggleWishlist}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title={
                    isInWishlist(product._id)
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"
                  }
                >
                  <Heart
                    className={`h-8 w-8 ${
                      isInWishlist(product._id)
                        ? "fill-current text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(product.price)}
                </p>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <p className="text-xl text-gray-500 line-through mb-1">
                        {formatCurrency(product.originalPrice)}
                      </p>
                      <span className="mb-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    </>
                  )}
              </div>
            </div>

            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Description
              </h3>
              <div className="prose prose-sm text-gray-500">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Specifications Table */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="py-6">
                <ProductSpecifications
                  specifications={product.specifications}
                />
              </div>
            )}

            {/* Trust & Badges */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Trusted seller
                  </p>
                  <p className="text-xs text-gray-500">Quality assured</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                <Lock className="h-5 w-5 text-blue-600" />
                <div className="text-sm text-gray-700">
                  Secure payment • PayFast • Visa • MasterCard
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                <CreditCard className="h-5 w-5 text-purple-600" />
                <div className="text-sm text-gray-700">
                  Easy returns <span className="text-gray-400">•</span>{" "}
                  <Link
                    to="/returns-policy"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    View policy
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 py-6">
              <div className="flex items-center mb-6">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.stock > 0 ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      In Stock ({product.stock} available)
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Out of Stock
                    </>
                  )}
                </span>
              </div>

              {product.stock > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center">
                    <label
                      htmlFor="quantity"
                      className="mr-4 text-sm font-medium text-gray-700"
                    >
                      Quantity
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        type="button"
                        className="p-2 text-gray-600 hover:bg-gray-100 border-r border-gray-300"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(
                              1,
                              Math.min(
                                product.stock,
                                parseInt(e.target.value) || 1
                              )
                            )
                          )
                        }
                        className="w-16 text-center border-none focus:ring-0 p-2"
                      />
                      <button
                        type="button"
                        className="p-2 text-gray-600 hover:bg-gray-100 border-l border-gray-300"
                        onClick={() =>
                          setQuantity(Math.min(product.stock, quantity + 1))
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={isAdding}
                      className={`w-full flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${
                        isAdding ? "opacity-75 cursor-wait" : ""
                      }`}
                    >
                      {isAdding ? "Adding..." : "Add to Cart"}
                    </button>

                    {message && (
                      <div
                        className={`p-4 rounded-md ${
                          message.includes("added")
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {message}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        {isLightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm"
                aria-label="Close image viewer"
              >
                Close
              </button>
              <div className="relative">
                <img
                  src={images[activeImageIndex]}
                  alt={`${product.name} large view`}
                  className="w-full max-h-[80vh] object-contain"
                />
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev === images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-gray-700" />
                </button>
              </div>
              {/* Thumbnails inside modal */}
              {images.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-md overflow-hidden border ${
                        activeImageIndex === idx
                          ? "border-primary-500"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumb ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <Reviews productId={product._id} />

        {/* Similar Products Component */}
        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Similar Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 relative">
                    <SaleBadge
                      price={product.price}
                      originalPrice={product.originalPrice}
                    />
                    <img
                      src={
                        Array.isArray(product.images) &&
                        product.images.length > 0
                          ? product.images[0]
                          : product.image
                      }
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-48 object-cover object-center group-hover:opacity-75 transition-opacity"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm text-gray-700 font-medium truncate">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
