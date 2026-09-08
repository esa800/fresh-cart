import React, { useState } from 'react';
import { 
  ShoppingBag, Search, Filter, Printer, Phone, 
  MessageSquare, Truck, CheckCircle2, Clock, AlertCircle, 
  ChevronDown, MapPin, Eye, ExternalLink, ShieldCheck
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../../types';

interface OrdersTabProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus) => void;
  onAssignCourier: (orderId: string, courierService: string, trackingId: string) => void;
  onPrintInvoice: (order: Order) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  onUpdateOrderStatus,
  onAssignCourier,
  onPrintInvoice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courierFilter, setCourierFilter] = useState<string>('all');

  // Selected Order for Courier Modal / Assignment
  const [courierModalOrder, setCourierModalOrder] = useState<Order | null>(null);
  const [selectedCourier, setSelectedCourier] = useState('Steadfast');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Selected Order Details modal
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);

  const openCourierModal = (order: Order) => {
    setCourierModalOrder(order);
    setSelectedCourier(order.courierService || 'Steadfast');
    setTrackingNumber(order.courierTrackingId || `ST-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleSaveCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierModalOrder) return;
    onAssignCourier(courierModalOrder.id, selectedCourier, trackingNumber.trim());
    setCourierModalOrder(null);
  };

  const getCleanPhone = (phone: string) => {
    return phone.replace(/[^0-9]/g, '');
  };

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      (order.courierTrackingId && order.courierTrackingId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    const matchesCourier = courierFilter === 'all' || 
      (order.courierService && order.courierService.toLowerCase().includes(courierFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesCourier;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <span>অর্ডার ও কুরিয়ার হ্যান্ডলিং (Orders & Courier Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ১-ক্লিকে স্ট্যাটাস আপডেট, কুরিয়ার ট্র্যাকিং অ্যাসাইন, ইনভয়েস প্রিন্ট ও হোয়াটসঅ্যাপ মেসেজিং
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs self-start sm:self-auto">
          মোট অর্ডার: <span className="text-emerald-700">{orders.length} টি</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="অর্ডার #, গ্রাহকের নাম, ফোন বা ট্র্যাকিং আইডি..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">সকল স্ট্যাটাস ({orders.length})</option>
              <option value="Pending">Pending (অপেক্ষমাণ)</option>
              <option value="Confirmed">Confirmed (যাচাইকৃত)</option>
              <option value="Processing">Processing (প্রস্তুতি)</option>
              <option value="Shipped">Shipped (কুরিয়ারে প্রেরিত)</option>
              <option value="Delivered">Delivered (সফল ডেলিভারি)</option>
              <option value="Cancelled">Cancelled (বাতিলকৃত)</option>
            </select>
          </div>

          {/* Courier Filter */}
          <div>
            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">সকল কুরিয়ার পার্টনার</option>
              <option value="steadfast">Steadfast Courier</option>
              <option value="pathao">Pathao Courier</option>
              <option value="redx">RedX Logistics</option>
              <option value="sundarban">Sundarban Courier</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">অর্ডার বিবরণী</th>
                <th className="py-3 px-4">গ্রাহক ও ডেলিভারি ঠিকানা</th>
                <th className="py-3 px-4">অর্ডারকৃত আইটেম</th>
                <th className="py-3 px-4 text-right">টাকা ও পেমেন্ট</th>
                <th className="py-3 px-4">কুরিয়ার ট্র্যাকিং</th>
                <th className="py-3 px-4">১-ক্লিক স্ট্যাটাস</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    কোনো অর্ডার পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const cleanPhone = getCleanPhone(order.phone);
                  const whatsappMsg = encodeURIComponent(
                    `আসসালামু আলাইকুম ${order.customerName}, KHAN GADGET BD থেকে আপনার অর্ডার #${order.orderNumber} সংক্রান্ত আপডেট। মোট: ৳${order.total}। স্ট্যাটাস: ${order.orderStatus}${order.courierTrackingId ? ` (কুরিয়ার ট্র্যাকিং: ${order.courierTrackingId})` : ''}। কোনো প্রয়োজনে আমাদের জানান। ধন্যবাদ!`
                  );

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order Info */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setDetailsOrder(order)}
                          className="font-mono font-bold text-slate-900 hover:text-emerald-700 hover:underline block"
                        >
                          {order.orderNumber}
                        </button>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="inline-block mt-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {order.deliveryOption === 'express' ? '⚡ 2-Hour Express' : 'Standard'}
                        </span>
                      </td>

                      {/* Customer & Address */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{order.customerName}</p>
                        <p className="text-[11px] text-slate-500">{order.phone}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[170px] mt-0.5" title={order.address.fullAddress}>
                          <MapPin className="w-2.5 h-2.5 inline mr-0.5 text-slate-400" />
                          {order.address.area}, {order.address.district}
                        </p>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <img
                              key={idx}
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                              title={`${item.name} (${item.quantity} ${item.unit})`}
                              referrerPolicy="no-referrer"
                            />
                          ))}
                          {order.items.length > 2 && (
                            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 border border-slate-200">
                              +{order.items.length - 2}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-600 block mt-1 font-medium">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} টি আইটেম
                        </span>
                      </td>

                      {/* Amount & Payment */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-black text-slate-900 text-sm block">৳{order.total}</span>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                          order.paymentStatus === 'paid' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
                        </span>
                      </td>

                      {/* Courier Tracking */}
                      <td className="py-3 px-4">
                        {order.courierService ? (
                          <div className="space-y-0.5">
                            <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-bold text-[10px]">
                              {order.courierService}
                            </span>
                            {order.courierTrackingId ? (
                              <p className="font-mono text-[11px] font-bold text-emerald-700">
                                #{order.courierTrackingId}
                              </p>
                            ) : null}
                            <button
                              onClick={() => openCourierModal(order)}
                              className="text-[10px] text-slate-500 hover:text-emerald-700 underline block"
                            >
                              পরিবর্তন করুন
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openCourierModal(order)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Truck className="w-3 h-3 text-slate-500" />
                            <span>কুরিয়ার দিন</span>
                          </button>
                        )}
                      </td>

                      {/* 1-Click Status Dropdown */}
                      <td className="py-3 px-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => {
                            const newStatus = e.target.value as OrderStatus;
                            const paymentUpdate = newStatus === 'Delivered' ? 'paid' : undefined;
                            onUpdateOrderStatus(order.id, newStatus, paymentUpdate);
                          }}
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-hidden cursor-pointer ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.orderStatus === 'Shipped'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : order.orderStatus === 'Processing'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="Pending">Pending (অপেক্ষমাণ)</option>
                          <option value="Confirmed">Confirmed (যাচাইকৃত)</option>
                          <option value="Processing">Processing (প্রস্তুতি)</option>
                          <option value="Shipped">Shipped (কুরিয়ারে প্রেরিত)</option>
                          <option value="Delivered">Delivered (ডেলিভার্ড)</option>
                          <option value="Cancelled">Cancelled (বাতিল)</option>
                        </select>
                      </td>

                      {/* Action Buttons: Invoice, WhatsApp, Call */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print Invoice */}
                          <button
                            onClick={() => onPrintInvoice(order)}
                            title="ইনভয়েস প্রিন্ট করুন"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/880${cleanPhone.slice(-10)}?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {/* Phone Call */}
                          <a
                            href={`tel:${order.phone}`}
                            title="সরাসরি কল করুন"
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Courier Assignment Modal */}
      {courierModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden my-6">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">কুরিয়ার পার্টনার ও ট্র্যাকিং নির্ধারণ</h3>
              </div>
              <button
                onClick={() => setCourierModalOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourier} className="p-6 space-y-4">
              <div>
                <span className="text-xs text-slate-500 block">অর্ডার নাম্বার:</span>
                <strong className="text-sm font-mono text-slate-900">{courierModalOrder.orderNumber}</strong>
                <p className="text-xs text-slate-600 mt-0.5">গ্রাহক: {courierModalOrder.customerName} ({courierModalOrder.phone})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কুরিয়ার সার্ভিস নির্বাচন করুন *
                </label>
                <select
                  value={selectedCourier}
                  onChange={(e) => {
                    setSelectedCourier(e.target.value);
                    const prefix = e.target.value === 'Steadfast' ? 'ST' : e.target.value === 'Pathao' ? 'PTH' : e.target.value === 'RedX' ? 'RDX' : 'SND';
                    setTrackingNumber(`${prefix}-${Math.floor(100000 + Math.random() * 900000)}`);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
                >
                  <option value="Steadfast">Steadfast Courier (স্টেডফাস্ট)</option>
                  <option value="Pathao">Pathao Courier (পাঠাও)</option>
                  <option value="RedX">RedX Logistics (রেডএক্স)</option>
                  <option value="Sundarban">Sundarban Courier (সুন্দরবন)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কনসাইনমেন্ট ট্র্যাকিং আইডি (Consignment #) *
                </label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. ST-982341"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  গ্রাহক এই ট্র্যাকিং নম্বর দিয়ে ট্র্যাক অর্ডার পেজে লাইভ স্ট্যাটাস দেখতে পাবেন।
                </span>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCourierModalOrder(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  কুরিয়ারে অর্পণ করুন (Assign & Ship)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Quick Details Modal */}
      {detailsOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-6">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  অর্ডার বিস্তারিত: {detailsOrder.orderNumber}
                </h3>
                <span className="text-xs text-slate-500">
                  {new Date(detailsOrder.orderDate).toLocaleString('en-GB')}
                </span>
              </div>
              <button
                onClick={() => setDetailsOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <p className="font-bold text-slate-900">{detailsOrder.customerName}</p>
                <p className="text-slate-600">ফোন: {detailsOrder.phone}</p>
                <p className="text-slate-600">ঠিকানা: {detailsOrder.address.fullAddress}, {detailsOrder.address.area}, {detailsOrder.address.district}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[11px]">
                  অর্ডারকৃত পণ্য তালিকা:
                </h4>
                <div className="space-y-2 divide-y divide-slate-100">
                  {detailsOrder.items.map((it, idx) => (
                    <div key={idx} className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={it.image} alt={it.name} className="w-9 h-9 object-cover rounded-lg border border-slate-200" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-slate-800">{it.name}</p>
                          <span className="text-slate-400 text-[10px]">{it.quantity} x ৳{it.price}</span>
                        </div>
                      </div>
                      <span className="font-black text-slate-900">৳{it.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1 text-right">
                <div className="flex justify-between text-slate-500">
                  <span>সাবটোটাল:</span>
                  <span>৳{detailsOrder.subtotal}</span>
                </div>
                {detailsOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>কুপন ছাড় ({detailsOrder.couponCode}):</span>
                    <span>-৳{detailsOrder.couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>ডেলিভারি ফি:</span>
                  <span>৳{detailsOrder.deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                  <span>সর্বমোট টাকা:</span>
                  <span className="text-emerald-700">৳{detailsOrder.total}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    const ord = detailsOrder;
                    setDetailsOrder(null);
                    onPrintInvoice(ord);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>ক্যাশ মেমো প্রিন্ট করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
