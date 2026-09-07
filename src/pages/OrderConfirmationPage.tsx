import React, { useState } from 'react';
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
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-12 h-12" />
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
