import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export const FloatingCartButton: React.FC = () => {
  const { itemCount, subtotal, setIsCartOpen } = useCart();

  return (
    <button
      id="floating-cart-badge-btn"
      onClick={() => setIsCartOpen(true)}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#f85606] hover:bg-[#e04a00] text-white shadow-2xl rounded-l-2xl py-3.5 px-3 flex flex-col items-center gap-1.5 transition-transform hover:-translate-x-1 active:scale-95 group border-y border-l border-white/20 select-none cursor-pointer"
      title="Open Cart"
    >
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white relative">
        <ShoppingBag className="w-4 h-4" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-300 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </div>
      <span className="text-[11px] font-extrabold tracking-tight whitespace-nowrap">
        {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
      </span>
      <div className="bg-black/25 text-amber-200 text-[11px] font-black px-2 py-0.5 rounded-full font-mono">
        ৳{subtotal.toFixed(2)}
      </div>
    </button>
  );
};
