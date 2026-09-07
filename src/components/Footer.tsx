import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  RefreshCcw, 
  Send, 
  Heart,
  CreditCard,
  Truck
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    showToast('Subscribed! Check your inbox for your 10% coupon code (FRESH10).', 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-slate-800">
      {/* 1. Value Badges Top Bar */}
      <div className="max-w-7xl mx-auto px-4 pb-10 border-b border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Pure & Fresh</h4>
              <p className="text-xs text-slate-400 mt-0.5">Adulteration-free groceries guaranteed</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">2-Hour Express Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Prompt doorstep service across Dhaka</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24-Hour Easy Return</h4>
              <p className="text-xs text-slate-400 mt-0.5">No-questions-asked grocery replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">bKash, Nagad & COD</h4>
              <p className="text-xs text-slate-400 mt-0.5">Safe mobile wallets or pay upon delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: Brand & Contact */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
                FC
              </div>
              <span className="font-black text-2xl text-white tracking-tight">FreshCart <span className="text-emerald-400 font-bold">BD</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              FreshCart BD is Bangladesh's premier modern online shopping destination for pure food items, latest electronic gadgets, and premium men's & women's fashion with reliable nationwide doorstep delivery.
            </p>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Level 4, Plot 18, Road 2, Block A, Bashundhara R/A, Dhaka 1229</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hotline: +880 1700-FRESH (01700-373741)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Email: support@freshcartbd.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Top Categories */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Main Categories</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('category-products', 'food-items')} className="hover:text-emerald-400 transition-colors">
                  Food Items (খাদ্য সামগ্রী)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category-products', 'electronic-gadget')} className="hover:text-emerald-400 transition-colors">
                  Electronic Gadgets (ইলেকট্রনিক্স)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category-products', 'man-fashion')} className="hover:text-emerald-400 transition-colors">
                  Men's Fashion (পুরুষদের ফ্যাশন)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category-products', 'women-fashion')} className="hover:text-emerald-400 transition-colors">
                  Women's Fashion (মহিলাদের ফ্যাশন)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'filter=flash')} className="hover:text-amber-400 transition-colors font-semibold">
                  Flash Sale Deals (হট ডিল)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-emerald-400 transition-colors">
                  All Marketplace Products
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Customer Care</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Track Your Order</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-emerald-400 transition-colors">
                  Frequently Asked Questions (FAQ)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('return-refund')} className="hover:text-emerald-400 transition-colors">
                  Return & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy-policy')} className="hover:text-emerald-400 transition-colors">
                  Privacy & Data Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms-conditions')} className="hover:text-emerald-400 transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact-us')} className="hover:text-emerald-400 transition-colors">
                  Help & Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Get Discounts</h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Subscribe to get weekly discount alerts and special seasonal grocery offers.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Subscribe for 10% Off</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 3. Payment Methods & Copyright */}
      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold mr-1">Accepted In Bangladesh:</span>
            <span className="bg-pink-900/40 text-pink-300 px-2.5 py-1 rounded-md font-bold text-[11px] border border-pink-700/50">bKash</span>
            <span className="bg-orange-900/40 text-orange-300 px-2.5 py-1 rounded-md font-bold text-[11px] border border-orange-700/50">Nagad</span>
            <span className="bg-purple-900/40 text-purple-300 px-2.5 py-1 rounded-md font-bold text-[11px] border border-purple-700/50">Rocket</span>
            <span className="bg-blue-900/40 text-blue-300 px-2.5 py-1 rounded-md font-bold text-[11px] border border-blue-700/50">Visa / Mastercard</span>
            <span className="bg-emerald-900/40 text-emerald-300 px-2.5 py-1 rounded-md font-bold text-[11px] border border-emerald-700/50">Cash on Delivery (COD)</span>
          </div>

          <p className="text-xs text-slate-500 text-center md:text-right">
            © {new Date().getFullYear()} FreshCart BD. All rights reserved. Built for Bangladesh.
          </p>
        </div>
      </div>
    </footer>
  );
};
