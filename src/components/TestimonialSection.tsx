import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Dr. Nusrat Parveen',
    location: 'Gulshan 2, Dhaka',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'ঘানি ভাঙা সরিষার তেল এবং দেশি গরুর মাংসের কোয়ালিটি সত্যিই দারুণ। ঢাকায় সচরাচর এত তাজা ও আসল স্বাদের বাজার পাওয়া কঠিন। ডেলিভারিও ঠিক ২ ঘণ্টার মধ্যে পেয়েছি।',
    product: 'Cold-Pressed Mustard Oil & Beef'
  },
  {
    id: 2,
    name: 'Mahmudul Hasan',
    location: 'Dhanmondi, Dhaka',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'পদ্মার ইলিশ মাছটা আসলেই অসাধারণ ছিল। মিষ্টি গন্ধ এবং তাজা রুপালি চকচকে। প্যাকেজিংয়ে বরফের ব্যবস্থা খুব ভালো ছিল। এখন থেকে নিয়মিত FreshCart BD থেকেই বাজার করব।',
    product: 'Padma River Hilsa (ইলিশ)'
  },
  {
    id: 3,
    name: 'Shamima Akter',
    location: 'Uttara Sector 7, Dhaka',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'মিনিকেট চাল ও পাবনার গাওয়া ঘি-এর কোনো তুলনা হয় না। পোলাও রান্না করার পর পুরো বাসা সুগন্ধে ভরে গিয়েছিল। bKash দিয়ে পেমেন্টও খুব স্মুথ ছিল।',
    product: 'Miniket Rice & Pure Gawa Ghee'
  }
];

export const TestimonialSection: React.FC = () => {
  return (
    <section className="space-y-6">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
          Customer Stories
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Loved by Bangladeshi Homemakers
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Real feedback from happy customers across Dhaka and beyond.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-5 h-5 text-emerald-100" />
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic mb-4">
                "{t.text}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <span>{t.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </h4>
                <p className="text-[11px] text-slate-400">{t.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
