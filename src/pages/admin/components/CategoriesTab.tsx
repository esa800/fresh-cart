import React, { useState, useRef } from 'react';
import { 
  FolderTree, Plus, Edit3, Trash2, X, Upload, 
  Layers, CheckCircle2, ShoppingBag, ExternalLink
} from 'lucide-react';
import { Category, Product } from '../../../types';

interface CategoriesTabProps {
  categories: Category[];
  products: Product[];
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  products,
  onSaveCategory,
  onDeleteCategory
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [banglaName, setBanglaName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('ShoppingBag');
  const [image, setImage] = useState('');
  const [subcategoriesInput, setSubcategoriesInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setBanglaName(cat.banglaName);
      setSlug(cat.slug);
      setIcon(cat.icon || 'ShoppingBag');
      setImage(cat.image || '');
      setSubcategoriesInput(cat.subcategories ? cat.subcategories.join(', ') : '');
    } else {
      setEditingCategory(null);
      setName('');
      setBanglaName('');
      setSlug('');
      setIcon('ShoppingBag');
      setImage('https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80');
      setSubcategoriesInput('');
    }
    setIsModalOpen(true);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) setImage(res);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !banglaName.trim()) {
      alert('নাম এবং বাংলা নাম প্রদান করা আবশ্যক!');
      return;
    }

    const generatedSlug = slug.trim() 
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') 
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const subcats = subcategoriesInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newCategory: Category = {
      id: editingCategory?.id || `cat-${Date.now()}`,
      name: name.trim(),
      banglaName: banglaName.trim(),
      slug: generatedSlug,
      icon,
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      description: `${banglaName} - KHAN GADGET BD প্রিমিয়াম কালেকশন`,
      featured: true,
      subcategories: subcats.length > 0 ? subcats : ['General', 'Premium']
    };

    onSaveCategory(newCategory);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-emerald-600" />
            <span>ক্যাটাগরি ম্যানেজার (Categories Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            নতুন ক্যাটাগরি তৈরি, রিনেম, লাইভ প্রোডাক্ট কাউন্টার ও সাব-ক্যাটাগরি কন্ট্রোল
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ক্যাটাগরি যোগ করুন (New Category)</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const productCount = products.filter(
            (p) => p.categoryId === category.id || (p.category && p.category.toLowerCase().includes(category.name.toLowerCase()))
          ).length;

          return (
            <div 
              key={category.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between group hover:border-emerald-300 transition-colors"
            >
              <div>
                {/* Category Cover Image */}
                <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                  
                  {/* Live Product Counter Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" />
                    <span>{productCount} টি পণ্য</span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <h3 className="font-bold text-sm text-white drop-shadow-xs truncate">{category.name}</h3>
                    <p className="text-[11px] text-emerald-200 drop-shadow-xs font-medium">{category.banglaName}</p>
                  </div>
                </div>

                {/* Subcategories list preview */}
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>স্লাগ (Slug):</span>
                    <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded font-bold">
                      {category.slug}
                    </code>
                  </div>

                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        সাব-ক্যাটাগরি ({category.subcategories.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories.slice(0, 4).map((sub, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {sub}
                          </span>
                        ))}
                        {category.subcategories.length > 4 && (
                          <span className="text-[10px] text-slate-400">+{category.subcategories.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  ID: {category.id.slice(0, 10)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openModal(category)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="রিনেম ও সংশোধন করুন"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`আপনি কি নিশ্চিতভাবে "${category.name}" ক্যাটাগরিটি মুছে ফেলতে চান?`)) {
                        onDeleteCategory(category.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden my-6">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-emerald-600" />
                <span>{editingCategory ? 'ক্যাটাগরি সংশোধন (Edit)' : 'নতুন ক্যাটাগরি তৈরি (Add)'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ক্যাটাগরির নাম (English Name) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Dairy & Eggs"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বাংলা নাম (Bangla Name) *
                </label>
                <input
                  type="text"
                  required
                  value={banglaName}
                  onChange={(e) => setBanglaName(e.target.value)}
                  placeholder="যেমন: দুগ্ধ ও ডিম্বজাত"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইউআরএল স্লাগ (Slug)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="dairy-eggs"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ক্যাটাগরি কভার ছবি (Image URL বা আপলোড)
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={image.startsWith('data:') ? 'Local file uploaded' : image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:border-emerald-600 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>আপলোড</span>
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFile}
                  />

                  {image && (
                    <div className="h-20 w-full rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সাব-ক্যাটাগরি তালিকা (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={subcategoriesInput}
                  onChange={(e) => setSubcategoriesInput(e.target.value)}
                  placeholder="Milk, Butter, Cheese, Farm Eggs"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {editingCategory ? 'আপডেট করুন' : 'ক্যাটাগরি সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
