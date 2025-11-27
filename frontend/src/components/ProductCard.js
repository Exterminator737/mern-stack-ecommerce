import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { formatCurrency } from "../utils/currency";
import SaleBadge from "./SaleBadge";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const {
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    wishlists,
    createWishlist,
  } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const hasVariants =
    Array.isArray(product.variants) && product.variants.length > 0;
  const effectiveStock = hasVariants
    ? product.variants.reduce((s, v) => s + (v.stock || 0), 0)
    : product.stock || 0;
  const imageUrl = hasVariants
    ? product.variants.find((v) => v.image)?.image ||
      (Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : product.image)
    : Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : product.image;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (hasVariants) {
      navigate(`/products/${product._id}`);
      return;
    }
    await addToCart(product._id, 1, null);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
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

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full"
    >
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8 relative">
        {product.isOnSale && (
          <SaleBadge
            price={product.price}
            originalPrice={product.originalPrice}
          />
        )}

        {effectiveStock > 0 && effectiveStock <= 5 && (
          <div className="absolute top-0 left-0 m-2 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded">
            Low stock
          </div>
        )}

        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-64 object-cover object-center group-hover:opacity-75 transition-opacity"
        />
        {effectiveStock === 0 && (
          <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
            Out of Stock
          </div>
        )}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md text-gray-400 hover:text-red-500 hover:bg-gray-50 focus:outline-none transition-colors"
          title={
            isInWishlist(product._id)
              ? "Remove from Wishlist"
              : "Add to Wishlist"
          }
        >
          <Heart
            className={`h-5 w-5 ${
              isInWishlist(product._id) ? "fill-current text-red-500" : ""
            }`}
          />
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm text-gray-700 font-medium truncate">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{product.category}</p>

        {hasVariants && (
          <div className="mt-2 flex flex-wrap gap-1">
            {(() => {
              try {
                // Derive first attribute and show its unique values (up to 5 chips)
                const allAttrs = product.variants.flatMap((v) =>
                  Array.isArray(v.attributes) ? v.attributes : []
                );
                if (allAttrs.length === 0) return null;
                const firstName = allAttrs[0].name;
                const valuesSet = new Set();
                product.variants.forEach((v) => {
                  const a = (v.attributes || []).find(
                    (x) => x.name === firstName
                  );
                  if (a && a.value) valuesSet.add(String(a.value));
                });
                const values = Array.from(valuesSet.values()).slice(0, 5);
                return values.map((v) => (
                  <span
                    key={v}
                    className="px-2 py-0.5 border rounded-full text-[10px] text-gray-600 bg-white"
                  >
                    {v}
                  </span>
                ));
              } catch (_) {
                return null;
              }
            })()}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col">
            {product.isOnSale ? (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
                <span className="text-lg font-bold text-[#E60023]">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {product.rating > 0 && (
            <div className="flex items-center text-yellow-400">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-xs text-gray-500 ml-1">
                {product.rating.toFixed(1)} ({product.numReviews})
              </span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={effectiveStock === 0}
            className={`flex-1 flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              effectiveStock === 0
                ? "bg-gray-400 cursor-not-allowed"
                : hasVariants
                ? "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                : "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            }`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {hasVariants ? "View Options" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
