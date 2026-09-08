import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Banner } from '../types';
import { StoreService, subscribeToStore } from '../services/store';

interface HeroBannerSliderProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HeroBannerSlider: React.FC<HeroBannerSliderProps> = ({ onNavigate }) => {
  const [banners, setBanners] = useState<Banner[]>(() =>
    StoreService.getBanners().filter((b) => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const unsub = subscribeToStore(() => {
      setBanners(
        StoreService.getBanners().filter((b) => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
      );
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIdx];

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleCtaClick = () => {
    const url = currentBanner.targetUrl;
    if (url.startsWith('/product/')) {
      const slug = url.replace('/product/', '');
      onNavigate('product-detail', slug);
    } else if (url.startsWith('/category/')) {
      const slug = url.replace('/category/', '');
      onNavigate('category-products', slug);
    } else {
      onNavigate('shop');
    }
  };

  return (
    <div 
      className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Dark Overlay */}
      <div className="relative min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] flex items-center">
        <img
          src={currentBanner.image}
          alt={currentBanner.title}
          className="absolute inset-0 w-full h-full object-cover opacity-35 transform transition-transform duration-1000 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${currentBanner.bgGradient || 'from-slate-950 via-[#2a0e02]/90 to-transparent'}`} />

        {/* Content Area */}
        <div className="relative z-10 max-w-2xl px-6 sm:px-12 py-10 text-white space-y-4">
          {currentBanner.badge && (
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>{currentBanner.badge}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight sm:leading-tight">
            {currentBanner.title}
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-orange-100 font-medium leading-relaxed max-w-xl">
            {currentBanner.subtitle}
          </p>

          <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3">
            <button
              id="hero-banner-cta-btn"
              onClick={handleCtaClick}
              className="px-6 py-3.5 bg-[#f85606] hover:bg-[#e04a00] text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-all hover:gap-3 active:scale-95"
            >
              <span>{currentBanner.buttonText || 'Order Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('shop', 'filter=flash')}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs sm:text-sm backdrop-blur-xs transition-colors"
            >
              View Today's Deals
            </button>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors opacity-0 group-hover:opacity-100 z-20"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors opacity-0 group-hover:opacity-100 z-20"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentIdx ? 'w-8 bg-[#f85606]' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
