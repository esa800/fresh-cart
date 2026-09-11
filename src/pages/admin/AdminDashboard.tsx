import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FolderTree, 
  Tag, 
  TrendingUp, 
  Settings, 
  Store, 
  LogOut, 
  Bell, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { StoreService, subscribeToStore } from '../../services/store';
import { FirebaseSyncService } from '../../services/firebase';
import { Product, Order, Category, Coupon, StoreSettings, OrderStatus, PaymentStatus } from '../../types';
import { InvoiceModal } from '../../components/InvoiceModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { OverviewTab } from './components/OverviewTab';
import { AnalysisTab } from './components/AnalysisTab';
import { ProductsTab } from './components/ProductsTab';
import { CategoriesTab } from './components/CategoriesTab';
import { OrdersTab } from './components/OrdersTab';
import { CouponsTab } from './components/CouponsTab';
import { StoreControlsTab } from './components/StoreControlsTab';

interface AdminDashboardProps {
  onNavigate: (view: string, param?: string) => void;
}

type AdminTab = 
  | 'overview' 
  | 'analysis' 
  | 'products' 
  | 'categories' 
  | 'orders' 
  | 'coupons' 
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  // Authentication check
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => 
    StoreService.isAdminSessionActive()
  );

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Reactive Data
  const [products, setProducts] = useState<Product[]>(() => StoreService.getProducts());
  const [orders, setOrders] = useState<Order[]>(() => StoreService.getOrders());
  const [categories, setCategories] = useState<Category[]>(() => StoreService.getCategories());
  const [coupons, setCoupons] = useState<Coupon[]>(() => StoreService.getCoupons());
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => StoreService.getSettings());

  // Invoice Modal
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Subscribe to storage updates, direct Firestore real-time listener, and regular polling
  useEffect(() => {
    // 1. Initial immediate pull from cloud
    StoreService.forceSyncOrders().then((synced) => {
      if (synced && synced.length > 0) setOrders(synced);
    }).catch((err) => console.warn('Admin initial sync error:', err));

    // 2. Direct real-time cloud listener for Orders (instant push across all devices)
    const unsubCloud = FirebaseSyncService.subscribeToOrders((cloudOrders) => {
      if (cloudOrders) {
        setOrders(cloudOrders);
      }
    });

    // 3. Local store subscriber for products/categories/settings/coupons
    const unsubStore = subscribeToStore(() => {
      setProducts(StoreService.getProducts());
      setOrders(StoreService.getOrders());
      setCategories(StoreService.getCategories());
      setCoupons(StoreService.getCoupons());
      setStoreSettings(StoreService.getSettings());
    });

    // 4. Guaranteed multi-device fallback sync every 6 seconds
    const interval = setInterval(() => {
      StoreService.forceSyncOrders().then((synced) => {
        if (synced) setOrders(synced);
      }).catch(() => {});
    }, 6000);

    return () => {
      unsubCloud();
      unsubStore();
      clearInterval(interval);
    };
  }, []);

  // Handlers for Data Mutations
  const handleSaveProduct = (prod: Product) => {
    StoreService.saveProduct(prod);
    setProducts(StoreService.getProducts());
  };

  const handleDeleteProduct = (productId: string) => {
    StoreService.deleteProduct(productId);
    setProducts(StoreService.getProducts());
  };

  const handleToggleProductBadge = (productId: string, badge: 'isFlashSale' | 'isDarazMall' | 'isFreeDelivery') => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const updated: Product = {
      ...prod,
      [badge]: !prod[badge]
    };
    // Sync flash sale tag
    if (badge === 'isFlashSale') {
      const currentTags = updated.tags || [];
      if (updated.isFlashSale && !currentTags.includes('flash_sale')) {
        updated.tags = [...currentTags, 'flash_sale'];
      } else if (!updated.isFlashSale) {
        updated.tags = currentTags.filter((t) => t !== 'flash_sale');
      }
    }

    StoreService.saveProduct(updated);
    setProducts(StoreService.getProducts());
  };

  const handleQuickRestock = (productId: string, amount: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const updated: Product = {
      ...prod,
      stockQuantity: prod.stockQuantity + amount,
      availability: 'in_stock'
    };
    StoreService.saveProduct(updated);
    setProducts(StoreService.getProducts());
  };

  const handleSaveCategory = (category: Category) => {
    StoreService.saveCategory(category);
    setCategories(StoreService.getCategories());
  };

  const handleDeleteCategory = (categoryId: string) => {
    StoreService.deleteCategory(categoryId);
    setCategories(StoreService.getCategories());
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus) => {
    StoreService.updateOrderStatus(orderId, status, paymentStatus);
    setOrders(StoreService.getOrders());
  };

  const handleAssignCourier = (orderId: string, courierService: string, trackingId: string) => {
    StoreService.updateOrderCourier(orderId, courierService, trackingId);
    setOrders(StoreService.getOrders());
  };

  const handleDeleteOrder = (orderId: string) => {
    StoreService.deleteOrder(orderId);
    setOrders(StoreService.getOrders());
  };

  const handleRefreshOrders = async () => {
    const updated = await StoreService.forceSyncOrders();
    setOrders(updated);
  };

  const handleSaveCoupon = (coupon: Coupon) => {
    const existing = StoreService.getCoupons();
    const updated = [coupon, ...existing.filter((c) => c.id !== coupon.id)];
    StoreService.saveCoupons(updated);
    setCoupons(updated);
  };

  const handleDeleteCoupon = (couponId: string) => {
    const updated = coupons.filter((c) => c.id !== couponId);
    StoreService.saveCoupons(updated);
    setCoupons(updated);
  };

  const handleToggleCouponActive = (couponId: string) => {
    const updated = coupons.map((c) => 
      c.id === couponId ? { ...c, isActive: !c.isActive } : c
    );
    StoreService.saveCoupons(updated);
    setCoupons(updated);
  };

  const handleSaveSettings = (newSettings: StoreSettings) => {
    StoreService.saveSettings(newSettings);
    setStoreSettings(newSettings);
  };

  const handleLogout = () => {
    StoreService.setAdminSession(false);
    setIsAuthenticated(false);
    onNavigate('home');
  };

  // If not authenticated, render the secure login gate
  if (!isAuthenticated) {
    return (
      <div className="bg-slate-100 min-h-screen">
        <AdminLoginModal
          onSuccess={() => {
            StoreService.setAdminSession(true);
            setIsAuthenticated(true);
          }}
          onNavigateHome={() => onNavigate('home')}
        />
      </div>
    );
  }

  // Pending count & low stock count for badges
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= (p.lowStockThreshold || 5)).length;

  // Sidebar Menu Items
  const navItems = [
    { id: 'overview', label: 'ওভারভিউ ও ড্যাশবোর্ড', labelEn: 'Overview & KPIs', icon: LayoutDashboard },
    { id: 'analysis', label: 'সেলস ও কুরিয়ার রিপোর্ট', labelEn: 'Sales & Courier', icon: TrendingUp },
    { id: 'products', label: 'প্রোডাক্টস ও স্টক', labelEn: 'Products & Stock', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-rose-500' },
    { id: 'categories', label: 'ক্যাটাগরি কন্ট্রোল', labelEn: 'Categories', icon: FolderTree },
    { id: 'orders', label: 'অর্ডার ও কুরিয়ার', labelEn: 'Orders & Dispatch', icon: ShoppingCart, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'coupons', label: 'ভাউচার ও কুপন', labelEn: 'Vouchers & Promos', icon: Tag },
    { id: 'settings', label: 'স্টোর ও সিকিউরিটি', labelEn: 'Store Controls', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white lg:hidden rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
                AP
              </div>
              <div>
                <h1 className="font-black text-sm sm:text-base leading-tight tracking-tight flex items-center gap-1.5">
                  <span>KHAN</span>
                  <span className="text-[#f85606]">store</span>
                  <span className="text-[11px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full border border-slate-700 hidden sm:inline-block font-semibold">
                    Admin Engine (AP)
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400">Safe & Pure Food এডমিন কন্ট্রোল সেন্টার</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Firebase Realtime Cloud Connected Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 rounded-full text-[11px] font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Firebase Realtime Cloud: সচল</span>
            </div>

            {/* View Live Store */}
            <button
              id="admin-view-store-btn"
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="মূল ওয়েবসাইটে ফিরে যান"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">লাইভ স্টোর ভিজিট</span>
            </button>

            {/* Admin Lock / Logout */}
            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border border-rose-800/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="লগআউট করে অ্যাডমিন প্যানেল লক করুন"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">লক / লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar + Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row w-full">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed lg:static top-16 bottom-0 left-0 z-20 w-64 bg-white border-r border-slate-200 
          transform lg:transform-none transition-transform duration-200 ease-in-out flex flex-col justify-between
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ম্যানেজমেন্ট মেন্যু
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as AdminTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div className="text-left truncate">
                      <span className="block leading-tight">{item.label}</span>
                      <span className={`block text-[10px] font-normal leading-none mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {item.labelEn}
                      </span>
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-black ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-[11px]">ESA Secured Admin</p>
                <p className="text-[10px] text-slate-400">v2.5 Daraz Framework</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <OverviewTab
              orders={orders}
              products={products}
              onSelectOrder={(ord) => {
                setActiveTab('orders');
              }}
              onPrintInvoice={(ord) => setInvoiceOrder(ord)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onQuickRestock={handleQuickRestock}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'analysis' && (
            <AnalysisTab
              orders={orders}
              products={products}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              products={products}
              categories={categories}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleBadge={handleToggleProductBadge}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab
              categories={categories}
              products={products}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onAssignCourier={handleAssignCourier}
              onPrintInvoice={(ord) => setInvoiceOrder(ord)}
              onDeleteOrder={handleDeleteOrder}
              onRefreshOrders={handleRefreshOrders}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponsTab
              coupons={coupons}
              onSaveCoupon={handleSaveCoupon}
              onDeleteCoupon={handleDeleteCoupon}
              onToggleCouponActive={handleToggleCouponActive}
            />
          )}

          {activeTab === 'settings' && (
            <StoreControlsTab
              settings={storeSettings}
              onSaveSettings={handleSaveSettings}
              onRefreshData={() => {
                setProducts(StoreService.getProducts());
                setOrders(StoreService.getOrders());
                setCategories(StoreService.getCategories());
                setCoupons(StoreService.getCoupons());
                setStoreSettings(StoreService.getSettings());
              }}
            />
          )}
        </main>
      </div>

      {/* Printable Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
