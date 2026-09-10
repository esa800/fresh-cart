import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  Truck, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  User, 
  CheckCircle2, 
  Plus, 
  Minus,
  MessageSquare,
  CreditCard,
  Lock
} from 'lucide-react';
import { Product } from '../types';
import { StoreService } from '../services/store';
import { useToast } from '../contexts/ToastContext';

interface QuickOrderModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'dhaka' | 'outside'>('dhaka');
  const [fullAddress, setFullAddress] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const settings = StoreService.getSettings();
  const deliveryCharge = deliveryArea === 'dhaka' 
    ? (settings.deliveryChargeDhaka || 60) 
    : (settings.deliveryChargeOutside || 120);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setIsSubmitting(false);
      // Pre-fill user data if logged in
      const currentUser = StoreService.getCurrentUser();
      if (currentUser) {
        setCustomerName(currentUser.name || '');
        setPhone(currentUser.phone || '');
        if (currentUser.savedAddresses && currentUser.savedAddresses.length > 0) {
          const addr = currentUser.savedAddresses[0];
          setFullAddress(addr.fullAddress || '');
        }
      }
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const subtotal = product.salePrice * quantity;
  const isFreeDelivery = settings.freeDeliveryThreshold && subtotal >= settings.freeDeliveryThreshold;
  const finalDeliveryCharge = isFreeDelivery ? 0 : deliveryCharge;
  const total = subtotal + finalDeliveryCharge;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = customerName.trim();
    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    const cleanAddress = fullAddress.trim();

    if (!cleanName) {
      showToast('অনুগ্রহ করে আপনার পুরো নাম লিখুন', 'error');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 11) {
      showToast('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)', 'error');
      return;
    }

    if (!cleanAddress || cleanAddress.length < 8) {
      showToast('অনুগ্রহ করে সম্পূর্ণ ডেলিভারি ঠিকানা (বাসা/রোড, এলাকা, জেলা) দিন', 'error');
      return;
    }

    if (quantity > product.stockQuantity) {
      showToast(`দুঃখিত! স্টকে সর্বোচ্চ ${product.stockQuantity} টি পণ্য উপলব্ধ আছে।`, 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = StoreService.createOrder({
        customerId: StoreService.getCurrentUser()?.id || `guest-${Date.now()}`,
        customerName: cleanName,
        phone: cleanPhone,
        email: 'quick-order@khangadgetbd.com',
        address: {
          division: deliveryArea === 'dhaka' ? 'Dhaka' : 'Outside Dhaka',
          district: deliveryArea === 'dhaka' ? 'Dhaka' : 'Rest of Bangladesh',
          area: deliveryArea === 'dhaka' ? 'Dhaka Metro' : 'Outside Dhaka',
          fullAddress: cleanAddress,
          deliveryNote: deliveryNote ? `[১-ক্লিক দ্রুত অর্ডার] ${deliveryNote}` : '[১-ক্লিক দ্রুত অর্ডার]'
        },
        items: [
          {
            productId: product.id,
            name: product.name,
            banglaName: product.banglaName,
            price: product.salePrice,
            quantity: quantity,
            unit: product.unit,
            image: product.images[0] || '',
            total: subtotal
          }
        ],
        subtotal: subtotal,
        discount: product.regularPrice > product.salePrice ? (product.regularPrice - product.salePrice) * quantity : 0,
        deliveryCharge: finalDeliveryCharge,
        couponDiscount: 0,
        total: total,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'Pending',
        deliveryStatus: 'Pending Confirmation - 1-Click Buy',
        deliveryOption: deliveryArea === 'dhaka' ? 'express' : 'standard',
        estimatedDelivery: deliveryArea === 'dhaka' ? '১-২ কার্যদিবস' : '২-৩ কার্যদিবস'
      });

      showToast(`অর্ডার সফল হয়েছে! আপনার অর্ডার নং: ${order.orderNumber}`, 'success');
      showToast(`নম্বর ${cleanPhone}-এ অর্ডার কনফার্মেশন SMS পাঠানো হয়েছে।`, 'info');
      
      onClose();
      onSuccess(order.orderNumber);
    } catch (err) {
      console.error('Failed to create quick order:', err);
      showToast('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#ea580c] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f85606] flex items-center justify-center text-white shadow-md shadow-orange-500/30 shrink-0">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  ১-ক্লিক দ্রুত অর্ডার
                </h3>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Instant Buy
                </span>
              </div>
              <p className="text-xs text-slate-300">
                কোনো লগইন ছাড়াই নাম ও ঠিকানা দিয়ে সরাসরি অর্ডার করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Product Summary Card */}
          <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl flex items-center gap-3.5">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-orange-200 bg-white shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <span className="text-[10px] font-bold text-[#f85606] uppercase tracking-wider block">
                {product.brand}
              </span>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1">
                {product.name}
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-sm sm:text-base font-black text-[#f85606]">
                  ৳{product.salePrice}
                </span>
                {product.regularPrice > product.salePrice && (
                  <span className="text-[11px] text-slate-400 line-through">
                    ৳{product.regularPrice}
                  </span>
                )}
                <span className="text-[10px] text-slate-500 font-medium">
                  / {product.unit}
                </span>
              </div>
            </div>

            {/* Quantity Controller */}
            <div className="flex items-center bg-white border border-orange-200 rounded-xl overflow-hidden shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-orange-100 disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-bold text-slate-900 text-xs">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                disabled={quantity >= product.stockQuantity}
                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-orange-100 disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <form id="quick-order-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Information Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  আপনার পুরো নাম (Full Name) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f85606]/20 focus:border-[#f85606] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  মোবাইল নম্বর (Phone Number) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f85606]/20 focus:border-[#f85606] transition-all font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  এই নম্বরে আপনার অর্ডার কনফার্মেশন SMS পাঠানো হবে
                </span>
              </div>

              {/* Delivery Area Toggle */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  ডেলিভারি এরিয়া নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryArea('dhaka')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      deliveryArea === 'dhaka'
                        ? 'border-[#f85606] bg-orange-50/60 ring-2 ring-[#f85606]/20 text-[#f85606]'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">ঢাকার ভিতরে</span>
                      <span className="font-black text-xs text-[#f85606]">
                        ৳{settings.deliveryChargeDhaka || 60}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">১-২ কার্যদিবসে ডেলিভারি</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryArea('outside')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      deliveryArea === 'outside'
                        ? 'border-[#f85606] bg-orange-50/60 ring-2 ring-[#f85606]/20 text-[#f85606]'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">ঢাকার বাইরে</span>
                      <span className="font-black text-xs text-[#f85606]">
                        ৳{settings.deliveryChargeOutside || 120}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">২-৩ কার্যদিবসে ডেলিভারি</p>
                  </button>
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <textarea
                    rows={2}
                    required
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="বাসা নং, রোড নং, এলাকা, থানা/উপজেলা ও জেলা"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f85606]/20 focus:border-[#f85606] transition-all leading-relaxed"
                  />
                </div>
              </div>

              {/* Order Note (Optional) */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  বিশেষ নির্দেশনা / নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="যেমন: অফিস টাইমে কল দিবেন বা নির্দিষ্ট সময়..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f85606]/20 focus:border-[#f85606] transition-all"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  পেমেন্ট পদ্ধতি (Payment Method)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label 
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#f85606] bg-orange-50/50 text-[#f85606] font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="quick_payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#f85606]"
                    />
                    <span className="text-xs">ক্যাশ অন ডেলিভারি (COD)</span>
                  </label>

                  <label 
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-[#f85606] bg-orange-50/50 text-[#f85606] font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="quick_payment"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="accent-[#f85606]"
                    />
                    <span className="text-xs">বিকাশ / নগদ পেমেন্ট</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>প্রোডাক্টের মূল্য ({quantity} টি)</span>
                <span className="font-bold text-slate-900">৳{subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ</span>
                {isFreeDelivery ? (
                  <span className="font-bold text-emerald-600">ফ্রি (Free)</span>
                ) : (
                  <span className="font-bold text-slate-900">৳{finalDeliveryCharge}</span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                <span>সর্বমোট প্রদেয় টাকা:</span>
                <span className="text-base text-[#f85606]">৳{total}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#f85606] hover:bg-[#e04a00] disabled:bg-slate-300 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-98 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isSubmitting 
                  ? 'অর্ডার প্রক্রিয়াধীন...' 
                  : `অর্ডার নিশ্চিত করুন — ৳${total}`}
              </span>
            </button>

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px] text-slate-500">
              <div className="flex items-center justify-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#f85606]" />
                <span>দ্রুত ডেলিভারি</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#f85606]" />
                <span>১০০% আসল গ্যাজেট</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#f85606]" />
                <span>নিরাপদ চেকআউট</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
