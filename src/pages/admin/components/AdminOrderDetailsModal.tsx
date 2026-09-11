import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Printer, 
  ExternalLink, 
  X, 
  User, 
  Phone, 
  MessageSquare, 
  FileText, 
  Package, 
  CreditCard, 
  Truck, 
  Check, 
  AlertCircle,
  Copy,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../../types';
import { StoreService } from '../../../services/store';

interface AdminOrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onPrintInvoice: (order: Order) => void;
  onOrderUpdated?: (updated: Order) => void;
}

export const AdminOrderDetailsModal: React.FC<AdminOrderDetailsModalProps> = ({
  order: initialOrder,
  onClose,
  onPrintInvoice,
  onOrderUpdated
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(initialOrder.orderStatus);
  const [selectedCourier, setSelectedCourier] = useState<string>(
    initialOrder.courierService || 'Steadfast Courier'
  );
  const [trackingNote, setTrackingNote] = useState<string>(
    initialOrder.deliveryStatus || 'Dispatched from main fulfillment hub via express courier...'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const cleanPhone = (order.phone || '').replace(/[^0-9]/g, '');
  const trackingNumber = order.courierTrackingId || `STD-BD-${order.orderNumber.replace(/\D/g, '') || Math.floor(10000000 + Math.random() * 90000000)}`;

  const orderDateFormatted = new Date(order.orderDate).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const totalUnits = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleUpdateStatusAndDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const isDelivered = selectedStatus === 'Delivered';
      const paymentStatusUpdate: PaymentStatus = isDelivered && order.paymentMethod === 'cod' 
        ? 'paid' 
        : order.paymentStatus;

      const updated = StoreService.updateOrderFull(order.id, {
        orderStatus: selectedStatus,
        paymentStatus: paymentStatusUpdate,
        courierService: selectedCourier,
        courierTrackingId: trackingNumber,
        deliveryStatus: trackingNote.trim() || `Order status updated to ${selectedStatus}`,
        notes: trackingNote.trim()
      });

      if (updated) {
        setOrder({ ...updated });
        if (onOrderUpdated) {
          onOrderUpdated(updated);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyTracking = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const handleTrackCourier = () => {
    // Open Track Order in a new tab or window with this order/tracking number
    const trackUrl = `${window.location.origin}/#track-order?ref=${encodeURIComponent(trackingNumber)}`;
    window.open(trackUrl, '_blank');
  };

  // Status badge styling matching the reference screenshot
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#3b2314] text-[#fca364] border border-[#783e18]">
            Confirmed
          </span>
        );
      case 'Delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-950 text-blue-400 border border-blue-800">
            Shipped
          </span>
        );
      case 'Processing':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-950 text-purple-400 border border-purple-800">
            Processing
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-slate-50 rounded-2xl shadow-2xl border border-slate-300 max-w-4xl w-full overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP HEADER - Dark Navy Background exactly matching reference screenshot */}
        <div className="bg-[#0b1329] px-4 sm:px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {/* Orange icon badge */}
            <div className="w-10 h-10 rounded-xl bg-[#f85606] text-white flex items-center justify-center shadow-md shadow-orange-900/30 shrink-0">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Order Details:</span>
                  <span className="text-[#f85606] font-mono tracking-wide">{order.orderNumber}</span>
                </h2>
                {getStatusBadge(order.orderStatus)}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                <span>Tracking: {trackingNumber}</span>
                <span>•</span>
                <span>{orderDateFormatted}</span>
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="hover:text-white transition-colors cursor-pointer ml-1"
                  title="কপি করুন"
                >
                  {copiedTracking ? <Check className="w-3 h-3 text-emerald-400 inline" /> : <Copy className="w-3 h-3 inline" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-2">
            <button
              id="admin-print-invoice-btn"
              type="button"
              onClick={() => onPrintInvoice(order)}
              className="px-3.5 py-2 bg-[#f85606] hover:bg-[#e04a00] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice (চালান)</span>
            </button>

            <button
              id="admin-track-courier-btn"
              type="button"
              onClick={handleTrackCourier}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer hidden sm:flex"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Track on Courier</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
          
          {/* SAVE SUCCESS BANNER */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>অর্ডার স্ট্যাটাস ও ডিসপ্যাচ লগ সফলভাবে সংরক্ষিত ও ক্লাউডে সিঙ্ক করা হয়েছে!</span>
            </div>
          )}

          {/* CARD 1: CUSTOMER & DELIVERY DETAILS (কাস্টমার তথ্য) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-orange-600">
                  <User className="w-4 h-4" />
                </span>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase">
                  CUSTOMER & DELIVERY DETAILS (কাস্টমার তথ্য)
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                {order.address?.area ? 'Home' : 'Standard'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {/* Left Column: Customer Name & City */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  CUSTOMER NAME
                </span>
                <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5 uppercase tracking-wide">
                  {order.customerName}
                </p>
              </div>

              {/* Right Column: Phone Number + Call & WhatsApp */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  PHONE NUMBER
                </span>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <strong className="text-sm sm:text-base font-black text-slate-900 font-mono">
                    {order.phone}
                  </strong>

                  <a
                    href={`tel:${order.phone}`}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`https://wa.me/880${cleanPhone.slice(-10)}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${order.customerName} সাহেব, আপনার অর্ডার #${order.orderNumber} এর ব্যাপারে যোগাযোগ করছি।`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <MessageSquare className="w-3 h-3 text-white fill-white" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* City */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  CITY
                </span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {order.address?.district || order.address?.division || 'Dhaka'}
                </p>
              </div>

              {/* Full Address */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  FULL DELIVERY ADDRESS
                </span>
                <p className="text-sm font-black text-slate-900 mt-0.5 uppercase">
                  {order.address?.fullAddress || `${order.address?.area}, ${order.address?.district}`}
                </p>
              </div>
            </div>

            {/* Inset Customer Note (Amber callout box) */}
            <div className="border border-amber-300 bg-amber-50/40 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Customer Note (কাস্টমার স্পেশাল নোট):</span>
              </div>
              <p className="text-xs text-amber-800 italic font-medium">
                {order.address?.deliveryNote || order.notes || 'No special instructions entered by customer.'}
              </p>
            </div>
          </div>

          {/* CARD 2: ORDER ITEMS (X UNITS) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase">
                  ORDER ITEMS ({totalUnits} UNITS)
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">PRODUCT</th>
                    <th className="py-2.5 px-4 text-right">UNIT PRICE</th>
                    <th className="py-2.5 px-4 text-center">QTY</th>
                    <th className="py-2.5 px-4 text-right">SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Brand: KHAN store • Category: Fresh Organic
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        ৳ {item.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center font-black text-slate-900 text-sm">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                        ৳ {item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CARD 3: PAYMENT METHOD & FINANCIAL SUMMARY (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Payment Method Card (Mint Green Border & Background) */}
            <div className="border border-emerald-300 bg-emerald-50/40 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>PAYMENT METHOD</span>
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">Method:</span>
                    <strong className="text-slate-900 uppercase font-black">
                      {order.paymentMethod === 'cod' ? 'CASH ON DELIVERY (COD)' : order.paymentMethod.toUpperCase()}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-emerald-100/70 text-emerald-800 border-emerald-200'
                    }`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid (COD)'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 pt-2 border-t border-emerald-200/60 leading-relaxed">
                {order.paymentMethod === 'cod' 
                  ? 'Rider must collect cash upon delivering the parcel to the customer.'
                  : `Paid via ${order.paymentMethod.toUpperCase()}${order.paymentDetails?.transactionId ? ` (Trx: ${order.paymentDetails.transactionId})` : ''}.`}
              </p>
            </div>

            {/* Right: Summary Calculation Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-800">৳ {order.subtotal.toLocaleString()}</span>
              </div>

              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({order.couponCode}):</span>
                  <span>-৳ {order.couponDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee:</span>
                <span className="font-bold text-slate-800">
                  {order.deliveryCharge === 0 ? 'FREE' : `৳ ${order.deliveryCharge}`}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 uppercase">
                  Total Amount to Collect:
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#f85606]">
                  ৳ {order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* CARD 4: UPDATE ORDER STATUS & DISPATCH LOG (Orange Outlined Container) */}
          <form 
            onSubmit={handleUpdateStatusAndDispatch}
            className="border border-amber-300 bg-white rounded-xl p-5 shadow-2xs space-y-4"
          >
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-600" />
              <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase">
                UPDATE ORDER STATUS & DISPATCH LOG
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Update Status Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Update Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-hidden focus:border-orange-500 shadow-2xs cursor-pointer"
                >
                  <option value="Pending">Pending (অপেক্ষমাণ)</option>
                  <option value="Confirmed">Confirmed (Order Accepted)</option>
                  <option value="Processing">Processing (Packaging & Ready)</option>
                  <option value="Shipped">Shipped (Handed over to Courier)</option>
                  <option value="Delivered">Delivered (Cash Collected & Completed)</option>
                  <option value="Cancelled">Cancelled (Order Cancelled)</option>
                </select>
              </div>

              {/* Courier Partner Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Courier Partner
                </label>
                <select
                  value={selectedCourier}
                  onChange={(e) => setSelectedCourier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-hidden focus:border-orange-500 shadow-2xs cursor-pointer"
                >
                  <option value="Steadfast Courier">Steadfast Courier (স্টেডফাস্ট)</option>
                  <option value="Pathao Courier">Pathao Courier (পাঠাও)</option>
                  <option value="RedX Logistics">RedX Logistics (রেডএক্স)</option>
                  <option value="Sundarban Courier">Sundarban Courier (সুন্দরবন)</option>
                  <option value="Paperfly">Paperfly Express (পেপারফ্লাই)</option>
                </select>
              </div>
            </div>

            {/* Tracking Update Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tracking Update Note (Visible to customer in live tracking)
              </label>
              <input
                type="text"
                value={trackingNote}
                onChange={(e) => setTrackingNote(e.target.value)}
                placeholder="e.g. Dispatched from main fulfillment hub via express courier..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 shadow-2xs"
              />
            </div>

            {/* Footer Bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 italic">
                Updating will instantly log this checkpoint to customer live tracking.
              </span>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#f85606] hover:bg-[#e04a00] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Update Order Status</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
