import React, { useState, useRef } from 'react';
import { 
  Package, Plus, Search, Filter, Edit3, Trash2, CheckCircle2, 
  Flame, ShieldCheck, Truck, Upload, Image as ImageIcon, X, 
  Tag, Layers, Sparkles, AlertCircle
} from 'lucide-react';
import { Product, Category } from '../../../types';

// Helper to detect category type for dynamic inputs and unit suggestions
const getCategoryType = (catId?: string, catName?: string, catSlug?: string): 'fashion' | 'food' | 'electronics' | 'beauty' | 'general' => {
  const s = `${catId || ''} ${catName || ''} ${catSlug || ''}`.toLowerCase();
  if (
    s.includes('fashion') || s.includes('cloth') || s.includes('dress') ||
    s.includes('sharee') || s.includes('sari') || s.includes('panjabi') ||
    s.includes('shirt') || s.includes('pant') || s.includes('shoe') ||
    s.includes('apparel') || s.includes('wear') || s.includes('জামদানি') ||
    s.includes('শাড়ি') || s.includes('পোশাক') || s.includes('পাঞ্জাবি') ||
    s.includes('বোরকা') || s.includes('হিজাব') || s.includes('থ্রি-পিস') ||
    s.includes('জুতো') || s.includes('জুতা') || s.includes('ব্যাগ')
  ) {
    return 'fashion';
  }
  if (
    s.includes('gadget') || s.includes('electronic') || s.includes('mobile') ||
    s.includes('watch') || s.includes('headphone') || s.includes('earphone') ||
    s.includes('cable') || s.includes('charger') || s.includes('phone')
  ) {
    return 'electronics';
  }
  if (
    s.includes('cosmetic') || s.includes('beauty') || s.includes('skin') ||
    s.includes('hair') || s.includes('perfume') || s.includes('cream') || s.includes('soap')
  ) {
    return 'beauty';
  }
  if (
    s.includes('food') || s.includes('honey') || s.includes('date') ||
    s.includes('oil') || s.includes('ghee') || s.includes('spice') ||
    s.includes('rice') || s.includes('flour') || s.includes('lentil') ||
    s.includes('khejur') || s.includes('চাল') || s.includes('মধু') ||
    s.includes('তেল') || s.includes('ঘি') || s.includes('মশলা') || s.includes('ডাল') ||
    s.includes('organic') || s.includes('খাবার')
  ) {
    return 'food';
  }
  return 'general';
};

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleBadge: (productId: string, badge: 'isFlashSale' | 'isDarazMall' | 'isFreeDelivery') => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  categories,
  onSaveProduct,
  onDeleteProduct,
  onToggleBadge
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'flash' | 'darazmall' | 'freedelivery'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formBanglaName, setFormBanglaName] = useState('');
  const [formBrand, setFormBrand] = useState('KHAN Selected');
  const [formCustomBrand, setFormCustomBrand] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formRegularPrice, setFormRegularPrice] = useState(120);
  const [formSalePrice, setFormSalePrice] = useState(100);
  const [formUnit, setFormUnit] = useState('1 Piece');
  const [formStock, setFormStock] = useState(25);
  const [formLowStockThreshold, setFormLowStockThreshold] = useState(5);
  const [formDescription, setFormDescription] = useState('');
  
  // 4 Images slots (Slot 1: Cover, Slots 2-4: Gallery)
  const [formImages, setFormImages] = useState<string[]>(['', '', '', '']);

  // Badges
  const [formIsFlashSale, setFormIsFlashSale] = useState(false);
  const [formIsDarazMall, setFormIsDarazMall] = useState(true);
  const [formIsFreeDelivery, setFormIsFreeDelivery] = useState(false);

  // Variants (Colors, Sizes, Models)
  const [formVariantInput, setFormVariantInput] = useState('');
  const [formVariants, setFormVariants] = useState<string[]>([]);

  // File input refs for the 4 slots
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Popular Brands preset with Fashion, Gadgets & Essentials
  const popularBrands = [
    'KHAN Selected', 'KHAN Collection', 'Aarong', 'Dorji', 'Sailor', 'Yellow', 'Apex', 'Bata',
    'Anker', 'Baseus', 'Apple', 'Samsung', 'Xiaomi', 'Remax', 'Hoco', 'Boat', 'Oraimo',
    'Square', 'Pran', 'ACI', 'Radhuni', 'No Brand', 'Other'
  ];

  // Active Category Type helper
  const currentCategoryObj = categories.find((c) => c.id === formCategory || c.slug === formCategory);
  const activeCategoryType = getCategoryType(formCategory, currentCategoryObj?.name, currentCategoryObj?.slug);

  // Handle Category Change and adapt Unit and Variants automatically
  const handleCategoryChange = (newCatId: string) => {
    setFormCategory(newCatId);
    const cat = categories.find((c) => c.id === newCatId);
    const type = getCategoryType(newCatId, cat?.name, cat?.slug);

    if (type === 'fashion') {
      if (formUnit === '1 kg' || !formUnit || formUnit === '1 piece') {
        setFormUnit('1 Piece');
      }
      if (formVariants.length === 0 || (formVariants.length === 1 && formVariants[0] === 'Standard')) {
        setFormVariants(['Free Size']);
      }
    } else if (type === 'food') {
      if (formUnit === '1 Piece' || !formUnit) {
        setFormUnit('1 kg');
      }
      if (formVariants.length === 0 || (formVariants.length === 1 && formVariants[0] === 'Free Size')) {
        setFormVariants(['Standard']);
      }
    } else {
      if (!formUnit || formUnit === '1 kg') {
        setFormUnit('1 Piece');
      }
    }
  };

  // Open Add / Edit Modal
  const openModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setFormName(prod.name);
      setFormBanglaName(prod.banglaName);
      setFormBrand(popularBrands.includes(prod.brand) ? prod.brand : 'Other');
      setFormCustomBrand(popularBrands.includes(prod.brand) ? '' : prod.brand);
      setFormCategory(prod.categoryId);
      setFormRegularPrice(prod.regularPrice);
      setFormSalePrice(prod.salePrice);
      setFormUnit(prod.unit || prod.weightSize || '1 Piece');
      setFormStock(prod.stockQuantity);
      setFormLowStockThreshold(prod.lowStockThreshold || 5);
      setFormDescription(prod.shortDescription || prod.fullDescription || '');
      
      const imgs = [
        prod.images[0] || '',
        prod.images[1] || '',
        prod.images[2] || '',
        prod.images[3] || ''
      ];
      setFormImages(imgs);

      setFormIsFlashSale(Boolean(prod.isFlashSale || (prod.tags && prod.tags.includes('flash_sale'))));
      setFormIsDarazMall(Boolean(prod.isDarazMall !== false));
      setFormIsFreeDelivery(Boolean(prod.isFreeDelivery));
      setFormVariants(prod.variants && prod.variants.length > 0 ? prod.variants : ['Standard']);
    } else {
      const defaultCat = categories[0]?.id || 'cat-fashion';
      const defaultCatObj = categories[0];
      const type = getCategoryType(defaultCat, defaultCatObj?.name, defaultCatObj?.slug);

      setEditingProduct(null);
      setFormName('');
      setFormBanglaName('');
      setFormBrand(type === 'fashion' ? 'KHAN Collection' : 'KHAN Selected');
      setFormCustomBrand('');
      setFormCategory(defaultCat);
      setFormRegularPrice(1200);
      setFormSalePrice(950);
      setFormUnit(type === 'fashion' ? '1 Piece' : type === 'food' ? '1 kg' : '1 Piece');
      setFormStock(25);
      setFormLowStockThreshold(5);
      setFormDescription(
        type === 'fashion'
          ? 'উন্নত মানের প্রিমিয়াম ফেব্রিক ও স্টাইলিশ আরামদায়ক কালেকশন।'
          : 'উন্নত মানের তাজা ও প্রিমিয়াম গ্রেডের পণ্য, সরাসরি সোর্সিং করা।'
      );
      // Clean slots ready for image file upload or image URL link
      setFormImages(['', '', '', '']);
      setFormIsFlashSale(false);
      setFormIsDarazMall(true);
      setFormIsFreeDelivery(false);
      setFormVariants(type === 'fashion' ? ['Free Size'] : ['Standard']);
    }
    setIsModalOpen(true);
  };

  // Image Upload handler for file reading
  const handleImageFileChange = (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const updated = [...formImages];
        updated[slotIndex] = result;
        setFormImages(updated);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleImageUrlChange = (slotIndex: number, url: string) => {
    const updated = [...formImages];
    updated[slotIndex] = url;
    setFormImages(updated);
  };

  // Variant Add / Remove
  const handleAddVariant = () => {
    if (formVariantInput.trim() && !formVariants.includes(formVariantInput.trim())) {
      setFormVariants([...formVariants, formVariantInput.trim()]);
      setFormVariantInput('');
    }
  };

  const handleRemoveVariant = (variantToRemove: string) => {
    setFormVariants(formVariants.filter((v) => v !== variantToRemove));
  };

  // Save Product Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBanglaName.trim()) {
      alert('নাম এবং বাংলা নাম পূরণ করা বাধ্যতামূলক!');
      return;
    }

    // Filter valid images from any of the 4 slots (upload file or web link)
    const validImages = formImages.filter((img) => img && typeof img === 'string' && img.trim().length > 0 && img !== 'Local file uploaded');
    if (validImages.length === 0) {
      alert('অনুগ্রহ করে অন্তত ১টি ছবি আপলোড করুন অথবা ছবির লিংক দিন!');
      return;
    }

    const brandName = formBrand === 'Other' ? (formCustomBrand.trim() || 'KHAN Selected') : formBrand;
    const catObj = categories.find((c) => c.id === formCategory) || categories[0];
    const discountPct = Number(formRegularPrice) > Number(formSalePrice)
      ? Math.round(((Number(formRegularPrice) - Number(formSalePrice)) / Number(formRegularPrice)) * 100)
      : 0;

    const finalUnit = formUnit.trim() || (activeCategoryType === 'fashion' ? '1 Piece' : activeCategoryType === 'food' ? '1 kg' : '1 Piece');

    const productPayload: Product = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      name: formName.trim(),
      banglaName: formBanglaName.trim(),
      slug: editingProduct?.slug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      sku: editingProduct?.sku || `FC-${Math.floor(1000 + Math.random() * 9000)}`,
      category: catObj?.name || 'Fashion',
      categoryId: catObj?.id || formCategory || 'cat-fashion',
      brand: brandName,
      shortDescription: formDescription.slice(0, 100),
      fullDescription: formDescription,
      images: validImages,
      regularPrice: Number(formRegularPrice),
      salePrice: Number(formSalePrice),
      discountPercentage: discountPct,
      unit: finalUnit,
      weightSize: finalUnit,
      stockQuantity: Number(formStock),
      lowStockThreshold: Number(formLowStockThreshold),
      availability: Number(formStock) === 0 ? 'out_of_stock' : Number(formStock) <= Number(formLowStockThreshold) ? 'low_stock' : 'in_stock',
      isFeatured: true,
      isBestSeller: Boolean(editingProduct?.isBestSeller),
      isNewArrival: Boolean(editingProduct?.isNewArrival),
      isFlashSale: formIsFlashSale,
      isDarazMall: formIsDarazMall,
      isFreeDelivery: formIsFreeDelivery,
      variants: formVariants.length > 0 ? formVariants : (activeCategoryType === 'fashion' ? ['Free Size'] : ['Standard']),
      tags: formIsFlashSale ? ['flash_sale', 'top_deal'] : ['verified'],
      rating: editingProduct?.rating || 4.8,
      reviewCount: editingProduct?.reviewCount || 12,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveProduct(productPayload);
    setIsModalOpen(false);
  };

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.banglaName.includes(searchTerm) ||
      (prod.brand && prod.brand.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || prod.categoryId === selectedCategory;

    const matchesStock = 
      stockFilter === 'all' ||
      (stockFilter === 'in_stock' && prod.stockQuantity > (prod.lowStockThreshold || 5)) ||
      (stockFilter === 'low_stock' && prod.stockQuantity > 0 && prod.stockQuantity <= (prod.lowStockThreshold || 5)) ||
      (stockFilter === 'out_of_stock' && prod.stockQuantity === 0);

    const matchesBadge = 
      badgeFilter === 'all' ||
      (badgeFilter === 'flash' && Boolean(prod.isFlashSale || (prod.tags && prod.tags.includes('flash_sale')))) ||
      (badgeFilter === 'darazmall' && Boolean(prod.isDarazMall)) ||
      (badgeFilter === 'freedelivery' && Boolean(prod.isFreeDelivery));

    return matchesSearch && matchesCategory && matchesStock && matchesBadge;
  });

  return (
    <div className="space-y-6">
      {/* Top Action & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>প্রোডাক্ট ম্যানেজমেন্ট (Products Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            নতুন পণ্য যুক্ত করুন, ৪টি ছবি আপলোড, স্টক, ভ্যারিয়েন্ট ও ব্যাজ কন্ট্রোল করুন
          </p>
        </div>

        <button
          id="admin-add-product-btn"
          onClick={() => openModal()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন পণ্য যোগ করুন (Add Product)</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="নাম, বাংলা নাম বা ব্র্যান্ড দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">সকল ক্যাটাগরি ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.banglaName})
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">সকল স্টক স্ট্যাটাস</option>
              <option value="in_stock">ইন-স্টক (In Stock)</option>
              <option value="low_stock">কম স্টক (Low Stock ≤5)</option>
              <option value="out_of_stock">স্টক শেষ (Out of Stock)</option>
            </select>
          </div>

          {/* Badge Filter */}
          <div>
            <select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">সকল ব্যাজ ফিল্টার</option>
              <option value="flash">🔥 Flash Sale (হট ডিল)</option>
              <option value="darazmall">🏬 DarazMall Verified</option>
              <option value="freedelivery">🚚 Free Delivery</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>মোট প্রদর্শিত পণ্য: <strong className="text-slate-800">{filteredProducts.length}</strong> টি</span>
          {(searchTerm || selectedCategory !== 'all' || stockFilter !== 'all' || badgeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setStockFilter('all');
                setBadgeFilter('all');
              }}
              className="text-emerald-700 hover:underline font-bold"
            >
              ফিল্টার রিসেট করুন
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">পণ্য ও ছবি</th>
                <th className="py-3 px-4">ক্যাটাগরি ও ব্র্যান্ড</th>
                <th className="py-3 px-4 text-right">মূল্য (৳)</th>
                <th className="py-3 px-4 text-center">স্টক পরিমাণ</th>
                <th className="py-3 px-4 text-center">দারাজ-স্টাইল স্পেশাল ব্যাজ</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    কোনো পণ্য পাওয়া যায়নি। সার্চ ফিল্টার পরিবর্তন করুন অথবা নতুন পণ্য যোগ করুন।
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isFlash = Boolean(product.isFlashSale || (product.tags && product.tags.includes('flash_sale')));
                  const isMall = Boolean(product.isDarazMall !== false);
                  const isFreeDel = Boolean(product.isFreeDelivery);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-xl shrink-0 border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">{product.name}</p>
                            <p className="text-[11px] text-slate-500">{product.banglaName}</p>
                            <span className="text-[10px] text-slate-400">SKU: {product.sku} • {product.unit}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {product.category}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          ব্র্যান্ড: <strong className="text-slate-800">{product.brand || 'KHAN GADGET'}</strong>
                        </p>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-black text-slate-900 text-sm">৳{product.salePrice}</span>
                        {product.regularPrice > product.salePrice && (
                          <span className="block text-[11px] text-slate-400 line-through">
                            ৳{product.regularPrice}
                          </span>
                        )}
                        {product.discountPercentage > 0 && (
                          <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5">
                            {product.discountPercentage}% ছাড়
                          </span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-xs ${
                          product.stockQuantity === 0
                            ? 'bg-rose-100 text-rose-800'
                            : product.stockQuantity <= (product.lowStockThreshold || 5)
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {product.stockQuantity} {product.unit}
                        </span>
                        {product.stockQuantity <= (product.lowStockThreshold || 5) && product.stockQuantity > 0 && (
                          <span className="block text-[10px] text-amber-600 font-bold mt-0.5">কম স্টক</span>
                        )}
                      </td>

                      {/* 1-Click Toggle Badges */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Flash Sale Toggle */}
                          <button
                            onClick={() => onToggleBadge(product.id, 'isFlashSale')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all ${
                              isFlash 
                                ? 'bg-amber-500 text-slate-950 shadow-xs ring-1 ring-amber-400' 
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title="Flash Sale টগল করুন"
                          >
                            <Flame className="w-3 h-3" />
                            <span>Flash</span>
                          </button>

                          {/* DarazMall Toggle */}
                          <button
                            onClick={() => onToggleBadge(product.id, 'isDarazMall')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all ${
                              isMall 
                                ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-500' 
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title="Mall Verified টগল করুন"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Mall</span>
                          </button>

                          {/* Free Delivery Toggle */}
                          <button
                            onClick={() => onToggleBadge(product.id, 'isFreeDelivery')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all ${
                              isFreeDel 
                                ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-500' 
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title="Free Delivery টগল করুন"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Free</span>
                          </button>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openModal(product)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="এডিট করুন"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden my-4">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <span>{editingProduct ? 'পণ্য সংশোধন করুন (Edit Product)' : 'নতুন পণ্য যোগ করুন (Add Product)'}</span>
                </h3>
                <p className="text-xs text-slate-500">৪টি ছবি আপলোড, ক্যাটাগরি, মূল্য ও ভ্যারিয়েন্ট নির্ধারণ</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} noValidate className="p-6 overflow-y-auto space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পণ্যের নাম (English Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Silk Sharee or Cotton Panjabi"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বাংলা নাম (Bangla Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBanglaName}
                    onChange={(e) => setFormBanglaName(e.target.value)}
                    placeholder="যেমন: প্রিমিয়াম জামদানি শাড়ি বা সুতি পাঞ্জাবি"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              {/* Category & Brand & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্যাটাগরি (Category) *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.banglaName})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                    টাইপ: {activeCategoryType === 'fashion' ? 'পোশাক / ফ্যাশন' : activeCategoryType === 'food' ? 'খাবার / মুদি' : activeCategoryType === 'electronics' ? 'গ্যাজেট / ইলেকট্রনিক্স' : activeCategoryType === 'beauty' ? 'বিউটি / কসমেটিক্স' : 'সাধারণ'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ব্র্যান্ড (Brand)
                  </label>
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden bg-white"
                  >
                    {popularBrands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {formBrand === 'Other' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      কাস্টম ব্র্যান্ডের নাম লিখুন
                    </label>
                    <input
                      type="text"
                      value={formCustomBrand}
                      onChange={(e) => setFormCustomBrand(e.target.value)}
                      placeholder="ব্র্যান্ডের নাম লিখুন..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {activeCategoryType === 'fashion' 
                      ? 'সাইজ / ইউনিট (Size / Unit)' 
                      : activeCategoryType === 'food' 
                      ? 'ওজন / পরিমাপ (Weight / Unit)' 
                      : 'ইউনিট (Unit)'}
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder={
                      activeCategoryType === 'fashion'
                        ? 'যেমন: 1 Piece, 1 Set, XL, 3 Piece...'
                        : activeCategoryType === 'food'
                        ? 'যেমন: 1 kg, 500g, 1 Litre, 250g...'
                        : 'যেমন: 1 Piece, 1 Box...'
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden bg-white"
                  />
                  {/* Category Quick Unit Pills */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(activeCategoryType === 'fashion'
                      ? ['1 Piece', '1 Set', '3 Piece', 'Free Size', 'S', 'M', 'L', 'XL', 'XXL']
                      : activeCategoryType === 'food'
                      ? ['1 kg', '500 gm', '250 gm', '1 Litre', '5 kg', '12 pcs']
                      : activeCategoryType === 'electronics'
                      ? ['1 Piece', '1 Unit', '1 Box', '1 Pair']
                      : activeCategoryType === 'beauty'
                      ? ['1 Piece', '50 ml', '100 ml', '1 Tube']
                      : ['1 Piece', '1 Set', '1 Box', '1 kg', '500g']
                    ).map((unitPreset) => (
                      <button
                        key={unitPreset}
                        type="button"
                        onClick={() => setFormUnit(unitPreset)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-bold transition-colors ${
                          formUnit === unitPreset 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                        }`}
                      >
                        {unitPreset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    রেগুলার প্রাইস (Regular ৳)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formRegularPrice}
                    onChange={(e) => setFormRegularPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:border-emerald-600 focus:outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সেল প্রাইস (Sale ৳) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-emerald-700 focus:border-emerald-600 focus:outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    স্টক সংখ্যা (Stock Qty) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:border-emerald-600 focus:outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    লো-স্টক থ্রেশহোল্ড
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formLowStockThreshold}
                    onChange={(e) => setFormLowStockThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-rose-600 focus:border-emerald-600 focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              {/* 4 Images Upload Slots */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    ৪টি ছবির স্লট (4-Image Gallery Upload)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    কম্পিউটার/মোবাইল থেকে সরাসরি ছবি আপলোড করুন অথবা ইমেজ লিংক পেস্ট করুন (উভয়ই সমর্থিত)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const hasImage = Boolean(formImages[slotIdx] && formImages[slotIdx].trim().length > 0);
                    const isLocalUpload = Boolean(formImages[slotIdx]?.startsWith('data:'));

                    return (
                      <div 
                        key={slotIdx} 
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                            {slotIdx === 0 ? '১. কভার ছবি (Cover)' : `ছবি #${slotIdx + 1}`}
                            {slotIdx === 0 && <span className="text-[9px] bg-orange-100 text-orange-700 px-1 py-0.2 rounded font-bold">মেইন</span>}
                          </span>
                          {hasImage && (
                            <button
                              type="button"
                              onClick={() => handleImageUrlChange(slotIdx, '')}
                              className="text-slate-400 hover:text-rose-600"
                              title="ছবি মুছুন"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Image Preview Box */}
                        <div 
                          onClick={() => fileInputRefs[slotIdx].current?.click()}
                          className="w-full h-28 bg-white border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-colors"
                        >
                          {hasImage ? (
                            <>
                              <img
                                src={formImages[slotIdx]}
                                alt={`Slot ${slotIdx + 1}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                                ছবি পরিবর্তন করুন
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-2 text-slate-400">
                              <Upload className="w-5 h-5 mx-auto mb-1 text-slate-400 group-hover:text-emerald-600" />
                              <span className="text-[10px] font-semibold block">ছবি আপলোড</span>
                              <span className="text-[8px] text-slate-400 block">ক্লিক করুন</span>
                            </div>
                          )}
                        </div>

                        {/* Hidden File Input */}
                        <input
                          type="file"
                          ref={fileInputRefs[slotIdx]}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileChange(slotIdx, e)}
                        />

                        {/* Direct URL Input or Upload Status */}
                        {isLocalUpload ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                              <span className="flex items-center gap-1 truncate">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                ফাইল আপলোডকৃত
                              </span>
                              <button
                                type="button"
                                onClick={() => handleImageUrlChange(slotIdx, '')}
                                className="text-slate-400 hover:text-rose-600 shrink-0 text-[9px]"
                              >
                                মুছুন
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="বা অন্য লিংক পেস্ট..."
                              value=""
                              onChange={(e) => handleImageUrlChange(slotIdx, e.target.value)}
                              className="w-full px-2 py-1 text-[10px] border border-slate-300 rounded-lg text-slate-600 bg-white focus:outline-hidden focus:border-emerald-600"
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="বা ইমেজ লিংক (URL) পেস্ট..."
                            value={formImages[slotIdx] || ''}
                            onChange={(e) => handleImageUrlChange(slotIdx, e.target.value)}
                            className="w-full px-2 py-1 text-[10px] border border-slate-300 rounded-lg text-slate-600 bg-white focus:outline-hidden focus:border-emerald-600"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Variants (Multi-Tag manager with Category-specific presets) */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {activeCategoryType === 'fashion' 
                      ? 'সাইজ ও কালার ভ্যারিয়েন্ট (Sizes & Colors)' 
                      : activeCategoryType === 'food'
                      ? 'ওজন ও প্যাক ভ্যারিয়েন্ট (Weight & Pack Variants)'
                      : 'ভ্যারিয়েন্ট ও সাইজ / কালার (Product Variants)'}
                  </label>
                  <span className="text-[10px] text-slate-500">
                    ক্লিক করে দ্রুত ভ্যারিয়েন্ট যোগ করুন অথবা নিচে লিখে এন্টার দিন
                  </span>
                </div>

                {/* Quick Add Variant Pills based on category */}
                <div className="space-y-1.5 pb-1">
                  {activeCategoryType === 'fashion' ? (
                    <>
                      {/* Fashion Sizes */}
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-500 mr-1">সাইজ:</span>
                        {['Free Size', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Semi-Stitched', 'Unstitched'].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              if (!formVariants.includes(size)) {
                                setFormVariants([...formVariants, size]);
                              }
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded-md border font-bold transition-all ${
                              formVariants.includes(size)
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            + {size}
                          </button>
                        ))}
                      </div>

                      {/* Fashion Colors */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] font-bold text-slate-500 mr-1">কালার:</span>
                        {['লাল (Red)', 'কালো (Black)', 'সাদা (White)', 'নীল (Blue)', 'হলুদ (Yellow)', 'সবুজ (Green)', 'গোলাপী (Pink)', 'মেরুন (Maroon)', 'মাল্টিকালার (Multicolor)'].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              if (!formVariants.includes(color)) {
                                setFormVariants([...formVariants, color]);
                              }
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded-md border font-bold transition-all ${
                              formVariants.includes(color)
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            + {color}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : activeCategoryType === 'food' ? (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-500 mr-1">ওজন:</span>
                      {['250g', '500g', '1 kg', '2 kg', '5 kg', 'Standard'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            if (!formVariants.includes(opt)) {
                              setFormVariants([...formVariants, opt]);
                            }
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-bold transition-all ${
                            formVariants.includes(opt)
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          + {opt}
                        </button>
                      ))}
                    </div>
                  ) : activeCategoryType === 'electronics' ? (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-500 mr-1">মডেল/কালার:</span>
                      {['Black', 'White', 'Silver', '64GB', '128GB', '256GB', 'Standard'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            if (!formVariants.includes(opt)) {
                              setFormVariants([...formVariants, opt]);
                            }
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-bold transition-all ${
                            formVariants.includes(opt)
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          + {opt}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formVariantInput}
                    onChange={(e) => setFormVariantInput(e.target.value)}
                    placeholder={
                      activeCategoryType === 'fashion'
                        ? 'যেমন: XL, লাল, ৩ পিস, Semi-Stitched (লিখে Enter চাপুন)...'
                        : activeCategoryType === 'food'
                        ? 'যেমন: 500g, 1kg, প্রিমিয়াম প্যাক (লিখে Enter চাপুন)...'
                        : 'যেমন: Space Gray, 128GB, XL, 500g...'
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddVariant();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    যোগ করুন
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formVariants.map((v) => (
                    <span 
                      key={v}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>{v}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Special Badges Switches */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  দারাজ-স্টাইল স্পেশাল ফিচার ব্যাজসমূহ (Badges)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Flash Sale */}
                  <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                    formIsFlashSale ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formIsFlashSale}
                      onChange={(e) => setFormIsFlashSale(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        Flash Sale (হট ডিল)
                      </span>
                      <span className="text-[10px] text-slate-500 block">হোমপেজের ফ্ল্যাশ সেল সেকশনে দেখাবে</span>
                    </div>
                  </label>

                  {/* DarazMall */}
                  <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                    formIsDarazMall ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formIsDarazMall}
                      onChange={(e) => setFormIsDarazMall(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        Mall Verified
                      </span>
                      <span className="text-[10px] text-slate-500 block">১০০% অথেনটিক পণ্য ব্যাজ</span>
                    </div>
                  </label>

                  {/* Free Delivery */}
                  <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                    formIsFreeDelivery ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formIsFreeDelivery}
                      onChange={(e) => setFormIsFreeDelivery(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        Free Delivery
                      </span>
                      <span className="text-[10px] text-slate-500 block">এই পণ্যে ডেলিভারি চার্জ নেই</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পণ্যের বিবরণ ও বৈশিষ্ট্য (Description)
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="পণ্যটির গুণাগুণ, প্রস্তুতকারক ও অর্গানিক বৈশিষ্ট্য সম্পর্কে লিখুন..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-95"
                >
                  {editingProduct ? 'আপডেট সম্পন্ন করুন' : 'পণ্য সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
