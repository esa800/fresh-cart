import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Copy, 
  Check, 
  Printer, 
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';

interface OrderSuccessBusModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder?: (orderNumber: string) => void;
  onViewInvoice?: (order: Order) => void;
  onContinueShopping?: () => void;
}

export const OrderSuccessBusModal: React.FC<OrderSuccessBusModalProps> = ({
  order,
  isOpen,
  onClose,
  onTrackOrder,
  onViewInvoice,
  onContinueShopping
}) => {
  const [animationStage, setAnimationStage] = useState<'driving' | 'success'>('driving');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAnimationStage('driving');
      return;
    }

    // Step 1: Initial driving bus animation
    setAnimationStage('driving');

    // Step 2: After 1.2s, transition to success state with confetti burst!
    const timer = setTimeout(() => {
      setAnimationStage('success');
      
      // Fire celebratory confetti
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f85606', '#10b981', '#3b82f6', '#f59e0b', '#ec4899']
        });
      } catch (e) {
        // Safe fallback if canvas-confetti is not loaded
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyOrderNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 md:p-6 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-auto transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP STATUS BAR */}
        <div className="bg-[#0b1329] px-6 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold tracking-wide uppercase text-emerald-300">
              {animationStage === 'driving' ? 'ডেলিভারি এক্সপ্রেস রেডি হচ্ছে...' : 'অর্ডার সফলভাবে নিশ্চিত হয়েছে'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {order.orderNumber}
          </span>
        </div>

        {/* BUS ANIMATION STAGE */}
        <div className="relative bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50/40 pt-6 pb-4 px-4 overflow-hidden border-b border-slate-200 text-center">
          
          {/* Drifting Clouds in Sky */}
          <div className="absolute top-2 left-4 w-12 h-4 bg-white/70 rounded-full blur-[0.5px] animate-pulse"></div>
          <div className="absolute top-4 right-8 w-16 h-5 bg-white/80 rounded-full blur-[0.5px]"></div>
          
          {/* Animated Speed Lines */}
          <div className="absolute top-8 left-10 w-24 h-0.5 bg-orange-400/30 rounded-full"></div>
          <div className="absolute top-12 right-12 w-20 h-0.5 bg-sky-400/40 rounded-full"></div>

          {/* DELIVER BUS / VAN SVG */}
          <div className="relative inline-block mx-auto my-2">
            <div className={`transition-transform duration-700 ease-out ${
              animationStage === 'driving' 
                ? 'translate-x-0 animate-bounce' 
                : 'translate-x-0'
            }`}>
              {/* Bus SVG Container */}
              <svg 
                className="w-56 sm:w-64 h-auto drop-shadow-xl" 
                viewBox="0 0 280 140" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Exhaust Smoke Puffs */}
                <g className="animate-pulse opacity-70">
                  <circle cx="20" cy="100" r="5" fill="#cbd5e1" />
                  <circle cx="10" cy="96" r="4" fill="#e2e8f0" />
                  <circle cx="2" cy="94" r="3" fill="#f1f5f9" />
                </g>

                {/* Headlight Beam */}
                <path 
                  d="M260 80 L285 65 L285 110 L260 95 Z" 
                  fill="url(#headlight-gradient)" 
                  opacity="0.8" 
                />
                <defs>
                  <linearGradient id="headlight-gradient" x1="260" y1="87" x2="285" y2="87" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fef08a" stopOpacity="0.8"/>
                    <stop offset="1" stopColor="#fef08a" stopOpacity="0"/>
                  </linearGradient>
                </defs>

                {/* Main Bus/Van Body (Vibrant Orange & Sleek Curvature) */}
                <path 
                  d="M 30 100 
                     L 30 50 
                     Q 30 40, 42 40 
                     L 195 40 
                     Q 220 40, 235 60 
                     L 255 75 
                     Q 262 82, 262 92 
                     L 262 100 
                     Q 262 105, 255 105 
                     L 230 105 
                     A 20 20 0 0 0 190 105 
                     L 95 105 
                     A 20 20 0 0 0 55 105 
                     L 35 105 
                     Q 30 105, 30 100 Z" 
                  fill="#f85606" 
                />

                {/* Van Roof Rack / Top Accent */}
                <rect x="50" y="36" width="130" height="4" rx="2" fill="#d04200" />

                {/* Windows */}
                {/* Front Windshield */}
                <path 
                  d="M 198 46 
                     L 230 62 
                     Q 235 66, 235 74 
                     L 198 74 Z" 
                  fill="#e0f2fe" 
                />
                
                {/* Driver Silhouette with Cap & Smile */}
                <circle cx="210" cy="62" r="5.5" fill="#0f172a" />
                <path d="M 205 60 Q 212 55, 218 60 Z" fill="#f85606" /> {/* Cap */}
                <path d="M 206 72 Q 210 67, 216 72 Z" fill="#0284c7" /> {/* Shirt */}

                {/* Side Cargo Windows */}
                <rect x="140" y="46" width="48" height="28" rx="4" fill="#e0f2fe" />
                <rect x="85" y="46" width="48" height="28" rx="4" fill="#e0f2fe" />
                <rect x="38" y="46" width="40" height="28" rx="4" fill="#e0f2fe" />

                {/* Delivery Boxes visible inside rear windows */}
                <rect x="42" y="56" width="14" height="14" rx="2" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                <rect x="58" y="58" width="12" height="12" rx="2" fill="#d97706" stroke="#92400e" strokeWidth="1" />
                <rect x="92" y="55" width="15" height="15" rx="2" fill="#10b981" stroke="#047857" strokeWidth="1" />

                {/* White Stripe across bus side */}
                <rect x="30" y="80" width="232" height="7" fill="#ffffff" />
                
                {/* Brand Badge Text on Stripe */}
                <text x="50" y="85.5" fill="#0f172a" fontSize="5.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">
                  KHAN EXPRESS COURIER
                </text>

                {/* Front Bumper & Grill */}
                <rect x="256" y="90" width="8" height="12" rx="3" fill="#334155" />
                {/* Headlight */}
                <circle cx="258" cy="85" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />

                {/* Rear Tail Light */}
                <rect x="28" y="65" width="4" height="10" rx="2" fill="#ef4444" />

                {/* Door Handles */}
                <rect x="190" y="79" width="6" height="2" rx="1" fill="#475569" />
                <rect x="135" y="79" width="6" height="2" rx="1" fill="#475569" />

                {/* Wheels & Tires with Rotating Hubcaps */}
                {/* Back Wheel */}
                <g transform="translate(75, 105)">
                  <circle cx="0" cy="0" r="16" fill="#1e293b" />
                  <circle cx="0" cy="0" r="10" fill="#94a3b8" />
                  <circle cx="0" cy="0" r="4" fill="#0f172a" />
                  {/* Wheel Spokes */}
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#f8fafc" strokeWidth="1.8" className="origin-center animate-spin" style={{ animationDuration: '0.4s' }} />
                  <line x1="0" y1="-8" x2="0" y2="8" stroke="#f8fafc" strokeWidth="1.8" className="origin-center animate-spin" style={{ animationDuration: '0.4s' }} />
                </g>

                {/* Front Wheel */}
                <g transform="translate(210, 105)">
                  <circle cx="0" cy="0" r="16" fill="#1e293b" />
                  <circle cx="0" cy="0" r="10" fill="#94a3b8" />
                  <circle cx="0" cy="0" r="4" fill="#0f172a" />
                  {/* Wheel Spokes */}
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#f8fafc" strokeWidth="1.8" className="origin-center animate-spin" style={{ animationDuration: '0.4s' }} />
                  <line x1="0" y1="-8" x2="0" y2="8" stroke="#f8fafc" strokeWidth="1.8" className="origin-center animate-spin" style={{ animationDuration: '0.4s' }} />
                </g>
              </svg>
            </div>

            {/* ROADWAY TRACK WITH FAST-MOVING DASHED ROAD LINES */}
            <div className="w-full max-w-[260px] mx-auto mt-[-8px]">
              <div className="h-3.5 bg-slate-800 rounded-full relative overflow-hidden flex items-center shadow-inner">
                {/* Road dividing stripes racing from right to left */}
                <div className="flex gap-4 w-[600px] animate-[roadDash_0.6s_linear_infinite]">
                  <span className="w-6 h-1 bg-amber-400 rounded-full shrink-0"></span>
                  <span className="w-6 h-1 bg-amber-400 rounded-full shrink-0"></span>
                  <span className="w-6 h-1 bg-amber-400 rounded-full shrink-0"></span>
                  <span className="w-6 h-1 bg-amber-400 rounded-full shrink-0"></span>
                  <span className="w-6 h-1 bg-amber-400 rounded-full shrink-0"></span>
                  <span className="w-6 h-1 bg-amber-400 rounded-full shrink-0"></span>
                  <span className="w-6 h-1 bg-amber-400 rounded-full shrink-0"></span>
                  <span className="w-6 h-1 bg-amber-400 rounded-full shrink-0"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Congratulatory Message */}
          <div className="mt-2 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs shadow-md animate-bounce">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
              <span>Order Successful! (অর্ডার কনফার্ম)</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              আমাদের ডেলিভারি ভ্যান দ্রুততম সময়ে আপনার ঠিকানায় পণ্যটি পৌঁছে দেওয়ার জন্য প্রস্তুত হচ্ছে।
            </p>
          </div>
        </div>

        {/* ORDER DETAILS SNAPSHOT CARD */}
        <div className="p-5 sm:p-6 space-y-4 text-slate-700 text-xs">
          
          {/* Order Reference Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                আপনার অর্ডার নম্বর (Order ID)
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-[#f85606]">
                {order.orderNumber}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
            </button>
          </div>

          {/* Customer & Address Preview */}
          <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-emerald-950 font-bold">
              <span>গ্রাহকের নাম:</span>
              <span className="text-slate-900">{order.customerName}</span>
            </div>

            <div className="flex items-start justify-between gap-2 text-slate-600 text-[11px]">
              <span className="shrink-0 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>ডেলিভারি ঠিকানা:</span>
              </span>
              <span className="text-right font-medium text-slate-800">
                {order.address.fullAddress}, {order.address.area}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-emerald-200/50 font-black">
              <span className="text-slate-800">সর্বমোট প্রদেয় টাকা:</span>
              <span className="text-sm text-[#f85606]">৳ {order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Track Order */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onTrackOrder) {
                    onTrackOrder(order.orderNumber);
                  }
                }}
                className="w-full py-2.5 px-4 bg-[#f85606] hover:bg-[#e04a00] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>লাইভ ট্র্যাক করুন (Track)</span>
              </button>

              {/* View Invoice */}
              <button
                type="button"
                onClick={() => {
                  if (onViewInvoice) {
                    onViewInvoice(order);
                  }
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>চালান প্রিন্ট করুন (Invoice)</span>
              </button>
            </div>

            {/* Continue Shopping */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onContinueShopping) {
                  onContinueShopping();
                }
              }}
              className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
            >
              ← আরো কেনাকাটা করুন (Continue Shopping)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
