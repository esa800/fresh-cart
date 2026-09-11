import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Leaf,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  KeyRound,
  Store,
  Zap,
  LogIn
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { StoreService } from '../services/store';

interface AuthPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin'>('login');
  
  // Customer Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Customer Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Admin Quick Login field
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { login, register } = useAuth();
  const { showToast } = useToast();

  // 1-Click Demo Login for fast testing
  const handleQuickDemoCustomer = async () => {
    setLoginIdentifier('customer@khanstore.com');
    setLoginPassword('123456');
    setErrorMessage('');
    setIsLoading(true);

    const res = await login('customer@khanstore.com', '123456');
    setIsLoading(false);

    if (res.success) {
      showToast('গ্রাহক অ্যাকাউন্টে সফলভাবে লগইন হয়েছে!', 'success');
      onNavigate('customer-dashboard');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMessage('অনুগ্রহ করে মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsLoading(true);
    const res = await login(loginIdentifier, loginPassword);
    setIsLoading(false);

    if (res.success) {
      showToast('লগইন সফল হয়েছে! KHAN store এ স্বাগতম।', 'success');
      onNavigate('customer-dashboard');
    } else {
      setErrorMessage(res.message || 'ইমেইল বা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setErrorMessage('অনুগ্রহ করে নাম, ফোন নম্বর এবং পাসওয়ার্ড পূরণ করুন।');
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
      showToast('আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!', 'success');
      onNavigate('customer-dashboard');
    } else {
      setErrorMessage(res.message || 'অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে। ইমেইল বা ফোন নম্বরটি ইতোমধ্যে ব্যবহৃত হতে পারে।');
    }
  };

  // Direct Admin Portal Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const actual = StoreService.getAdminPassword();
    if (adminPassword.trim() === actual.trim()) {
      StoreService.setAdminSession(true);
      showToast('অ্যাডমিন প্যানেলে স্বাগতম!', 'success');
      onNavigate('admin');
    } else {
      setErrorMessage('অ্যাডমিন পাসওয়ার্ড সঠিক নয়! সঠিক পাসওয়ার্ড প্রদান করুন।');
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 max-w-5xl mx-auto">
      {/* Container Grid: Left Marketing Card (Desktop), Right Interactive Auth Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Visual Column: Benefits & Trust (Hidden on small mobile, prominent on desktop) */}
        <div className="lg:col-span-5 space-y-6 hidden sm:block">
          <div 
            onClick={() => onNavigate('home')} 
            className="cursor-pointer inline-flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#f85606] text-white flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="font-black text-2xl text-slate-900 tracking-tight flex items-center gap-1">
                <span>KHAN</span>
                <span className="text-[#f85606]">store</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">
                100% Pure & Organic
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              সহজ ও নিরাপদ কেনাকাটায় <br />
              <span className="text-[#f85606]">আপনার আস্থার ঠিকানা</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              লগইন করে আপনার পূর্বের সকল অর্ডারের লাইভ স্ট্যাটাস ট্র্যাক করুন, ফেভারিট উইশলিস্ট সংরক্ষণ করুন এবং এক্সক্লুসিভ অফার উপভোগ করুন।
            </p>
          </div>

          {/* Key Advantages Checklist */}
          <div className="space-y-3 bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">১-ক্লিকে দ্রুত চেকআউট</h4>
                <p className="text-[11px] text-slate-500">আপনার ঠিকানা ও যোগাযোগের তথ্য স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-orange-100 text-[#f85606] flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">লাইভ কুরিয়ার ও অর্ডার ট্র্যাকিং</h4>
                <p className="text-[11px] text-slate-500">স্টাডফাস্ট ও রেডেক্স কুরিয়ারের রিয়েল-টাইম পার্সেল আপডেট।</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">বিশেষ ডিসকাউন্ট ও মেম্বারশিপ পয়েন্ট</h4>
                <p className="text-[11px] text-slate-500">প্রতিটি ক্রয়ে বিশেষ ক্যাশব্যাক ও ভাউচার সুবিধা।</p>
              </div>
            </div>
          </div>

          {/* Trust Banner */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SSL সিকিউরড ২৫৬-বিট এনক্রিপশনযুক্ত গ্রাহক নিরাপত্তা</span>
          </div>
        </div>

        {/* Right Interactive Form Box */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 relative overflow-hidden">
            
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#f85606] via-amber-500 to-emerald-600" />

            {/* Mobile Header Brand (Visible on mobile) */}
            <div className="sm:hidden text-center space-y-1 pb-2">
              <div className="inline-flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#f85606] text-white flex items-center justify-center">
                  <Leaf className="w-5 h-5 fill-white" />
                </div>
                <span className="font-black text-xl text-slate-900">
                  KHAN <span className="text-[#f85606]">store</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">নিরাপদ খাদ্য সেবায় স্বাগতম</p>
            </div>

            {/* Three Tab Controls: Customer Login / Register / Admin Portal */}
            <div className="grid grid-cols-3 p-1.5 bg-slate-100/90 rounded-2xl gap-1">
              <button
                id="tab-login-btn"
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
                className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'login' 
                    ? 'bg-white text-slate-900 shadow-md shadow-slate-200' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-[#f85606]" />
                <span>লগইন (Sign In)</span>
              </button>

              <button
                id="tab-register-btn"
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
                className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'register' 
                    ? 'bg-white text-slate-900 shadow-md shadow-slate-200' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>নতুন একাউন্ট</span>
              </button>

              <button
                id="tab-admin-btn"
                type="button"
                onClick={() => { setActiveTab('admin'); setErrorMessage(''); }}
                className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'admin' 
                    ? 'bg-slate-900 text-amber-400 shadow-md shadow-slate-900/30' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>অ্যাডমিন</span>
              </button>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {/* 1. CUSTOMER LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 block">
                    মোবাইল নম্বর বা ইমেইল এড্রেস *
                  </label>
                  <div className="relative">
                    <input
                      id="login-email-input"
                      type="text"
                      required
                      placeholder="017xxxxxxxx বা name@example.com"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 transition-all outline-hidden font-medium"
                      autoFocus
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-black text-slate-700">পাসওয়ার্ড *</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] font-bold text-[#f85606] hover:underline cursor-pointer"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password-input"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="আপনার পাসওয়ার্ড লিখুন"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100 rounded-2xl pl-10 pr-11 py-3 text-xs sm:text-sm text-slate-900 transition-all outline-hidden font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#f85606] focus:ring-[#f85606] accent-[#f85606]" 
                    />
                    <span>লগইন তথ্য মনে রাখুন</span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#f85606] to-[#e04a00] hover:from-[#e04a00] hover:to-[#c83e00] disabled:bg-slate-300 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 active:scale-98 transition-all cursor-pointer"
                >
                  <span>{isLoading ? 'সাইন ইন করা হচ্ছে...' : 'লগইন করুন (Sign In)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 1-Click Fast Customer Demo Login Shortcut */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleQuickDemoCustomer}
                    className="w-full py-2.5 px-3 bg-orange-50/80 hover:bg-orange-100 text-[#f85606] border border-orange-200/80 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-[#f85606]" />
                    <span>১-ক্লিকে টেস্ট গ্রাহক লগইন (Quick Demo)</span>
                  </button>
                </div>
              </form>
            )}

            {/* 2. CUSTOMER REGISTRATION FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 block">আপনার পুরো নাম *</label>
                  <div className="relative">
                    <input
                      id="reg-name-input"
                      type="text"
                      required
                      placeholder="যেমন: মোঃ সাব্বির আহমেদ"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100 rounded-2xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 transition-all outline-hidden font-medium"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 block">
                    মোবাইল নম্বর (SMS কনফার্মেশনের জন্য) *
                  </label>
                  <div className="relative">
                    <input
                      id="reg-phone-input"
                      type="tel"
                      required
                      placeholder="017xxxxxxxx বা 018xxxxxxxx"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100 rounded-2xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 transition-all outline-hidden font-medium"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 block">ইমেইল এড্রেস (ঐচ্ছিক)</label>
                  <div className="relative">
                    <input
                      id="reg-email-input"
                      type="email"
                      placeholder="yourname@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100 rounded-2xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 transition-all outline-hidden font-medium"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 block">একটি নতুন পাসওয়ার্ড দিন *</label>
                  <div className="relative">
                    <input
                      id="reg-password-input"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="কমপক্ষে ৬টি অক্ষর লিখুন"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100 rounded-2xl pl-10 pr-11 py-2.5 text-xs sm:text-sm text-slate-900 transition-all outline-hidden font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="register-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-98 transition-all cursor-pointer"
                >
                  <span>{isLoading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'নতুন একাউন্ট খুলুন (Create Account)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 3. DIRECT ADMIN PORTAL LOGIN */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                    <Store className="w-4 h-4" />
                    <span>KHAN store Admin Panel Gateway</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    স্টোর ম্যানেজমেন্ট, কুরিয়ার পার্সেল বুকিং এবং প্রোডাক্ট স্টক কন্ট্রোল করতে অ্যাডমিন পাসওয়ার্ড প্রদান করুন।
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 block">
                    অ্যাডমিন পাসওয়ার্ড (Admin Password) *
                  </label>
                  <div className="relative">
                    <input
                      id="admin-direct-password-input"
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      placeholder="অ্যাডমিন পাসওয়ার্ড লিখুন..."
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 rounded-2xl pl-10 pr-11 py-3 text-xs sm:text-sm text-slate-900 font-mono transition-all outline-hidden"
                      autoFocus
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="admin-login-submit-btn"
                  type="submit"
                  disabled={!adminPassword.trim()}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-amber-300 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>অ্যাডমিন প্যানেলে প্রবেশ করুন</span>
                </button>
              </form>
            )}

            {/* Footer Help & Support */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>আপনার সকল তথ্য সম্পূর্ণ সুরক্ষিত</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="font-bold text-[#f85606] hover:underline cursor-pointer"
              >
                মূল ওয়েবসাইটে ফিরে যান →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Helper Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#f85606] flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-black text-base text-slate-900">পাসওয়ার্ড পুনরুদ্ধার</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                আপনার পাসওয়ার্ড ভুলে গিয়ে থাকলে আমাদের হেল্পলাইন নম্বরে বা হোয়াটসঅ্যাপে সরাসরি যোগাযোগ করুন। আমাদের টিম দ্রুত আপনার পাসওয়ার্ড রিসেট করে দিবে।
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1.5 border border-slate-200 text-slate-700">
              <div className="font-bold text-slate-900">হটলাইন ও সাপোর্ট:</div>
              <div className="flex items-center justify-between">
                <span>মোবাইল:</span>
                <span className="font-mono font-bold text-[#f85606]">01711-000000</span>
              </div>
              <div className="flex items-center justify-between">
                <span>হোয়াটসঅ্যাপ:</span>
                <span className="font-mono font-bold text-emerald-600">+8801711000000</span>
              </div>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              বুঝেছি / বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
