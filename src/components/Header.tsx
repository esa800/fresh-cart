import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Truck, 
  ChevronDown, 
  Menu, 
  X, 
  ShieldCheck,
  Percent,
  Sparkles,
  Flame,
  LogOut,
  Settings,
  PackageCheck,
  MessageCircle,
  Phone,
  Lock,
  Leaf,
  Layers
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { StoreService } from '../services/store';
import { Category, Product } from '../types';

interface HeaderProps {
  currentView: string;
  viewParam?: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenAreaModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, viewParam = '', onNavigate, onOpenAreaModal }) => {
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { currentUser, isAuthenticated, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  
  // Real-time Reactive State for Categories, Products & Settings
  const [categories, setCategories] = useState<Category[]>(() => StoreService.getCategories());
  const [allProducts, setAllProducts] = useState<Product[]>(() => StoreService.getProducts());
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

  // Dynamically generated navigation categories:
  // Starts with Offer Zone, then incorporates all categories configured in the Admin Panel
  const navCategories = [
    { 
      name: 'Offer Zone', 
      slug: 'offer-zone', 
      isSpecial: true, 
      hasDropdown: false,
      subItems: [] as string[],
      icon: <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" /> 
    },
    ...categories.map((cat) => {
      // Find matching products for this category to populate dropdown suggestions
      const matchingProducts = allProducts.filter((p) => {
        if (p.categoryId && (p.categoryId === cat.id || p.categoryId === cat.slug)) return true;
        if (p.category) {
          const pCat = p.category.toLowerCase().trim();
          const cName = cat.name.toLowerCase().trim();
          const cSlug = cat.slug.toLowerCase().trim();
          if (pCat === cName || pCat === cSlug || pCat.includes(cName) || cName.includes(pCat)) return true;
        }
        if (p.tags && Array.isArray(p.tags)) {
          if (p.tags.includes(cat.slug) || p.tags.includes(cat.id)) return true;
        }
        return false;
      });

      // Use subcategories if defined by admin, or top product names
      const subItems = cat.subcategories && cat.subcategories.length > 0
        ? cat.subcategories
        : matchingProducts.slice(0, 5).map((p) => p.name);

      return {
        name: cat.name,
        slug: cat.slug,
        isSpecial: false,
        icon: undefined,
        hasDropdown: subItems.length > 0,
        subItems
      };
    })
  ];

  return (
    <header className="relative z-40 bg-white">
      {/* 0. Top Clean Announcement Bar */}
      {settings.isAnnouncementActive !== false && (
        <div className="bg-[#0f2824] text-slate-200 text-xs py-1.5 px-4 border-b border-emerald-950/40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 bg-[#f85606] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                <Leaf className="w-2.5 h-2.5" /> 100% PURE
              </span>
              <span className="text-emerald-100 font-medium hidden sm:inline">
                {settings.announcementText || '🌿 KHAN store: ১০০% খাঁটি ও প্রাকৃতিক খাদ্যসামগ্রী | প্রমোকোড: KHAN10 (১০% ছাড়) | হটলাইন: 01854774406'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-semibold text-emerald-200">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>{settings.hotline || '01854774406'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Main Header Bar (Clean White aesthetic matching the reference image) */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div 
            id="header-brand-logo"
            onClick={() => onNavigate('home')} 
            className="cursor-pointer select-none flex items-center gap-2.5 shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f85606] to-[#e04a00] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight text-slate-900 uppercase flex items-center gap-1 leading-none">
                <span>KHAN</span>
                <span className="text-[#f85606]">store</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                Safe & Pure Food
              </p>
            </div>
          </div>

          {/* Centered Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="header-search-input"
                type="text"
                placeholder="Search in..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-5 pr-12 py-2.5 bg-white rounded-full text-sm text-slate-800 placeholder:text-slate-400 border border-slate-300 focus:outline-hidden focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 shadow-xs transition-all"
              />
              <button
                id="header-search-btn"
                type="submit"
                className="absolute right-1.5 top-1 bottom-1 px-3 text-slate-400 hover:text-[#f85606] transition-colors flex items-center justify-center"
                title="Search"
              >
                <Search className="w-5 h-5 stroke-[2.2]" />
              </button>
            </form>

            {/* Suggestions dropdown */}
            {isSearchFocused && filteredSuggestions.length > 0 && (
              <div 
                id="header-search-results-dropdown" 
                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto text-slate-800"
              >
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-semibold px-4">
                  <span>Product Suggestions</span>
                  <span>{filteredSuggestions.length} found</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredSuggestions.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectSuggestion(prod.slug)}
                      className="p-3 hover:bg-orange-50/70 cursor-pointer flex items-center gap-3 transition-colors group"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-11 h-11 object-cover rounded-lg shrink-0 border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#f85606] truncate">
                          {prod.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {prod.banglaName} • <span className="text-slate-400">{prod.unit}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-[#f85606]">৳{prod.salePrice}</span>
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

          {/* Right Header Navigation Items: Sign In | Live Order Track | Cart | 3-Line Menu */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            
            {/* 1. Sign In / My Account */}
            <div className="relative">
              <button
                id="header-account-btn"
                onClick={() => {
                  if (isAuthenticated) {
                    setIsUserMenuOpen(!isUserMenuOpen);
                  } else {
                    onNavigate('login');
                  }
                }}
                className="flex items-center gap-2 text-slate-700 hover:text-[#f85606] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <User className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="text-xs font-semibold hidden sm:inline">
                  {isAuthenticated ? (currentUser?.name?.split(' ')[0] || 'Account') : 'Sign In'}
                </span>
                {isAuthenticated && <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />}
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && isAuthenticated && (
                <div 
                  id="header-user-dropdown-menu" 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 divide-y divide-slate-100 text-slate-800"
                >
                  <div className="px-4 py-2.5">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { onNavigate('customer-dashboard'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('my-orders'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                    >
                      <PackageCheck className="w-4 h-4 text-slate-400" />
                      <span>My Orders</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { logout(); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Live Order Track (Replaces Wishlist / Love option next to Sign In) */}
            <button
              id="header-live-track-btn"
              onClick={() => onNavigate('track-order')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl transition-all shadow-2xs group cursor-pointer"
              title="লাইভ অর্ডার ট্র্যাক করুন"
            >
              <div className="relative">
                <Truck className="w-4 h-4 text-emerald-700 stroke-[2] group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-600 rounded-full" />
              </div>
              <span className="text-xs font-bold text-emerald-900 hidden md:inline">
                Live Order Track
              </span>
            </button>

            {/* 3. Cart */}
            <button
              id="header-cart-drawer-trigger"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 text-slate-700 hover:text-[#f85606] transition-colors"
              title="Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-slate-700 stroke-[1.8]" />
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#f85606] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              </div>
              <span className="text-xs font-semibold hidden sm:inline">Cart</span>
            </button>

            {/* 4. Three-Line Menu (Hamburger) */}
            <button
              id="three-line-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
              <span className="text-xs font-bold text-slate-800 hidden lg:inline">Menu</span>
            </button>
          </div>
        </div>

        {/* Mobile Search input bar */}
        <div className="px-4 pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Search in..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-50 rounded-full text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:outline-hidden focus:border-[#f85606]"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 text-slate-400 hover:text-[#f85606]"
              title="Search"
            >
              <Search className="w-4 h-4 stroke-[2.2]" />
            </button>
          </form>
        </div>
      </div>

      {/* 2. Deep Forest Green / Teal Secondary Category Navigation Bar */}
      <nav className="bg-[#0f2824] text-white text-xs font-semibold select-none hidden md:block shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1">
            {navCategories.map((cat) => (
              <div 
                key={cat.slug} 
                className="relative group"
                onMouseEnter={() => cat.hasDropdown && setActiveDropdown(cat.slug)}
                onMouseLeave={() => cat.hasDropdown && setActiveDropdown(null)}
              >
                <button
                  onClick={() => {
                    if (cat.slug === 'offer-zone') {
                      onNavigate('shop', 'filter=discount');
                    } else {
                      onNavigate('category-products', cat.slug);
                    }
                  }}
                  className={`px-3 py-2.5 rounded-md hover:bg-emerald-900/60 transition-colors flex items-center gap-1 whitespace-nowrap ${
                    cat.isSpecial ? 'text-orange-400 font-extrabold' : 'text-slate-100'
                  }`}
                >
                  {cat.icon && cat.icon}
                  <span>{cat.name}</span>
                  {cat.hasDropdown && <ChevronDown className="w-3 h-3 text-emerald-300 opacity-70 group-hover:rotate-180 transition-transform" />}
                </button>

                {/* Dropdown Menu */}
                {cat.hasDropdown && activeDropdown === cat.slug && (
                  <div className="absolute left-0 top-full w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 text-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
                    {cat.subItems?.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => {
                          onNavigate('shop', `search=${encodeURIComponent(sub)}`);
                          setActiveDropdown(null);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs hover:bg-orange-50 hover:text-[#f85606] transition-colors"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* 3. Three-Line Slide-Over Menu (Hamburger Drawer with prominent AP button) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full overflow-y-auto p-5 flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f85606] to-[#e04a00] flex items-center justify-center text-white font-black text-base shadow-sm">
                  <Leaf className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <span className="font-black text-lg text-slate-900 tracking-tight block leading-none">
                    KHAN <span className="text-[#f85606]">store</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Safe & Pure Food</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Links */}
            <div className="py-2 space-y-1 text-sm font-semibold text-slate-700">
              <button
                onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Home (হোম)</span>
              </button>
              <button
                onClick={() => { onNavigate('shop'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center justify-between"
              >
                <span>All Products (সকল পণ্য)</span>
              </button>
              <button
                onClick={() => { onNavigate('track-order'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-slate-800"
              >
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Track Order (অর্ডার ট্র্যাকিং)</span>
              </button>
              <button
                onClick={() => { onNavigate('wishlist'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-slate-800"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Wishlist (পছন্দের তালিকা)</span>
              </button>
              <button
                onClick={() => { onNavigate('customer-dashboard'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-slate-800"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>My Account (আমার প্রোফাইল)</span>
              </button>

              {/* Discreet single AP option disguised as "ap 😊" - inaccessible to regular customers */}
              <button
                id="drawer-discreet-ap-btn"
                onClick={() => {
                  onNavigate('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 text-xs font-normal flex items-center justify-between transition-colors cursor-pointer"
                title="ap 😊"
              >
                <span>ap 😊</span>
              </button>
            </div>

            {/* Categories List in Drawer */}
            <div className="pt-3 mt-2 border-t border-slate-100">
              <p className="text-xs uppercase font-extrabold text-slate-400 px-3 mb-2 tracking-wider">
                Categories (ক্যাটাগরি সমূহ)
              </p>
              <div className="space-y-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onNavigate('category-products', c.slug);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#f85606] hover:bg-orange-50 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>{c.name} ({c.banglaName})</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {c.productCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Support Info at bottom of Drawer */}
            <div className="mt-auto pt-4 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Phone className="w-3.5 h-3.5 text-[#f85606]" />
                  <span>হটলাইন: 01854774406</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  সরাসরি কল করে বা হোয়াটসঅ্যাপে অর্ডার করুন।
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
