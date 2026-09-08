import React from 'react';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

interface MobileBottomNavProps {
  currentView?: string;
  activeView?: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenCart?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  currentView = '', 
  activeView = '', 
  onNavigate,
  onOpenCart 
}) => {
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  const view = activeView || currentView || 'home';

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 z-40 flex items-center justify-around shadow-lg">
      {/* Home */}
      <button
        id="mobile-nav-home"
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold transition-colors ${
          view === 'home' ? 'text-[#f85606]' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      {/* Categories / Shop */}
      <button
        id="mobile-nav-shop"
        onClick={() => onNavigate('shop')}
        className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold transition-colors ${
          view === 'shop' || view === 'category-products' ? 'text-[#f85606]' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span>Shop</span>
      </button>

      {/* Cart Button */}
      <button
        id="mobile-nav-cart"
        onClick={() => onOpenCart ? onOpenCart() : onNavigate('cart')}
        className="flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold text-[#f85606] relative"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-[#f85606] text-white flex items-center justify-center shadow-md">
            <ShoppingBag className="w-4 h-4" />
          </div>
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {itemCount}
            </span>
          )}
        </div>
        <span className="font-bold">Cart</span>
      </button>

      {/* Wishlist */}
      <button
        id="mobile-nav-wishlist"
        onClick={() => onNavigate('shop')}
        className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold transition-colors relative ${
          view === 'wishlist' ? 'text-[#f85606]' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <Heart className="w-5 h-5" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </div>
        <span>Wishlist</span>
      </button>

      {/* Account */}
      <button
        id="mobile-nav-account"
        onClick={() => onNavigate(isAuthenticated ? 'customer-dashboard' : 'login')}
        className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold transition-colors ${
          view && (view.includes('dashboard') || view === 'login' || view === 'profile')
            ? 'text-[#f85606]'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <User className="w-5 h-5" />
        <span>Account</span>
      </button>
    </div>
  );
};
