import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Headphones, 
  Shirt, 
  Salad, 
  CheckCircle2, 
  TrendingUp,
  PhoneCall,
  ShieldCheck
} from 'lucide-react';
import { HeroBannerSlider } from '../components/HeroBannerSlider';
import { CategorySection } from '../components/CategorySection';
import { FlashSaleSection } from '../components/FlashSaleSection';
import { ProductCard } from '../components/ProductCard';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { TestimonialSection } from '../components/TestimonialSection';
import { StoreService, subscribeToStore } from '../services/store';
import { Product } from '../types';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenAreaModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>(() => StoreService.getProducts());

  useEffect(() => {
    const unsub = subscribeToStore(() => {
      setProducts(StoreService.getProducts());
    });
    return unsub;
  }, []);

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  
  // Products per main category
  const foodProducts = products.filter(
    (p) => p.categoryId === 'cat-food-items' || p.category === 'food-items' || p.category === 'Food Items'
  ).slice(0, 4);

  const gadgetProducts = products.filter(
    (p) => p.categoryId === 'cat-electronic-gadget' || p.category === 'electronic-gadget' || p.category === 'Electronic Gadget'
  ).slice(0, 4);

  const menProducts = products.filter(
    (p) => p.categoryId === 'cat-man-fashion' || p.category === 'man-fashion' || p.category === 'Man Fashion'
  ).slice(0, 4);

  const womenProducts = products.filter(
    (p) => p.categoryId === 'cat-women-fashion' || p.category === 'women-fashion' || p.category === 'Women Fashion'
  ).slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Carousel */}
      <HeroBannerSlider onNavigate={onNavigate} />

      {/* 2. Highlight Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-emerald-50/80 border border-emerald-200/60 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">100% Authentic</h4>
            <p className="text-[11px] text-slate-500">Pure food & official warranty</p>
          </div>
        </div>

        <div className="bg-amber-50/80 border border-amber-200/60 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Fast Nationwide Delivery</h4>
            <p className="text-[11px] text-slate-500">Dhaka & all 64 districts</p>
          </div>
        </div>

        <div className="bg-sky-50/80 border border-sky-200/60 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Curated Quality</h4>
            <p className="text-[11px] text-slate-500">Handpicked premium products</p>
          </div>
        </div>

        <div className="bg-rose-50/80 border border-rose-200/60 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">COD, bKash & Nagad</h4>
            <p className="text-[11px] text-slate-500">Easy cash or mobile payments</p>
          </div>
        </div>
      </div>

      {/* 3. Main 4 Categories Showcase Grid */}
      <CategorySection onNavigate={onNavigate} />

      {/* 4. Flash Sale with live countdown */}
      <FlashSaleSection products={products} onNavigate={onNavigate} />

      {/* 5. Top Featured Products */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Top Customer Favorites
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Featured Items (সেরা পণ্যসমূহ)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* 6. Food Items Section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Category 01
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Food Items (খাদ্যদ্রব্য ও অর্গানিক গ্রোসারি)</span>
              <Salad className="w-5 h-5 text-emerald-600" />
            </h2>
          </div>
          <button
            onClick={() => onNavigate('category-products', 'food-items')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>View All Food Items</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {foodProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* 7. Electronic Gadget Section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block mb-1">
              Category 02
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Electronic Gadgets (স্মার্ট ইলেকট্রনিক্স ও গ্যাজেট)</span>
              <Headphones className="w-5 h-5 text-indigo-600" />
            </h2>
          </div>
          <button
            onClick={() => onNavigate('category-products', 'electronic-gadget')}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 group"
          >
            <span>View All Gadgets</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {gadgetProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Promotional Mid Banner: Gadget & Fashion Spotlight */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <span className="inline-block bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Premium Lifestyle & Smart Living
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            অরিজিনাল গ্যাজেট এবং ঐতিহ্যবাহী ফ্যাশন এক ছাদের নিচে
          </h3>
          <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">
            স্মার্ট গ্যাজেটস, আড়ং ও রিচম্যান স্টাইলের পুরুষদের ফ্যাশন এবং খাঁটি ঢাকাই জামদানি সহ সব লেটেস্ট ট্রেন্ড সংগ্রহ করুন সেরা অফারে।
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('category-products', 'electronic-gadget')}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-amber-400/20 active:scale-95"
            >
              Shop Gadgets
            </button>
            <button
              onClick={() => onNavigate('category-products', 'women-fashion')}
              className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs sm:text-sm transition-all border border-white/30"
            >
              Shop Women's Fashion
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div className="w-36 sm:w-44 h-44 sm:h-52 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80"
              alt="Electronic Gadgets"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="w-36 sm:w-44 h-44 sm:h-52 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80"
              alt="Women Fashion Jamdani"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* 8. Men's Fashion Section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
              Category 03
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Men's Fashion (পুরুষদের পোশাক ও ফ্যাশন)</span>
              <Shirt className="w-5 h-5 text-amber-600" />
            </h2>
          </div>
          <button
            onClick={() => onNavigate('category-products', 'man-fashion')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 group"
          >
            <span>View Men's Collection</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {menProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* 9. Women's Fashion Section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-1">
              Category 04
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Women's Fashion (মহিলাদের শাড়ি, থ্রি-পিস ও ফ্যাশন)</span>
              <Sparkles className="w-5 h-5 text-rose-600" />
            </h2>
          </div>
          <button
            onClick={() => onNavigate('category-products', 'women-fashion')}
            className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 group"
          >
            <span>View Women's Collection</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {womenProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* 10. Why Choose Us */}
      <WhyChooseUs />

      {/* 11. Customer Testimonials */}
      <TestimonialSection />

      {/* 12. Hotline Quick Order CTA Bar */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-emerald-800">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
            Prefer ordering by phone or WhatsApp?
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Call Our Customer Support & Order Desk
          </h3>
          <p className="text-xs text-emerald-200">
            Tell our representative your product list in Bangla or English, and we will place the order directly for you!
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <a
            href="tel:+8801700373741"
            className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>01700-373741</span>
          </a>
        </div>
      </div>
    </div>
  );
};
