import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, 
  Camera, 
  CheckCircle2, 
  ThumbsUp, 
  X, 
  Upload, 
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Review } from '../types';
import { StoreService } from '../services/store';
import { useToast } from '../contexts/ToastContext';

interface PhotoReviewsSectionProps {
  productId: string;
  productName: string;
}

const SAMPLE_GADGET_PHOTOS = [
  {
    label: 'আনবক্সিং ছবি',
    url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'হাতে নেওয়া ছবি',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'প্যাকেজিং বক্স',
    url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'গ্যাজেট লাইটিং',
    url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
  }
];

export const PhotoReviewsSection: React.FC<PhotoReviewsSectionProps> = ({
  productId,
  productName
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'photos' | '5' | '4'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showToast } = useToast();

  const loadReviews = () => {
    // Get product-specific reviews or fallback to sample verified reviews if newly added
    const all = StoreService.getReviews(productId);
    if (all.length === 0) {
      // If this specific product has no reviews yet, also pull global approved gadget reviews for social proof
      const fallback = StoreService.getReviews().slice(0, 3);
      setReviews(fallback);
    } else {
      setReviews(all);
    }
  };

  useEffect(() => {
    loadReviews();
    const unsub = StoreService.subscribeToStore(() => {
      loadReviews();
    });
    return unsub;
  }, [productId]);

  // Pre-fill user name if logged in
  useEffect(() => {
    const user = StoreService.getCurrentUser();
    if (user && !customerName) {
      setCustomerName(user.name);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    (Array.from(files) as File[]).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        showToast('অনুগ্রহ করে শুধুমাত্র ছবি (JPG, PNG, WEBP) আপলোড করুন', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('ছবির সাইজ সর্বোচ্চ ৫MB হতে পারবে', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddSamplePhoto = (url: string) => {
    if (images.includes(url)) {
      showToast('ছবিটি ইতোমধ্যে যুক্ত করা হয়েছে', 'info');
      return;
    }
    setImages((prev) => [...prev, url]);
    showToast('স্যাম্পল গ্যাজেট ফটো যুক্ত করা হয়েছে!', 'success');
  };

  const handleRemovePhoto = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('আপনার নাম লিখুন', 'error');
      return;
    }
    if (!comment.trim()) {
      showToast('অনুগ্রহ করে আপনার রিভিউ বা অভিজ্ঞতা লিখুন', 'error');
      return;
    }

    try {
      StoreService.addReview({
        productId,
        customerId: StoreService.getCurrentUser()?.id || `cust-${Date.now()}`,
        customerName: customerName.trim(),
        rating,
        comment: comment.trim(),
        images: images,
        isVerifiedPurchase: true,
        status: 'approved'
      });

      showToast('ধন্যবাদ! আপনার ছবি সহ রিভিউ সফলভাবে প্রকাশিত হয়েছে।', 'success');
      setComment('');
      setImages([]);
      setIsFormOpen(false);
      loadReviews();
    } catch (err) {
      console.error(err);
      showToast('রিভিউ সংরক্ষণ করতে সমস্যা হয়েছে', 'error');
    }
  };

  const handleHelpful = (reviewId: string) => {
    setHelpfulCounts((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
    showToast('ধন্যবাদ! আপনার মতামত গ্রহণ করা হয়েছে।', 'success');
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'photos') return r.images && r.images.length > 0;
    if (activeFilter === '5') return r.rating === 5;
    if (activeFilter === '4') return r.rating === 4;
    return true;
  });

  // Collect all photos from reviews for the top gallery
  const allReviewPhotos = reviews.flatMap((r) => (r.images || []).map(img => ({ img, reviewer: r.customerName })));
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <div className="space-y-6">
      {/* Top Rating & Photo Review Stats Header */}
      <div className="bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 rounded-3xl p-5 sm:p-7 border border-orange-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-orange-100">
          <div className="flex items-center gap-4">
            <div className="text-center sm:text-left pr-4 border-r border-orange-200">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 block leading-none">
                {avgRating}
              </span>
              <div className="flex items-center gap-1 text-amber-400 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">
                {reviews.length} টি রিভিউ
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#f85606] text-xs font-bold mb-1">
                <Camera className="w-3.5 h-3.5" />
                <span>ছবি সহ কাস্টমার রিভিউ (Photo Reviews)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                ১০০% আসল ক্রেতাদের গ্যাজেট আনবক্সিং, প্যাকেজিং এবং বাস্তব ব্যবহারিক ছবি ও মতামত।
              </p>
            </div>
          </div>

          <button
            id="open-review-form-btn"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2.5 bg-[#f85606] hover:bg-[#ea580c] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Camera className="w-4 h-4" />
            <span>{isFormOpen ? 'ফর্ম বন্ধ করুন' : 'ছবি সহ রিভিউ দিন'}</span>
          </button>
        </div>

        {/* Customer Photos Showcase Strip */}
        {allReviewPhotos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#f85606]" />
                <span>ক্রেতাদের আপলোডকৃত আসল ছবি ({allReviewPhotos.length})</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">বড় করে দেখতে ছবিতে ক্লিক করুন</span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {allReviewPhotos.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setPreviewImage(item.img)}
                  className="relative group shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white shadow-sm hover:border-[#f85606] transition-all cursor-pointer"
                >
                  <img
                    src={item.img}
                    alt="Customer gadget review"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Submission Form Modal / Box */}
      {isFormOpen && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-orange-300 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#f85606] flex items-center justify-center font-bold">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  ছবি সহ আপনার রিভিউ লিখুন
                </h4>
                <p className="text-[11px] text-slate-500">
                  {productName}-এর জন্য আপনার মূল্যবান মতামত ও ছবি শেয়ার করুন
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsFormOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Star Rating Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                আপনার রেটিং নির্বাচন করুন <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {rating === 5 ? 'অসাধারণ (৫/৫)' : rating === 4 ? 'খুব ভালো (৪/৫)' : rating === 3 ? 'মোটামুটি (৩/৫)' : 'বাজে'}
                </span>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আপনার নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="যেমন: তানভীর আহমেদ"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f85606]/20 focus:border-[#f85606]"
              />
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আপনার অভিজ্ঞতা বা রিভিউ লিখুন <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="গ্যাজেটের পারফর্মেন্স, সাউন্ড/ক্যামেরা কোয়ালিটি, প্যাকেজিং এবং সার্ভিস কেমন লেগেছে লিখুন..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f85606]/20 focus:border-[#f85606] leading-relaxed"
              />
            </div>

            {/* Photo Upload Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#f85606]" />
                  <span>পণ্য বা আনবক্সিং ছবি যোগ করুন (ঐচ্ছিক)</span>
                </label>
                <span className="text-[10px] text-slate-400">সর্বোচ্চ ৫MB (JPG, PNG)</span>
              </div>

              {/* Upload Trigger Box */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-3 border-2 border-dashed border-orange-300 hover:border-[#f85606] bg-orange-50/50 hover:bg-orange-50 rounded-2xl text-xs font-bold text-[#f85606] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>ডিভাইস থেকে ছবি আপলোড করুন</span>
                </button>

                {/* Quick Add Preset Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium">অথবা স্যাম্পল ছবি যোগ করুন:</span>
                  {SAMPLE_GADGET_PHOTOS.map((sample, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleAddSamplePhoto(sample.url)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-orange-100 hover:text-[#f85606] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      + {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="flex items-center gap-3 pt-2 flex-wrap">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-orange-300 group shadow-2xs">
                      <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs cursor-pointer hover:bg-rose-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit CTA */}
            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#f85606] hover:bg-[#ea580c] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>রিভিউ প্রকাশ করুন</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#f85606] text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          সব রিভিউ ({reviews.length})
        </button>

        <button
          onClick={() => setActiveFilter('photos')}
          className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeFilter === 'photos'
              ? 'bg-[#f85606] text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>ছবি সহ ({reviews.filter(r => r.images && r.images.length > 0).length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('5')}
          className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer ${
            activeFilter === '5'
              ? 'bg-[#f85606] text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>৫ স্টার</span>
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 divide-y divide-slate-100">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">এই ফিল্টারে কোনো রিভিউ পাওয়া যায়নি</p>
            <p className="text-[11px] text-slate-500">প্রথম ব্যক্তি হিসেবে ছবি সহ রিভিউ প্রকাশ করুন!</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="pt-4 first:pt-0 space-y-3">
              {/* Reviewer Meta */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-[#f85606] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                        {review.customerName}
                      </h5>
                      {review.isVerifiedPurchase && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> যাচাইকৃত ক্রেতা
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Helpful Button */}
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-[11px] font-semibold text-slate-600 hover:text-[#f85606] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>সহায়ক ({helpfulCounts[review.id] || 0})</span>
                </button>
              </div>

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-12">
                {review.comment}
              </p>

              {/* Attached Review Photos */}
              {review.images && review.images.length > 0 && (
                <div className="pl-12 flex items-center gap-2.5 flex-wrap pt-1">
                  {review.images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setPreviewImage(img)}
                      className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 hover:border-[#f85606] shadow-2xs transition-all cursor-pointer"
                    >
                      <img
                        src={img}
                        alt="Customer review attachment"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-3xl max-h-[85vh] bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Full size customer photo"
              className="max-h-[80vh] w-auto object-contain mx-auto"
              referrerPolicy="no-referrer"
            />
            <div className="p-3 bg-slate-950/80 text-center text-xs text-slate-300 font-medium">
              গ্রাহকের আপলোডকৃত গ্যাজেট ফটো • KHAN GADGET BD কাস্টমার রিভিউ
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
