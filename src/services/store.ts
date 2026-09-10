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
  PaymentStatus,
  SMSLog 
} from '../types';
import { FirebaseSyncService } from './firebase';
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
  PRODUCTS: 'khan_store_organic_v4_products',
  CATEGORIES: 'khan_store_organic_v4_categories',
  BRANDS: 'khan_store_organic_v4_brands',
  ORDERS: 'khan_store_organic_v4_orders',
  COUPONS: 'khan_store_organic_v4_coupons',
  BANNERS: 'khan_store_organic_v4_banners',
  DELIVERY_ZONES: 'khan_store_organic_v4_zones',
  USERS: 'khan_store_organic_v4_users',
  CURRENT_USER: 'khan_store_organic_v4_current_user',
  REVIEWS: 'khan_store_organic_v4_reviews',
  SETTINGS: 'khan_store_organic_v4_settings',
  CART: 'khan_store_organic_v4_cart',
  WISHLIST: 'khan_store_organic_v4_wishlist',
  SELECTED_ZONE: 'khan_store_organic_v4_selected_zone',
  ADMIN_AUTH: 'khan_store_organic_v4_admin_auth',
  ADMIN_PASS: 'khan_store_organic_v4_admin_pass',
  VISITORS: 'khan_store_organic_v4_visitors',
  SMS_LOGS: 'khan_store_organic_v4_sms_logs',
  DELETED_PRODUCT_IDS: 'khan_store_organic_v4_deleted_ids',
  INITIALIZED: 'khan_store_organic_v4_initialized'
};

// Ultra-fast Real-Time Multi-Tab / Multi-Window Synchronizer
type Listener = () => void;
const listeners = new Set<Listener>();

