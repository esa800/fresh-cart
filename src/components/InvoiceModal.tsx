import React, { useState } from 'react';
import { 
  X, Printer, CheckCircle2, ShieldCheck, Phone, Mail, 
  MapPin, Truck, Package, FileText, Tag, Copy, Sparkles,
  QrCode, AlertCircle, Calendar, Hash
} from 'lucide-react';
import { Order } from '../types';
import { StoreService } from '../services/store';

interface InvoiceModalProps {
  order: Order | null;
  isOpen?: boolean;
  onClose: () => void;
  initialMode?: 'invoice' | 'sticker' | 'challan';
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ 
  order, 
  isOpen = true, 
  onClose,
  initialMode = 'invoice' 
}) => {
  const [activeTemplate, setActiveTemplate] = useState<'invoice' | 'sticker' | 'challan'>(initialMode);
  const [copiedTracking, setCopiedTracking] = useState(false);

  if (!isOpen || !order) return null;

  const settings = StoreService.getSettings();
  const storeName = settings.storeName || 'KHAN store';
  const tagline = settings.tagline || settings.brandTagline || '১০০% খাঁটি ও নিরাপদ অর্গানিক ফুড';
  const hotline = settings.hotline || settings.phone || '01854774406';
  const email = settings.email || settings.supportEmail || 'contact@khanstore.com';
  const address = settings.address || settings.officeAddress || 'House 14, Road 4, Sector 7, Uttara, Dhaka 1230, Bangladesh';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTracking = () => {
    const text = order.courierTrackingId || order.orderNumber;
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const formattedDate = new Date(order.orderDate).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      {/* Print Specific CSS to isolate the active document and remove headers/footers */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-document-area, #print-document-area * {
            visibility: visible;
          }
          #print-document-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 12px;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden my-4 relative">
        
        {/* Top Controls & Mode Switcher (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">ডকুমেন্ট মোড:</span>
            <div className="inline-flex bg-slate-800 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTemplate('invoice')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTemplate === 'invoice' 
                    ? 'bg-[#f85606] text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>ইনভয়েস মেমো</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTemplate('sticker')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTemplate === 'sticker' 
                    ? 'bg-amber-500 text-slate-950 shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>কুরিয়ার স্টিকার লেবেল</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTemplate('challan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTemplate === 'challan' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>ডেলিভারি চালান</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-[#f85606] to-[#e04a00] hover:from-[#e04a00] hover:to-[#c83e00] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>১-ক্লিকে প্রিন্ট করুন</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Container */}
        <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-6 bg-slate-100">
          <div id="print-document-area" className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 text-slate-900 mx-auto">
            
            {/* ========================================================= */}
            {/* TEMPLATE 1: STANDARD CUSTOMER INVOICE (মেমো)              */}
            {/* ========================================================= */}
            {activeTemplate === 'invoice' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-5 border-b-2 border-slate-800 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-[#f85606] text-white flex items-center justify-center font-black text-sm">
                        KS
                      </div>
                      <div className="font-black text-2xl tracking-tight text-slate-900">
                        <span>KHAN</span> <span className="text-[#f85606]">store</span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-emerald-800 tracking-wide">{tagline}</p>
                    <p className="text-[11px] text-slate-600 leading-tight">{address}</p>
                    <p className="text-[11px] text-slate-600 font-mono">হটলাইন: {hotline} | ইমেইল: {email}</p>
                  </div>

                  <div className="sm:text-right space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="inline-block px-2.5 py-0.5 bg-slate-900 text-white rounded text-[11px] font-black uppercase tracking-wider">
                      RETAIL INVOICE / বিল মেমো
                    </div>
                    <div className="text-xs">
                      <span className="text-slate-500 font-semibold">অর্ডার নং: </span>
                      <strong className="font-mono text-sm text-slate-900">{order.orderNumber}</strong>
                    </div>
                    <div className="text-xs text-slate-600">
                      <span>তারিখ: </span>
                      <strong className="font-medium">{formattedDate}</strong>
                    </div>
                    <div className="text-xs">
                      <span className="text-slate-500 font-semibold">পেমেন্ট মেথড: </span>
                      <strong className="uppercase font-bold text-[#f85606]">
                        {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : order.paymentMethod.toUpperCase()}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Customer & Shipping Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-200">
                      <span>গ্রাহকের বিবরণ (Customer Details):</span>
                    </h4>
                    <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                    <p className="font-mono text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{order.phone}</span>
                    </p>
                    {order.email && <p className="text-slate-500">{order.email}</p>}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-200">
                      <span>ডেলিভারি ঠিকানা (Shipping Address):</span>
                    </h4>
                    <p className="text-slate-800 leading-relaxed font-medium">{order.address.fullAddress}</p>
                    <p className="text-slate-600 font-semibold">
                      {order.address.area}, {order.address.district}
                    </p>
                    {order.address.deliveryNote && (
                      <p className="text-slate-500 italic mt-1">নোট: "{order.address.deliveryNote}"</p>
                    )}
                  </div>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold text-[11px]">
                        <th className="py-2.5 px-3 border border-slate-800 rounded-l-lg">ক্র.নং</th>
                        <th className="py-2.5 px-3 border border-slate-800">পণ্যের বিবরণ (Item Name)</th>
                        <th className="py-2.5 px-3 border border-slate-800 text-center">পরিমাণ</th>
                        <th className="py-2.5 px-3 border border-slate-800 text-right">একক মূল্য</th>
                        <th className="py-2.5 px-3 border border-slate-800 text-right rounded-r-lg">মোট টাকা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {order.items.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="py-2.5 px-3 border border-slate-200 font-mono text-center text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 border border-slate-200 font-bold text-slate-900">
                            {item.name}
                            {item.unit && <span className="text-slate-500 font-normal text-[11px] ml-1">({item.unit})</span>}
                          </td>
                          <td className="py-2.5 px-3 border border-slate-200 font-bold text-center text-slate-800">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 border border-slate-200 font-mono text-right text-slate-700">
                            ৳{item.price.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 border border-slate-200 font-mono font-bold text-right text-slate-900">
                            ৳{item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                  <div className="text-xs text-slate-500 space-y-1 max-w-sm">
                    <p className="font-bold text-slate-700">শর্তাবলী ও নির্দেশিকা:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      <li>ডেলিভারিম্যানের উপস্থিতিতে পণ্যটি চেক করে রিসিভ করুন।</li>
                      <li>কোনো ভাঙা বা ত্রুটি থাকলে তাৎক্ষণিকভাবে আমাদের হটলাইনে কল করুন।</li>
                      <li>১০০% খাঁটি ও নির্ভেজাল খাদ্যের আস্থার ঠিকানা KHAN store।</li>
                    </ul>
                  </div>

                  <div className="w-full sm:w-64 space-y-1.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between text-slate-600">
                      <span>সাবটোটাল (Subtotal):</span>
                      <span className="font-mono font-bold text-slate-900">৳{order.subtotal.toLocaleString()}</span>
                    </div>
                    {order.couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>কুপন ডিসকাউন্ট:</span>
                        <span className="font-mono font-bold">-৳{order.couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>ডেলিভারি চার্জ:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {order.deliveryCharge === 0 ? 'FREE' : `৳${order.deliveryCharge.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="border-t-2 border-slate-300 pt-2 flex justify-between items-baseline font-black">
                      <span className="text-slate-900 text-sm">সর্বমোট পরিশোধযোগ্য:</span>
                      <span className="font-mono text-lg text-[#f85606]">৳{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-10 flex justify-between text-xs text-slate-600">
                  <div className="text-center">
                    <div className="w-36 border-b border-slate-400 pb-1"></div>
                    <p className="mt-1 font-semibold">গ্রাহকের স্বাক্ষর</p>
                  </div>
                  <div className="text-center">
                    <div className="w-36 border-b border-slate-400 pb-1"></div>
                    <p className="mt-1 font-semibold">অনুমোদিত স্বাক্ষরকারী</p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TEMPLATE 2: COURIER SHIPPING STICKER LABEL (স্টিকার লেবেল) */}
            {/* ========================================================= */}
            {activeTemplate === 'sticker' && (
              <div className="max-w-md mx-auto border-4 border-slate-900 rounded-2xl p-5 space-y-4 bg-white">
                {/* Sticker Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                  <div>
                    <div className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-1">
                      <span>KHAN</span>
                      <span className="text-[#f85606]">store</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-600">100% Pure & Organic Food</p>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-slate-900 text-amber-400 rounded-lg text-xs font-black uppercase">
                      {order.courierService || 'Steadfast Courier'}
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {formattedDate}
                    </p>
                  </div>
                </div>

                {/* Giant COD Amount Banner */}
                <div className="bg-slate-900 text-white rounded-xl p-3 text-center space-y-0.5 border-2 border-slate-900">
                  <span className="text-[11px] uppercase tracking-widest text-amber-300 font-bold">
                    CASH ON DELIVERY (COD AMOUNT)
                  </span>
                  <div className="font-mono text-3xl font-black text-amber-400">
                    ৳{order.total.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-300 block">
                    {order.paymentStatus === 'paid' ? '⚠️ ALREADY PAID (টাকা নেওয়া লাগবে না)' : '✓ গ্রাহকের থেকে টাকা গ্রহণ করুন'}
                  </span>
                </div>

                {/* Recipient Details Box (Large & High Contrast for Delivery Rider) */}
                <div className="border-2 border-slate-900 rounded-xl p-3.5 space-y-1.5 bg-amber-50/40">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">
                    TO / প্রাপক (গ্রাহক):
                  </span>
                  <p className="text-base font-black text-slate-900">{order.customerName}</p>
                  <p className="font-mono text-base font-black text-[#f85606] tracking-wide">
                    📞 {order.phone}
                  </p>
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    📍 {order.address.fullAddress}
                  </p>
                  <p className="text-xs font-semibold text-slate-600">
                    এলাকা: {order.address.area}, জেলা: {order.address.district}
                  </p>
                  {order.address.deliveryNote && (
                    <div className="text-[11px] bg-white p-1.5 rounded border border-amber-300 font-bold text-slate-700 mt-1">
                      বিশেষ নির্দেশনা: {order.address.deliveryNote}
                    </div>
                  )}
                </div>

                {/* Items Summary & Fragile Tag */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="border border-slate-300 rounded-xl p-2.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">পার্সেল কন্টেন্ট:</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {order.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                    </p>
                  </div>

                  <div className="border-2 border-rose-500 bg-rose-50 rounded-xl p-2.5 text-center flex flex-col justify-center items-center">
                    <span className="font-black text-rose-700 text-xs uppercase tracking-wider">
                      ⚠️ FRAGILE / কাঁচের বোতল
                    </span>
                    <span className="text-[10px] font-bold text-rose-600">হ্যান্ডেল উইথ কেয়ার</span>
                  </div>
                </div>

                {/* Sender Details */}
                <div className="border-t border-slate-300 pt-2 text-[10px] text-slate-600 flex justify-between items-center">
                  <div>
                    <strong className="text-slate-900">প্রেরক (From): </strong>
                    <span>KHAN store, উত্তরা, ঢাকা</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900">
                    হটলাইন: {hotline}
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="text-center pt-2 space-y-1">
                  <div className="h-10 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_5px,#000_5px,#000_8px,transparent_8px,transparent_10px,#000_10px,#000_14px)] mx-auto w-4/5 rounded-xs"></div>
                  <p className="font-mono text-xs font-bold text-slate-900 tracking-widest">
                    *{order.courierTrackingId || order.orderNumber}*
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TEMPLATE 3: DELIVERY CHALLAN (ডেলিভারি চালান)              */}
            {/* ========================================================= */}
            {activeTemplate === 'challan' && (
              <div className="space-y-6">
                <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">KHAN store</h2>
                    <p className="text-xs text-slate-600">{tagline}</p>
                    <p className="text-[11px] text-slate-500 font-mono">ওয়্যারহাউস ও প্যাকেজিং চালান</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-emerald-700 text-white font-black text-xs rounded-md uppercase">
                      DELIVERY CHALLAN
                    </span>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-1">চালান নং: CH-{order.orderNumber}</p>
                    <p className="text-xs text-slate-500">তারিখ: {formattedDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-700 block">কুরিয়ার ও ডিসপ্যাচ ইনফো:</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{order.courierService || 'Steadfast'}</p>
                    <p className="font-mono text-slate-600">ট্র্যাকিং আইডি: {order.courierTrackingId || 'প্রক্রিয়াধীন'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">ডেলিভারি গন্তব্য:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{order.customerName} ({order.phone})</p>
                    <p className="text-slate-600">{order.address.fullAddress}</p>
                  </div>
                </div>

                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-bold">
                      <th className="border border-slate-300 p-2 text-center w-12">নং</th>
                      <th className="border border-slate-300 p-2">পণ্য বিবরণ</th>
                      <th className="border border-slate-300 p-2 text-center w-24">পরিমাণ</th>
                      <th className="border border-slate-300 p-2 text-center w-32">প্যাকিং স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 font-semibold text-slate-900">
                          {item.name} {item.unit && `(${item.unit})`}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-bold">{item.quantity}</td>
                        <td className="border border-slate-300 p-2 text-center">
                          <span className="text-emerald-700 font-bold">✓ চেকড ও সিলড</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pt-8 grid grid-cols-3 gap-4 text-xs text-center text-slate-600">
                  <div>
                    <div className="border-b border-slate-400 pb-1"></div>
                    <p className="mt-1 font-semibold">প্যাকার / ওয়্যারহাউস</p>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 pb-1"></div>
                    <p className="mt-1 font-semibold">কুরিয়ার হ্যান্ডওভার ম্যান</p>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 pb-1"></div>
                    <p className="mt-1 font-semibold">স্টোর ম্যানেজার</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer info (Hidden in print) */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 no-print flex flex-wrap items-center justify-between gap-2 px-6">
          <div className="flex items-center gap-1 text-slate-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>প্রিন্ট বাটনে ক্লিক করলেই সরাসরি পরিষ্কার A4 / লেবেল প্রিন্ট হবে।</span>
          </div>
          <button
            type="button"
            onClick={handleCopyTracking}
            className="text-xs font-bold text-[#f85606] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedTracking ? 'ট্র্যাকিং কপি হয়েছে!' : 'অর্ডার ও ট্র্যাকিং নম্বর কপি করুন'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
