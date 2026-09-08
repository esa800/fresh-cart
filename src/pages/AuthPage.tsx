import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Role } from '../types';

interface AuthPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('tanvir@khangadgetbd.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, register, switchDemoRole } = useAuth();
  const { showToast } = useToast();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await login(loginEmail, loginPassword);
    setIsLoading(false);

    if (res.success) {
      showToast(res.message, 'success');
      if (res.user && ['super_admin', 'manager', 'order_manager', 'product_manager'].includes(res.user.role)) {
        onNavigate('admin');
      } else {
        onNavigate('customer-dashboard');
      }
    } else {
      setErrorMessage(res.message);
      showToast(res.message, 'error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }

    setIsLoading(true);
    const res = await register(regName, regEmail, regPhone, regPassword);
    setIsLoading(false);

    if (res.success) {
      showToast(res.message, 'success');
      onNavigate('customer-dashboard');
    } else {
      setErrorMessage(res.message);
      showToast(res.message, 'error');
    }
  };

  const handleQuickDemoLogin = (role: Role) => {
    switchDemoRole(role);
    showToast(`Logged in as ${role.replace('_', ' ').toUpperCase()}`, 'success');
    if (role === 'super_admin' || role === 'order_manager' || role === 'product_manager') {
      onNavigate('admin');
    } else {
      onNavigate('customer-dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6 pb-16">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div 
          onClick={() => onNavigate('home')} 
          className="cursor-pointer inline-flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-[#f85606] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            KG
          </div>
          <span className="font-black text-2xl text-slate-900 tracking-tight">
            KHAN GADGET <span className="text-[#f85606]">BD</span>
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Sign in to track orders, save delivery addresses and view exclusive discounts.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
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
              <label className="text-xs font-bold text-slate-700 block">Email Address *</label>
              <div className="relative">
                <input
                  id="login-email-input"
                  type="email"
                  required
                  placeholder="tanvir@khangadgetbd.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700">Password *</label>
                <span className="text-emerald-700 font-semibold cursor-pointer hover:underline">Forgot?</span>
              </div>
              <div className="relative">
                <input
                  id="login-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahfuzur Rahman"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="mahfuz@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Mobile Number (017XXXXXXXX) *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="01711223344"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Create Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
            >
              <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Quick Demo Test Access Box */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Instant Demo Accounts (One-Click Testing)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Click any account role below to instantly log in and verify features:
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => handleQuickDemoLogin('customer')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-center transition-colors"
            >
              <span className="font-bold text-[11px] block">Customer</span>
              <span className="text-[9px] text-slate-400">Regular Buyer</span>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('super_admin')}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-center transition-colors"
            >
              <span className="font-bold text-[11px] text-amber-900 block">Super Admin</span>
              <span className="text-[9px] text-amber-700">All Modules</span>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('order_manager')}
              className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-center transition-colors"
            >
              <span className="font-bold text-[11px] text-sky-900 block">Order Ops</span>
              <span className="text-[9px] text-sky-700">Orders & Stock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
