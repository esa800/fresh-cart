import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  MapPin, 
  User as UserIcon, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ArrowLeft,
  Lock,
  Clock,
  Sparkles
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PaymentService } from '../services/paymentService';
import { StoreService } from '../services/store';
import { PaymentMethod, OrderItem } from '../types';

interface CheckoutPageProps {
  onNavigate: (view: string, param?: string) => void;
  onOrderPlaced: (orderNumber: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderPlaced }) => {
  const {
    items,
    subtotal,
    appliedCoupon,
    couponDiscount,
    deliveryCharge,
    total,
    clearCart,
    selectedZone,
    deliveryOption,
    setDeliveryOption
  } = useCart();

  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Form states
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  
  const [division, setDivision] = useState(selectedZone.division || 'Dhaka');
  const [area, setArea] = useState('Bashundhara R/A');
  const [fullAddress, setFullAddress] = useState(
    currentUser?.savedAddresses?.[0]?.fullAddress || ''
  );
  const [deliveryNote, setDeliveryNote] = useState('');

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  
  // MFS fields (for bKash / Nagad)
  const [walletNumber, setWalletNumber] = useState(phone || '01711000000');
  const [trxId, setTrxId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 my-8 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Browse Shop
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).');
      return;
    }
    if (!fullAddress.trim()) {
      setErrorMessage('Please provide your detailed delivery address (House, Road, Block).');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && !walletNumber.trim()) {
      setErrorMessage(`Please provide your ${paymentMethod.toUpperCase()} mobile account number.`);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Process payment through payment abstraction service
      const paymentResult = await PaymentService.processPayment({
        orderAmount: total,
        orderNumber: `FCB-${Date.now()}`,
        customerName: customerName.trim(),
        customerPhone: phone.trim(),
        paymentMethod: paymentMethod,
        payerNumber: walletNumber || phone
      });

      if (!paymentResult.success) {
        setErrorMessage(paymentResult.message);
        showToast(paymentResult.message, 'error');
        setIsProcessing(false);
        return;
      }

      // 2. Format order items
      const orderItems: OrderItem[] = items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.salePrice,
        quantity: i.quantity,
        total: i.product.salePrice * i.quantity,
        unit: i.product.unit,
        image: i.product.images[0]
      }));

      // 3. Create persistent order record
      const createdOrder = await StoreService.createOrder({
        customerId: currentUser?.id || 'guest',
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || 'customer@khangadgetbd.com',
        items: orderItems,
        subtotal,
        discount: 0,
        deliveryCharge,
        deliveryOption,
        couponCode: appliedCoupon?.code,
        couponDiscount,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'Confirmed',
        deliveryStatus: 'Order confirmed and sent to warehouse',
        estimatedDelivery: deliveryOption === 'express' ? 'Within 2 Hours' : 'Tomorrow 8 AM - 12 PM',
        address: {
          division,
          district: 'Dhaka',
          area,
          fullAddress: fullAddress.trim(),
          deliveryNote: deliveryNote.trim() || undefined
        },
        paymentDetails: {
          transactionId: paymentResult.transactionId || `TRX-${Date.now()}`,
          senderNumber: walletNumber || phone,
          simulated: paymentResult.isSimulated,
          provider: paymentResult.provider
        }
      });

      // 4. Clear cart & toast
      clearCart();
      showToast(`Order #${createdOrder.orderNumber} confirmed successfully!`, 'success');
      onOrderPlaced(createdOrder.orderNumber);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while placing your order.');
      showToast('Order creation failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Checkout Header */}
      <div>
        <button
          onClick={() => onNavigate('cart')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 mb-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Secure Checkout (চেকআউট)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fast doorstep grocery delivery with verified Halal & pure goods guarantee.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Customer Personal Information */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                Customer Information (গ্রাহকের তথ্য)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Full Name (সম্পূর্ণ নাম) *</label>
                <div className="relative">
                  <input
                    id="checkout-customer-name"
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Phone (মোবাইল নম্বর) *</label>
                <div className="relative">
                  <input
                    id="checkout-customer-phone"
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address (ঐচ্ছিক ইমেইল)</label>
                <div className="relative">
                  <input
                    id="checkout-customer-email"
                    type="email"
                    placeholder="tanvir@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                Delivery Address in Bangladesh (ডেলিভারি ঠিকানা)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Division (বিভাগ) *</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="Dhaka">Dhaka (ঢাকা)</option>
                  <option value="Chattogram">Chattogram (চট্টগ্রাম)</option>
                  <option value="Sylhet">Sylhet (সিলেট)</option>
                  <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                  <option value="Khulna">Khulna (খুলনা)</option>
                  <option value="Barishal">Barishal (বরিশাল)</option>
                  <option value="Rangpur">Rangpur (রংপুর)</option>
                  <option value="Mymensingh">Mymensingh (ময়মনসিংহ)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Area / Thana (এলাকা / থানা) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bashundhara R/A, Dhanmondi, Uttara"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Detailed Street Address (বাসা, রোড ও ফ্ল্যাট নম্বর) *</label>
                <div className="relative">
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. House #14, Road #5, Block C, Flat 3B, Bashundhara R/A"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 leading-relaxed"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Landmark / Delivery Note (ঐচ্ছিক নির্দেশনা)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Apollo Gate, call before arriving, ring second bell"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Delivery Speed in Checkout */}
            <div className="pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-700 block mb-2 text-xs">Choose Delivery Option:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    deliveryOption === 'standard'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="checkoutDeliveryOption"
                      checked={deliveryOption === 'standard'}
                      onChange={() => setDeliveryOption('standard')}
                      className="text-emerald-600"
                    />
                    <div>
                      <span>Standard Delivery</span>
                      <span className="block text-[10px] text-slate-500 font-normal">Next morning or scheduled slot</span>
                    </div>
                  </div>
                  <span>{subtotal >= selectedZone.freeDeliveryThreshold ? 'FREE' : `৳${selectedZone.standardCharge}`}</span>
                </label>

                <label
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    deliveryOption === 'express'
                      ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="checkoutDeliveryOption"
                      checked={deliveryOption === 'express'}
                      onChange={() => setDeliveryOption('express')}
                      className="text-amber-600"
                    />
                    <div>
                      <span className="flex items-center gap-1 text-amber-900 font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> 2-Hour Express
                      </span>
                      <span className="block text-[10px] text-slate-500 font-normal">Fastest rider dispatch in Dhaka</span>
                    </div>
                  </div>
                  <span>৳{selectedZone.expressCharge}</span>
                </label>
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                Payment Method (পেমেন্ট পদ্ধতি)
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {/* bKash */}
              <div
                onClick={() => setPaymentMethod('bkash')}
                className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-600 bg-pink-50 text-pink-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-pink-300'
                }`}
              >
                <span className="text-base font-black text-pink-600 block">bKash</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">বিকাশ পেমেন্ট</span>
              </div>

              {/* Nagad */}
              <div
                onClick={() => setPaymentMethod('nagad')}
                className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                  paymentMethod === 'nagad'
                    ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-orange-300'
                }`}
              >
                <span className="text-base font-black text-orange-600 block">Nagad</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">নগদ ওয়ালেট</span>
              </div>

              {/* Cash On Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-sm font-black text-emerald-700 block">Cash on Delivery</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">ক্যাশ অন ডেলিভারি</span>
              </div>

              {/* Card */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <span className="text-sm font-black text-blue-700 block">Card / Visa</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">কার্ড পেমেন্ট</span>
              </div>
            </div>

            {/* Payment Method Details Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              {paymentMethod === 'bkash' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-pink-700 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>bKash Online Payment (01700-373741 Merchant)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Enter your bKash mobile number below. You will receive an instant verification prompt or you can enter your TrxID.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">bKash Number *</label>
                      <input
                        type="text"
                        placeholder="017XXXXXXXX"
                        value={walletNumber}
                        onChange={(e) => setWalletNumber(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">Transaction ID (Optional / Auto)</label>
                      <input
                        type="text"
                        placeholder="e.g. 9K28DF10"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'nagad' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-orange-700 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Nagad Direct Wallet Gateway</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">Nagad Account Number *</label>
                      <input
                        type="text"
                        placeholder="01XXXXXXXXX"
                        value={walletNumber}
                        onChange={(e) => setWalletNumber(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">Nagad TrxID (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. NG71928"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">Pay Cash Upon Delivery</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      You can inspect all groceries (fish, vegetables, meat) in front of our delivery executive before handing over cash. If any item is substandard, you can return it instantly.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-2 text-slate-700">
                  <div className="flex items-center gap-2 text-blue-700 font-bold">
                    <CreditCard className="w-4 h-4" />
                    <span>Visa / Mastercard / UnionPay</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Protected by 256-bit SSL encryption. Local Bangladeshi debit & credit cards accepted.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Total (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5 sticky top-24">
          <h2 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
            Order Review ({items.length} items)
          </h2>

          {/* Items mini list */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
            {items.map((item) => (
              <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-slate-500">{item.product.unit} × {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  ৳{item.product.salePrice * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Summary Breakdown */}
          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">৳{subtotal}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon ({appliedCoupon?.code})</span>
                <span className="font-bold">-৳{couponDiscount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery ({selectedZone.division} - {deliveryOption})</span>
              <span className="font-semibold text-slate-900">
                {deliveryCharge === 0 ? <strong className="text-emerald-600">FREE</strong> : `৳${deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="text-lg text-emerald-700">৳{total}</span>
            </div>
          </div>

          {/* Error notice if any */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="place-order-submit-btn"
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Order...
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Confirm & Place Order (৳{total})</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            By placing order, you agree to KHAN GADGET BD's Terms of Service and 7-Day Replacement Guarantee.
          </p>
        </div>
      </form>
    </div>
  );
};
