import React from 'react';
import { ShieldCheck, Heart, Users, MapPin, Truck, Award } from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full">
          About KHAN GADGET BD
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Your Trusted Destination for Smart Gadgets & Mobile Accessories
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Founded with a commitment to authenticity and customer satisfaction, KHAN GADGET BD delivers 100% genuine electronic gadgets, mobile accessories, smart watches, and audio gear nationwide across Bangladesh.
        </p>
      </div>

      {/* Hero Visual */}
      <div className="relative rounded-3xl overflow-hidden aspect-21/9 shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80"
          alt="Fresh Village Market"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6 sm:p-8">
          <p className="text-white font-bold text-sm sm:text-base">
            Direct haat procurement every morning across Dinajpur, Chandpur, Pabna & Munshiganj.
          </p>
        </div>
      </div>

      {/* Story Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">The Problem with Adulterated Food</h3>
          <p>
            In urban Bangladesh, families struggle to find formalin-free fish, pure unadulterated mustard oil, and genuine Miniket or Nazirshail rice that hasn't been chemically polished. We set out to change this by building our own direct supply network.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Cold-Chain Express Delivery</h3>
          <p>
            Unlike regular courier logistics, our fleet is equipped with food-grade temperature-controlled boxes with dry ice and thermal bags. Your fish arrives smelling fresh, your beef chilled, and leafy vegetables crisp as if plucked an hour ago.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-center">Our 4 Core Promises</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-emerald-900/60 rounded-2xl border border-emerald-800 space-y-1.5">
            <strong className="text-emerald-400 font-bold block text-sm">1. Pure Wooden Ghani</strong>
            <p className="text-emerald-200/80 leading-relaxed">No solvents or essences. Only slow cold-pressed mustard oil and churned gawa ghee.</p>
          </div>
          <div className="p-4 bg-emerald-900/60 rounded-2xl border border-emerald-800 space-y-1.5">
            <strong className="text-emerald-400 font-bold block text-sm">2. 100% Halal Slaughter</strong>
            <p className="text-emerald-200/80 leading-relaxed">Strict veterinary certified inspection and hygienic halal butchering.</p>
          </div>
          <div className="p-4 bg-emerald-900/60 rounded-2xl border border-emerald-800 space-y-1.5">
            <strong className="text-emerald-400 font-bold block text-sm">3. Transparent Weight</strong>
            <p className="text-emerald-200/80 leading-relaxed">Exact calibrated digital weighing with gross and net weights printed on invoices.</p>
          </div>
          <div className="p-4 bg-emerald-900/60 rounded-2xl border border-emerald-800 space-y-1.5">
            <strong className="text-emerald-400 font-bold block text-sm">4. Doorstep Check & Return</strong>
            <p className="text-emerald-200/80 leading-relaxed">Check every fish piece or mango before paying. If not 100% satisfied, return on the spot.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
