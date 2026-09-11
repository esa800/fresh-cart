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
  Info,
  Phone
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
  const [settings, setSettings] = useState(() => StoreService.getSettings());

  useEffect(() => {
    const unsub = StoreService.subscribeToStore ? StoreService.subscribeToStore(() => {
      setSettings(StoreService.getSettings());
    }) : undefined;
    return unsub;
  }, []);

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

  const handleWhatsAppOrder = () => {
    const rawNumber = (settings.whatsappNumber || settings.phone || '01854774406').replace(/[^0-9]/g, '');
    const cleanNumber = rawNumber.startsWith('88') 
      ? rawNumber 
      : `88${rawNumber.startsWith('0') ? rawNumber : '0' + rawNumber}`;
    const productPrice = product.salePrice * quantity;
    const msg = `আসসালামু আলাইকুম! আমি "${product.name}" অর্ডার করতে চাই।
পরিমাণ: ${quantity} টি
মূল্য: ৳${productPrice.toLocaleString()}
লিংক: ${window.location.href}`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
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

          {/* Action Area: Quantity & 4 Action Buttons matching user screenshot */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {/* Quantity: [-]  1  [+] */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-700">Quantity:</span>
              <div className="inline-flex items-center border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40"
                  disabled={isOutOfStock || quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center font-bold text-sm text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40"
                  disabled={isOutOfStock || quantity >= product.stockQuantity}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4 Action Buttons in 2x2 Grid exactly like screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* 1. ADD TO CART (Vibrant Orange) */}
              <button
                id="pdp-add-to-cart-btn"
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full py-3.5 px-4 bg-[#f85606] hover:bg-[#e04a00] active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all uppercase tracking-wide cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO CART</span>
              </button>

              {/* 2. BUY NOW (Dark / Black) */}
              <button
                id="pdp-buy-now-btn"
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-3.5 px-4 bg-[#0a192f] hover:bg-[#112240] active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-slate-900/20 transition-all uppercase tracking-wide cursor-pointer"
              >
                <span>BUY NOW</span>
              </button>

              {/* 3. Order On WhatsApp (Vibrant Green) */}
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="w-full py-3.5 px-4 bg-[#10b981] hover:bg-[#059669] active:scale-[0.98] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.43 1.02 2.6.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/>
                </svg>
                <span>Order On WhatsApp</span>
              </button>

              {/* 4. Call For Order (Dark Blue) */}
              <a
                href={`tel:${settings.phone || settings.hotline || '01854774406'}`}
                className="w-full py-3.5 px-4 bg-[#1e3a8a] hover:bg-[#172554] active:scale-[0.98] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call For Order</span>
              </a>
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
                  <span className="font-bold text-slate-900">{String(v)}</span>
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
