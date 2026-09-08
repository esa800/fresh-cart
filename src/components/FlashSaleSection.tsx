import React, { useState, useEffect } from 'react';
import { Zap, Clock, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FlashSaleSectionProps {
  products: Product[];
  onNavigate: (view: string, param?: string) => void;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({ products, onNavigate }) => {
  // 6 hour rotating countdown
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 6, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = products.filter((p) => p.discountPercentage >= 9).slice(0, 4);

  if (flashProducts.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-[#1c1917] via-[#2a0e02] to-[#090d16] rounded-3xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#f85606] text-white flex items-center justify-center font-black shadow-lg shadow-orange-500/30">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Flash Sale (সীমিত সময়ের ধামাকা অফার)
              </h2>
              <span className="bg-[#ff4600] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                Mega Deals
              </span>
            </div>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Daily flash discounts on authentic smartwatches, earbuds & tech accessories.
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mr-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Ends in:</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono font-black text-xs">
            <div className="bg-white/15 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-center min-w-[34px]">
              <span className="text-sm text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="block text-[8px] text-amber-300 uppercase">Hrs</span>
            </div>
            <span className="text-amber-400 font-bold">:</span>
            <div className="bg-white/15 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-center min-w-[34px]">
              <span className="text-sm text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="block text-[8px] text-amber-300 uppercase">Min</span>
            </div>
            <span className="text-amber-400 font-bold">:</span>
            <div className="bg-white/15 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-center min-w-[34px]">
              <span className="text-sm text-amber-300">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="block text-[8px] text-amber-300 uppercase">Sec</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flash products grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-slate-900">
        {flashProducts.map((product) => (
          <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
        ))}
      </div>

      {/* Footer CTA */}
      <div className="relative z-10 mt-6 pt-4 text-center">
        <button
          onClick={() => onNavigate('shop', 'filter=flash')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition-colors"
        >
          <span>View all flash deals & promotions</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
