import React, { useState, useRef } from 'react';
import { 
  Settings, Save, Key, Lock, Eye, EyeOff, ShieldCheck, 
  Store, Phone, Mail, MapPin, Bell, Download, Upload, 
  CheckCircle2, AlertCircle, RefreshCw, Truck
} from 'lucide-react';
import { StoreSettings } from '../../../types';
import { StoreService } from '../../../services/store';

interface StoreControlsTabProps {
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
  onRefreshData: () => void;
}

export const StoreControlsTab: React.FC<StoreControlsTabProps> = ({
  settings,
  onSaveSettings,
  onRefreshData
}) => {
  // Local Form state for Settings
  const [storeName, setStoreName] = useState(settings.storeName || 'KHAN GADGET BD');
  const [tagline, setTagline] = useState(settings.tagline || 'স্মার্ট গ্যাজেট ও মোবাইল এক্সেসরিজের বিশ্বস্ত প্রতিষ্ঠান');
  const [phone, setPhone] = useState(settings.phone || '01854774406');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '01854774406');
  const [email, setEmail] = useState(settings.email || 'info@khangadgetbd.com');
  const [address, setAddress] = useState(settings.address || 'House 14, Road 4, Sector 7, Uttara, Dhaka 1230, Bangladesh');
  
  // Announcement
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(settings.isAnnouncementActive !== false);
  const [announcementText, setAnnouncementText] = useState(
    settings.announcementText || '🔥 আজকের স্পেশাল অফার: যেকোনো গ্যাজেট অর্ডারে ১০% ইনস্ট্যান্ট ছাড়! প্রোমোকোড: KHAN10 | সারাদেশে ক্যাশ অন ডেলিভারি'
  );

  // Delivery Charges
  const [deliveryChargeDhaka, setDeliveryChargeDhaka] = useState(settings.deliveryChargeDhaka || 60);
  const [deliveryChargeOutside, setDeliveryChargeOutside] = useState(settings.deliveryChargeOutside || 120);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(settings.freeDeliveryThreshold || 2000);

  // About Us
  const [aboutUsText, setAboutUsText] = useState(
    settings.aboutUsText || 'KHAN GADGET BD বাংলাদেশের অন্যতম নির্ভরযোগ্য অথেন্টিক মোবাইল গ্যাজেট ও লাইফস্টাইল অ্যাক্সেসরিজ ই-কমার্স প্ল্যাটফর্ম।'
  );

  // Feedback Banner
  const [savedSuccessMessage, setSavedSuccessMessage] = useState('');

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Backup file input ref
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Save General Settings
  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoreSettings = {
      ...settings,
      storeName,
      tagline,
      phone,
      whatsappNumber,
      email,
      address,
      isAnnouncementActive,
      announcementText,
      deliveryChargeDhaka: Number(deliveryChargeDhaka),
      deliveryChargeOutside: Number(deliveryChargeOutside),
      freeDeliveryThreshold: Number(freeDeliveryThreshold),
      aboutUsText
    };

    onSaveSettings(updated);
    setSavedSuccessMessage('স্টোর সেটিংস সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!');
    setTimeout(() => setSavedSuccessMessage(''), 3500);
  };

  // Change Admin Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const actualCurrent = StoreService.getAdminPassword();
    if (currentPassword !== actualCurrent) {
      setPasswordError('বর্তমান পাসওয়ার্ড সঠিক নয়!');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }

    StoreService.setAdminPassword(newPassword);
    setPasswordSuccess('অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! পরবর্তী লগইনে এটি ব্যবহার করুন।');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const jsonStr = StoreService.exportStoreSnapshot();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KHAN-GADGET-BD-Store-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StoreService.importStoreSnapshot(content);
        if (success) {
          alert('ব্যাকআপ ডাটা সফলভাবে রিস্টোর হয়েছে! পেজটি রিফ্রেশ হচ্ছে...');
          onRefreshData();
          window.location.reload();
        } else {
          alert('ব্যাকআপ ফাইলটি অকার্যকর বা ফরম্যাট সঠিক নয়!');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <span>স্টোর কন্ট্রোল ও সিকিউরিটি সেটিংস (Store Controls & Security)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          যোগাযোগের তথ্য, নোটিশ বার, ডেলিভারি চার্জ, পাসওয়ার্ড ও ডাটা ব্যাকআপ
        </p>
      </div>

      {savedSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedSuccessMessage}</span>
        </div>
      )}

      {/* 1. Store Profile & Announcement Form */}
      <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
        {/* Top Announcement Bar Control */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>টপ অ্যানাউন্সমেন্ট নোটিশ বার (Top Announcement Bar)</span>
              </h3>
              <p className="text-xs text-slate-500">
                ওয়েবসাইটের সবচেয়ে উপরে দারাজ-স্টাইলে বিশেষ অফার বা জরুরি বিজ্ঞপ্তি প্রদর্শন করুন
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-bold text-slate-700">নোটিশ সক্রিয়:</span>
              <input
                type="checkbox"
                checked={isAnnouncementActive}
                onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              বিজ্ঞপ্তি টেক্সট (Notice Message)
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="🚚 ঢাকা শহরে ২ ঘণ্টার মধ্যে নিশ্চিত ডেলিভারি!..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          {/* Live Preview */}
          <div className="bg-slate-900 text-amber-300 p-2.5 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2 border border-slate-800">
            <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded uppercase">
              লাইভ প্রিভিউ
            </span>
            <span className="truncate">{announcementText || 'কোনো নোটিশ নেই'}</span>
          </div>
        </div>

        {/* Store Information */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>স্টোর পরিচিতি ও সাপোর্ট কন্ট্রোল (Store Information)</span>
            </h3>
            <p className="text-xs text-slate-500">
              ওয়েবসাইটের হেডার, ফুটার ও ইনভয়েসে এই তথ্য স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">স্টোরের নাম (Brand Name)</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ট্যাগলাইন (Slogan)</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">কাস্টমার কেয়ার হটলাইন</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01700-373741"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">সাপোর্ট হোয়াটসঅ্যাপ নাম্বার</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="01700-373741"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">অফিসিয়াল ইমেইল</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">অফিস ও ওয়্যারহাউস ঠিকানা</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">আমাদের সম্পর্কে (About Us Text)</label>
            <textarea
              rows={2}
              value={aboutUsText}
              onChange={(e) => setAboutUsText(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Delivery Charges Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>ডেলিভারি চার্জ নির্ধারণ (Delivery Rates)</span>
            </h3>
            <p className="text-xs text-slate-500">
              চেকআউটে গ্রাহকের এলাকা অনুযায়ী চার্জ স্বয়ংক্রিয়ভাবে যুক্ত হবে
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">ঢাকা সিটি ডেলিভারি (৳)</label>
              <input
                type="number"
                min="0"
                value={deliveryChargeDhaka}
                onChange={(e) => setDeliveryChargeDhaka(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-black text-slate-900 bg-white"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">ঢাকার বাহিরে ডেলিভারি (৳)</label>
              <input
                type="number"
                min="0"
                value={deliveryChargeOutside}
                onChange={(e) => setDeliveryChargeOutside(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-black text-slate-900 bg-white"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">ফ্রি ডেলিভারি থ্রেশহোল্ড (৳)</label>
              <input
                type="number"
                min="0"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-black text-emerald-700 bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">এই পরিমাণের বেশি অর্ডারে চার্জ ফ্রি</span>
            </div>
          </div>
        </div>

        {/* Save General Settings Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>স্টোর সেটিংস সংরক্ষণ করুন (Save Settings)</span>
          </button>
        </div>
      </form>

      {/* 2. Change Admin Password Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>অ্যাডমিন পাসওয়ার্ড পরিবর্তন (Change Admin Password)</span>
            </h3>
            <p className="text-xs text-slate-500">
              অ্যাডমিন প্যানেলের নিরাপত্তা নিশ্চিত করতে নিয়মিত শক্তিশালী পাসওয়ার্ড ব্যবহার করুন
            </p>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">বর্তমান পাসওয়ার্ড (Current Password)</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="বর্তমান পাসওয়ার্ড দিন..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">নতুন পাসওয়ার্ড (New Password)</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড দিন..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">কনফার্ম পাসওয়ার্ড (Confirm)</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড পুনরায় দিন..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>পাসওয়ার্ড আপডেট করুন</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Cloud Sync & Snapshot Backup/Restore */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-600" />
            <span>ডাটা ব্যাকআপ ও রিস্টোর (Cloud Sync & Snapshot Backup)</span>
          </h3>
          <p className="text-xs text-slate-500">
            পুরো ওয়েবসাইটের পণ্য, অর্ডার, ক্যাটাগরি, সেটিংস ও কুপন ডাটা ১-ক্লিকে ডাউনলোড ও রিস্টোর করুন
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Download Backup */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>ফুল ডাটাবেজ ব্যাকআপ ডাউনলোড</span>
              </span>
              <p className="text-xs text-slate-500 mt-1">
                সকল পণ্য, অর্ডার তালিকা এবং স্টোর সেটিংস একটি সুরক্ষিত JSON ফাইলে আপনার কম্পিউটারে ডাউনলোড হবে।
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="mt-3 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>এখনই ব্যাকআপ ফাইল ডাউনলোড করুন (JSON)</span>
            </button>
          </div>

          {/* Restore Backup */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>ব্যাকআপ ফাইল থেকে ডাটা রিস্টোর</span>
              </span>
              <p className="text-xs text-slate-500 mt-1">
                পূর্বের ব্যাকআপকৃত JSON ফাইল আপলোড করে এক নিমেষেই পূর্বের সমস্ত তথ্য ফিরিয়ে আনুন।
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={backupInputRef}
                accept=".json"
                className="hidden"
                onChange={handleImportBackup}
              />
              <button
                type="button"
                onClick={() => backupInputRef.current?.click()}
                className="mt-3 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-98"
              >
                <Upload className="w-4 h-4" />
                <span>JSON ব্যাকআপ ফাইল সিলেক্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
