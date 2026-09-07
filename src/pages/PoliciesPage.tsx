import React from 'react';
import { ShieldCheck, RefreshCcw, FileText, CheckCircle2 } from 'lucide-react';

interface PoliciesPageProps {
  type: 'return-refund' | 'privacy' | 'terms';
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({ type }) => {
  if (type === 'return-refund') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <RefreshCcw className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            24-Hour Return & Refund Policy
          </h1>
          <p className="text-xs text-slate-500">
            FreshCart BD's customer-first satisfaction guarantee.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-medium">
            <strong className="block text-emerald-900 mb-1">Our Core Guarantee:</strong>
            You have the right to inspect all groceries (fresh fish, meat, fruits, vegetables) right at your doorstep before accepting or paying. If anything looks or smells substandard, you may reject that item immediately.
          </div>

          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">1. Perishable Items (Fish, Meat, Produce)</h3>
          <p>
            Because fish, meat, and vegetables are perishable, any complaints regarding freshness or cuts must be registered within <strong>24 hours</strong> of delivery by calling <strong>01700-373741</strong> or sending a picture on WhatsApp.
          </p>

          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">2. Non-Perishable Groceries (Rice, Oils, Ghee, Spices)</h3>
          <p>
            Staple groceries in sealed packaging can be returned within <strong>3 days</strong> if the seal is intact or if any adulteration or packaging damage is observed.
          </p>

          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">3. Refund Processing</h3>
          <p>
            Refunds for online payments (bKash, Nagad, Card) are processed within <strong>24 to 48 hours</strong> back to the original source account. For Cash on Delivery returns, we can credit your bKash wallet or offer store credits for your next purchase.
          </p>
        </div>
      </div>
    );
  }

  if (type === 'privacy') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Privacy & Data Protection Policy
          </h1>
          <p className="text-xs text-slate-500">
            How FreshCart BD securely handles your personal and delivery data.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            At FreshCart BD, we value your trust. We strictly collect only the necessary information (Name, Phone number, Delivery address, and Email) required to accurately process and deliver your grocery orders in Bangladesh.
          </p>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Data Security</h3>
          <p>
            We never sell, rent, or trade your personal telephone numbers or addresses to third-party telemarketers. All mobile financial transactions (bKash, Nagad) are processed through secure, bank-grade encrypted channels.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-xs text-slate-500">
          General marketplace conditions for ordering on FreshCart BD.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <p>
          By placing an order on FreshCart BD, you agree to these terms. Prices in Bangladeshi Taka (৳) are subject to daily market changes for fresh river catch and seasonal vegetables.
        </p>
        <p>
          Our delivery riders will wait up to 10 minutes at the designated address. Please ensure a valid contact number is provided at checkout.
        </p>
      </div>
    </div>
  );
};
