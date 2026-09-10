import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Leaf,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface AuthPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, register } = useAuth();
  const { showToast } = useToast();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await login(loginEmail, loginPassword);
    setIsLoading(false);

    if (res.success) {
      showToast('লগইন সফল হয়েছে! স্বাগতম।', 'success');
      onNavigate('customer-dashboard');
    } else {
      setErrorMessage(res.message || 'ইমেইল বা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setErrorMessage('অনুগ্রহ করে সকল আবশ্যকীয় তথ্য পূরণ করুন।');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।');
      return;
    }

    setIsLoading(true);
    const res = await register(regName, regEmail, regPhone, regPassword);
    setIsLoading(false);

    if (res.success) {
      showToast('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!', 'success');
      onNavigate('customer-dashboard');
    } else {
      setErrorMessage(res.message || 'অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে। ইমেইল বা ফোন নম্বরটি ইতোমধ্যে ব্যবহৃত হতে পারে।');
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-6 pb-20">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div 
          onClick={() => onNavigate('home')} 
          className="cursor-pointer inline-flex items-center gap-2.5"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f85606] to-[#e04a00] text-white flex items-center justify-center shadow-md">
            <Leaf className="w-6 h-6 fill-white" />
          </div>
          <span className="font-black text-2xl text-slate-900 tracking-tight uppercase">
            KHAN <span className="text-[#f85606]">store</span>
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          অর্ডার ট্র্যাকিং ও নিরাপদ সেবার জন্য আপনার অ্যাকাউন্টে সাইন ইন করুন
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
          <button
            id="tab-login-btn"
            onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'login' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In (লগইন)
          </button>
          <button
            id="tab-register-btn"
            onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'register' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account (রেজিস্টার)
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">ইমেইল বা ফোন নম্বর *</label>
              <div className="relative">
                <input
                  id="login-email-input"
                  type="text"
                  required
                  placeholder="yourname@gmail.com বা মোবাইল নম্বর"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#f85606]"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700">পাসওয়ার্ড *</label>
              </div>
              <div className="relative">
                <input
                  id="login-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#f85606] font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#f85606] hover:bg-[#e04a00] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 active:scale-98 transition-all"
            >
              <span>{isLoading ? 'সাইন ইন হচ্ছে...' : 'সাইন ইন করুন (Sign In)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">আপনার পুরো নাম *</label>
              <div className="relative">
                <input
                  id="reg-name-input"
                  type="text"
                  required
                  placeholder="আপনার নাম লিখুন"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#f85606]"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">মোবাইল নম্বর (SMS কনফার্মেশনের জন্য) *</label>
              <div className="relative">
                <input
                  id="reg-phone-input"
                  type="tel"
                  required
                  placeholder="017xxxxxxxx"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#f85606]"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">ইমেইল এড্রেস (ঐচ্ছিক)</label>
              <div className="relative">
                <input
                  id="reg-email-input"
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#f85606]"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">পাসওয়ার্ড তৈরি করুন *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="কমপক্ষে ৬টি অক্ষর"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#f85606] font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#f85606] hover:bg-[#e04a00] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 active:scale-98 transition-all"
            >
              <span>{isLoading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>আপনার ব্যক্তিগত তথ্য KHAN store এ সম্পূর্ণ সুরক্ষিত</span>
        </div>
      </div>
    </div>
  );
};
