import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  FileText, 
  Truck, 
  ShoppingBag, 
  Phone, 
  Clock, 
  MapPin 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StoreService } from '../services/store';
import { InvoiceModal } from '../components/InvoiceModal';
import { useToast } from '../contexts/ToastContext';

interface OrderConfirmationPageProps {
  orderNumber: string;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderNumber,
  onNavigate
}) => {
  const [copied, setCopied] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const { showToast } = useToast();

  const order = StoreService.getOrderById(orderNumber);

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.55 },
        colors: ['#f85606', '#10b981', '#3b82f6', '#f59e0b']
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  const handleCopyOrderNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      showToast('Order number copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      {/* Success Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg text-center space-y-5">
        
        {/* Animated Delivery Bus Banner */}
        <div className="relative bg-gradient-to-b from-sky-50 via-sky-50/50 to-amber-50/40 rounded-2xl p-4 overflow-hidden border border-slate-200/80">
          <div className="relative inline-block mx-auto">
            <svg 
              className="w-44 sm:w-56 h-auto drop-shadow-md animate-bounce" 
              viewBox="0 0 280 140" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ animationDuration: '2.2s' }}
            >
              {/* Exhaust Smoke Puffs */}
              <g className="animate-pulse opacity-70">
                <circle cx="20" cy="100" r="5" fill="#cbd5e1" />
                <circle cx="10" cy="96" r="4" fill="#e2e8f0" />
                <circle cx="2" cy="94" r="3" fill="#f1f5f9" />
              </g>

              {/* Headlight Beam */}
              <path d="M260 80 L285 65 L285 110 L260 95 Z" fill="#fef08a" opacity="0.6" />

              {/* Main Bus/Van Body */}
              <path 
                d="M 30 100 L 30 50 Q 30 40, 42 40 L 195 40 Q 220 40, 235 60 L 255 75 Q 262 82, 262 92 L 262 100 Q 262 105, 255 105 L 230 105 A 20 20 0 0 0 190 105 L 95 105 A 20 20 0 0 0 55 105 L 35 105 Q 30 105, 30 100 Z" 
                fill="#f85606" 
              />
              <rect x="50" y="36" width="130" height="4" rx="2" fill="#d04200" />

              {/* Windows */}
              <path d="M 198 46 L 230 62 Q 235 66, 235 74 L 198 74 Z" fill="#e0f2fe" />
              <circle cx="210" cy="62" r="5.5" fill="#0f172a" />
              <path d="M 205 60 Q 212 55, 218 60 Z" fill="#f85606" />

              <rect x="140" y="46" width="48" height="28" rx="4" fill="#e0f2fe" />
              <rect x="85" y="46" width="48" height="28" rx="4" fill="#e0f2fe" />
              <rect x="38" y="46" width="40" height="28" rx="4" fill="#e0f2fe" />

              {/* Delivery Boxes inside */}
              <rect x="42" y="56" width="14" height="14" rx="2" fill="#f59e0b" />
              <rect x="58" y="58" width="12" height="12" rx="2" fill="#d97706" />
              <rect x="92" y="55" width="15" height="15" rx="2" fill="#10b981" />

              {/* White stripe with text */}
              <rect x="30" y="80" width="232" height="7" fill="#ffffff" />
              <text x="50" y="85.5" fill="#0f172a" fontSize="5.5" fontWeight="900" fontFamily="sans-serif">
                KHAN EXPRESS COURIER
              </text>

              {/* Front & Rear Lights */}
              <circle cx="258" cy="85" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
              <rect x="28" y="65" width="4" height="10" rx="2" fill="#ef4444" />

              {/* Wheels with rotating spokes */}
              <g transform="translate(75, 105)">
                <circle cx="0" cy="0" r="16" fill="#1e293b" />
                <circle cx="0" cy="0" r="10" fill="#94a3b8" />
                <line x1="-8" y1="0" x2="8" y2="0" stroke="#f8fafc" strokeWidth="1.8" className="origin-center animate-spin" style={{ animationDuration: '0.4s' }} />
                <line x1="0" y1="-8" x2="0" y2="8" stroke="#f8fafc" strokeWidth="1.8" className="origin-center animate-spin" style={{ animationDuration: '0.4s' }} />
              </g>

              <g transform="translate(210, 105)">
                <circle cx="0" cy="0" r="16" fill="#1e293b" />
                <circle cx="0" cy="0" r="10" fill="#94a3b8" />
                <line x1="-8" y1="0" x2="8" y2="0" stroke="#f8fafc" strokeWidth="1.8" className="origin-center animate-spin" style={{ animationDuration: '0.4s' }} />
                <line x1="0" y1="-8" x2="0" y2="8" stroke="#f8fafc" strokeWidth="1.8" className="origin-center animate-spin" style={{ animationDuration: '0.4s' }} />
              </g>
            </svg>

            {/* Roadway Track with fast dashes */}
            <div className="w-full max-w-[210px] mx-auto mt-[-6px]">
              <div className="h-3 bg-slate-800 rounded-full relative overflow-hidden flex items-center shadow-inner">
                <div className="flex gap-4 w-[500px] animate-[roadDash_0.6s_linear_infinite]">
                  <span className="w-5 h-1 bg-amber-400 rounded-full shrink-0"></span>
                  <span className="w-5 h-1 bg-amber-400 rounded-full shrink-0"></span>
                  <span className="w-5 h-1 bg-amber-400 rounded-full shrink-0"></span>
                  <span className="w-5 h-1 bg-amber-400 rounded-full shrink-0"></span>
                  <span className="w-5 h-1 bg-amber-400 rounded-full shrink-0"></span>
                  <span className="w-5 h-1 bg-amber-400 rounded-full shrink-0"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
            Order Placed Successfully!
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত হয়েছে
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            We have received your order. Our team is now preparing fresh cuts and hand-picked vegetables for dispatch.
          </p>
        </div>

        {/* Order Number Box */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-flex flex-col sm:flex-row items-center gap-3">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Order Reference</span>
            <span className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-wider">
              {orderNumber}
            </span>
          </div>

          <button
            id="copy-order-number-btn"
            onClick={handleCopyOrderNumber}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Delivery Details Snapshot */}
        {order && (
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-left space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100/80 font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-900">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Estimated Delivery:</span>
              </span>
              <strong className="text-slate-900">
                {order.deliveryOption === 'express' ? 'Within 2 Hours' : 'Tomorrow 8:00 AM - 12:00 PM'}
              </strong>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>Deliver to: {order.address.fullAddress}, {order.address.area}, {order.address.division}</span>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <span>Payment Method: <strong className="uppercase">{order.paymentMethod}</strong></span>
              <span>Total: <strong className="text-emerald-700 font-bold">৳{order.total}</strong></span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="view-invoice-btn"
            onClick={() => setIsInvoiceOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>View & Print Invoice</span>
          </button>

          <button
            id="track-order-btn"
            onClick={() => onNavigate('track-order', orderNumber)}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Truck className="w-4 h-4" />
            <span>Track Live Status</span>
          </button>

          <button
            onClick={() => onNavigate('shop')}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Customer Help Box */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Need help with this order? Call our hotline: <strong>01700-373741</strong></span>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        order={order || null}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};
