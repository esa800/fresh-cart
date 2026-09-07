import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { StoreService } from '../services/store';

interface CartPageProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenAreaModal: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate, onOpenAreaModal }) => {
  const {
    items,
    itemCount,
    subtotal,
    appliedCoupon,
    couponDiscount,
    deliveryCharge,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    selectedZone,
    deliveryOption,
    setDeliveryOption
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const { showToast } = useToast();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput.trim());
    if (res.success) {
      showToast(res.message, 'success');
      setCouponInput('');
    } else {
      setCouponError(res.message);
      showToast(res.message, 'error');
    }
  };

  const freeDeliveryDiff = Math.max(0, selectedZone.freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / selectedZone.freeDeliveryThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 my-8 max-w-lg mx-auto shadow-xs">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Your Basket is Empty</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Looks like you haven't added anything to your cart yet. Explore our fresh grocery collection!
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Explore Groceries
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('shop')}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 mb-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-800 font-semibold self-start sm:self-auto"
        >
          Clear All Items
        </button>
      </div>

      {/* Free Delivery Bar */}
      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="flex items-center gap-2 text-emerald-950">
            <Truck className="w-4 h-4 text-emerald-600" />
            {freeDeliveryDiff > 0 ? (
              <>Add <strong className="text-emerald-700">৳{freeDeliveryDiff}</strong> more to get FREE standard delivery in {selectedZone.division}!</>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Free Delivery Unlocked for {selectedZone.name}!
              </span>
            )}
          </span>
          <span className="text-emerald-700">{freeDeliveryProgress}%</span>
        </div>
        <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Item Table (8 cols) & Summary Box (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div 
                  className="flex items-center gap-3.5 cursor-pointer"
                  onClick={() => onNavigate('product-detail', item.product.slug)}
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {item.product.banglaName} • <span className="font-semibold text-slate-700">{item.product.unit}</span>
                    </p>
                    <span className="text-xs font-bold text-emerald-700 block mt-1">
                      ৳{item.product.salePrice}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        const res = updateQuantity(item.product.id, item.quantity + 1);
                        if (!res.success) showToast(res.message, 'error');
                      }}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total item price */}
                  <span className="text-sm font-black text-slate-900 min-w-[70px] text-right">
                    ৳{item.product.salePrice * item.quantity}
                  </span>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Special Note */}
          <div className="pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Special Delivery Instructions (ঐচ্ছিক নোট)
            </label>
            <input
              type="text"
              placeholder="e.g. Call before coming, please give medium-sized fish cuts..."
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Right: Summary & Checkout (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5 sticky top-24">
          <h2 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h2>

          {/* Delivery Zone Selector */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Delivery Destination:</span>
              <button
                onClick={onOpenAreaModal}
                className="text-emerald-700 font-bold hover:underline"
              >
                Change
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{selectedZone.name} ({selectedZone.division})</span>
            </div>
          </div>

          {/* Delivery Speed Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Delivery Speed</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label 
                className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between gap-1 transition-all ${
                  deliveryOption === 'standard'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="cartPageDeliverySpeed"
                    checked={deliveryOption === 'standard'}
                    onChange={() => setDeliveryOption('standard')}
                    className="text-emerald-600"
                  />
                  <span>Standard</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {subtotal >= selectedZone.freeDeliveryThreshold ? 'FREE' : `৳${selectedZone.standardCharge}`}
                </span>
              </label>

              <label 
                className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between gap-1 transition-all ${
                  deliveryOption === 'express'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="cartPageDeliverySpeed"
                    checked={deliveryOption === 'express'}
                    onChange={() => setDeliveryOption('express')}
                    className="text-amber-600"
                  />
                  <span>2-Hr Express</span>
                </div>
                <span className="text-[11px] text-slate-500">৳{selectedZone.expressCharge}</span>
              </label>
            </div>
          </div>

          {/* Coupon input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Have a Coupon Code?</label>
            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{appliedCoupon.code} applied (-৳{couponDiscount})</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code (e.g. FRESH10)"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError('');
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 uppercase placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </form>
            )}
            {couponError && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {couponError}
              </p>
            )}
          </div>

          {/* Breakdown */}
          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">৳{subtotal}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon Discount</span>
                <span className="font-bold">-৳{couponDiscount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated Delivery Fee</span>
              <span className="font-semibold text-slate-900">
                {deliveryCharge === 0 ? <strong className="text-emerald-600 font-bold">FREE</strong> : `৳${deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="text-emerald-700">৳{total}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            id="cart-page-checkout-btn"
            onClick={() => onNavigate('checkout')}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
