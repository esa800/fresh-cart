import React, { useState } from 'react';
import { 
  Tag, Plus, Trash2, CheckCircle2, Clock, 
  Calendar, Percent, DollarSign, X, AlertCircle
} from 'lucide-react';
import { Coupon } from '../../../types';

interface CouponsTabProps {
  coupons: Coupon[];
  onSaveCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (couponId: string) => void;
  onToggleCouponActive: (couponId: string) => void;
}

export const CouponsTab: React.FC<CouponsTabProps> = ({
  coupons,
  onSaveCoupon,
  onDeleteCoupon,
  onToggleCouponActive
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(500);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [description, setDescription] = useState('বিশেষ অফার ভাউচার কোড');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newCoupon: Coupon = {
      id: `cpn-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      expiryDate,
      isActive: true,
      description
    };

    onSaveCoupon(newCoupon);
    setCode('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            <span>ভাউচার ও ডিসকাউন্ট কুপন (Vouchers & Coupons)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            প্রচারমূলক প্রোমোকোড তৈরি করুন, ডিসকাউন্ট ও মেয়াদ নিয়ন্ত্রণ করুন
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন কুপন কোড তৈরি করুন (Create Voucher)</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <div 
            key={coupon.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              coupon.isActive ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50 border-slate-200/60 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm font-black tracking-wider px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl">
                  {coupon.code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {coupon.isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                </span>
              </div>

              <div className="my-2">
                <div className="text-xl font-black text-slate-900">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}% ছাড়` : `৳${coupon.discountValue} ছাড়`}
                </div>
                <p className="text-xs text-slate-500 mt-1">{coupon.description}</p>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>সর্বনিম্ন অর্ডার খরচ:</span>
                  <strong className="text-slate-800">৳{coupon.minOrderAmount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>মেয়াদ উত্তীর্ণের তারিখ:</span>
                  <strong className="text-slate-800">{coupon.expiryDate}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onToggleCouponActive(coupon.id)}
                className={`text-xs font-bold hover:underline ${
                  coupon.isActive ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {coupon.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
              </button>

              <button
                onClick={() => {
                  if (confirm(`আপনি কি "${coupon.code}" ভাউচারটি মুছে ফেলতে চান?`)) {
                    onDeleteCoupon(coupon.id);
                  }
                }}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden my-6">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <span>নতুন প্রোমো ভাউচার তৈরি করুন</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ভাউচার কোড (Promo Code) *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="যেমন: EID50, FRESH20, SPECIAL100"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:border-emerald-600 focus:outline-hidden uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ডিসকাউন্ট ধরণ
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-hidden"
                  >
                    <option value="percentage">শতকরা (%)</option>
                    <option value="fixed">ফিক্সড টাকা (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পরিমাণ ({discountType === 'percentage' ? '%' : '৳'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সর্বনিম্ন অর্ডার (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মেয়াদ শেষ
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিবরণ (Description)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="যেমন: সকল অর্ডারে ১০% অতিরিক্ত ছাড়"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  ভাউচার সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
