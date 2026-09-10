import React from 'react';
import { Heart, ShoppingCart, Check, Zap, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useQuickOrder } from '../contexts/QuickOrderContext';
import { useToast } from '../contexts/ToastContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (view: string, param?: string) => void;
  showBuyNow?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, showBuyNow = false }) => {
  const { items, addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openQuickOrder } = useQuickOrder();
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

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    showToast(added ? `Added to wishlist!` : `Removed from wishlist.`, 'info');
  };

  const isOutOfStock = product.stockQuantity <= 0 || product.availability === 'out_of_stock';

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onNavigate('product-detail', product.slug)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-orange-300 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Top Badges & Wishlist */}
      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
        {product.isBestSeller && (
          <span className="bg-[#f85606] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            Best Selling
          </span>
        )}
        {product.tags?.includes('cooking essentials') && !product.isBestSeller && (
          <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            Offered Items
          </span>
        )}
        {product.isNewArrival && (
          <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            New Arrival
          </span>
        )}
      </div>

      <button
        id={`wishlist-btn-${product.id}`}
        onClick={handleToggleWishlist}
        className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10 ${
          isWishlisted
            ? 'bg-rose-50 text-rose-500 shadow-xs'
            : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-2xs'
        }`}
        title="Wishlist"
      >
        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Image Area */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-3">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex-1 flex flex-col justify-between border-t border-slate-100 bg-white">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#f85606] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
            {product.banglaName}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-500 font-semibold">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-slate-400 text-[10px]">({product.reviewCount || 35})</span>
          </div>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-slate-900">
              ৳ {product.salePrice.toLocaleString()}
            </span>
            {product.regularPrice > product.salePrice && (
              <span className="text-xs text-slate-400 line-through">
                ৳ {product.regularPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Buttons matching the image */}
        <div className="mt-3 pt-2">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed text-center"
            >
              Stock Out
            </button>
          ) : showBuyNow ? (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleAddToCart}
                className={`py-2 px-2 border rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  inCart 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                    : 'bg-white border-orange-300 text-[#f85606] hover:bg-orange-50'
                }`}
              >
                {inCart ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                <span>{inCart ? 'Added' : 'Add To Cart'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openQuickOrder(product);
                }}
                className="py-2 px-2 bg-[#f85606] hover:bg-[#e04a00] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                <Zap className="w-3 h-3 fill-white" />
                <span>Buy now</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className={`w-full py-2 px-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                inCart 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                  : 'bg-white border-orange-300 hover:border-[#f85606] text-[#f85606] hover:bg-orange-50/70'
              }`}
            >
              {inCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Added To Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add To Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
