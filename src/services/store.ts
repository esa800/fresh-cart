import { 
  Product, 
  Category, 
  Brand, 
  Order, 
  Coupon, 
  Banner, 
  DeliveryZone, 
  User, 
  Review, 
  StoreSettings, 
  OrderStatus, 
  PaymentStatus 
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_BRANDS, 
  INITIAL_COUPONS, 
  INITIAL_BANNERS, 
  INITIAL_DELIVERY_ZONES, 
  INITIAL_ORDERS, 
  INITIAL_USERS, 
  INITIAL_REVIEWS, 
  INITIAL_STORE_SETTINGS 
} from '../data/seedData';

const STORAGE_KEYS = {
  PRODUCTS: 'freshcart_products_v2',
  CATEGORIES: 'freshcart_categories_v2',
  BRANDS: 'freshcart_brands_v2',
  ORDERS: 'freshcart_orders_v1',
  COUPONS: 'freshcart_coupons_v1',
  BANNERS: 'freshcart_banners_v2',
  DELIVERY_ZONES: 'freshcart_zones_v1',
  USERS: 'freshcart_users_v1',
  CURRENT_USER: 'freshcart_current_user_v1',
  REVIEWS: 'freshcart_reviews_v1',
  SETTINGS: 'freshcart_settings_v1',
  CART: 'freshcart_cart_v1',
  WISHLIST: 'freshcart_wishlist_v1',
  SELECTED_ZONE: 'freshcart_selected_zone_v1',
  ADMIN_AUTH: 'freshcart_admin_auth_v1',
  ADMIN_PASS: 'freshcart_admin_pass_v1',
  VISITORS: 'freshcart_visitors_v1',
};

// Ultra-fast Real-Time Multi-Tab / Multi-Window Synchronizer
type Listener = () => void;
const listeners = new Set<Listener>();

// Create BroadcastChannel for instantaneous zero-latency sync across all tabs/windows
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('khan_gadget_realtime_sync');
    syncChannel.onmessage = (event) => {
      // Received update from another tab/admin window!
      internalNotify(false);
    };
  }
} catch (err) {
  console.warn('BroadcastChannel not supported or restricted', err);
}

// Listen to native window storage events as fallback
if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => {
    internalNotify(false);
  });
}

function internalNotify(broadcastToOthers = true) {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Store notification error', e);
    }
  });

  if (typeof window !== 'undefined') {
    // Fire custom event for any window listeners
    window.dispatchEvent(new CustomEvent('khan_store_updated', { detail: { timestamp: Date.now() } }));

    // Send broadcast to other open tabs/windows
    if (broadcastToOthers && syncChannel) {
      try {
        syncChannel.postMessage({ action: 'SYNC_UPDATE', timestamp: Date.now() });
      } catch (e) {
        // channel may be closed
      }
    }
  }
}

