import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  FileText, 
  Phone, 
  MapPin, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { StoreService } from '../services/store';
import { Order, OrderStatus } from '../types';
import { InvoiceModal } from '../components/InvoiceModal';

interface TrackOrderPageProps {
  initialOrderNumber?: string;
  onNavigate: (view: string, param?: string) => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'Pending', label: 'Order Placed', desc: 'Order received into KHAN GADGET BD system' },
  { status: 'Confirmed', label: 'Confirmed', desc: 'Items and gadget quality verified at warehouse' },
  { status: 'Processing', label: 'Packed & Dispatched', desc: 'Sealed with tamper-proof security package' },
  { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Courier rider dispatched to your address' },
  { status: 'Delivered', label: 'Delivered', desc: 'Received & inspected by customer' }
];

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderNumber = '', onNavigate }) => {
  const [searchInput, setSearchInput] = useState(initialOrderNumber);
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    if (initialOrderNumber) {
      handleSearch(initialOrderNumber);
    } else {
      // Default to the latest order in the system for instant testing!
      const orders = StoreService.getOrders();
      if (orders.length > 0) {
        setOrder(orders[0]);
        setSearchInput(orders[0].orderNumber);
        setHasSearched(true);
      }
    }
  }, [initialOrderNumber]);

  const handleSearch = (queryToSearch?: string) => {
    const q = (queryToSearch || searchInput).trim();
    if (!q) return;

    setHasSearched(true);
    const found = StoreService.getOrderById(q) || 
      StoreService.getOrders().find((o) => (o.orderNumber && o.orderNumber.includes(q)) || (o.phone && o.phone.includes(q)));
    setOrder(found || null);
  };

  const getStepIndex = (status: OrderStatus): number => {
    const map: Record<OrderStatus, number> = {
      'Pending': 0,
      'Confirmed': 1,
      'Processing': 2,
      'Packed': 2,
      'Shipped': 3,
      'Out for Delivery': 3,
      'Delivered': 4,
      'Cancelled': -1
    };
    return map[status] ?? 0;
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Search Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Track Your Order (অর্ডার ট্র্যাকিং)
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Enter your KHAN GADGET Order ID (e.g. <strong>KGBD-2025-001</strong>) or your 11-digit mobile number.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="max-w-md mx-auto flex gap-2"
        >
          <div className="relative flex-1">
            <input
              id="track-order-search-input"
              type="text"
              placeholder="FCBD-2025-XXX or 017XXXXXXXX"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3 py-3 text-xs text-slate-900 uppercase font-mono font-bold focus:outline-hidden focus:border-emerald-600 shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            id="track-order-submit-btn"
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-colors shadow-xs"
          >
            Track
          </button>
        </form>
      </div>

      {/* Results Box */}
      {hasSearched && !order && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Order not found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No order was found matching "{searchInput}". Please double check your order number or phone number.
          </p>
        </div>
      )}

      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8">
          {/* Order Meta Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Order Reference</span>
              <h2 className="text-xl font-black text-slate-900 font-mono mt-0.5">{order.orderNumber}</h2>
              <span className="text-xs text-slate-500 block mt-0.5">
                Placed on: {new Date(order.orderDate).toLocaleString('en-GB')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-xl border ${
                order.orderStatus === 'delivered'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : order.orderStatus === 'cancelled'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {order.orderStatus.replace('_', ' ')}
              </span>

              <button
                onClick={() => setIsInvoiceOpen(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Invoice</span>
              </button>
            </div>
          </div>

          {/* Stepper Timeline */}
          {order.orderStatus !== 'cancelled' ? (
            <div className="py-2">
              <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-2">
                {/* Connecting Bar (Desktop) */}
                <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-slate-100 z-0">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${(currentStepIdx / (ORDER_STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                {ORDER_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.status} className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center sm:w-28">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 shadow-xs ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>

                      <div>
                        <h4 className={`text-xs font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.label}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 max-w-[130px] hidden sm:block">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs">
              This order has been cancelled. For refunds or reordering, please call 01700-373741.
            </div>
          )}

          {/* Delivery & Rider Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Destination</span>
              <p className="font-bold text-slate-900">{order.customerName}</p>
              <p className="text-slate-600">{order.address.fullAddress}, {order.address.area}</p>
              <p className="text-slate-500">{order.address.division} • Contact: {order.phone}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Delivery Slot & Speed</span>
              <p className="font-bold text-emerald-800">
                {order.deliveryOption === 'express' ? '2-Hour Express Delivery' : 'Standard Scheduled Slot'}
              </p>
              <p className="text-slate-600 mt-0.5">
                Payment: <strong className="uppercase">{order.paymentMethod}</strong> ({order.paymentStatus})
              </p>
              <p className="text-slate-500 mt-0.5">Amount: <strong>৳{order.total}</strong></p>
            </div>
          </div>

          {/* Ordered Products Overview */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Items in this Package ({order.items.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-[11px] text-slate-400">{item.unit} × {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">৳{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        order={order}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};
