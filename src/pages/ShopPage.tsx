import React, { useState, useMemo, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  X, 
  SlidersHorizontal, 
  RotateCcw, 
  Check, 
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { StoreService, subscribeToStore } from '../services/store';
import { Product, Category } from '../types';

interface ShopPageProps {
  initialFilter?: string;
  initialCategory?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialFilter = '', initialCategory = '', onNavigate }) => {
  const [products, setProducts] = useState<Product[]>(() => StoreService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => StoreService.getCategories());

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onlyFlashSales, setOnlyFlashSales] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<number>(50000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeToStore(() => {
      setProducts(StoreService.getProducts());
      setCategories(StoreService.getCategories());
    });
    return unsub;
  }, []);

  const isProductInCategory = (p: Product, targetCat: string): boolean => {
    if (!targetCat || targetCat === 'all') return true;
    if (p.categoryId === targetCat || p.category === targetCat) return true;
    const catObj = categories.find((c) => c.slug === targetCat || c.id === targetCat);
    if (catObj) {
      return p.categoryId === catObj.id || p.category === catObj.slug || p.category === catObj.name;
    }
    return false;
  };

  // Parse initial query params like `search=rice` or `category=food-items` or `filter=flash`
  useEffect(() => {
    const filter = initialFilter || initialCategory || '';
    if (!filter) return;

    if (filter.startsWith('search=')) {
      const q = decodeURIComponent(filter.replace('search=', ''));
      setSearchQuery(q);
    } else if (filter.startsWith('category=')) {
      const cat = filter.replace('category=', '');
      setSelectedCategory(cat);
    } else if (filter.includes('flash')) {
      setOnlyFlashSales(true);
    } else if (filter.includes('discount')) {
      setSortBy('discount');
    } else {
      setSelectedCategory(filter);
    }
  }, [initialFilter, initialCategory]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (!isProductInCategory(p, selectedCategory)) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.banglaName && p.banglaName.includes(q)) ||
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.tags && p.tags.some((t) => t && t.toLowerCase().includes(q)));
          if (!matches) return false;
        }

        // Stock filter
        if (inStockOnly && (p.stockQuantity <= 0 || p.availability === 'out_of_stock')) {
          return false;
        }

        // Flash sale filter
        if (onlyFlashSales && p.discountPercentage < 9) {
          return false;
        }

        // Price filter
        if (p.salePrice > priceRange) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.salePrice - b.salePrice;
        if (sortBy === 'price-high') return b.salePrice - a.salePrice;
        if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        // Default: featured
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, inStockOnly, onlyFlashSales, priceRange, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setInStockOnly(false);
    setOnlyFlashSales(false);
    setPriceRange(50000);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery !== '' ||
    inStockOnly ||
    onlyFlashSales ||
    priceRange < 50000;

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb & Title */}
      <div className="bg-slate-100/70 p-4 sm:p-6 rounded-3xl border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span 
              onClick={() => onNavigate('home')} 
              className="hover:text-emerald-700 cursor-pointer font-medium"
            >
              Home
            </span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Grocery Shop</span>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-emerald-700 font-bold capitalize">
                  {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                </span>
              </>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {selectedCategory === 'all'
              ? 'All Grocery Essentials (বাজারের সবকিছু)'
              : categories.find((c) => c.slug === selectedCategory)?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredProducts.length} farm-fresh products ready for express delivery.
          </p>
        </div>

        {/* Mobile filter toggle button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-2 shadow-2xs"
          >
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filter Products</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Search within shop */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Product name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Categories Filter */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Categories</label>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
                <span>{products.length}</span>
              </button>

              {categories.map((cat) => {
                const count = products.filter((p) => isProductInCategory(p, cat.slug)).length;
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Max Price</span>
              <span className="text-emerald-700">৳{priceRange}</span>
            </div>
            <input
              type="range"
              min="50"
              max="50000"
              step="200"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>৳50</span>
              <span>৳50,000+</span>
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyFlashSales}
                onChange={(e) => setOnlyFlashSales(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Flash Deals Only
              </span>
            </label>
          </div>
        </aside>

        {/* Product Grid & Top Sort Bar */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Sort & Filter Pills */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            {/* Active Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Active Filters:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-lg font-bold border border-emerald-200">
                  {categories.find((c) => c.slug === selectedCategory)?.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                  "{searchQuery}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </span>
              )}
              {onlyFlashSales && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-xs px-2.5 py-1 rounded-lg font-bold border border-amber-200">
                  Flash Sale
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setOnlyFlashSales(false)} />
                </span>
              )}
              {!hasActiveFilters && (
                <span className="text-xs text-slate-400">None (Showing all)</span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Sort by:</span>
              <select
                id="shop-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No groceries found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                We couldn't find any products matching your selected filters or search terms. Try clearing filters to see all available groceries.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full p-5 overflow-y-auto flex flex-col space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Filter Groceries</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Category</p>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                    selectedCategory === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                      selectedCategory === c.slug ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] opacity-80">
                      ({products.filter((p) => isProductInCategory(p, c.slug)).length})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Max Price:</span>
                <span className="text-emerald-700">৳{priceRange}</span>
              </div>
              <input
                type="range"
                min="50"
                max="50000"
                step="200"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>In Stock Only</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={onlyFlashSales}
                  onChange={(e) => setOnlyFlashSales(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Flash Deals Only</span>
              </label>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
