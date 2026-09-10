import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  RefreshCcw, 
  Send, 
  CreditCard,
  Truck,
  Leaf,
  Lock
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { StoreService } from '../services/store';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [settings, setSettings] = useState(() => StoreService.getSettings());
  const { showToast } = useToast();

  useEffect(() => {
    const unsub = StoreService.subscribeToStore(() => {
      setSettings(StoreService.getSettings());
    });
    return unsub;
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    showToast('Subscribed! Check your inbox for your 10% coupon code (KHAN10).', 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-[#0c1f1c] text-slate-300 pt-12 pb-24 md:pb-12 border-t border-emerald-950">
      {/* 1. Value Badges Top Bar */}
      <div className="max-w-7xl mx-auto px-4 pb-10 border-b border-emerald-900/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#112a26] border border-emerald-800/40">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-[#f85606] flex items-center justify-center shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">১০০% খাঁটি ও নিরাপদ</h4>
              <p className="text-xs text-slate-400 mt-0.5">ন্যাচারাল ও বিশুদ্ধ খাদ্যপণ্য</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#112a26] border border-emerald-800/40">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-[#f85606] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">সারাদেশে হোম ডেলিভারি</h4>
              <p className="text-xs text-slate-400 mt-0.5">ক্যাশ অন ডেলিভারি সুবিধা</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#112a26] border border-emerald-800/40">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-[#f85606] flex items-center justify-center shrink-0">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">সহজ রিটার্ন পলিসি</h4>
              <p className="text-xs text-slate-400 mt-0.5">পণ্য অপছন্দ হলে পরিবর্তনের সুযোগ</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#112a26] border border-emerald-800/40">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-[#f85606] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">অর্গানিক সনদপ্রাপ্ত</h4>
              <p className="text-xs text-slate-400 mt-0.5">কোয়ালিটি ও মান যাচাইকৃত</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: Brand & Contact */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-10 h-10 rounded-xl bg-[#f85606] flex items-center justify-center text-white font-black text-lg shadow-sm">
                <Leaf className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="font-black text-2xl text-white tracking-tight uppercase flex items-center gap-1">
                  <span>{(settings.storeName || 'KHAN GADGET BD').split(' ')[0]}</span>
                  {(settings.storeName || 'KHAN GADGET BD').split(' ').slice(1).length > 0 && (
                    <span className="text-[#f85606]">
                      {(settings.storeName || 'KHAN GADGET BD').split(' ').slice(1).join(' ')}
                    </span>
                  )}
                </span>
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                  {settings.brandTagline || settings.tagline || 'স্মার্ট গ্যাজেট ও মোবাইল এক্সেসরিজ'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {settings.aboutUsText || 'KHAN GADGET BD বাংলাদেশের অন্যতম নির্ভরযোগ্য অথেন্টিক মোবাইল গ্যাজেট ও লাইফস্টাইল অ্যাক্সেসরিজ ই-কমার্স প্ল্যাটফর্ম। সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা।'}
            </p>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.officeAddress || settings.address || 'House 14, Road 4, Sector 7, Uttara, Dhaka 1230, Bangladesh'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hotline: <strong>{settings.hotline || settings.phone || '01854774406'}</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Email: <strong>{settings.supportEmail || settings.email || 'info@khangadgetbd.com'}</strong></span>
              </div>
            </div>
          </div>

          {/* Col 2: Top Categories */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">জনপ্রিয় ক্যাটাগরি</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('category-products', 'honey')} className="hover:text-amber-400 transition-colors">
                  প্রাকৃতিক মধু (All Natural Honey)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category-products', 'oil-ghee')} className="hover:text-amber-400 transition-colors">
                  তেল ও খাঁটি ঘি (Oil & Ghee)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category-products', 'dates')} className="hover:text-amber-400 transition-colors">
                  প্রিমিয়াম খেজুর (Premium Dates)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category-products', 'spices')} className="hover:text-amber-400 transition-colors">
                  খাঁটি মসলা (Pure Spices)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category-products', 'nuts-seeds')} className="hover:text-amber-400 transition-colors">
                  বাদাম ও বীজ (Nuts & Seeds)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('category-products', 'certified')} className="hover:text-amber-400 transition-colors">
                  অর্গানিক সার্টিফাইড (Certified)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">গ্রাহক সেবা</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>অর্ডার ট্র্যাক করুন (Track Order)</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-amber-400 transition-colors">
                  প্রশ্নোত্তর (FAQ)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('return-refund')} className="hover:text-amber-400 transition-colors">
                  রিটার্ন পলিসি (Return Policy)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy-policy')} className="hover:text-amber-400 transition-colors">
                  প্রাইভেসি পলিসি (Privacy Policy)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact-us')} className="hover:text-amber-400 transition-colors">
                  যোগাযোগ (Contact Us)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">ডিসকাউন্ট অফার</h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              আপনার ইমেইল দিয়ে সাবস্ক্রাইব করুন এবং পরবর্তী অর্ডারে ১০% ছাড়ের স্পেশাল কুপন কোড পান।
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="আপনার ইমেইল দিন..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-[#112a26] border border-emerald-800/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#f85606] hover:bg-[#e04a00] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md active:scale-95"
              >
                <span>সাবস্ক্রাইব করুন</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 3. Payment Methods & Copyright */}
      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-emerald-900/40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold mr-1">মূল্য পরিশোধের মাধ্যম:</span>
            <span className="bg-pink-950/60 text-pink-300 px-2.5 py-1 rounded-md font-bold text-[11px] border border-pink-700/50">bKash</span>
            <span className="bg-orange-950/60 text-orange-300 px-2.5 py-1 rounded-md font-bold text-[11px] border border-orange-700/50">Nagad</span>
            <span className="bg-purple-950/60 text-purple-300 px-2.5 py-1 rounded-md font-bold text-[11px] border border-purple-700/50">Rocket</span>
            <span className="bg-blue-950/60 text-blue-300 px-2.5 py-1 rounded-md font-bold text-[11px] border border-blue-700/50">Card</span>
            <span className="bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-md font-bold text-[11px] border border-emerald-700/50">Cash on Delivery (ক্যাশ অন ডেলিভারি)</span>
          </div>

          <p className="text-xs text-slate-500 text-center md:text-right">
            © {new Date().getFullYear()} KHAN store (Safe & Pure Food). সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
};
