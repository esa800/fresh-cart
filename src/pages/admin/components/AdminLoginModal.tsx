import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, Eye, EyeOff, AlertCircle, Sparkles, Store, ArrowRight } from 'lucide-react';
import { StoreService } from '../../../services/store';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess, onNavigateHome }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const actualPassword = StoreService.getAdminPassword();

    setTimeout(() => {
      if (password === actualPassword) {
        StoreService.setAdminSession(true);
        onSuccess();
      } else {
        setError('ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড প্রদান করুন (ডিফল্ট: ESA006##)');
        setIsSubmitting(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl mx-auto shadow-lg mb-4">
            AP
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            FreshCart <span className="text-amber-400">BD</span> Admin Portal
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            দারাজ-স্টাইল ই-কমার্স অ্যাডমিন কন্ট্রোল প্যানেল
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                অ্যাডমিন পাসওয়ার্ড (Admin Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="পাসওয়ার্ড লিখুন..."
                  className={`w-full pl-10 pr-11 py-3 bg-slate-50 border ${
                    error ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                  } rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all outline-hidden`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Default Password Prompt & Security Note */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Key className="w-4 h-4 text-amber-600 shrink-0" />
                <span>ডিফল্ট অ্যাক্সেস ক্রেডেনশিয়াল:</span>
              </div>
              <p className="text-slate-700">
                ডিফল্ট পাসওয়ার্ড: <code className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded font-mono font-bold">ESA006##</code>
              </p>
              <p className="text-[11px] text-slate-500">
                লগইন করার পর <span className="font-semibold text-slate-700">Store Controls</span> ট্যাব থেকে যেকোনো সময় পাসওয়ার্ড পরিবর্তন করতে পারবেন।
              </p>
            </div>

            {/* Submit Button */}
            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isSubmitting ? 'যাচাই করা হচ্ছে...' : 'অ্যাডমিন প্যানেলে প্রবেশ করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Return to Home */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={onNavigateHome}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>মূল ওয়েবসাইটে ফিরে যান (Back to Store)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
