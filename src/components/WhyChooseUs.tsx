import React from 'react';
import { ShieldCheck, Zap, HeartHandshake, Award } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="bg-[#0f172a] text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative border border-slate-800">
      <div className="max-w-3xl mb-8">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
          The KHAN GADGET BD Promise
        </span>
        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
          Why Thousands of Tech Lovers Trust Us Daily
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
          We bring 100% authentic mobile accessories, latest electronic gadgets, and smart lifestyle gear directly to your doorstep with trusted warranty and nationwide cash on delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-[#f85606] flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-white">100% Original Gadgets</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Directly imported authentic smartwatches, earbuds, chargers, and accessories with genuine brand barcodes.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-[#f85606] flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-white">Fast Courier Delivery</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            24-hour express delivery inside Dhaka and 48-72 hours nationwide shipping across all 64 districts.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-[#f85606] flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-white">Official Brand Warranty</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Up to 1-year replacement warranty on selected items and dedicated customer support helpline.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-[#f85606] flex items-center justify-center font-bold">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-white">Cash On Delivery Check</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Check the parcel in front of the delivery agent before completing your payment with total peace of mind.
          </p>
        </div>
      </div>
    </section>
  );
};
