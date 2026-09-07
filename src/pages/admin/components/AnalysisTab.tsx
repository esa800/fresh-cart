import React from 'react';
import { 
  TrendingUp, Truck, CreditCard, Award, ArrowUpRight, 
  CheckCircle2, Clock, AlertCircle, BarChart3, PieChart
} from 'lucide-react';
import { Order, Product } from '../../../types';

interface AnalysisTabProps {
  orders: Order[];
  products: Product[];
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({ orders, products }) => {
  const totalOrdersCount = orders.length;

  // 1. Sales Funnel Calculation
  const funnelStages = [
    {
      key: 'Pending',
      label: '১. অর্ডার প্রাপ্তি (Pending)',
      count: orders.filter((o) => o.orderStatus === 'Pending').length,
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      description: 'গ্রাহক অর্ডার প্লেস করেছেন, ফোন কলের মাধ্যমে নিশ্চিত হওয়ার অপেক্ষায়'
    },
    {
      key: 'Confirmed',
      label: '২. নিশ্চিত অর্ডার (Confirmed)',
      count: orders.filter((o) => o.orderStatus === 'Confirmed').length,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      description: 'অর্ডার ভেরিফাই সম্পন্ন, ওয়্যারহাউসে প্যাকেজিং চলছে'
    },
    {
      key: 'Processing',
      label: '৩. প্যাকেজিং সম্পন্ন (Processing)',
      count: orders.filter((o) => o.orderStatus === 'Processing').length,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      description: 'পার্সেল রেডি, কুরিয়ার পিকআপের জন্য প্রস্তুত'
    },
    {
      key: 'Shipped',
      label: '৪. কুরিয়ারে প্রেরিত (Shipped)',
      count: orders.filter((o) => o.orderStatus === 'Shipped').length,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      description: 'কুরিয়ার হাব থেকে গ্রাহকের ঠিকানার পথে চলমান'
    },
    {
      key: 'Delivered',
      label: '৫. সফল ডেলিভারি (Delivered)',
      count: orders.filter((o) => o.orderStatus === 'Delivered').length,
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      description: 'গ্রাহক পার্সেল গ্রহণ করেছেন ও মূল্য পরিশোধ সম্পন্ন'
    },
    {
      key: 'Cancelled',
      label: '৬. বাতিল / রিটার্ন (Cancelled)',
      count: orders.filter((o) => o.orderStatus === 'Cancelled').length,
      color: 'bg-rose-500',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      description: 'গ্রাহক কর্তৃক বা ঠিকানায় পাওয়া না যাওয়ায় অর্ডার বাতিল'
    }
  ];

  // 2. Bangladeshi Courier Report
  // Couriers: Steadfast, Pathao, RedX, Sundarban
  const couriersList = [
    { name: 'Steadfast', fullName: 'Steadfast Courier', logoBg: 'bg-rose-600' },
    { name: 'Pathao', fullName: 'Pathao Courier', logoBg: 'bg-red-500' },
    { name: 'RedX', fullName: 'RedX Logistics', logoBg: 'bg-amber-600' },
    { name: 'Sundarban', fullName: 'Sundarban Courier', logoBg: 'bg-emerald-700' }
  ];

  const courierStats = couriersList.map((c) => {
    const courierOrders = orders.filter(
      (o) => o.courierService && o.courierService.toLowerCase().includes(c.name.toLowerCase())
    );
    const deliveredCount = courierOrders.filter((o) => o.orderStatus === 'Delivered').length;
    const inTransitCount = courierOrders.filter((o) => o.orderStatus === 'Shipped').length;
    const rate = courierOrders.length > 0 ? Math.round((deliveredCount / courierOrders.length) * 100) : 0;
    const codTotal = courierOrders.reduce((sum, o) => sum + o.total, 0);

    return {
      ...c,
      totalParcels: courierOrders.length,
      deliveredCount,
      inTransitCount,
      deliveryRate: rate,
      codTotal
    };
  });

  // 3. Payment Method Statistics
  const paymentMethods = [
    {
      id: 'cod',
      name: 'ক্যাশ অন ডেলিভারি (COD)',
      orders: orders.filter((o) => o.paymentMethod === 'cod'),
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'bkash',
      name: 'বিকাশ পেমেন্ট (bKash)',
      orders: orders.filter((o) => o.paymentMethod === 'bkash'),
      badgeColor: 'bg-pink-100 text-pink-800'
    },
    {
      id: 'nagad',
      name: 'নগদ পেমেন্ট (Nagad)',
      orders: orders.filter((o) => o.paymentMethod === 'nagad'),
      badgeColor: 'bg-orange-100 text-orange-800'
    }
  ];

  // 4. Top Selling Products
  // Count how many times each product is ordered
  const productSalesMap: Record<string, { product: Product; quantitySold: number; totalRevenue: number }> = {};
  
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        const p = products.find((prod) => prod.id === item.productId);
        if (p) {
          productSalesMap[item.productId] = {
            product: p,
            quantitySold: 0,
            totalRevenue: 0
          };
        }
      }
      if (productSalesMap[item.productId]) {
        productSalesMap[item.productId].quantitySold += item.quantity;
        productSalesMap[item.productId].totalRevenue += item.total;
      }
    });
  });

  const topSellingList = Object.values(productSalesMap)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);

  const formatCurrency = (val: number) => `৳${val.toLocaleString('en-BD')}`;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>বিক্রয় ও কুরিয়ার বিশ্লেষণ (Analysis & Reports)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          সেলস ফানেল ট্র্যাকিং, কুরিয়ার পারফরম্যান্স এবং পেমেন্ট মেথড রিপোর্ট
        </p>
      </div>

      {/* 1. Sales Funnel Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>সেলস ফানেল ট্র্যাকার (Sales Funnel Analysis)</span>
            </h3>
            <p className="text-xs text-slate-500">
              অর্ডার প্রাপ্তি থেকে ডেলিভারি পর্যন্ত গ্রাহকের রূপান্তর হার (Conversion Journey)
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            সর্বমোট {totalOrdersCount} টি অর্ডার
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {funnelStages.map((stage) => {
            const percentage = totalOrdersCount > 0 
              ? Math.round((stage.count / totalOrdersCount) * 100) 
              : 0;

            return (
              <div 
                key={stage.key} 
                className={`p-4 rounded-2xl border border-slate-200/90 ${stage.bgColor} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-extrabold ${stage.textColor}`}>
                      {stage.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/80 rounded-full h-2 mb-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="text-2xl font-black text-slate-900">
                    {stage.count} <span className="text-xs font-semibold text-slate-500">টি অর্ডার</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-200/60 leading-tight">
                  {stage.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Bangladeshi Courier Report */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>দেশীয় কুরিয়ার রিপোর্ট (Bangladeshi Courier Performance)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Steadfast, Pathao, RedX ও Sundarban কুরিয়ারের পার্সেল ও ডেলিভারি সাকসেস রেট
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courierStats.map((courier) => (
            <div 
              key={courier.name}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${courier.logoBg}`} />
                    <h4 className="font-black text-slate-900 text-sm">{courier.fullName}</h4>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {courier.deliveryRate}% Success
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">মোট পার্সেল</span>
                    <span className="text-base font-black text-slate-800">{courier.totalParcels}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">ডেলিভার্ড</span>
                    <span className="text-base font-black text-emerald-700">{courier.deliveredCount}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span>চলমান (In Transit):</span>
                    <strong className="text-slate-800">{courier.inTransitCount} টি</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>মোট COD মূল্য:</span>
                    <strong className="text-emerald-800">{formatCurrency(courier.codTotal)}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>API Status</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 & 4. Grid: Payment Method Stats & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>পেমেন্ট মেথড পরিসংখ্যান (Payment Method Stats)</span>
            </h3>
            <p className="text-xs text-slate-500">
              ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ পেমেন্টের মোট বিক্রয়
            </p>
          </div>

          <div className="space-y-3">
            {paymentMethods.map((pm) => {
              const count = pm.orders.length;
              const totalAmount = pm.orders.reduce((sum, o) => sum + o.total, 0);
              const percentage = totalOrdersCount > 0 
                ? Math.round((count / totalOrdersCount) * 100) 
                : 0;

              return (
                <div 
                  key={pm.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs sm:text-sm">{pm.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {count} টি অর্ডার ({percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">আদায়কৃত ভলিউম:</span>
                    <span className="font-black text-slate-900">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>টপ সেলিং প্রোডাক্টস (Top Selling Products)</span>
              </h3>
              <p className="text-xs text-slate-500">সর্বোচ্চ বিক্রিত পণ্য ও রেভিনিউ তালিকা</p>
            </div>
          </div>

          <div className="space-y-3">
            {topSellingList.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">এখনো পর্যাপ্ত সেলস ডাটা নেই</p>
            ) : (
              topSellingList.map((item, index) => (
                <div 
                  key={item.product.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      index === 0 ? 'bg-amber-400 text-slate-950 shadow-xs' :
                      index === 1 ? 'bg-slate-300 text-slate-800' :
                      index === 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      #{index + 1}
                    </span>

                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name}
                      className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-200"
                      referrerPolicy="no-referrer"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-[11px] text-slate-500">{item.product.category}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-700 block">
                      {formatCurrency(item.totalRevenue)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {item.quantitySold} ইউনিট বিক্রিত
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
