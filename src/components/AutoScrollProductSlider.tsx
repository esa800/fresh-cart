import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';

interface AutoScrollProductSliderProps {
  category: Category;
  products: Product[];
  onNavigate: (view: string, param?: string) => void;
  showBuyNow?: boolean;
}

export const AutoScrollProductSlider: React.FC<AutoScrollProductSliderProps> = ({
  category,
  products,
  onNavigate,
  showBuyNow = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll boundaries for arrow buttons
  const updateScrollBounds = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < maxScroll - 10);
  }, []);

  useEffect(() => {
    updateScrollBounds();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollBounds, { passive: true });
      window.addEventListener('resize', updateScrollBounds);
      return () => {
        el.removeEventListener('scroll', updateScrollBounds);
        window.removeEventListener('resize', updateScrollBounds);
      };
    }
  }, [updateScrollBounds, products]);

  // Smooth next/prev slide handlers like Ghorebazaar
  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    // Calculate 1 or 2 card slide distance depending on screen width
    const containerWidth = el.clientWidth;
    const scrollStep = containerWidth >= 1024 
      ? containerWidth * 0.4 // slide ~2 items on desktop
      : containerWidth * 0.75; // slide ~1-2 items on mobile/tablet

    const target = direction === 'left' ? el.scrollLeft - scrollStep : el.scrollLeft + scrollStep;
    el.scrollTo({ left: target, behavior: 'smooth' });
  };

  // Auto-advance carousel slide every 5 seconds if user is not hovering or interacting
  useEffect(() => {
    if (isHovered || isInteracting || !products || products.length <= 4) return;

    const timer = setInterval(() => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 20) return;

      if (el.scrollLeft >= maxScroll - 20) {
        // Smoothly loop back to start
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const step = el.clientWidth * 0.4;
        el.scrollTo({ left: el.scrollLeft + step, behavior: 'smooth' });
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isHovered, isInteracting, products]);

  if (!products || products.length === 0) {
    return null;
  }

  // Display name formatting (Matches the video: e.g. "All Natural Honey" for Honey category)
  const isHoney = category.slug === 'honey' || category.name.toLowerCase().includes('honey');
  const titleDisplay = isHoney ? 'All Natural Honey' : category.name;
  const subtitleDisplay = isHoney ? 'প্রাকৃতিক মধু' : category.banglaName;

  return (
    <section 
      id={`category-slider-${category.slug || category.id}`}
      className="space-y-3.5 group/section relative"
    >
      {/* Category Section Header matching Ghorebazaar video: Title on left, "VIEW ALL ITEMS >" on right */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{titleDisplay}</span>
            {subtitleDisplay && (
              <span className="text-slate-500 font-semibold text-xs sm:text-sm hidden sm:inline">
                ({subtitleDisplay})
              </span>
            )}
          </h2>
          {isHoney && (
            <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300 hidden md:inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>১০০% খাঁটি ও প্রাকৃতিক</span>
            </span>
          )}
        </div>

        <button
          id={`view-all-${category.slug || category.id}`}
          onClick={() => onNavigate('category-products', category.slug || category.id)}
          className="text-xs sm:text-sm font-black text-[#f85606] hover:text-[#d04600] flex items-center gap-1 group/btn transition-colors cursor-pointer select-none"
        >
          <span>VIEW ALL ITEMS</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Carousel Container with side arrows */}
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsInteracting(false);
        }}
      >
        {/* Left Arrow Button (Floats on the left edge, visible on desktop and tablet) */}
        <button
          type="button"
          aria-label="Previous Products"
          onClick={() => handleScroll('left')}
          className={`absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-xl border border-slate-200 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer text-slate-800 hover:text-[#f85606] ${
            canScrollLeft ? 'opacity-95 hover:opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Scrollable Track: Exact 5 cards per view on desktop, 4 on laptop, 3 on tablet, 2 on mobile */}
        <div
          ref={scrollContainerRef}
          onPointerDown={() => setIsInteracting(true)}
          onPointerUp={() => setIsInteracting(false)}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-2 px-1 touch-pan-x snap-x snap-mandatory cursor-grab active:cursor-grabbing scroll-smooth"
        >
          {products.map((prod) => (
            <div 
              key={prod.id} 
              className="w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] shrink-0 snap-start flex flex-col transition-transform hover:-translate-y-0.5 duration-200"
            >
              <ProductCard
                product={prod}
                onNavigate={onNavigate}
                showBuyNow={showBuyNow}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow Button (Floats on the right edge) */}
        <button
          type="button"
          aria-label="Next Products"
          onClick={() => handleScroll('right')}
          className={`absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-xl border border-slate-200 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer text-slate-800 hover:text-[#f85606] ${
            canScrollRight ? 'opacity-95 hover:opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </section>
  );
};
