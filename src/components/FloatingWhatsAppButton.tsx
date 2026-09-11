import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { StoreService } from '../services/store';

export const FloatingWhatsAppButton: React.FC = () => {
  const [settings, setSettings] = useState(() => StoreService.getSettings());
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const unsub = StoreService.subscribeToStore ? StoreService.subscribeToStore(() => {
      setSettings(StoreService.getSettings());
    }) : undefined;
    return unsub;
  }, []);

  const rawPhone = settings.whatsappNumber || settings.phone || '01854774406';
  const cleanNumber = rawPhone.replace(/[^0-9]/g, '');
  const formattedNumber = cleanNumber.startsWith('88') 
    ? cleanNumber 
    : `88${cleanNumber.startsWith('0') ? cleanNumber : '0' + cleanNumber}`;

  const message = `আসসালামু আলাইকুম! আমি ${settings.storeName || 'KHAN STORE'} থেকে অর্ডার ও প্রোডাক্ট সম্পর্কে বিস্তারিত জানতে চাই।`;
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div 
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-center group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip on hover / desktop */}
      <div 
        className={`hidden sm:flex items-center gap-2 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-lg mr-2 transition-all duration-300 pointer-events-none ${
          showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>WhatsApp এ অর্ডার করুন</span>
      </div>

      {/* Floating Circular WhatsApp Button */}
      <a
        id="floating-whatsapp-btn"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer select-none"
      >
        {/* Radar Pulse Effect */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping -z-10" />

        {/* WhatsApp Vector Icon */}
        <svg 
          className="w-7 h-7 fill-current drop-shadow-xs" 
          viewBox="0 0 24 24"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.43 1.02 2.6.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/>
        </svg>

        {/* Online Status Green Dot */}
        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
        </span>
      </a>
    </div>
  );
};
