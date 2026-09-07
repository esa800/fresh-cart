import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Layers, 
  Tag, 
  Truck, 
  BarChart3, 
  ShieldAlert, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowLeft,
  DollarSign,
  FileText,
  UserCheck,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { StoreService, subscribeToStore } from '../../services/store';
import { Product, Order, Category, Coupon, DeliveryZone, OrderStatus, PaymentStatus } from '../../types';
import { InvoiceModal } from '../../components/InvoiceModal';

interface AdminDashboardProps {
  onNavigate: (view: string, param?: string) => void;
}

type AdminTab = 'overview' | 'products' | 'orders' | 'categories' | 'inventory' | 'coupons' | 'delivery' | 'reports';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { currentUser, hasPermission, switchDemoRole } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Reactive data states
  const [products, setProducts] = useState<Product[]>(() => StoreService.getProducts());
  const [orders, setOrders] = useState<Order[]>(() => StoreService.getOrders());
  const [categories, setCategories] = useState<Category[]>(() => StoreService.getCategories());
  const [coupons, setCoupons] = useState<Coupon[]>(() => StoreService.getCoupons());
  const [zones, setZones] = useState<DeliveryZone[]>(() => StoreService.getDeliveryZones());

  // Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Product Create/Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category Create/Edit Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Coupon Create Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Subscribe to store updates
  useEffect(() => {
    const unsub = subscribeToStore(() => {
      setProducts(StoreService.getProducts());
      setOrders(StoreService.getOrders());
      setCategories(StoreService.getCategories());
      setCoupons(StoreService.getCoupons());
      setZones(StoreService.getDeliveryZones());
    });
    return unsub;
  }, []);

  // Check role access
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const canManageProducts = hasPermission(['super_admin', 'manager', 'product_manager']);
  const canManageOrders = hasPermission(['super_admin', 'manager', 'order_manager']);

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => o.paymentStatus === 'paid' ? sum + o.total : sum, 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed');
  const lowStockProducts = products.filter((p) => p.stockQuantity <= (p.lowStockThreshold || 10));

  // Product Form states
  const [formName, setFormName] = useState('');
  const [formBanglaName, setFormBanglaName] = useState('');
  const [formCategory, setFormCategory] = useState('fish-seafood');
  const [formRegPrice, setFormRegPrice] = useState(100);
  const [formSalePrice, setFormSalePrice] = useState(90);
  const [formUnit, setFormUnit] = useState('1 kg');
  const [formStock, setFormStock] = useState(25);
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsFlashSale, setFormIsFlashSale] = useState(false);

  const openProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setFormName(prod.name);
      setFormBanglaName(prod.banglaName);
      setFormCategory(prod.categoryId);
      setFormRegPrice(prod.regularPrice);
      setFormSalePrice(prod.salePrice);
      setFormUnit(prod.unit);
      setFormStock(prod.stockQuantity);
      setFormImage(prod.images[0] || '');
      setFormDescription(prod.shortDescription || prod.fullDescription || '');
      setFormIsFlashSale(Boolean(prod.tags && prod.tags.includes('flash_sale')));
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormBanglaName('');
      setFormCategory(categories[0]?.id || 'cat-food-items');
      setFormRegPrice(150);
      setFormSalePrice(140);
      setFormUnit('1 kg');
      setFormStock(20);
      setFormImage('https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');
      setFormDescription('Fresh organic farm produce sourced directly from Bangladeshi farms.');
      setFormIsFlashSale(false);
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBanglaName.trim()) {
      showToast('Name and Bangla name are required', 'error');
      return;
    }

    const discountPct = Number(formRegPrice) > Number(formSalePrice)
      ? Math.round(((Number(formRegPrice) - Number(formSalePrice)) / Number(formRegPrice)) * 100)
      : 0;
    const catObj = categories.find(c => c.id === formCategory) || categories[0];

    const payload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formName.trim(),
      banglaName: formBanglaName.trim(),
      slug: formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: editingProduct?.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: catObj ? catObj.name : 'Groceries',
      categoryId: formCategory,
      brand: editingProduct?.brand || 'FreshCart Organic',
      regularPrice: Number(formRegPrice),
      salePrice: Number(formSalePrice),
      discountPercentage: discountPct,
      unit: formUnit.trim(),
      weightSize: formUnit.trim(),
      stockQuantity: Number(formStock),
      lowStockThreshold: 8,
      availability: Number(formStock) <= 0 ? 'out_of_stock' : Number(formStock) <= 8 ? 'low_stock' : 'in_stock',
      images: [formImage.trim() || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'],
      shortDescription: formDescription.trim(),
      fullDescription: formDescription.trim(),
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: !editingProduct,
      tags: formIsFlashSale ? ['flash_sale'] : [],
      rating: editingProduct?.rating || 4.8,
      reviewCount: editingProduct?.reviewCount || 12,
      origin: 'Bangladesh Local Farms',
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StoreService.saveProduct(payload);
    showToast(editingProduct ? 'Product updated successfully!' : 'New product added to catalog!', 'success');
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the inventory?`)) {
      StoreService.deleteProduct(id);
      showToast(`Removed "${name}"`, 'info');
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    StoreService.updateOrderStatus(orderId, newStatus);
    showToast(`Order status changed to ${newStatus}`, 'success');
  };

  const handleUpdatePaymentStatus = (orderId: string, newStatus: PaymentStatus) => {
    StoreService.updatePaymentStatus(orderId, newStatus);
    showToast(`Payment status updated to ${newStatus}`, 'success');
  };

  const handleInlineStockChange = (productId: string, newStock: number) => {
    if (newStock < 0) return;
    const target = products.find(p => p.id === productId);
    if (target) {
      StoreService.saveProduct({
        ...target,
        stockQuantity: newStock,
        availability: newStock <= 0 ? 'out_of_stock' : newStock <= target.lowStockThreshold ? 'low_stock' : 'in_stock'
      });
      showToast('Stock count updated', 'info');
    }
  };

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'fixed' | 'percentage'>('percentage');
  const [couponValue, setCouponValue] = useState(10);
  const [couponMinOrder, setCouponMinOrder] = useState(500);

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    StoreService.saveCoupon({
      id: `cpn-${Date.now()}`,
      code: couponCode.trim().toUpperCase(),
      discountType: couponType,
      discountValue: Number(couponValue),
      minOrderAmount: Number(couponMinOrder),
      maxDiscountAmount: 500,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: 100,
      usageCount: 0,
      isActive: true
    });

    showToast(`Coupon ${couponCode.toUpperCase()} created!`, 'success');
    setCouponCode('');
    setIsCouponModalOpen(false);
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilterStatus === 'all') return true;
    return o.orderStatus === orderFilterStatus;
  });

  const filteredProducts = products.filter((p) =>
    (p.name && p.name.toLowerCase().includes(productSearch.toLowerCase())) ||
    (p.banglaName && p.banglaName.includes(productSearch)) ||
    (p.categoryId && p.categoryId.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Top Admin Header Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30">
              Admin Ops Portal
            </span>
            <span className="text-xs text-slate-400">
              Logged as: <strong className="text-white capitalize">{currentUser?.name || 'Administrator'}</strong> ({currentUser?.role.replace('_', ' ')})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            FreshCart BD Management Hub
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('home')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Customer Shop</span>
          </button>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-extrabold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors ${
            activeTab === 'overview' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors ${
            activeTab === 'products' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors ${
            activeTab === 'orders' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
          {pendingOrders.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors ${
            activeTab === 'inventory' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Stock & Inventory</span>
          {lowStockProducts.length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full">
              {lowStockProducts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors ${
            activeTab === 'categories' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors ${
            activeTab === 'coupons' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Coupons ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors ${
            activeTab === 'delivery' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Delivery Zones ({zones.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors ${
            activeTab === 'reports' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Sales & Analytics</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: OVERVIEW
      ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Total Sales (Paid)</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ৳
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">৳{totalRevenue.toLocaleString()}</div>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Across all confirmed dispatches</span>
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{orders.length}</div>
              <p className="text-[11px] text-sky-700 font-medium">
                {pendingOrders.length} pending processing/dispatch
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Catalog Items</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{products.length} Products</div>
              <p className="text-[11px] text-amber-700 font-medium">
                Across {categories.length} grocery categories
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Low Stock Alert</span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-600">{lowStockProducts.length} Items</div>
              <p className="text-[11px] text-rose-700 font-medium">Needs procurement replenishment</p>
            </div>
          </div>

          {/* Low Stock Warning Alert if any */}
          {lowStockProducts.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-3xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900">
                    Urgent Procurement Notice: {lowStockProducts.length} products are running low in stock!
                  </h4>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Items like {lowStockProducts.slice(0, 3).map(p => p.name).join(', ')} have fallen below minimum thresholds.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
              >
                Manage Stock
              </button>
            </div>
          )}

          {/* Recent Orders Table */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Recent Customer Orders</h3>
                <p className="text-xs text-slate-500">Live order stream across Dhaka and divisions</p>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <span>View All ({orders.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="pb-3">Order No</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Address</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                      <td className="py-3 font-medium text-slate-800">
                        <div>{order.customerName}</div>
                        <div className="text-[10px] text-slate-400">{order.phone}</div>
                      </td>
                      <td className="py-3 text-slate-600 max-w-[150px] truncate">
                        {order.address.area}, {order.address.division}
                      </td>
                      <td className="py-3 text-slate-600">{order.items.length} items</td>
                      <td className="py-3 font-bold text-slate-900">৳{order.total}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentMethod} ({order.paymentStatus})
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                          order.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100"
                          title="View Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: PRODUCT MANAGEMENT (CRUD)
      ========================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <input
                type="text"
                placeholder="Search products by English or Bangla name..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            <button
              onClick={() => openProductModal()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Product Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Unit</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Flash Sale</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{prod.name}</p>
                            <p className="text-[11px] text-slate-400">{prod.banglaName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 capitalize text-slate-600 font-medium">
                        {prod.categoryId.replace('-', ' ')}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900">৳{prod.salePrice}</span>
                        {prod.regularPrice > prod.salePrice && (
                          <span className="text-[10px] text-slate-400 line-through block">
                            ৳{prod.regularPrice}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{prod.unit}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          prod.stockQuantity <= (prod.lowStockThreshold || 10)
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {prod.stockQuantity} in stock
                        </span>
                      </td>
                      <td className="p-4">
                        {prod.isFlashSale ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Active
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openProductModal(prod)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: ORDER MANAGEMENT
      ========================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['all', 'pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setOrderFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[11px] transition-colors ${
                  orderFilterStatus === status
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Destination</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Order Status</th>
                    <th className="p-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">
                        <div>{order.orderNumber}</div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{order.phone}</p>
                      </td>
                      <td className="p-4 max-w-[180px]">
                        <p className="truncate text-slate-700 font-medium">{order.address.fullAddress}</p>
                        <p className="text-[10px] text-slate-400">{order.address.area} • {order.address.division}</p>
                      </td>
                      <td className="p-4">
                        <strong className="text-slate-900 font-bold">৳{order.total}</strong>
                        <span className="text-[10px] text-slate-400 block">{order.items.length} items</span>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value as PaymentStatus)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                        <span className="text-[10px] uppercase text-slate-400 block mt-0.5">{order.paymentMethod}</span>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="bg-emerald-50 border border-emerald-300 rounded-lg px-2 py-1 text-[11px] font-extrabold text-emerald-900"
                        >
                          <option value="pending">Order Placed (Pending)</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing (Packing)</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: INVENTORY & STOCK MANAGEMENT
      ========================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Real-Time Inventory Levels</h3>
              <p className="text-xs text-slate-500">Update warehouse stock quantity with immediate customer catalog synchronization.</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {lowStockProducts.length} Items Below Safe Threshold
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Current Stock Units</th>
                    <th className="p-4">Threshold</th>
                    <th className="p-4">Stock Health Status</th>
                    <th className="p-4 text-right">Adjust Stock Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => {
                    const isLow = prod.stockQuantity <= (prod.lowStockThreshold || 10);
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div>{prod.name}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{prod.banglaName} • {prod.unit}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 capitalize">{prod.categoryId.replace('-', ' ')}</td>
                        <td className="p-4 font-mono font-black text-sm text-slate-900">{prod.stockQuantity}</td>
                        <td className="p-4 text-slate-500">{prod.lowStockThreshold || 10}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            isLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isLow ? 'LOW STOCK (REORDER)' : 'HEALTHY INVENTORY'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleInlineStockChange(prod.id, Math.max(0, prod.stockQuantity - 5))}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold"
                              title="Decrease 5"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => handleInlineStockChange(prod.id, prod.stockQuantity + 10)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md font-bold"
                              title="Restock 10"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleInlineStockChange(prod.id, prod.stockQuantity + 50)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold"
                              title="Bulk haat arrival +50"
                            >
                              +50
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: CATEGORIES
      ========================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900">Grocery Department Categories</h3>
              <p className="text-xs text-slate-500">Organize and display fresh grocery departments across the storefront.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{cat.name}</h4>
                    <p className="text-xs text-slate-500">{cat.banglaName}</p>
                    <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                      {products.filter((p) => p.categoryId === cat.id).length} Active Products
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 6: COUPONS & DISCOUNTS
      ========================================================= */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900">Promotional Discount Coupons</h3>
              <p className="text-xs text-slate-500">Create promotional codes for customers to apply in cart & checkout.</p>
            </div>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-mono font-black text-sm rounded-xl border border-emerald-200">
                    {coupon.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {coupon.isActive ? 'ACTIVE' : 'EXPIRED'}
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <p>
                    Discount: <strong className="text-emerald-700 font-bold">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `৳${coupon.discountValue} OFF`}
                    </strong>
                  </p>
                  <p className="text-slate-500">Minimum Basket: ৳{coupon.minOrderAmount}</p>
                  <p className="text-slate-400 text-[11px]">Expires: {coupon.expiryDate}</p>
                  <p className="text-slate-500 text-[11px]">Redeemed: {coupon.usageCount} times</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 7: DELIVERY ZONES & CHARGES
      ========================================================= */}
      {activeTab === 'delivery' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Bangladesh Delivery Coverage & Charges</h3>
            <p className="text-xs text-slate-500">Manage delivery fees, 2-Hour express rates, and free delivery thresholds by division.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <div key={zone.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900">{zone.name}</h4>
                  <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded-md">
                    {zone.division}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Standard Delivery:</span>
                    <strong className="text-slate-900">৳{zone.standardCharge}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">2-Hour Express:</span>
                    <strong className="text-amber-700 font-bold">৳{zone.expressCharge}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Free Delivery Over:</span>
                    <strong className="text-emerald-700 font-bold">৳{zone.freeDeliveryThreshold}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                  {zone.areas.slice(0, 4).map((area, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {area}
                    </span>
                  ))}
                  {zone.areas.length > 4 && (
                    <span className="text-[10px] text-slate-400 font-bold">+{zone.areas.length - 4} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 8: REPORTS & SALES ANALYTICS
      ========================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Sales Summary & Grocery Analytics</h3>
            <p className="text-xs text-slate-500">Key metrics for management and warehouse operations.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total GMV</span>
                <strong className="text-xl font-black text-emerald-950">৳{totalRevenue}</strong>
              </div>

              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
                <span className="text-[10px] uppercase font-bold text-sky-800 block">Average Order Value (AOV)</span>
                <strong className="text-xl font-black text-sky-950">
                  ৳{orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0}
                </strong>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Fulfilled Orders</span>
                <strong className="text-xl font-black text-amber-950">
                  {orders.filter((o) => o.orderStatus === 'delivered').length} Orders
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PRODUCT ADD/EDIT MODAL
      ========================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900">
              {editingProduct ? 'Edit Grocery Item' : 'Add New Grocery Item'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">English Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fresh Rui Fish Cut"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bangla Name (বাংলা নাম) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. রুই মাছ কাটা পিস"
                    value={formBanglaName}
                    onChange={(e) => setFormBanglaName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit (ওজন / পরিমাণ)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 kg, 500 gm, 5 ltr"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Regular Price (৳)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formRegPrice}
                    onChange={(e) => setFormRegPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sale / Offer Price (৳) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Photo URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="flashSaleCheck"
                  checked={formIsFlashSale}
                  onChange={(e) => setFormIsFlashSale(e.target.checked)}
                  className="text-emerald-600 rounded-sm"
                />
                <label htmlFor="flashSaleCheck" className="font-bold text-slate-800">
                  Feature in 24-Hour Flash Sale Section
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          COUPON MODAL
      ========================================================= */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Create Discount Coupon</h3>
            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Coupon Code (e.g. EID2025)</label>
                <input
                  type="text"
                  required
                  placeholder="CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Type</label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Taka (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={couponValue}
                    onChange={(e) => setCouponValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Minimum Order Amount (৳)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={couponMinOrder}
                  onChange={(e) => setCouponMinOrder(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
};
