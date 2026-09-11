import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [canScrollRight, setCanScrollRight] = useState(false);

  const animationFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const pauseUntilRef = useRef<number>(0);

  // Guarantee sufficient horizontal track width for smooth right-to-left glide on hover
  const displayProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    if (products.length < 5) {
      return [...products, ...products, ...products];
    }
    if (products.length < 8) {
      return [...products, ...products];
    }
    return products;
  }, [products]);

  // Check scroll boundary to show/hide arrow buttons
  const updateScrollBounds = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
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

  // Smooth right-to-left auto-scroll when hovered ("auto dan dik theke bame ase aste aste")
  useEffect(() => {
    if (!isHovered || isInteracting) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const scrollSpeedPixelsPerSecond = 50; // Smooth, slow gliding speed ("aste aste")

    const animate = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      const el = scrollContainerRef.current;
      if (el && time > pauseUntilRef.current) {
        const maxScroll = el.scrollWidth - el.clientWidth;

        if (maxScroll > 10) {
          if (el.scrollLeft >= maxScroll - 2) {
            // Pause 1.5s at the end, then smoothly glide back to start
            pauseUntilRef.current = time + 1500;
            el.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            el.scrollLeft += scrollSpeedPixelsPerSecond * deltaTime;
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isHovered, isInteracting]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollDistance = Math.min(el.clientWidth * 0.75, 340);
      const target = direction === 'left' ? el.scrollLeft - scrollDistance : el.scrollLeft + scrollDistance;
      el.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section 
      id={`category-section-${category.slug || category.id}`}
      className="space-y-3 sm:space-y-4 group/section"
    >
      {/* Category Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>{category.name}</span>
          {category.banglaName && (
            <span className="text-slate-500 font-semibold text-xs sm:text-sm">
              ({category.banglaName})
            </span>
          )}
        </h2>
        <button
          id={`view-all-${category.slug || category.id}`}
          onClick={() => onNavigate('category-products', category.slug || category.id)}
          className="text-xs font-bold text-[#f85606] hover:text-[#e04a00] flex items-center gap-1 group/btn"
        >
          <span>VIEW ALL ITEMS</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Auto-scrolling Carousel Container */}
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsInteracting(false);
        }}
      >
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => handleScroll('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer opacity-90 group-hover:opacity-100 hidden sm:flex"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={scrollContainerRef}
          onPointerDown={() => setIsInteracting(true)}
          onPointerUp={() => setIsInteracting(false)}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-2 px-0.5 touch-pan-x cursor-grab active:cursor-grabbing"
        >
          {displayProducts.map((prod, index) => (
            <div 
              key={`${prod.id}-slider-${index}`} 
              className="w-[200px] sm:w-[230px] md:w-[250px] lg:w-[260px] shrink-0 flex flex-col transition-transform hover:-translate-y-0.5 duration-200"
            >
              <ProductCard
                product={prod}
                onNavigate={onNavigate}
                showBuyNow={showBuyNow}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => handleScroll('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer opacity-90 group-hover:opacity-100 hidden sm:flex"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
        )}
      </div>
    </section>
  );
};
