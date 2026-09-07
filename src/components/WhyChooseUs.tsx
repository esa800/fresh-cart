import React from 'react';
import { ShieldCheck, Zap, HeartHandshake, Award } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
      <div className="max-w-3xl mb-8">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
          The FreshCart BD Difference
        </span>
        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
          Why Thousands of Families Trust Us Daily
        </h2>
        <p className="text-xs sm:text-sm text-emerald-200/80 mt-1.5 leading-relaxed">
          We bring the authenticity of rural haats and village farmers directly to your urban doorstep, backed by modern cold-chain handling and honest pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-4 rounded-2xl bg-emerald-900/50 border border-emerald-800/80 space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-white">Direct Village Sourcing</h3>
          <p className="text-xs text-emerald-200/70 leading-relaxed">
            Mustard oil from heritage wooden ghanis, river fish from Chandpur, and aromatic rice from Dinajpur.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-900/50 border border-emerald-800/80 space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-white">2-Hour Express Delivery</h3>
          <p className="text-xs text-emerald-200/70 leading-relaxed">
            Dedicated riders with temperature-safe cold boxes ensuring ice-cold fish and crisp greens arrive fresh.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-900/50 border border-emerald-800/80 space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-white">100% Halal & Clean</h3>
          <p className="text-xs text-emerald-200/70 leading-relaxed">
            Strict veterinary health inspection and certified Halal butchering in sanitized meat preparation rooms.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-900/50 border border-emerald-800/80 space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-white">24-Hour Hassle-Free Return</h3>
          <p className="text-xs text-emerald-200/70 leading-relaxed">
            Not completely happy with a fish cut or vegetable quality? We replace or refund with zero fuss at your doorstep.
          </p>
        </div>
      </div>
    </section>
  );
};
