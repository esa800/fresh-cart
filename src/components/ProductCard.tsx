import React from 'react';
import { Heart, Plus, Minus, Check, AlertTriangle, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../contexts/ToastContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const cartItem = items.find((i) => i.product.id === product.id);
  const inCart = Boolean(cartItem);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = addToCart(product, 1);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      const res = updateQuantity(product.id, cartItem.quantity + 1);
      if (!res.success) showToast(res.message, 'error');
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity - 1);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    showToast(added ? `Added ${product.name} to wishlist!` : `Removed from wishlist.`, 'info');
  };

  const isOutOfStock = product.stockQuantity <= 0 || product.availability === 'out_of_stock';
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.lowStockThreshold;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onNavigate('product-detail', product.slug)}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-950/5 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Image Area */}
      <div className="relative aspect-4/3 sm:aspect-square bg-slate-50 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {product.discountPercentage > 0 && (
            <span className="bg-[#f85606] text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-slate-900 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              New Arrival
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-500 shadow-sm'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-xs'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Quick View Button overlay on hover */}
        <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 px-3 pointer-events-none">
          <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold py-1.5 px-3 rounded-full flex items-center gap-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5 text-amber-400" /> Quick View
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Unit */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span className="text-[#ea580c] font-bold">{product.brand}</span>
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
              {product.unit}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#f85606] transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
            {product.banglaName}
          </p>

          {/* Stock Status Indicator */}
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            {isOutOfStock ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" /> Only {product.stockQuantity} left!
              </span>
            ) : (
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Check className="w-3 h-3 text-[#ea580c]" /> In Stock
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Add To Cart Button */}
        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Price */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-slate-900">
                ৳{product.salePrice}
              </span>
              {product.regularPrice > product.salePrice && (
                <span className="text-[11px] text-slate-400 line-through">
                  ৳{product.regularPrice}
                </span>
              )}
            </div>
          </div>

          {/* Action: Add or +/- Counter */}
          <div>
            {isOutOfStock ? (
              <button
                disabled
                className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl cursor-not-allowed"
              >
                Stock Out
              </button>
            ) : inCart ? (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="flex items-center bg-[#ea580c] text-white rounded-xl overflow-hidden shadow-xs"
              >
                <button
                  onClick={handleDecrement}
                  className="w-7 h-7 flex items-center justify-center hover:bg-[#c2410c] transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center text-xs font-bold">
                  {cartItem?.quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-7 h-7 flex items-center justify-center hover:bg-[#c2410c] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id={`add-to-cart-btn-${product.id}`}
                onClick={handleAddToCart}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-orange-50 hover:bg-[#f85606] text-[#ea580c] hover:text-white border border-orange-200 hover:border-[#f85606] rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