// Create BroadcastChannel for instantaneous zero-latency sync across all tabs/windows
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('khan_store_realtime_sync');
    syncChannel.onmessage = () => {
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
    window.dispatchEvent(new CustomEvent('khan_store_updated', { detail: { timestamp: Date.now() } }));

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

// Initialize seed data once and only once
export function initStore(): void {
  if (typeof window === 'undefined') return;

  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInitialized) {
    try {
      // Clear old obsolete keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('freshcart_') || key.startsWith('khan_gadget_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      // ignore
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(INITIAL_BRANDS));
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(INITIAL_BANNERS));
    localStorage.setItem(STORAGE_KEYS.DELIVERY_ZONES, JSON.stringify(INITIAL_DELIVERY_ZONES));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_STORE_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS.find(u => u.role === 'customer')));
    localStorage.setItem(STORAGE_KEYS.SELECTED_ZONE, JSON.stringify(INITIAL_DELIVERY_ZONES[0]));
    localStorage.setItem(STORAGE_KEYS.DELETED_PRODUCT_IDS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

let hasInitializedFirebaseSync = false;

export function initFirebaseRealtimeSync(): void {
  if (typeof window === 'undefined' || hasInitializedFirebaseSync) return;
  hasInitializedFirebaseSync = true;

  try {
    // 1. Seed initial products to Cloud Firestore if cloud collection is currently empty
    setTimeout(() => {
      try {
        const currentProds = StoreService.getProducts();
        FirebaseSyncService.seedInitialProductsIfEmpty(currentProds);
      } catch (e) {
        console.warn('Firebase initial seed check:', e);
      }
    }, 1200);

    // 2. Realtime listener for Products from Cloud Firestore
    FirebaseSyncService.subscribeToProducts((cloudProducts) => {
      try {
        if (cloudProducts && cloudProducts.length > 0) {
          const deletedIds = getItem<string[]>(STORAGE_KEYS.DELETED_PRODUCT_IDS, []);
          const filtered = cloudProducts.filter(p => !deletedIds.includes(p.id));
          setItem(STORAGE_KEYS.PRODUCTS, filtered);
          internalNotify(false);
        }
      } catch (err) {
        console.warn('Firebase product sync error:', err);
      }
    });

    // 3. Realtime listener for Orders from Cloud Firestore
    FirebaseSyncService.subscribeToOrders((cloudOrders) => {
      try {
        if (cloudOrders) {
          const currentLocal = getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
          // Merge any locally created orders (e.g. placed while offline or just placed) that haven't hit cloud yet
          const merged = [...cloudOrders];
          for (const local of currentLocal) {
            const alreadyInCloud = merged.some(co => co.id === local.id || co.orderNumber === local.orderNumber);
            if (!alreadyInCloud && local.id.startsWith('ord-')) {
              merged.push(local);
              // Push this local order to Cloud Firestore so all other devices receive it
              FirebaseSyncService.saveOrder(local);
            }
          }
          merged.sort((a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime());
          setItem(STORAGE_KEYS.ORDERS, merged);
          internalNotify(false);
        }
      } catch (err) {
        console.warn('Firebase order sync error:', err);
      }
    });

    // 4. Realtime listener for Settings from Cloud Firestore
    FirebaseSyncService.subscribeToSettings((cloudSettings) => {
      try {
        if (cloudSettings && cloudSettings.storeName) {
          StoreService.updateSettings(cloudSettings, false);
          internalNotify(false);
        }
      } catch (err) {
        console.warn('Firebase settings sync error:', err);
      }
    });

    // Seed default settings to Firestore if not already present
    setTimeout(() => {
      try {
        const currentSettings = StoreService.getSettings();
        FirebaseSyncService.seedInitialSettingsIfEmpty(currentSettings);
      } catch (e) {
        console.warn('Firebase settings initial seed check:', e);
      }
    }, 1500);

    // 5. Realtime listener for Categories from Cloud Firestore
    FirebaseSyncService.subscribeToCategories((cloudCategories) => {
      try {
        if (cloudCategories && cloudCategories.length > 0) {
          setItem(STORAGE_KEYS.CATEGORIES, cloudCategories);
          internalNotify(false);
        }
      } catch (err) {
        console.warn('Firebase categories sync error:', err);
      }
    });
  } catch (err) {
    console.warn('initFirebaseRealtimeSync warning:', err);
  }
}

// Auto-run init safely and initialize Firebase Realtime sync
if (typeof window !== 'undefined') {
  initStore();
  initFirebaseRealtimeSync();
}

export const StoreService = {
  // Products
  getProducts(): Product[] {
    const deletedIds = getItem<string[]>(STORAGE_KEYS.DELETED_PRODUCT_IDS, []);
    const stored = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    if (deletedIds && deletedIds.length > 0) {
      return stored.filter((p) => !deletedIds.includes(p.id));
    }
    return stored;
  },
  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  },
  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug);
  },
  saveProduct(product: Product): void {
    // If this product was in deleted list, remove from deleted list
    const deletedIds = getItem<string[]>(STORAGE_KEYS.DELETED_PRODUCT_IDS, []);
    if (deletedIds.includes(product.id)) {
      setItem(STORAGE_KEYS.DELETED_PRODUCT_IDS, deletedIds.filter((d) => d !== product.id));
    }

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
    internalNotify(true);

    // Realtime sync to Cloud Firestore
    try {
      const savedProd = products[index >= 0 ? index : 0];
      FirebaseSyncService.saveProduct(savedProd);
    } catch (e) {
      console.warn('Firebase sync saveProduct error:', e);
    }
  },
  deleteProduct(id: string): void {
    // Permanently record deletion so it can NEVER auto-add again
    const deletedIds = getItem<string[]>(STORAGE_KEYS.DELETED_PRODUCT_IDS, []);
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      setItem(STORAGE_KEYS.DELETED_PRODUCT_IDS, deletedIds);
    }

    const currentProds = this.getProducts();
    const filtered = currentProds.filter((p) => p.id !== id);
    setItem(STORAGE_KEYS.PRODUCTS, filtered);

    // Also purge from cart and wishlist immediately
    try {
      this.removeFromCart(id);
      this.removeFromWishlist(id);
    } catch (e) {
      // ignore
    }

    internalNotify(true);

    // Realtime sync to Cloud Firestore
    try {
      FirebaseSyncService.deleteProduct(id);
    } catch (e) {
      console.warn('Firebase sync deleteProduct error:', e);
    }
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
    internalNotify(true);

    // Realtime sync to Cloud Firestore
    try {
      const savedCat = cats[index >= 0 ? index : cats.length - 1];
      FirebaseSyncService.saveCategory(savedCat);
    } catch (e) {
      console.warn('Firebase sync saveCategory error:', e);
    }
  },
  deleteCategory(id: string): void {
    const cats = this.getCategories().filter((c) => c.id !== id);
    setItem(STORAGE_KEYS.CATEGORIES, cats);
    internalNotify(true);

    // Realtime sync to Cloud Firestore
    try {
      FirebaseSyncService.deleteCategory(id);
    } catch (e) {
      console.warn('Firebase sync deleteCategory error:', e);
    }
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
    const orderNumber = `KG-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
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

    // Auto-generate & dispatch confirmation SMS
    try {
      const sms = this.sendOrderConfirmationSMS(newOrder);
      newOrder.smsSent = true;
      newOrder.smsSentAt = sms.sentAt;
      newOrder.smsContent = sms.message;
    } catch (err) {
      console.warn('SMS dispatch simulation handled:', err);
    }

    orders.unshift(newOrder);
    setItem(STORAGE_KEYS.ORDERS, orders);

    // Realtime sync to Cloud Firestore
    try {
      FirebaseSyncService.saveOrder(newOrder);
    } catch (e) {
      console.warn('Firebase sync saveOrder error:', e);
    }

    return newOrder;
  },

  // SMS Notification Engine
  getSMSLogs(): SMSLog[] {
    return getItem<SMSLog[]>(STORAGE_KEYS.SMS_LOGS, []);
  },

  sendOrderConfirmationSMS(order: Order): SMSLog {
    const settings = this.getSettings();
    const hotline = settings.hotline || settings.phone || '01854774406';
    const storeName = settings.storeName || 'KHAN GADGET BD';
    
    // Customized or standard template
    const template = settings.smsTemplate || `প্রিয় [NAME], ${storeName}-এ আপনার অর্ডার [ORDER_ID] সফল হয়েছে! সর্বমোট: ৳[TOTAL]। দ্রুততম সময়ে ডেলিভারির ব্যবস্থা করা হচ্ছে। হেল্পলাইন: ${hotline}`;
    
    const message = template
      .replace('[NAME]', order.customerName)
      .replace('[ORDER_ID]', order.orderNumber)
      .replace('[TOTAL]', order.total.toLocaleString());

    const smsLog: SMSLog = {
      id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      recipientPhone: order.phone,
      recipientName: order.customerName,
      message,
      sentAt: new Date().toISOString(),
      status: 'Delivered',
      provider: 'Greenweb / BulkSMS BD Gateway'
    };

    const logs = this.getSMSLogs();
    logs.unshift(smsLog);
    setItem(STORAGE_KEYS.SMS_LOGS, logs);

    // Update order reference if already exists
    const orders = this.getOrders();
    const target = orders.find(o => o.id === order.id || o.orderNumber === order.orderNumber);
    if (target) {
      target.smsSent = true;
      target.smsSentAt = smsLog.sentAt;
      target.smsContent = message;
      setItem(STORAGE_KEYS.ORDERS, orders);
    }

    return smsLog;
  },

  resendOrderSMS(orderId: string): SMSLog | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;
    return this.sendOrderConfirmationSMS(order);
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
      internalNotify(true);

      // Realtime sync full order to Cloud Firestore
      try {
        FirebaseSyncService.saveOrder(target);
      } catch (e) {
        console.warn('Firebase sync updateOrderStatus error:', e);
      }
    }
  },
  deleteOrder(orderId: string): void {
    const orders = this.getOrders();
    const filtered = orders.filter((o) => o.id !== orderId && o.orderNumber !== orderId);
    setItem(STORAGE_KEYS.ORDERS, filtered);
    internalNotify(true);

    // Sync deletion to Cloud Firestore
    try {
      FirebaseSyncService.deleteOrder(orderId);
    } catch (e) {
      console.warn('Firebase sync deleteOrder error:', e);
    }
  },
  async forceSyncOrders(): Promise<Order[]> {
    try {
      const cloudOrders = await FirebaseSyncService.fetchOrdersOnce();
      if (cloudOrders && cloudOrders.length > 0) {
        const currentLocal = this.getOrders();
        const merged = [...cloudOrders];
        for (const local of currentLocal) {
          if (!merged.some(co => co.id === local.id || co.orderNumber === local.orderNumber) && local.id.startsWith('ord-')) {
            merged.push(local);
            FirebaseSyncService.saveOrder(local);
          }
        }
        merged.sort((a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime());
        setItem(STORAGE_KEYS.ORDERS, merged);
        internalNotify(true);
        return merged;
      }
    } catch (e) {
      console.warn('forceSyncOrders error:', e);
    }
    return this.getOrders();
  },
  updatePaymentStatus(orderId: string, status: PaymentStatus): void {
    const orders = this.getOrders();
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      target.paymentStatus = status;
      setItem(STORAGE_KEYS.ORDERS, orders);
      internalNotify(true);

      // Realtime sync to Cloud Firestore
      try {
        FirebaseSyncService.saveOrder(target);
      } catch (e) {
        console.warn('Firebase sync updatePaymentStatus error:', e);
      }
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
  saveDeliveryZones(zones: DeliveryZone[]): void {
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
  getAllReviews(): Review[] {
    return getItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },
  addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const reviews = getItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const newReview: Review = {
      ...review,
      images: review.images || [],
      status: review.status || 'approved',
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
  updateReviewStatus(reviewId: string, status: 'approved' | 'pending' | 'rejected'): void {
    const reviews = getItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const target = reviews.find(r => r.id === reviewId);
    if (target) {
      target.status = status;
      setItem(STORAGE_KEYS.REVIEWS, reviews);
    }
  },
  deleteReview(reviewId: string): void {
    const reviews = getItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS).filter(r => r.id !== reviewId);
    setItem(STORAGE_KEYS.REVIEWS, reviews);
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
  saveUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    setItem(STORAGE_KEYS.USERS, users);
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
    const s = getItem<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_STORE_SETTINGS);
    // Ensure aliases are populated
    return {
      ...s,
      storeName: s.storeName || 'KHAN GADGET BD',
      brandTagline: s.brandTagline || s.tagline || 'স্মার্ট গ্যাজেট ও মোবাইল এক্সেসরিজের বিশ্বস্ত প্রতিষ্ঠান',
      tagline: s.tagline || s.brandTagline || 'স্মার্ট গ্যাজেট ও মোবাইল এক্সেসরিজের বিশ্বস্ত প্রতিষ্ঠান',
      hotline: s.hotline || s.phone || '01854774406',
      phone: s.phone || s.hotline || '01854774406',
      whatsappNumber: s.whatsappNumber || '01854774406',
      supportEmail: s.supportEmail || s.email || 'info@khangadgetbd.com',
      email: s.email || s.supportEmail || 'info@khangadgetbd.com',
      officeAddress: s.officeAddress || s.address || 'House 14, Road 4, Sector 7, Uttara, Dhaka 1230, Bangladesh',
      address: s.address || s.officeAddress || 'House 14, Road 4, Sector 7, Uttara, Dhaka 1230, Bangladesh',
      isAnnouncementActive: s.isAnnouncementActive !== false,
      deliveryChargeDhaka: Number(s.deliveryChargeDhaka ?? 60),
      deliveryChargeOutside: Number(s.deliveryChargeOutside ?? 120),
      freeDeliveryThreshold: Number(s.freeDeliveryThreshold ?? 2000)
    };
  },
  updateSettings(settings: StoreSettings, syncToCloud: boolean = true): void {
    const normalized: StoreSettings = {
      ...settings,
      storeName: settings.storeName?.trim() || 'KHAN GADGET BD',
      brandTagline: settings.brandTagline?.trim() || settings.tagline?.trim() || 'স্মার্ট গ্যাজেট ও মোবাইল এক্সেসরিজের বিশ্বস্ত প্রতিষ্ঠান',
      tagline: settings.tagline?.trim() || settings.brandTagline?.trim() || 'স্মার্ট গ্যাজেট ও মোবাইল এক্সেসরিজের বিশ্বস্ত প্রতিষ্ঠান',
      hotline: settings.hotline?.trim() || settings.phone?.trim() || '01854774406',
      phone: settings.phone?.trim() || settings.hotline?.trim() || '01854774406',
      whatsappNumber: settings.whatsappNumber?.trim() || '01854774406',
      supportEmail: settings.supportEmail?.trim() || settings.email?.trim() || 'info@khangadgetbd.com',
      email: settings.email?.trim() || settings.supportEmail?.trim() || 'info@khangadgetbd.com',
      officeAddress: settings.officeAddress?.trim() || settings.address?.trim() || 'House 14, Road 4, Sector 7, Uttara, Dhaka 1230, Bangladesh',
      address: settings.address?.trim() || settings.officeAddress?.trim() || 'House 14, Road 4, Sector 7, Uttara, Dhaka 1230, Bangladesh',
      isAnnouncementActive: settings.isAnnouncementActive !== false,
      announcementText: settings.announcementText ?? '🔥 আজকের স্পেশাল অফার: যেকোনো গ্যাজেট অর্ডারে ১০% ইনস্ট্যান্ট ছাড়! প্রোমোকোড: KHAN10 | সারাদেশে ক্যাশ অন ডেলিভারি',
      deliveryChargeDhaka: Number(settings.deliveryChargeDhaka ?? 60),
      deliveryChargeOutside: Number(settings.deliveryChargeOutside ?? 120),
      freeDeliveryThreshold: Number(settings.freeDeliveryThreshold ?? 2000),
      aboutUsText: settings.aboutUsText || 'KHAN GADGET BD বাংলাদেশের অন্যতম নির্ভরযোগ্য অথেন্টিক মোবাইল গ্যাজেট ও লাইফস্টাইল অ্যাক্সেসরিজ ই-কমার্স প্ল্যাটফর্ম।'
    };
    setItem(STORAGE_KEYS.SETTINGS, normalized);
    internalNotify(true);

    // Realtime sync to Cloud Firestore
    if (syncToCloud) {
      try {
        FirebaseSyncService.saveSettings(normalized);
      } catch (e) {
        console.warn('Firebase sync saveSettings error:', e);
      }
    }

    // Synchronize delivery rates into delivery zones
    try {
      const zones = this.getDeliveryZones();
      const updatedZones = zones.map((z) => {
        const isDhaka = z.division.toLowerCase().includes('dhaka') || z.id === 'zone-dhaka';
        return {
          ...z,
          standardCharge: isDhaka ? normalized.deliveryChargeDhaka! : normalized.deliveryChargeOutside!,
          freeDeliveryThreshold: normalized.freeDeliveryThreshold!
        };
      });
      this.saveDeliveryZones(updatedZones);

      const currentSelected = this.getSelectedZone();
      const isDhaka = currentSelected.division.toLowerCase().includes('dhaka') || currentSelected.id === 'zone-dhaka';
      this.setSelectedZone({
        ...currentSelected,
        standardCharge: isDhaka ? normalized.deliveryChargeDhaka! : normalized.deliveryChargeOutside!,
        freeDeliveryThreshold: normalized.freeDeliveryThreshold!
      });
    } catch (e) {
      console.error('Failed to sync delivery zones with settings', e);
    }

    internalNotify(true);
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
      internalNotify(true);

      // Realtime sync to Cloud Firestore
      try {
        FirebaseSyncService.saveOrder(order);
      } catch (e) {
        console.warn('Firebase sync updateOrderCourier error:', e);
      }
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

  resetToDefaults(): void {
    setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    setItem(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
    setItem(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    setItem(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    setItem(STORAGE_KEYS.DELIVERY_ZONES, INITIAL_DELIVERY_ZONES);
    setItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    setItem(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    setItem(STORAGE_KEYS.SETTINGS, INITIAL_STORE_SETTINGS);
    internalNotify(true);
  },

  // Real-time synchronization hooks
  subscribeToStore(listener: Listener): () => void {
    return subscribeToStore(listener);
  },
  notify(): void {
    notifyStoreUpdate();
  }
};