export function notifyStoreUpdate(): void {
  internalNotify(true);
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to parse ${key} from storage`, err);
    return defaultVal;
  }
}

function setItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    internalNotify(true);
  } catch (err) {
    console.error(`Failed to write ${key} to storage`, err);
  }
}

// Initialize seed data if not present
export function initStore(): void {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(INITIAL_BRANDS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BANNERS)) {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(INITIAL_BANNERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DELIVERY_ZONES)) {
    localStorage.setItem(STORAGE_KEYS.DELIVERY_ZONES, JSON.stringify(INITIAL_DELIVERY_ZONES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_STORE_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Default logged-in as customer for easy browsing experience, or switchable via UI
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS.find(u => u.role === 'customer')));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SELECTED_ZONE)) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_ZONE, JSON.stringify(INITIAL_DELIVERY_ZONES[0]));
  }
}

export const StoreService = {
  // Products
  getProducts(): Product[] {
    return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  },
  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug);
  },
  saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      products.unshift({
        ...product,
        id: product.id || `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    setItem(STORAGE_KEYS.PRODUCTS, products);
  },
  deleteProduct(id: string): void {
    const products = this.getProducts().filter((p) => p.id !== id);
    setItem(STORAGE_KEYS.PRODUCTS, products);
  },
  updateStock(productId: string, delta: number): boolean {
    const products = this.getProducts();
    const target = products.find((p) => p.id === productId);
    if (!target) return false;
    const newQty = Math.max(0, target.stockQuantity + delta);
    target.stockQuantity = newQty;
    target.availability = newQty === 0 ? 'out_of_stock' : newQty <= target.lowStockThreshold ? 'low_stock' : 'in_stock';
    target.updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.PRODUCTS, products);
    return true;
  },

  // Categories
  getCategories(): Category[] {
    return getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },
  getCategoryBySlug(slug: string): Category | undefined {
    return this.getCategories().find((c) => c.slug === slug);
  },
  saveCategory(cat: Category): void {
    const cats = this.getCategories();
    const index = cats.findIndex((c) => c.id === cat.id);
    if (index >= 0) {
      cats[index] = cat;
    } else {
      cats.push({
        ...cat,
        id: cat.id || `cat-${Date.now()}`,
        productCount: 0,
        displayOrder: cats.length + 1
      });
    }
    setItem(STORAGE_KEYS.CATEGORIES, cats);
  },
  deleteCategory(id: string): void {
    const cats = this.getCategories().filter((c) => c.id !== id);
    setItem(STORAGE_KEYS.CATEGORIES, cats);
  },

  // Brands
  getBrands(): Brand[] {
    return getItem<Brand[]>(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
  },

  // Orders
  getOrders(): Order[] {
    return getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },
  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.orderNumber === id);
  },
  getOrdersByCustomerId(customerId: string): Order[] {
    return this.getOrders().filter((o) => o.customerId === customerId);
  },
  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'orderDate'>): Order {
    const orders = this.getOrders();
    const now = new Date();
    const orderNumber = `FCB-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      orderDate: now.toISOString(),
      orderStatus: 'Pending',
      paymentStatus: orderData.paymentStatus || 'pending'
    };

    // Decrement stock for ordered items
    orderData.items.forEach((item) => {
      this.updateStock(item.productId, -item.quantity);
    });

    // Increment coupon usage if used
    if (orderData.couponCode) {
      this.incrementCouponUsage(orderData.couponCode);
    }

    orders.unshift(newOrder);
    setItem(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  },
  updateOrderStatus(orderId: string, status: OrderStatus, deliveryNote?: string): void {
    const orders = this.getOrders();
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      target.orderStatus = status;
      if (status === 'Delivered') {
        target.deliveryStatus = 'Package delivered successfully to customer';
        if (target.paymentMethod === 'cod') {
          target.paymentStatus = 'paid';
        }
      } else if (status === 'Out for Delivery') {
        target.deliveryStatus = 'Rider is on the way to delivery address';
      } else if (status === 'Processing') {
        target.deliveryStatus = 'Items being packaged at fulfillment warehouse';
      } else if (status === 'Shipped') {
        target.deliveryStatus = 'Dispatched to local courier hub';
      } else if (status === 'Cancelled') {
        target.deliveryStatus = 'Order cancelled';
      }
      if (deliveryNote) {
        target.notes = deliveryNote;
      }
      setItem(STORAGE_KEYS.ORDERS, orders);
    }
  },
  updatePaymentStatus(orderId: string, status: PaymentStatus): void {
    const orders = this.getOrders();
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      target.paymentStatus = status;
      setItem(STORAGE_KEYS.ORDERS, orders);
    }
  },

  // Coupons
  getCoupons(): Coupon[] {
    return getItem<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  },
  validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const coupons = this.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or inactive coupon code.' };
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, discount: 0, message: 'Coupon has expired.' };
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: 'Coupon usage limit has been reached.' };
    }

    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order amount for this coupon is ৳${coupon.minOrderAmount}.`
      };
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === 'percentage') {
      calculatedDiscount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount > 0 && calculatedDiscount > coupon.maxDiscountAmount) {
        calculatedDiscount = coupon.maxDiscountAmount;
      }
    } else {
      calculatedDiscount = coupon.discountValue;
    }

    return {
      valid: true,
      discount: calculatedDiscount,
      message: `Coupon applied successfully! You saved ৳${calculatedDiscount}`,
      coupon
    };
  },
  incrementCouponUsage(code: string): void {
    const coupons = this.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (coupon) {
      coupon.usageCount += 1;
      setItem(STORAGE_KEYS.COUPONS, coupons);
    }
  },
  saveCoupon(coupon: Coupon): void {
    const coupons = this.getCoupons();
    const index = coupons.findIndex((c) => c.id === coupon.id);
    if (index >= 0) {
      coupons[index] = coupon;
    } else {
      coupons.push({ ...coupon, id: coupon.id || `cpn-${Date.now()}` });
    }
    setItem(STORAGE_KEYS.COUPONS, coupons);
  },
  saveCoupons(coupons: Coupon[]): void {
    setItem(STORAGE_KEYS.COUPONS, coupons);
  },
  deleteCoupon(id: string): void {
    const coupons = this.getCoupons().filter((c) => c.id !== id);
    setItem(STORAGE_KEYS.COUPONS, coupons);
  },

  // Banners
  getBanners(): Banner[] {
    return getItem<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  },
  saveBanner(banner: Banner): void {
    const banners = this.getBanners();
    const index = banners.findIndex((b) => b.id === banner.id);
    if (index >= 0) {
      banners[index] = banner;
    } else {
      banners.push({ ...banner, id: banner.id || `ban-${Date.now()}` });
    }
    setItem(STORAGE_KEYS.BANNERS, banners);
  },
  deleteBanner(id: string): void {
    const banners = this.getBanners().filter((b) => b.id !== id);
    setItem(STORAGE_KEYS.BANNERS, banners);
  },

  // Delivery Zones
  getDeliveryZones(): DeliveryZone[] {
    return getItem<DeliveryZone[]>(STORAGE_KEYS.DELIVERY_ZONES, INITIAL_DELIVERY_ZONES);
  },
  getSelectedZone(): DeliveryZone {
    return getItem<DeliveryZone>(STORAGE_KEYS.SELECTED_ZONE, INITIAL_DELIVERY_ZONES[0]);
  },
  setSelectedZone(zone: DeliveryZone): void {
    setItem(STORAGE_KEYS.SELECTED_ZONE, zone);
  },
  saveDeliveryZone(zone: DeliveryZone): void {
    const zones = this.getDeliveryZones();
    const idx = zones.findIndex((z) => z.id === zone.id);
    if (idx >= 0) {
      zones[idx] = zone;
    } else {
      zones.push({ ...zone, id: zone.id || `zone-${Date.now()}` });
    }
    setItem(STORAGE_KEYS.DELIVERY_ZONES, zones);
  },

  // Reviews
  getReviews(productId?: string): Review[] {
    const reviews = getItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    if (productId) {
      return reviews.filter((r) => r.productId === productId && r.status === 'approved');
    }
    return reviews;
  },
  addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const reviews = getItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    reviews.unshift(newReview);
    setItem(STORAGE_KEYS.REVIEWS, reviews);

    // Update product rating summary
    const prodReviews = reviews.filter(r => r.productId === review.productId && r.status === 'approved');
    if (prodReviews.length > 0) {
      const avg = prodReviews.reduce((acc, curr) => acc + curr.rating, 0) / prodReviews.length;
      const prods = this.getProducts();
      const p = prods.find(item => item.id === review.productId);
      if (p) {
        p.rating = Number(avg.toFixed(1));
        p.reviewCount = prodReviews.length;
        setItem(STORAGE_KEYS.PRODUCTS, prods);
      }
    }

    return newReview;
  },

  // Users & Auth
  getUsers(): User[] {
    return getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  getCurrentUser(): User | null {
    return getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },
  setCurrentUser(user: User | null): void {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
  },
  updateUserProfile(updatedUser: User): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === updatedUser.id);
    if (idx >= 0) {
      users[idx] = updatedUser;
      setItem(STORAGE_KEYS.USERS, users);
    }
    const current = this.getCurrentUser();
    if (current && current.id === updatedUser.id) {
      this.setCurrentUser(updatedUser);
    }
  },
  saveAddress(userId: string, address: any): void {
    const user = this.getUsers().find(u => u.id === userId);
    if (!user) return;
    if (!user.savedAddresses) user.savedAddresses = [];
    if (address.id) {
      const idx = user.savedAddresses.findIndex(a => a.id === address.id);
      if (idx >= 0) user.savedAddresses[idx] = address;
    } else {
      user.savedAddresses.push({ ...address, id: `addr-${Date.now()}` });
    }
    this.updateUserProfile(user);
  },

  // Store Settings
  getSettings(): StoreSettings {
    return getItem<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_STORE_SETTINGS);
  },
  updateSettings(settings: StoreSettings): void {
    setItem(STORAGE_KEYS.SETTINGS, settings);
  },
  saveSettings(settings: StoreSettings): void {
    this.updateSettings(settings);
  },

  // Visitors Counter & Analytics
  getVisitorStats(): { totalViews: number; uniqueVisitors: number } {
    return getItem<{ totalViews: number; uniqueVisitors: number }>(STORAGE_KEYS.VISITORS, {
      totalViews: 1984,
      uniqueVisitors: 742
    });
  },
  recordVisitor(): void {
    const current = this.getVisitorStats();
    let isNewUnique = false;
    try {
      if (!sessionStorage.getItem('freshcart_visited')) {
        sessionStorage.setItem('freshcart_visited', 'true');
        isNewUnique = true;
      }
    } catch {
      // safe fallback
    }
    const updated = {
      totalViews: current.totalViews + 1,
      uniqueVisitors: isNewUnique ? current.uniqueVisitors + 1 : current.uniqueVisitors
    };
    setItem(STORAGE_KEYS.VISITORS, updated);
  },

  // Admin Security
  getAdminPassword(): string {
    return getItem<string>(STORAGE_KEYS.ADMIN_PASS, 'ESA006##');
  },
  setAdminPassword(newPass: string): void {
    setItem(STORAGE_KEYS.ADMIN_PASS, newPass);
  },
  isAdminSessionActive(): boolean {
    return getItem<boolean>(STORAGE_KEYS.ADMIN_AUTH, false);
  },
  setAdminSession(active: boolean): void {
    setItem(STORAGE_KEYS.ADMIN_AUTH, active);
  },

  // Order Courier Tracking Update
  updateOrderCourier(orderId: string, courierService: string, courierTrackingId: string): void {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.courierService = courierService;
      order.courierTrackingId = courierTrackingId;
      if (order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed' || order.orderStatus === 'Processing') {
        order.orderStatus = 'Shipped';
        order.deliveryStatus = `Shipped via ${courierService} (${courierTrackingId})`;
      }
      setItem(STORAGE_KEYS.ORDERS, orders);
    }
  },

  // Cloud Sync Snapshot Export/Import
  exportStoreSnapshot(): string {
    const snapshot = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      categories: this.getCategories(),
      brands: this.getBrands(),
      orders: this.getOrders(),
      coupons: this.getCoupons(),
      banners: this.getBanners(),
      zones: this.getDeliveryZones(),
      settings: this.getSettings()
    };
    return JSON.stringify(snapshot, null, 2);
  },
  importStoreSnapshot(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) {
        setItem(STORAGE_KEYS.PRODUCTS, data.products);
      }
      if (data.categories && Array.isArray(data.categories)) {
        setItem(STORAGE_KEYS.CATEGORIES, data.categories);
      }
      if (data.orders && Array.isArray(data.orders)) {
        setItem(STORAGE_KEYS.ORDERS, data.orders);
      }
      if (data.coupons && Array.isArray(data.coupons)) {
        setItem(STORAGE_KEYS.COUPONS, data.coupons);
      }
      if (data.settings) {
        setItem(STORAGE_KEYS.SETTINGS, data.settings);
      }
      return true;
    } catch (err) {
      console.error('Import store snapshot failed', err);
      return false;
    }
  },

  // Real-time synchronization hooks
  subscribeToStore(listener: Listener): () => void {
    return subscribeToStore(listener);
  },
  notify(): void {
    notifyStoreUpdate();
  }
};
