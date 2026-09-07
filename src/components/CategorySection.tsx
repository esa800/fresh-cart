import React from 'react';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import { StoreService } from '../services/store';

interface CategorySectionProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ onNavigate }) => {
  const categories = StoreService.getCategories().filter((c) => c.isActive);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Explore Marketplace
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Main Categories (প্রধান ক্যাটাগরি সমূহ)
          </h2>
        </div>
        <button
          onClick={() => onNavigate('shop')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
        >
          <span>All Categories</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            id={`category-card-${cat.slug}`}
            onClick={() => onNavigate('category-products', cat.slug)}
            className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/10 transition-all duration-300 cursor-pointer flex flex-col"
          >
            {/* Image Banner */}
            <div className="relative h-44 w-full overflow-hidden bg-slate-100">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              
              {/* Product Count Pill */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-xs">
                {cat.productCount} Products
              </div>

              {/* Title on bottom of image */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="text-lg font-black tracking-tight leading-tight flex items-center justify-between">
                  <span>{cat.name}</span>
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </h3>
                <p className="text-xs text-emerald-200 font-medium mt-0.5">
                  {cat.banglaName}
                </p>
              </div>
            </div>

            {/* Subcategories preview tags */}
            {cat.subcategories && cat.subcategories.length > 0 && (
              <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex-1 flex flex-col justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.slice(0, 3).map((sub, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-white text-slate-700 px-2 py-1 rounded-md border border-slate-200/80 group-hover:border-emerald-200 transition-colors"
                    >
                      {sub.split('(')[0].trim()}
                    </span>
                  ))}
                  {cat.subcategories.length > 3 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-1 rounded-md">
                      +{cat.subcategories.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
