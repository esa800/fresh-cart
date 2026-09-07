import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Phone, Search } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'Delivery',
    question: 'How fast is your grocery delivery in Dhaka?',
    answer: 'We offer 2-Hour Express Delivery in Dhaka North and South (Gulshan, Banani, Dhanmondi, Uttara, Bashundhara, Mirpur, Mohammadpur). For regular scheduled orders, you can pick next-morning delivery slots between 8:00 AM and 1:00 PM.'
  },
  {
    category: 'Fish & Meat',
    question: 'Do you clean, descale, and cut fish and meat before delivery?',
    answer: 'Yes! All fish (including Padma Hilsa, Rui, Katla, and Chingri) are carefully descaled, gutted, washed, and cut into standard curry pieces by experienced butchers. You can also specify custom cuts in the delivery note field at checkout.'
  },
  {
    category: 'Quality & Authenticity',
    question: 'How do you guarantee the mustard oil and ghee are 100% pure?',
    answer: 'Our mustard oil is cold-pressed using traditional wooden ghanis (কাঠের ঘানি) in Pabna and Sirajganj without added artificial essence or petroleum solvents. Our ghee is hand-churned from grass-fed cow milk butter. We back every bottle with a 100% money-back adulteration guarantee.'
  },
  {
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash on Delivery (COD), bKash, Nagad, Rocket, and all local Bangladeshi Visa, Mastercard, and UnionPay debit/credit cards.'
  },
  {
    category: 'Returns & Refunds',
    question: 'What if I am not satisfied with the quality of vegetables or fish?',
    answer: 'We provide a 24-Hour No-Hassle Return Policy. You can inspect all items upon delivery. If any product does not meet your expectations, hand it back to our rider or call our support within 24 hours for an immediate replacement or full refund to your bKash/bank.'
  },
  {
    category: 'Delivery',
    question: 'What is the minimum order for free delivery?',
    answer: 'Orders of ৳1,000 or more in Dhaka qualify for FREE Standard Delivery. For outside Dhaka (Chattogram, Sylhet, Gazipur), free delivery applies to orders above ৳1,500.'
  }
];

export const FaqPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [filter, setFilter] = useState('');

  const filtered = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(filter.toLowerCase()) ||
      f.answer.toLowerCase().includes(filter.toLowerCase()) ||
      f.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Frequently Asked Questions (সাধারণ জিজ্ঞাসা)
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Everything you need to know about fresh delivery, fish preparation, bKash payments, and returns.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto relative pt-2">
          <input
            type="text"
            placeholder="Search questions (e.g. delivery, fish, payment)..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-5" />
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filtered.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs transition-colors"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-700"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Banner */}
      <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-200 text-center space-y-2">
        <h4 className="text-xs font-bold text-emerald-950">Still have questions?</h4>
        <p className="text-xs text-emerald-800">Our customer team is standing by 24/7 on WhatsApp & Phone.</p>
        <a
          href="tel:+8801700373741"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call 01700-373741</span>
        </a>
      </div>
    </div>
  );
};
