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
  PackageCheck
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
  const categories = StoreService.getCategories();
  const allProducts = StoreService.getProducts();
  const settings = StoreService.getSettings();

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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* 0. Top Announcement Notice Bar (Toggleable in Store Settings) */}
      {settings.isAnnouncementActive !== false && settings.announcementText && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 text-xs font-bold py-1.5 px-4 text-center overflow-hidden border-b border-amber-300/80 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{settings.announcementText}</span>
            <button
              onClick={() => onNavigate('shop', 'filter=flash')}
              className="underline hover:text-slate-800 text-[11px] shrink-0 font-extrabold ml-1"
            >
              Order Now ➜
            </button>
          </div>
        </div>
      )}

      {/* 1. Top Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hotline: <strong className="text-white">{settings.hotline || '+880 1700-FRESH'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>100% Authentic Bangladeshi E-Commerce & Fast Delivery</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="topbar-track-order-btn"
              onClick={() => onNavigate('track-order')}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Track Order</span>
            </button>

            <span className="text-emerald-700">|</span>

            {/* Dan Pase Ekdom Konay AP Admin Panel Button */}
            <button
              id="topbar-admin-panel-btn"
              onClick={() => onNavigate('admin')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 py-0.5 rounded text-[11px] flex items-center gap-1.5 shadow-xs transition-colors"
              title="অ্যাডমিন প্যানেল (Admin Panel)"
            >
              <span className="w-4 h-4 rounded bg-slate-950 text-amber-300 flex items-center justify-center font-extrabold text-[9px]">
                AP
              </span>
              <span>Admin Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Mobile menu trigger */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <div 
            id="header-brand-logo"
            onClick={() => onNavigate('home')} 
            className="cursor-pointer flex items-center gap-2 select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 transition-colors flex items-center justify-center text-white font-black text-xl shadow-xs shadow-emerald-500/20">
              FC
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight leading-none">FreshCart</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-1.5 py-0.5 rounded-md leading-none">BD</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5 hidden sm:block">
                তাজা বাজার • কম সময়ে
              </p>
            </div>
          </div>

          {/* Delivery Location Selector */}
          <button
            id="header-location-selector-btn"
            onClick={onOpenAreaModal}
            className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-colors text-left border border-slate-200/60 max-w-[190px]"
            title="Change Delivery Location"
          >
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider leading-none">Deliver to</span>
              <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5">
                {selectedZone.division || 'Dhaka'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0" />
          </button>

          {/* Live Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="header-search-input"
                type="text"
                placeholder="চাল, ডাল, মাছ, মাংস বা সরিষার তেল খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-24 py-2.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                id="header-search-btn"
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold transition-colors"
              >
                খুঁজুন
              </button>
            </form>

            {/* Suggestions dropdown */}
            {isSearchFocused && filteredSuggestions.length > 0 && (
              <div 
                id="header-search-results-dropdown" 
                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
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
                      className="p-3 hover:bg-emerald-50/60 cursor-pointer flex items-center gap-3 transition-colors group"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-11 h-11 object-cover rounded-lg shrink-0 border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 truncate">
                          {prod.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {prod.banglaName} • <span className="text-slate-400">{prod.unit}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-700">৳{prod.salePrice}</span>
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

          {/* Header Actions: Wishlist, Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist */}
            <button
              id="header-wishlist-btn"
              onClick={() => onNavigate('wishlist')}
              className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-full transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Account / User Menu */}
            <div className="relative">
              <button
                id="header-account-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 text-slate-700 hover:bg-slate-100 rounded-full sm:rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="hidden xl:block text-left">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider leading-none">
                    {isAuthenticated ? 'Hello,' : 'Welcome'}
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5 max-w-[90px]">
                    {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div 
                  id="header-user-dropdown-menu" 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 divide-y divide-slate-100"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2.5">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md uppercase">
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
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors mb-2"
                      >
                        Sign In / Register
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Trigger */}
            <button
              id="header-cart-drawer-trigger"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl transition-all shadow-xs shadow-emerald-600/20 active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span 
                    id="cart-badge-count" 
                    className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-emerald-600"
                  >
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left text-xs leading-none">
                <span className="text-[10px] text-emerald-200 block">Cart</span>
                <span className="font-extrabold mt-0.5 block">৳{subtotal}</span>
              </div>
            </button>

            {/* Extreme Right Corner: AP Button (অ্যাডমিন প্যানেল) */}
            <button
              id="header-ap-admin-shortcut-btn"
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs border border-slate-700 active:scale-95 shrink-0"
              title="অ্যাডমিন প্যানেল (Admin Panel)"
            >
              <span className="w-5 h-5 rounded-md bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[10px]">
                AP
              </span>
              <span className="hidden sm:inline text-[11px] font-bold text-amber-300">Admin</span>
            </button>
          </div>
        </div>

        {/* Mobile Search input bar */}
        <div className="mt-2 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Search rice, fish, oil, spices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2 bg-slate-100 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white border border-slate-200 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-600 text-white rounded-full text-[11px] font-semibold"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* 3. Navigation Bar (Desktop) */}
      <nav className="bg-emerald-800 text-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            {/* Categories Dropdown button */}
            <div className="relative">
              <button
                id="header-all-categories-btn"
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="bg-emerald-950 hover:bg-emerald-900 text-white px-5 py-3 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <Menu className="w-4 h-4 text-emerald-400" />
                <span>All Categories (ক্যাটাগরি)</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-300 ml-1" />
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
                      className="w-full text-left px-4 py-2 text-xs hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors group"
                    >
                      <span className="font-semibold group-hover:translate-x-1 transition-transform">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-800 px-1.5 py-0.5 rounded-full">
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
                className={`px-3 py-3 hover:bg-emerald-700 transition-colors ${currentView === 'home' ? 'bg-emerald-700 text-amber-300' : ''}`}
              >
                Home
              </button>
              <button
                id="nav-link-cat-food"
                onClick={() => onNavigate('category-products', 'food-items')}
                className={`px-3 py-3 hover:bg-emerald-700 transition-colors ${currentView === 'category-products' && viewParam === 'food-items' ? 'bg-emerald-700 text-amber-300' : ''}`}
              >
                Food Items (খাদ্যদ্রব্য)
              </button>
              <button
                id="nav-link-cat-gadget"
                onClick={() => onNavigate('category-products', 'electronic-gadget')}
                className={`px-3 py-3 hover:bg-emerald-700 transition-colors ${currentView === 'category-products' && viewParam === 'electronic-gadget' ? 'bg-emerald-700 text-amber-300' : ''}`}
              >
                Electronic Gadget (গ্যাজেট)
              </button>
              <button
                id="nav-link-cat-men"
                onClick={() => onNavigate('category-products', 'man-fashion')}
                className={`px-3 py-3 hover:bg-emerald-700 transition-colors ${currentView === 'category-products' && viewParam === 'man-fashion' ? 'bg-emerald-700 text-amber-300' : ''}`}
              >
                Men's Fashion (পুরুষদের ফ্যাশন)
              </button>
              <button
                id="nav-link-cat-women"
                onClick={() => onNavigate('category-products', 'women-fashion')}
                className={`px-3 py-3 hover:bg-emerald-700 transition-colors ${currentView === 'category-products' && viewParam === 'women-fashion' ? 'bg-emerald-700 text-amber-300' : ''}`}
              >
                Women's Fashion (মহিলাদের ফ্যাশন)
              </button>
              <button
                id="nav-link-flashsale"
                onClick={() => onNavigate('shop', 'filter=flash')}
                className="px-3 py-3 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 text-amber-300 font-bold"
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Flash Sale</span>
              </button>
              <button
                id="nav-link-offers"
                onClick={() => onNavigate('shop', 'filter=discount')}
                className="px-3 py-3 hover:bg-emerald-700 transition-colors"
              >
                Offers
              </button>
            </div>
          </div>

          <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Use Code: <strong>FRESH10</strong> for 10% Off</span>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full overflow-y-auto p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  FC
                </div>
                <span className="font-bold text-base text-slate-900">FreshCart BD</span>
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
