import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Star, 
  Share2, 
  ArrowLeft,
  Zap,
  Info
} from 'lucide-react';
import { Product } from '../types';
import { StoreService } from '../services/store';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../contexts/ToastContext';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
  const [product, setProduct] = useState<Product | null>(() => StoreService.getProductBySlug(slug) || null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'nutrition' | 'storage' | 'reviews'>('desc');

  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    const p = StoreService.getProductBySlug(slug);
    if (p) {
      setProduct(p);
      setActiveImageIdx(0);
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [slug]);

  if (!product) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 my-8">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <p className="text-xs text-slate-500">The product you are looking for might have been moved or is out of season.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stockQuantity <= 0 || product.availability === 'out_of_stock';
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.lowStockThreshold;
  const savings = Math.max(0, product.regularPrice - product.salePrice);

  const handleAddToCart = () => {
    const res = addToCart(product, quantity);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleBuyNow = () => {
    const res = addToCart(product, quantity);
    if (res.success) {
      onNavigate('checkout');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product.id);
    showToast(added ? `Added to your wishlist!` : `Removed from wishlist.`, 'info');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'success');
    }
  };

  // Related products in the same category
  const relatedProducts = StoreService.getProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="space-y-10 pb-16">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <button
          onClick={() => onNavigate('shop')}
          className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grocery Catalog</span>
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span>SKU: <strong className="text-slate-800">{product.sku}</strong></span>
          <span>•</span>
          <button onClick={handleShare} className="hover:text-emerald-700 flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      {/* Main Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.discountPercentage > 0 && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-lg uppercase shadow-xs">
                {product.discountPercentage}% OFF
              </span>
            )}
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-500 shadow-sm'
                  : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-xs'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIdx === idx ? 'border-emerald-600 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">
                {product.brand}
              </span>
              <span className="text-xs text-slate-500">Unit: <strong className="text-slate-800">{product.unit}</strong></span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {product.name}
            </h1>
            <p className="text-base text-slate-600 font-semibold">
              {product.banglaName}
            </p>

            {/* Ratings & Tags */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviewsCount} reviews)</span>
              </div>

              {product.tags.map((t, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium text-[11px]">
                  #{t}
                </span>
              ))}
            </div>

            {/* Pricing Area */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Special Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">৳{product.salePrice}</span>
                  {product.regularPrice > product.salePrice && (
                    <span className="text-sm text-slate-400 line-through">৳{product.regularPrice}</span>
                  )}
                </div>
              </div>

              {savings > 0 && (
                <div className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-xl text-xs font-bold text-right">
                  <span>You Save: ৳{savings} ({product.discountPercentage}%)</span>
                </div>
              )}
            </div>

            {/* Stock State */}
            <div className="flex items-center gap-2 text-xs">
              {isOutOfStock ? (
                <span className="text-rose-600 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600" /> Out of stock right now
                </span>
              ) : isLowStock ? (
                <span className="text-amber-600 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Only {product.stockQuantity} remaining in stock!
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> Ready for immediate dispatch ({product.stockQuantity} available)
                </span>
              )}
            </div>

            {/* Short description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              {product.description}
            </p>
          </div>

          {/* Action Area: Quantity & Add to Cart & Buy Now */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Quantity Counter */}
              <div className="flex items-center justify-between border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 w-full sm:w-36">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1 text-slate-600 hover:text-slate-900"
                  disabled={isOutOfStock || quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  className="p-1 text-slate-600 hover:text-slate-900"
                  disabled={isOutOfStock || quantity >= product.stockQuantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add To Cart */}
              <button
                id="pdp-add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Currently Out of Stock' : 'Add to Cart'}</span>
              </button>

              {/* Instant Buy Now */}
              {!isOutOfStock && (
                <button
                  id="pdp-buy-now-btn"
                  onClick={handleBuyNow}
                  className="py-3 px-5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Buy Now</span>
                </button>
              )}
            </div>

            {/* Assurance badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>2-Hour Express in Dhaka</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Certified Pure</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Doorstep Check & Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Details, Nutrition, Storage, Reviews */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('desc')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'desc' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sourcing & Description
          </button>
          {product.nutritionalFacts && (
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'nutrition' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Nutritional Facts
            </button>
          )}
          <button
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'storage' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Storage & Shelf Life
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'reviews' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Reviews ({product.reviewsCount})
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'desc' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>{product.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 block mb-0.5">Sourcing Origin:</strong>
                <span>{product.origin}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 block mb-0.5">Brand / Processor:</strong>
                <span>{product.brand}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Nutrition */}
        {activeTab === 'nutrition' && product.nutritionalFacts && (
          <div className="max-w-md">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nutritional Values (Approx. per 100g)</h4>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-200 text-xs">
              {Object.entries(product.nutritionalFacts).map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-2.5">
                  <span className="capitalize text-slate-600">{k}</span>
                  <span className="font-bold text-slate-900">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Storage */}
        {activeTab === 'storage' && (
          <div className="space-y-3 text-xs sm:text-sm text-slate-700">
            <p><strong>Recommended Storage:</strong> {product.storageTips || 'Store in a cool, dry place away from direct sunlight.'}</p>
            <p><strong>Shelf Life:</strong> {product.shelfLife || 'Check packaging for best before date.'}</p>
          </div>
        )}

        {/* Tab 4: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="text-center pr-4 border-r border-amber-200">
                <span className="text-3xl font-black text-slate-900 block">{product.rating}</span>
                <div className="flex items-center justify-center gap-0.5 text-amber-400 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Based on {product.reviewsCount} reviews</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                100% verified purchasers from Dhaka, Chittagong, and Sylhet. All grocery ratings are collected following delivery confirmation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            You Might Also Need (সম্পর্কিত পণ্য)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
