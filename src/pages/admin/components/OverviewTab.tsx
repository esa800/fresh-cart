import React from 'react';
import { 
  TrendingUp, Users, Clock, PackageCheck, AlertTriangle, 
  ArrowUpRight, Phone, MessageSquare, Printer, CheckCircle,
  ShoppingBag, Eye, RefreshCw, ChevronRight, PlusCircle
} from 'lucide-react';
import { Order, Product, OrderStatus } from '../../../types';
import { StoreService } from '../../../services/store';

interface OverviewTabProps {
  orders: Order[];
  products: Product[];
  onSelectOrder: (order: Order) => void;
  onPrintInvoice: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onQuickRestock: (productId: string, amount: number) => void;
  onNavigateTab: (tab: 'products' | 'orders' | 'analysis') => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  orders,
  products,
  onSelectOrder,
  onPrintInvoice,
  onUpdateOrderStatus,
  onQuickRestock,
  onNavigateTab
}) => {
  const visitorStats = StoreService.getVisitorStats();

  // 1. Strictly Delivered Revenue
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered');
  const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);

  // 2. Pending & Processing
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed');
  const processingOrders = orders.filter((o) => o.orderStatus === 'Processing');
  const shippedOrders = orders.filter((o) => o.orderStatus === 'Shipped');

  // 3. Low Stock Items (stock <= 5 or threshold)
  const lowStockItems = products.filter(
    (p) => p.stockQuantity <= (p.lowStockThreshold || 5)
  );

  // Recent 6 Orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 7);

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString('en-BD')}`;

  const getCleanPhone = (phone: string) => {
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>ড্যাশবোর্ড ওভারভিউ ও কী-পারফরম্যান্স (Overview & KPIs)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            রিয়েলটাইম বিক্রয়, ভিজিটর ট্র্যাকিং ও অর্ডার ম্যানেজমেন্ট মেম্বারশিপ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('analysis')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>ডিটেইলড অ্যানালিটিক্স দেখুন ➜</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Delivered Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              আদায়কৃত মোট বিক্রয় (Delivered)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-700 tracking-tight">
              {formatCurrency(deliveredRevenue)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>{deliveredOrders.length} টি সফলভাবে ডেলিভার্ড অর্ডার</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Delivered Revenue Only</span>
            <span className="text-emerald-700 font-semibold">100% Verified</span>
          </div>
        </div>

        {/* 2. Visitor Counter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              মোট ভিজিটর (Visitor Counter)
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{visitorStats.totalViews.toLocaleString()}</span>
              <span className="text-xs font-semibold text-slate-500">পেজভিউ</span>
            </h3>
            <p className="text-[11px] text-indigo-700 font-semibold mt-1 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{visitorStats.uniqueVisitors.toLocaleString()} জন ইউনিক ভিজিটর</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>রিয়েলটাইম ট্র্যাকিং সক্রিয়</span>
            <span className="text-indigo-600 font-bold">Live</span>
          </div>
        </div>

        {/* 3. Pending & Processing Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              পেন্ডিং ও প্রসেসিং অর্ডার
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <div>
              <h3 className="text-2xl font-black text-amber-600 tracking-tight">
                {pendingOrders.length}
              </h3>
              <span className="text-[11px] font-bold text-slate-500">যাচাইয়ের অপেক্ষায়</span>
            </div>
            <span className="text-slate-300 text-lg">/</span>
            <div>
              <h3 className="text-2xl font-black text-blue-600 tracking-tight">
                {processingOrders.length}
              </h3>
              <span className="text-[11px] font-bold text-slate-500">প্রসেসিং হচ্ছে</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">কুরিয়ারে আছে: {shippedOrders.length} টি</span>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-amber-700 font-bold hover:underline"
            >
              অর্ডার লিস্ট ➜
            </button>
          </div>
        </div>

        {/* 4. Low Stock Alerts */}
        <div className={`p-5 rounded-2xl border shadow-xs relative overflow-hidden transition-colors ${
          lowStockItems.length > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              কম স্টক সতর্কতা (Low Stock)
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              lowStockItems.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-black tracking-tight ${
              lowStockItems.length > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {lowStockItems.length} টি পণ্য
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {lowStockItems.length > 0 
                ? 'দ্রুত স্টক রিফিল করা প্রয়োজন' 
                : 'সব পণ্যের পর্যাপ্ত স্টক রয়েছে'}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">থ্রেশহোল্ড: ≤৫ টি</span>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-rose-700 font-bold hover:underline"
            >
              স্টক ম্যানেজ ➜
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Alert List & Quick Order Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>সাম্প্রতিক অর্ডারসমূহ (Recent Orders)</span>
              </h3>
              <p className="text-xs text-slate-500">
                তাৎক্ষণিক স্ট্যাটাস পরিবর্তন এবং সরাসরি গ্রাহকের সাথে যোগাযোগ
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>সকল অর্ডার দেখুন ({orders.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">অর্ডার আইডি</th>
                  <th className="py-3 px-4">গ্রাহক ও ফোন</th>
                  <th className="py-3 px-4 text-right">মোট টাকা</th>
                  <th className="py-3 px-4">বর্তমান স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-center">কুইক অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => {
                  const cleanPhone = getCleanPhone(order.phone);
                  const whatsappMsg = encodeURIComponent(
                    `Hello ${order.customerName}, your FreshCart BD order #${order.orderNumber} is received. Total: ৳${order.total}. Status: ${order.orderStatus}. Thank you!`
                  );

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="hover:text-emerald-700 hover:underline"
                        >
                          {order.orderNumber}
                        </button>
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">
                          {new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{order.customerName}</p>
                        <p className="text-[11px] text-slate-500">{order.phone}</p>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-black text-slate-900">৳{order.total}</span>
                        <span className={`block text-[10px] font-bold ${
                          order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
                        </span>
                      </td>

                      {/* 1-Click Status Dropdown */}
                      <td className="py-3 px-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-hidden cursor-pointer ${
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
                          <option value="Confirmed">Confirmed (নিশ্চিত)</option>
                          <option value="Processing">Processing (প্রস্তুতি)</option>
                          <option value="Shipped">Shipped (কুরিয়ারে প্রেরিত)</option>
                          <option value="Delivered">Delivered (ডেলিভার্ড)</option>
                          <option value="Cancelled">Cancelled (বাতিল)</option>
                        </select>
                      </td>

                      {/* Direct Actions: Invoice, WhatsApp, Call */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print Invoice */}
                          <button
                            onClick={() => onPrintInvoice(order)}
                            title="ইনভয়েস / ক্যাশ মেমো প্রিন্ট করুন"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/880${cleanPhone.slice(-10)}?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="সরাসরি হোয়াটসঅ্যাপ মেসেজ পাঠান"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {/* Direct Call */}
                          <a
                            href={`tel:${order.phone}`}
                            title="সরাসরি কল দিন"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Low Stock Alerts Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>কম স্টক অ্যালার্ট ({lowStockItems.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500">স্টক শেষ হওয়ার পূর্বে দ্রুত রিফিল করুন</p>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-[11px] font-bold text-emerald-700 hover:underline"
            >
              সব দেখুন
            </button>
          </div>

          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">আলহামদুলিল্লাহ! পর্যাপ্ত স্টক রয়েছে</p>
                <p className="text-[11px]">কোনো পণ্যের স্টক ৫ বা তার নিচে নেই</p>
              </div>
            ) : (
              lowStockItems.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={item.images[0]} 
                      alt={item.name} 
                      className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-rose-600 font-bold">
                        অবশিষ্ট: {item.stockQuantity} {item.unit}
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Quick Restock */}
                  <button
                    onClick={() => onQuickRestock(item.id, 15)}
                    className="shrink-0 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                    title="+15 টি স্টক যোগ করুন"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>+১৫ রিফিল</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Quick Tip */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-[11px] text-amber-900">
            <p className="font-bold mb-0.5">💡 দারাজ প্র্যাকটিস টিপ:</p>
            <p className="text-slate-600">
              হট সেলিং পণ্যের স্টক ফুরিয়ে গেলে স্বয়ংক্রিয়ভাবে Out of Stock ব্যাজ প্রদর্শিত হয় যাতে কাস্টমার অর্ডার আটকে না থাকে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
