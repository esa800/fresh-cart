import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  ShieldCheck,
  Star,
  Award,
  Leaf,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { StoreService, subscribeToStore } from '../services/store';
import { Product, Category } from '../types';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenAreaModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>(() => StoreService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => StoreService.getCategories());
  const [justForYouCount, setJustForYouCount] = useState(10);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeToStore(() => {
      setProducts(StoreService.getProducts());
      setCategories(StoreService.getCategories());
    });
    return unsub;
  }, []);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Top Selling Products (Best sellers or top available products)
  const topSellingFiltered = products.filter(
    (p) => p.isBestSeller || (p.tags && p.tags.includes('best_seller')) || (p.soldCount && p.soldCount > 10)
  );
  const topSellingProducts = topSellingFiltered.length >= 4 
    ? topSellingFiltered.slice(0, 4) 
    : [...topSellingFiltered, ...products.filter(p => !topSellingFiltered.some(t => t.id === p.id))].slice(0, 4);

  // All Natural Honey (Categorized dynamically)
  const honeyFiltered = products.filter(
    (p) => p.categoryId === 'honey' || p.category?.toLowerCase().includes('honey') || (p.tags && p.tags.includes('honey'))
  );
  const honeyProducts = honeyFiltered.length > 0 
    ? honeyFiltered.slice(0, 5) 
    : products.slice(0, 5);

  // Premium Dates (Categorized dynamically)
  const datesFiltered = products.filter(
    (p) => p.categoryId === 'dates' || p.category?.toLowerCase().includes('date') || (p.tags && p.tags.includes('dates'))
  );
  const datesProducts = datesFiltered.length > 0 
    ? datesFiltered.slice(0, 5) 
    : products.slice(5, 10);

  // Cooking Essentials (Oil, Ghee, Spices, Flours, Lentils)
  const cookingFiltered = products.filter(
    (p) => p.categoryId === 'oil-ghee' || p.categoryId === 'spices' || p.categoryId === 'flours-lentils' || (p.tags && p.tags.includes('cooking'))
  );
  const cookingProducts = cookingFiltered.length > 0 
    ? cookingFiltered.slice(0, 5) 
    : products.slice(10, 15);

  // Organic Certified (Certified category or marked certified)
  const certifiedFiltered = products.filter(
    (p) => p.categoryId === 'certified' || p.isOrganicCertified || (p.tags && p.tags.includes('organic'))
  );
  const certifiedProducts = certifiedFiltered.length > 0 
    ? certifiedFiltered.slice(0, 5) 
    : products.slice(15, 20);

  // Just For You
  const justForYouProducts = products.slice(0, justForYouCount);

  // Brands list from screenshot
  const brandsList = [
    {
      id: 'glarvest',
      name: 'GLARVEST',
      tagline: 'Nourishing Better Lives',
      color: 'from-emerald-700 to-teal-800',
      icon: <Leaf className="w-8 h-8 text-emerald-300" />
    },
    {
      id: 'khejuri',
      name: 'Khejuri',
      tagline: 'Authentic Madinah Dates',
      color: 'from-amber-800 to-yellow-900',
      icon: <Award className="w-8 h-8 text-amber-300" />
    },
    {
      id: 'shosti',
      name: 'স্বস্তি (Shosti)',
      tagline: 'খাবারে স্বাদ এবং প্রশান্তি',
      color: 'from-orange-700 to-amber-800',
      icon: <Sparkles className="w-8 h-8 text-orange-200" />
    },
    {
      id: 'honeyraj',
      name: 'হানিরাজ (Honeyraj)',
      tagline: '১০০% খাঁটি প্রাকৃতিক মধু',
      color: 'from-amber-600 to-orange-700',
      icon: <Flame className="w-8 h-8 text-amber-200" />
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. Hero Section (Left: GLARVEST landscape banner, Right: African Organic Wild Honey card) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Main Carousel Banner */}
        <div className="lg:col-span-8 rounded-3xl overflow-hidden shadow-lg relative bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white min-h-[340px] sm:min-h-[400px] flex flex-col justify-between p-6 sm:p-10">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80"
              alt="GLARVEST Organic Landscape"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="relative z-10 max-w-lg space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-emerald-800/80 backdrop-blur-xs text-amber-300 border border-emerald-600/50 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5 fill-amber-300" />
              <span>KHAN store & GLARVEST</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              Nourishing <br />
              <span className="text-amber-300">Better Lives</span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed max-w-md">
              প্রতিটি পরিবারের জন্য ১০০% নিরাপদ, ভেজালমুক্ত এবং সার্টিফাইড অর্গানিক খাদ্যসামগ্রী। খাঁটি ঘি, সরিষার তেল, প্রাকৃতিক মধু ও প্রিমিয়াম খেজুর।
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between pt-6">
            <button
              onClick={() => onNavigate('shop')}
              className="px-6 py-3 bg-[#f85606] hover:bg-[#e04a00] text-white font-black rounded-full text-xs sm:text-sm transition-all shadow-lg shadow-orange-600/30 flex items-center gap-2 active:scale-95"
            >
              <span>পণ্যসমূহ দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Banner Dots */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-2 rounded-full bg-[#f85606]" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* Right Highlight Card: African Organic Wild Honey */}
        <div className="lg:col-span-4 rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br from-[#fef3c7] via-[#fed7aa] to-[#fde68a] p-6 sm:p-7 flex flex-col justify-between border border-amber-300 relative">
          <div>
            <span className="inline-block bg-[#f85606] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 shadow-xs">
              Special Highlight
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              স্বাদ আর পুষ্টিতে অনন্য <br />
              <span className="text-[#c2410c]">আফ্রিকান অর্গানিক ওয়াইল্ড হানি</span>
            </h3>

            <div className="mt-4 space-y-2 text-xs font-bold text-slate-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>১. ৩০০০+ ফুট উঁচুতে আফ্রিকান ওয়াইল্ড হানি</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>২. EU এবং USDA অর্গানিক সনদপ্রাপ্ত</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>৩. পুষ্টিকর উপাদান সমৃদ্ধ ও খাঁটি</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="w-24 h-24 rounded-2xl bg-white/70 p-1 border border-amber-200/80 shadow-sm flex items-center justify-center shrink-0">
              <img
                src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&auto=format&fit=crop&q=80"
                alt="African Wild Honey"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <button
              onClick={() => onNavigate('product-detail', 'african-organic-wild-honey-500g')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <span>এখনই কিনুন</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories (Circular Icons Row with Left/Right Arrows) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-center w-full">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Featured Categories
            </h2>
            <div className="w-12 h-1 bg-[#f85606] mx-auto mt-1.5 rounded-full" />
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollCategories('left')}
              className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-orange-50 text-slate-700 hover:text-[#f85606] flex items-center justify-center transition-colors shadow-2xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCategories('right')}
              className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-orange-50 text-slate-700 hover:text-[#f85606] flex items-center justify-center transition-colors shadow-2xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={categoryScrollRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-3 px-1"
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('category-products', cat.slug)}
              className="flex flex-col items-center gap-2 group cursor-pointer shrink-0 w-24 sm:w-28 text-center select-none"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white border-2 border-slate-200 group-hover:border-[#f85606] shadow-sm group-hover:shadow-md transition-all duration-300 flex items-center justify-center overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#f85606] transition-colors leading-tight">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Top Selling Products (4 Prominent Cards from Screenshot) */}
      <section className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Top Selling Products
          </h2>
          <div className="w-12 h-1 bg-[#f85606] mx-auto mt-1.5 rounded-full" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {topSellingProducts.map((prod) => (
            <ProductCard 
              key={prod.id} 
              product={prod} 
              onNavigate={onNavigate} 
              showBuyNow={true}
            />
          ))}
        </div>
      </section>

      {/* 4. Our Brands Section (SEE ALL ->) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Our Brands
          </h2>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-[#f85606] hover:text-[#e04a00] flex items-center gap-1 group"
          >
            <span>SEE ALL</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {brandsList.map((b) => (
            <div
              key={b.id}
              onClick={() => onNavigate('shop', `search=${encodeURIComponent(b.name)}`)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-orange-300 p-4 sm:p-5 flex flex-col items-center text-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                {b.icon}
              </div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-[#f85606] transition-colors">
                {b.name}
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {b.tagline}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. All Natural Honey Section (VIEW ALL ITEMS ->) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>All Natural Honey</span>
          </h2>
          <button
            onClick={() => onNavigate('category-products', 'honey')}
            className="text-xs font-bold text-[#f85606] hover:text-[#e04a00] flex items-center gap-1 group"
          >
            <span>VIEW ALL ITEMS</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {honeyProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* 6. Premium Dates Section (VIEW ALL ITEMS ->) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Premium Dates
          </h2>
          <button
            onClick={() => onNavigate('category-products', 'dates')}
            className="text-xs font-bold text-[#f85606] hover:text-[#e04a00] flex items-center gap-1 group"
          >
            <span>VIEW ALL ITEMS</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {datesProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* 7. Mid-Page Landscape Banner: Shosti Brand (স্বস্তি - খাবারে স্বাদ এবং প্রশান্তি) */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-6 sm:p-10 shadow-xl border border-amber-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <span className="inline-block bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            স্বস্তি (Shosti) Signature Line
          </span>
          <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            খাবারে স্বাদ এবং প্রশান্তি
          </h3>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            ঐতিহ্যবাহী কাঠের ঘানির খাঁটি সরিষার তেল, পাবনার গাওয়া ঘি ও বাছাইকৃত কালা ভুনা মসলা আপনার পরিবারের প্রতিদিনের রন্ধনশিল্পকে করে তুলবে নির্ভেজাল ও অতুলনীয়।
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('category-products', 'oil-ghee')}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95"
            >
              ঘি ও সরিষার তেল কিনুন
            </button>
            <button
              onClick={() => onNavigate('category-products', 'spices')}
              className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs sm:text-sm transition-all border border-white/30"
            >
              খাঁটি মসলা দেখুন
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div className="w-32 sm:w-40 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg border border-amber-500/30">
            <img
              src="https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=500&auto=format&fit=crop&q=80"
              alt="Shosti Gawa Ghee"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="w-32 sm:w-40 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg border border-amber-500/30">
            <img
              src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80"
              alt="Deshi Mustard Oil"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* 8. Cooking Essentials Section (VIEW ALL ITEMS ->) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Cooking Essentials
          </h2>
          <button
            onClick={() => onNavigate('shop', 'filter=cooking')}
            className="text-xs font-bold text-[#f85606] hover:text-[#e04a00] flex items-center gap-1 group"
          >
            <span>VIEW ALL ITEMS</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {cookingProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* 9. Organic Certified Section (VIEW ALL ITEMS ->) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Organic Certified</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </h2>
          <button
            onClick={() => onNavigate('category-products', 'certified')}
            className="text-xs font-bold text-[#f85606] hover:text-[#e04a00] flex items-center gap-1 group"
          >
            <span>VIEW ALL ITEMS</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {certifiedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* 10. Just For You Section (VIEW ALL PRODUCTS ->) with LOAD MORE button */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Just For You
          </h2>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-[#f85606] hover:text-[#e04a00] flex items-center gap-1 group"
          >
            <span>VIEW ALL PRODUCTS</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {justForYouProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
          ))}
        </div>

        {justForYouCount < products.length && (
          <div className="text-center pt-4">
            <button
              onClick={() => setJustForYouCount((prev) => Math.min(prev + 10, products.length))}
              className="px-8 py-3 bg-white hover:bg-orange-50 text-[#f85606] border-2 border-[#f85606] font-black rounded-full text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95"
            >
              LOAD MORE
            </button>
          </div>
        )}
      </section>

      {/* 11. Customer Testimonials (Matching the 3 cards in the screenshot) */}
      <section className="space-y-6 pt-6 border-t border-slate-200">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            সম্মানিত গ্রাহকদের প্রতিক্রিয়া
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            KHAN store এর ১০০% খাঁটি পণ্য ও সার্ভিসে সন্তুষ্ট গ্রাহকদের রিভিউ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Review 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                "এই অবিশ্বাসের জগতে আস্থাশীল একটি প্রতিষ্ঠান KHAN store। গাওয়া ঘি ও সরিষার তেলের ঝাঁঝ দারুণ!"
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                FT
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Fariha Akter Tumpa</h4>
                <p className="text-[11px] text-slate-400">Entrepreneur, Dhaka</p>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                "২য় বার KHAN store থেকে অর্ডার করলাম। আগের মতো এবারও দারুণ কোয়ালিটি আর দ্রুত ডেলিভারি পেয়েছি। একদম সন্তুষ্ট!"
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 text-[#f85606] font-bold flex items-center justify-center text-xs">
                AK
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Ayesha Khan</h4>
                <p className="text-[11px] text-slate-400">Banker, Gulshan</p>
              </div>
            </div>
          </div>

          {/* Review 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                "Thanks KHAN store for free Honeyraj gift. Of course, I got it for being a regular customer. সুন্দরবনের মধু অতুলনীয়।"
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                SY
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Sultana Yesmin</h4>
                <p className="text-[11px] text-slate-400">Housewife, Dhanmondi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
