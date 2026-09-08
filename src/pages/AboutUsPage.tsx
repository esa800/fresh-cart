import React, { useState, useEffect } from 'react';
import { ShieldCheck, Heart, Users, MapPin, Truck, Award, CheckCircle2, Zap } from 'lucide-react';
import { StoreService } from '../services/store';

export const AboutUsPage: React.FC = () => {
  const [settings, setSettings] = useState(() => StoreService.getSettings());

  useEffect(() => {
    const unsub = StoreService.subscribeToStore(() => {
      setSettings(StoreService.getSettings());
    });
    return unsub;
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#f85606] uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
          About {settings.storeName || 'KHAN GADGET BD'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Your Trusted Destination for Smart Gadgets & Mobile Accessories
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {settings.aboutUsText || 'KHAN GADGET BD বাংলাদেশের অন্যতম নির্ভরযোগ্য অথেন্টিক মোবাইল গ্যাজেট ও লাইফস্টাইল অ্যাক্সেসরিজ ই-কমার্স প্ল্যাটফর্ম। সারাদেশে অরিজিনাল ব্র্যান্ড ওয়্যারেন্টি ও দ্রুততম ডেলিভারি সেবায় আমরা অঙ্গীকারবদ্ধ।'}
        </p>
      </div>

      {/* Hero Visual */}
      <div className="relative rounded-3xl overflow-hidden aspect-21/9 shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80"
          alt="Tech Lifestyle & Smart Gadgets"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent flex items-end p-6 sm:p-8">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-1">
              100% Genuine & Authentic Tech
            </span>
            <p className="text-white font-bold text-sm sm:text-base">
              Verified global gadgets from Anker, Remax, Joyroom, Haylou, Baseus, Kospet, and Xiaomi.
            </p>
          </div>
        </div>
      </div>

      {/* Story Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#f85606] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Zero Tolerance for Counterfeits</h3>
          <p>
            In today's market, fake earbuds, low-grade dangerous power banks, and non-certified chargers flood the web. At {settings.storeName || 'KHAN GADGET BD'}, every product comes directly from authorized distributors in original retail packaging with valid serial numbers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#f85606] flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Swift Nationwide Doorstep Delivery</h3>
          <p>
            We partner with Bangladesh's top courier logistics (Steadfast, Pathao, RedX) to deliver gadgets right to your doorstep across all 64 districts with transparent tracking and cash-on-delivery.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl border border-slate-800">
        <h2 className="text-xl sm:text-2xl font-black text-center text-white">Our 4 Core Customer Promises</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1.5">
            <strong className="text-amber-400 font-bold block text-sm">1. 100% Brand Authentic</strong>
            <p className="text-slate-300 leading-relaxed">Official manufacturer seals and genuine warranty cards with every unit.</p>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1.5">
            <strong className="text-amber-400 font-bold block text-sm">2. 7-Day Replacement</strong>
            <p className="text-slate-300 leading-relaxed">Instant claim processing if any manufacturing defect is encountered.</p>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1.5">
            <strong className="text-amber-400 font-bold block text-sm">3. Transparent Pricing</strong>
            <p className="text-slate-300 leading-relaxed">No hidden fees, accurate stock levels, and fair competitive prices.</p>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1.5">
            <strong className="text-amber-400 font-bold block text-sm">4. Doorstep Inspection</strong>
            <p className="text-slate-300 leading-relaxed">Check outer intact seal and bill details before finalizing payment.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
