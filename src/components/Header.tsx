import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  MapPin, 
  Phone, 
  Truck, 
  ChevronDown, 
  Menu, 
  X, 
  ShieldCheck,
  Percent,
  Sparkles,
  Layers,
  LogOut,
  Settings,
  PackageCheck,
  Megaphone,
  MessageCircle,
  RotateCw,
  Lock
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { StoreService } from '../services/store';

interface HeaderProps {
  currentView: string;
  viewParam?: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenAreaModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, viewParam = '', onNavigate, onOpenAreaModal }) => {
  const { itemCount, subtotal, setIsCartOpen, selectedZone } = useCart();
  const { wishlistCount } = useWishlist();
  const { currentUser, isAuthenticated, isAdmin, role, logout, switchDemoRole } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  
  // Real-time Reactive State for Categories, Products & Settings
  const [categories, setCategories] = useState(() => StoreService.getCategories());
  const [allProducts, setAllProducts] = useState(() => StoreService.getProducts());
  const [settings, setSettings] = useState(() => StoreService.getSettings());

  useEffect(() => {
    const unsub = StoreService.subscribeToStore ? StoreService.subscribeToStore(() => {
      setCategories(StoreService.getCategories());
      setAllProducts(StoreService.getProducts());
      setSettings(StoreService.getSettings());
    }) : undefined;
    return unsub;
  }, []);

  // Search auto-suggestions
  const filteredSuggestions = searchQuery.trim()
    ? allProducts
        .filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.banglaName && p.banglaName.includes(searchQuery)) ||
            (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.tags && p.tags.some((t) => t && t.toLowerCase().includes(searchQuery.toLowerCase())))
        )
        .slice(0, 6)
    : [];

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      onNavigate('shop', `search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectSuggestion = (slug: string) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    onNavigate('product-detail', slug);
  };

  return (
    <header className="relative z-40 bg-[#f85606] shadow-md">
      {/* 0. Top Dark Marquee Ticker Bar */}
      <div className="bg-[#090d16] text-slate-200 text-xs py-2 px-3 overflow-hidden border-b border-slate-800 select-none">
        <div className="flex items-center overflow-hidden whitespace-nowrap">
          <div className="animate-marquee flex items-center gap-6 font-medium text-xs">
            <span className="inline-flex items-center gap-1.5 bg-[#ff4600] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              <Megaphone className="w-3 h-3" /> HOT
            </span>
            <span className="text-amber-400 font-bold tracking-wider font-mono">KHAN10</span>
            <span className="text-slate-500">•</span>
            <span className="font-extrabold text-white tracking-wide">KHAN GADGET BD</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300 font-semibold">
              🔥 আজকের স্পেশাল অফার: যেকোনো গ্যাজেট অর্ডারে ১০% ইনস্ট্যান্ট ছাড়! প্রোমোকোড: KHAN10 | সারাদেশে ক্যাশ অন ডেলিভারি
            </span>
            <span className="text-slate-500">•</span>
            <span className="bg-orange-950 border border-orange-500/40 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded">
              কুপন: KHAN10
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> কোড: KHAN10
            </span>

            {/* Seamless marquee repetition */}
            <span className="text-slate-500 ml-4">•</span>
            <span className="inline-flex items-center gap-1.5 bg-[#ff4600] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              <Megaphone className="w-3 h-3" /> HOT
            </span>
            <span className="text-amber-400 font-bold tracking-wider font-mono">KHAN10</span>
            <span className="text-slate-500">•</span>
            <span className="font-extrabold text-white tracking-wide">KHAN GADGET BD</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300 font-semibold">
              🔥 আজকের স্পেশাল অফার: যেকোনো গ্যাজেট অর্ডারে ১০% ইনস্ট্যান্ট ছাড়! প্রোমোকোড: KHAN10 | সারাদেশে ক্যাশ অন ডেলিভারি
            </span>
            <span className="text-slate-500">•</span>
            <span className="bg-orange-950 border border-orange-500/40 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded">
              কুপন: KHAN10
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> কোড: KHAN10
            </span>
          </div>
        </div>
      </div>

      {/* 1. Deep Orange Sub-Bar */}
      <div className="bg-[#b93807] text-white text-xs py-1.5 px-4 hidden md:block border-b border-[#a22f04]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-white/95">
            <span className="text-amber-300 font-bold">⚡ Flash Deals:</span>
            <span>Use code <strong className="bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold text-white">KHAN10</strong> for 10% OFF</span>
            <span className="text-white/40 mx-1">|</span>
            <span className="text-white/90">Free delivery on orders over ৳ 2,000</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-white/95">
              <Phone className="w-3.5 h-3.5 text-white/80" />
              <span>Contact: <strong>{settings.hotline || '01854774406'}</strong></span>
            </div>

            <a
              href="https://wa.me/8801854774406"
              target="_blank"
              rel="noreferrer"
              className="bg-[#15803d] hover:bg-[#166534] text-white font-bold text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>WhatsApp: 01854774406</span>
            </a>

            <button
              onClick={() => window.location.reload()}
              className="p-1 rounded bg-black/20 hover:bg-black/30 text-white transition-colors"
              title="Refresh Page"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* AP Admin Panel Button */}
            <button
              id="topbar-admin-panel-btn"
              onClick={() => onNavigate('admin')}
              className="bg-[#7c2d12] hover:bg-[#9a3412] text-amber-200 border border-amber-500/40 text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
              title="অ্যাডমিন প্যানেল"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>AP</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar (Signature Daraz Vibrant Orange) */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Mobile menu trigger */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-black/10"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo: KHAN GADGET BD */}
          <div 
            id="header-brand-logo"
            onClick={() => onNavigate('home')} 
            className="cursor-pointer select-none group shrink-0"
          >
            <h1 className="font-black text-2xl sm:text-3xl text-white tracking-wider uppercase drop-shadow-xs">
              KHAN GADGET BD
            </h1>
          </div>

          {/* Live Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="header-search-input"
                type="text"
                placeholder="Search mobile accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-4 pr-11 py-2.5 bg-white rounded-md text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-300 shadow-xs"
              />
              <button
                id="header-search-btn"
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 text-[#f85606] hover:text-[#d44702] transition-colors flex items-center justify-center"
                title="Search"
              >
                <Search className="w-5 h-5 stroke-[2.5]" />
              </button>
            </form>

            {/* Suggestions dropdown */}
            {isSearchFocused && filteredSuggestions.length > 0 && (
              <div 
                id="header-search-results-dropdown" 
                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto text-slate-800"
              >
                <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-semibold px-3">
                  <span>Product Suggestions</span>
                  <span>{filteredSuggestions.length} found</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredSuggestions.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectSuggestion(prod.slug)}
                      className="p-3 hover:bg-amber-50/60 cursor-pointer flex items-center gap-3 transition-colors group"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-11 h-11 object-cover rounded-lg shrink-0 border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 group-hover:text-[#f85606] truncate">
                          {prod.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {prod.banglaName} • <span className="text-slate-400">{prod.unit}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#f85606]">৳{prod.salePrice}</span>
                        {prod.regularPrice > prod.salePrice && (
                          <span className="text-[10px] text-slate-400 line-through block">৳{prod.regularPrice}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Header Actions: Track My Order, Wishlist, Account, Cart */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            {/* Track My Order */}
            <button
              id="header-track-order-btn"
              onClick={() => onNavigate('track-order')}
              className="hidden lg:flex items-center gap-1 text-xs sm:text-sm font-bold text-white hover:text-amber-200 transition-colors"
            >
              <span>Track My Order</span>
            </button>

            {/* Wishlist */}
            <button
              id="header-wishlist-btn"
              onClick={() => onNavigate('wishlist')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white hover:text-amber-200 transition-colors"
              title="Wishlist"
            >
              <div className="relative">
                <Heart className="w-5 h-5 text-white stroke-[2]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-white text-[#f85606] text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Wishlist</span>
            </button>

            {/* Cart Trigger */}
            <button
              id="header-cart-drawer-trigger"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-[#df4b02] hover:bg-[#cf4200] border border-white/30 text-white px-3.5 py-2 rounded-lg transition-all shadow-xs active:scale-95 text-xs sm:text-sm font-bold"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              <span>{itemCount} (৳ {subtotal})</span>
            </button>

            {/* Account / User Menu Dropdown */}
            <div className="relative">
              <button
                id="header-account-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 text-white hover:text-amber-200 rounded-lg transition-colors"
                title="Account"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-white/80 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div 
                  id="header-user-dropdown-menu" 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 divide-y divide-slate-100 text-slate-800"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2.5">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold bg-amber-50 text-[#f85606] px-2 py-0.5 rounded-md uppercase">
                          {currentUser?.role.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => { onNavigate('customer-dashboard'); setIsUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Account</span>
                        </button>
                        <button
                          onClick={() => { onNavigate('my-orders'); setIsUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                        >
                          <PackageCheck className="w-4 h-4 text-slate-400" />
                          <span>My Orders</span>
                        </button>
                        <button
                          onClick={() => { onNavigate('wishlist'); setIsUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                        >
                          <Heart className="w-4 h-4 text-slate-400" />
                          <span>My Wishlist ({wishlistCount})</span>
                        </button>
                      </div>

                      {isAdmin && (
                        <div className="py-1">
                          <button
                            onClick={() => { onNavigate('admin'); setIsUserMenuOpen(false); }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2.5"
                          >
                            <Settings className="w-4 h-4 text-amber-600" />
                            <span>Go to Admin Panel</span>
                          </button>
                        </div>
                      )}

                      <div className="py-1">
                        <button
                          onClick={() => { logout(); setIsUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 text-center">
                      <p className="text-xs text-slate-600 mb-2">Access your orders and wishlist</p>
                      <button
                        id="user-menu-login-btn"
                        onClick={() => { onNavigate('login'); setIsUserMenuOpen(false); }}
                        className="w-full py-2 bg-[#f85606] hover:bg-[#e04a00] text-white rounded-xl text-xs font-bold transition-colors mb-2"
                      >
                        Sign In / Register
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search input bar */}
        <div className="mt-2.5 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Search mobile accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-10 py-2 bg-white rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-2.5 text-[#f85606]"
              title="Search"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Navigation Bar (Desktop) */}
      <nav className="bg-[#ea580c] text-white hidden md:block border-t border-[#f97316]/40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            {/* Categories Dropdown button */}
            <div className="relative">
              <button
                id="header-all-categories-btn"
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="bg-[#c2410c] hover:bg-[#9a3412] text-white px-5 py-3 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <Menu className="w-4 h-4 text-amber-300" />
                <span>All Categories (ক্যাটাগরি)</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-200 ml-1" />
              </button>

              {isCategoryMenuOpen && (
                <div 
                  id="header-categories-dropdown" 
                  className="absolute left-0 top-full w-64 bg-white rounded-b-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 max-h-[460px] overflow-y-auto"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onNavigate('category-products', cat.slug);
                        setIsCategoryMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-orange-50 hover:text-[#f85606] flex items-center justify-between transition-colors group"
                    >
                      <span className="font-semibold group-hover:translate-x-1 transition-transform">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 group-hover:bg-orange-100 group-hover:text-[#c2410c] px-1.5 py-0.5 rounded-full">
                        {cat.productCount}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nav links */}
            <div className="flex items-center text-xs font-semibold tracking-wide">
              <button
                id="nav-link-home"
                onClick={() => onNavigate('home')}
                className={`px-3 py-3 hover:bg-[#c2410c] transition-colors ${currentView === 'home' ? 'bg-[#c2410c] text-amber-300' : ''}`}
              >
                Home
              </button>
              <button
                id="nav-link-cat-gadget"
                onClick={() => onNavigate('category-products', 'electronic-gadget')}
                className={`px-3 py-3 hover:bg-[#c2410c] transition-colors ${currentView === 'category-products' && viewParam === 'electronic-gadget' ? 'bg-[#c2410c] text-amber-300' : ''}`}
              >
                Electronic Gadget (গ্যাজেট)
              </button>
              <button
                id="nav-link-cat-mobile-acc"
                onClick={() => onNavigate('shop', 'search=mobile')}
                className="px-3 py-3 hover:bg-[#c2410c] transition-colors"
              >
                Mobile Accessories
              </button>
              <button
                id="nav-link-cat-smart-watches"
                onClick={() => onNavigate('shop', 'search=watch')}
                className="px-3 py-3 hover:bg-[#c2410c] transition-colors"
              >
                Smart Watches
              </button>
              <button
                id="nav-link-cat-audio"
                onClick={() => onNavigate('shop', 'search=earbuds')}
                className="px-3 py-3 hover:bg-[#c2410c] transition-colors"
              >
                TWS & Audio
              </button>
              <button
                id="nav-link-flashsale"
                onClick={() => onNavigate('shop', 'filter=flash')}
                className="px-3 py-3 hover:bg-[#c2410c] transition-colors flex items-center gap-1.5 text-amber-200 font-bold"
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Flash Sale</span>
              </button>
              <button
                id="nav-link-offers"
                onClick={() => onNavigate('shop', 'filter=discount')}
                className="px-3 py-3 hover:bg-[#c2410c] transition-colors"
              >
                Offers
              </button>
            </div>
          </div>

          <div className="text-xs font-bold text-amber-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Use Code: <strong className="text-white bg-black/20 px-1.5 py-0.5 rounded font-mono">KHAN10</strong> for 10% Off</span>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full overflow-y-auto p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#f85606] flex items-center justify-center text-white font-bold text-sm">
                  KG
                </div>
                <span className="font-black text-base text-slate-900 tracking-wide">KHAN GADGET BD</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Delivery Area */}
            <div className="my-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-500 block text-[10px]">Zone:</span>
                  <strong className="text-slate-800">{selectedZone.division || 'Dhaka'}</strong>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAreaModal();
                }}
                className="text-xs font-bold text-emerald-700 underline"
              >
                Change
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="py-2 space-y-1 text-sm font-semibold text-slate-700">
              <button
                onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Home
              </button>
              <button
                onClick={() => { onNavigate('shop'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                All Products
              </button>
              <button
                onClick={() => { onNavigate('shop', 'filter=flash'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-amber-600 flex items-center gap-2"
              >
                <Percent className="w-4 h-4" /> Flash Sale Deals
              </button>
              <button
                onClick={() => { onNavigate('track-order'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2"
              >
                <Truck className="w-4 h-4 text-emerald-600" /> Track My Order
              </button>
              <button
                onClick={() => { onNavigate('about-us'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                About Us
              </button>
              <button
                onClick={() => { onNavigate('faq'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Frequently Asked Questions
              </button>
              <button
                onClick={() => { onNavigate('contact-us'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Contact & Support
              </button>
            </div>

            {/* Categories list in mobile */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs uppercase font-bold text-slate-400 px-3 mb-2">Categories</p>
              <div className="space-y-1">
                {categories.slice(0, 8).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onNavigate('category-products', c.slug);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:text-emerald-700 hover:bg-slate-50 rounded"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Admin Link if logged in as admin */}
            {isAdmin && (
              <div className="mt-auto pt-4 border-t border-slate-200">
                <button
                  onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  Admin Dashboard ({role})
                </button>
              </div>
            )}
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
