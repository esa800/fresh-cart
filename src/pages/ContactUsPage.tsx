import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { StoreService } from '../services/store';

export const ContactUsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState(() => StoreService.getSettings());
  const { showToast } = useToast();

  useEffect(() => {
    const unsub = StoreService.subscribeToStore(() => {
      setSettings(StoreService.getSettings());
    });
    return unsub;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      showToast('Please fill in your name, phone and message', 'error');
      return;
    }

    setSubmitted(true);
    showToast('Your message has been received! Our support agent will call you within 15 minutes.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#f85606] uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
          Customer Support
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          We are Here to Help with Your Gadgets & Orders
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Have an inquiry, bulk order request, warranty support, or need tracking assistance? Contact our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info (5 cols) */}
        <div className="md:col-span-5 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-800">
          <div>
            <h3 className="text-lg font-black">{settings.storeName || 'KHAN GADGET BD'} Support HQ</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Main office and nationwide gadget dispatch operations hub.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 text-slate-300">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>{settings.officeAddress || settings.address || 'House 14, Road 4, Sector 7, Uttara, Dhaka 1230, Bangladesh'}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <Phone className="w-5 h-5 text-[#f85606] shrink-0" />
              <span>Hotline: <strong>{settings.hotline || settings.phone || '01854774406'}</strong></span>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <a
                href={`https://wa.me/88${(settings.whatsappNumber || '01854774406').replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-300 transition-colors"
              >
                WhatsApp: <strong>{settings.whatsappNumber || '01854774406'}</strong>
              </a>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <Mail className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{settings.supportEmail || settings.email || 'info@khangadgetbd.com'}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Support & Dispatch: 9:00 AM - 10:00 PM (Everyday)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
            <strong className="text-white block mb-1">Corporate & Bulk Orders:</strong>
            <span>Looking for corporate gifting or bulk gadget supplies? Email {settings.supportEmail || 'info@khangadgetbd.com'} or call {settings.hotline || '01854774406'}.</span>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#f85606] mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Message Received!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you, {name}. Our customer care representative will call you shortly on {phone}.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 bg-[#f85606] hover:bg-[#e04a00] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Send Us a Message</h3>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asif Mahmud"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#f85606]/20 focus:border-[#f85606] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="018XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#f85606]/20 focus:border-[#f85606] transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="asif@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#f85606]/20 focus:border-[#f85606] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">How can we help? *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write your gadget question, order inquiry, or delivery issue here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#f85606]/20 focus:border-[#f85606] transition-all leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#f85606] hover:bg-[#e04a00] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
