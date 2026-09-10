import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  onSnapshot, 
  updateDoc,
  Firestore
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import type { Product, Order, StoreSettings, Category } from '../types';

// Default Firebase Configuration for KHAN store (Cloud Firestore & Auth)
// Works seamlessly both with and without external config files on Vercel / GitHub
const DEFAULT_FIREBASE_CONFIG = {
  projectId: "gen-lang-client-0711712259",
  appId: "1:867985691468:web:13b5c0212299b139f775e9",
  apiKey: "AIzaSyBYg709h2rIWI_MZGTHdwKQb73yCK442Ko",
  authDomain: "gen-lang-client-0711712259.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-freshcartbd-f6a72862-f00f-45bc-9ff4-444b8cb19780",
  storageBucket: "gen-lang-client-0711712259.firebasestorage.app",
  messagingSenderId: "867985691468",
  measurementId: "",
  oAuthClientId: "867985691468-40psb7a4resi0j7s0d2i1d2shprrs59j.apps.googleusercontent.com"
};

// Safe initialization of Firebase App, Firestore and Auth
let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let isConnected = false;

try {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(DEFAULT_FIREBASE_CONFIG);
  
  const customDbId = DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId;
  if (customDbId && customDbId !== '(default)') {
    dbInstance = getFirestore(appInstance, customDbId);
  } else {
    dbInstance = getFirestore(appInstance);
  }
  
  authInstance = getAuth(appInstance);
  isConnected = true;
} catch (error) {
  console.warn('Firebase safe initialization notice (store will use local offline storage):', error);
}

export const app = appInstance;
export const db = dbInstance;
export const auth = authInstance;

// Helper to strip undefined values so Firestore never throws "Unsupported field value: undefined"
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data.toISOString() as unknown as T;
  }
  if (Array.isArray(data)) {
    return data
      .filter((val) => val !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const sanitizedObj: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value !== undefined) {
      sanitizedObj[key] = sanitizeForFirestore(value);
    }
  }
  return sanitizedObj as T;
}

// Firestore Collection References
export const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  SETTINGS: 'settings',
  CATEGORIES: 'categories',
  USERS: 'users',
  SMS_LOGS: 'sms_logs'
} as const;

// In-memory deleted orders set to prevent resurrecting deleted orders without blocking calls
const knownDeletedOrderIds = new Set<string>(['ord-1001', 'ord-1002']);

if (typeof window !== 'undefined') {
  try {
    const cached = localStorage.getItem('khan_store_organic_v4_deleted_order_ids');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        parsed.forEach((id: string) => knownDeletedOrderIds.add(id));
      }
    }
  } catch (e) {
    // ignore
  }
}

function isOrderDeleted(id?: string, orderNumber?: string): boolean {
  if (!id && !orderNumber) return false;
  if (id && (id === 'ord-1001' || id === 'ord-1002' || knownDeletedOrderIds.has(id))) return true;
  if (orderNumber && (orderNumber === 'ord-1001' || orderNumber === 'ord-1002' || knownDeletedOrderIds.has(orderNumber))) return true;
  return false;
}

// Firebase Realtime Cloud Service
export const FirebaseSyncService = {
  get isConnected(): boolean {
    return isConnected && !!dbInstance;
  },

  // Synchronous check for deleted order
  isOrderDeleted(id?: string, orderNumber?: string): boolean {
    return isOrderDeleted(id, orderNumber);
  },

  // Save or update product in Firestore
  async saveProduct(product: Product): Promise<void> {
    if (!dbInstance) return;
    try {
      const docRef = doc(dbInstance, COLLECTIONS.PRODUCTS, product.id);
      const sanitized = sanitizeForFirestore({
        ...product,
        updatedAt: new Date().toISOString()
      });
      await setDoc(docRef, sanitized, { merge: true });
    } catch (err) {
      console.warn('Firestore saveProduct error:', err);
    }
  },

  // Delete product from Firestore
  async deleteProduct(productId: string): Promise<void> {
    if (!dbInstance) return;
    try {
      const docRef = doc(dbInstance, COLLECTIONS.PRODUCTS, productId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deleteProduct error:', err);
    }
  },

  // Record deleted order ID permanently in local memory and cache
  async recordDeletedOrder(orderId: string): Promise<void> {
    knownDeletedOrderIds.add(orderId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'khan_store_organic_v4_deleted_order_ids',
          JSON.stringify(Array.from(knownDeletedOrderIds))
        );
      } catch (e) {
        // ignore
      }
    }
  },

  // Save new or updated order to Firestore
  async saveOrder(order: Order): Promise<boolean> {
    if (!dbInstance) {
      console.warn('Firestore dbInstance unavailable, cannot save order to cloud');
      return false;
    }
    if (isOrderDeleted(order.id, order.orderNumber)) {
      console.log('Skipping save for deleted order:', order.id);
      return false;
    }
    try {
      const docRef = doc(dbInstance, COLLECTIONS.ORDERS, order.id);
      const sanitized = sanitizeForFirestore({
        ...order,
        isPendingCloudSync: false,
        updatedAt: new Date().toISOString()
      });
      await setDoc(docRef, sanitized, { merge: true });
      console.log('Order successfully synced to Cloud Firestore:', order.orderNumber, order.id);
      return true;
    } catch (err) {
      console.error('Firestore saveOrder error:', err);
      return false;
    }
  },

  // Delete order permanently from Firestore
  async deleteOrder(orderId: string): Promise<void> {
    await this.recordDeletedOrder(orderId);
    if (!dbInstance) return;
    try {
      const docRef = doc(dbInstance, COLLECTIONS.ORDERS, orderId);
      await deleteDoc(docRef);
      console.log('Order deleted permanently from Cloud Firestore:', orderId);
    } catch (err) {
      console.warn('Firestore deleteOrder error:', err);
    }
  },

  // Update order status in Firestore
  async updateOrderStatus(orderId: string, orderStatus: string, paymentStatus?: string): Promise<void> {
    if (!dbInstance) return;
    try {
      const docRef = doc(dbInstance, COLLECTIONS.ORDERS, orderId);
      const updateData: Record<string, unknown> = {
        orderStatus,
        updatedAt: new Date().toISOString()
      };
      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }
      await setDoc(docRef, sanitizeForFirestore(updateData), { merge: true });
    } catch (err) {
      console.warn('Firestore updateOrderStatus error:', err);
    }
  },

  // Save store settings to Firestore
  async saveSettings(settings: StoreSettings): Promise<boolean> {
    if (!dbInstance) {
      console.warn('Firestore dbInstance unavailable, cannot save settings');
      return false;
    }
    try {
      const docRef = doc(dbInstance, COLLECTIONS.SETTINGS, 'global_settings');
      const sanitized = sanitizeForFirestore({
        ...settings,
        updatedAt: new Date().toISOString()
      });
      await setDoc(docRef, sanitized, { merge: true });
      console.log('Store settings successfully synced to Cloud Firestore:', settings.storeName);
      return true;
    } catch (err) {
      console.error('Firestore saveSettings error:', err);
      return false;
    }
  },

  // Seed default settings to Firestore if not already present
  async seedInitialSettingsIfEmpty(defaultSettings: StoreSettings): Promise<void> {
    if (!dbInstance) return;
    try {
      const docRef = doc(dbInstance, COLLECTIONS.SETTINGS, 'global_settings');
      const snap = await getDocs(collection(dbInstance, COLLECTIONS.SETTINGS));
      if (snap.empty) {
        console.log('Seeding initial store settings to Cloud Firestore...');
        await setDoc(docRef, sanitizeForFirestore(defaultSettings), { merge: true });
      }
    } catch (err) {
      console.warn('Firestore seedInitialSettingsIfEmpty error:', err);
    }
  },

  // Fetch orders once from Cloud Firestore
  async fetchOrdersOnce(): Promise<Order[]> {
    if (!dbInstance) return [];
    try {
      const snap = await getDocs(collection(dbInstance, COLLECTIONS.ORDERS));
      const list: Order[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Order;
        if (data && data.id && !isOrderDeleted(data.id, data.orderNumber)) {
          list.push(data);
        }
      });
      list.sort((a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime());
      return list;
    } catch (err) {
      console.warn('Firestore fetchOrdersOnce warning:', err);
      return [];
    }
  },

  // Save or update category in Firestore
  async saveCategory(category: Category): Promise<void> {
    if (!dbInstance) return;
    try {
      const docRef = doc(dbInstance, COLLECTIONS.CATEGORIES, category.id);
      await setDoc(docRef, {
        ...category,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveCategory error:', err);
    }
  },

  // Delete category from Firestore
  async deleteCategory(categoryId: string): Promise<void> {
    if (!dbInstance) return;
    try {
      const docRef = doc(dbInstance, COLLECTIONS.CATEGORIES, categoryId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deleteCategory error:', err);
    }
  },

  // Subscribe to real-time categories collection updates
  subscribeToCategories(
    onUpdate: (categories: Category[]) => void,
    onError?: (error: unknown) => void
  ): () => void {
    if (!dbInstance) return () => {};
    try {
      const colRef = collection(dbInstance, COLLECTIONS.CATEGORIES);
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Category[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as Category);
            });
            list.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
            onUpdate(list);
          }
        },
        (error) => {
          console.warn('Firestore categories onSnapshot warning:', error);
          if (onError) onError(error);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Failed to start Firestore categories subscription:', err);
      return () => {};
    }
  },

  // Seed initial products to Firestore if empty
  async seedInitialProductsIfEmpty(initialProducts: Product[]): Promise<void> {
    if (!dbInstance) return;
    try {
      const snap = await getDocs(collection(dbInstance, COLLECTIONS.PRODUCTS));
      if (snap.empty && initialProducts.length > 0) {
        console.log('Seeding initial products to Cloud Firestore...');
        for (const p of initialProducts) {
          await setDoc(doc(dbInstance, COLLECTIONS.PRODUCTS, p.id), p);
        }
      }
    } catch (err) {
      console.warn('Firestore seed error (offline or permission):', err);
    }
  },

  // Subscribe to real-time products collection updates
  subscribeToProducts(
    onUpdate: (products: Product[]) => void,
    onError?: (error: unknown) => void
  ): () => void {
    if (!dbInstance) return () => {};
    try {
      const colRef = collection(dbInstance, COLLECTIONS.PRODUCTS);
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Product[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as Product);
            });
            onUpdate(list);
          }
        },
        (error) => {
          console.warn('Firestore products onSnapshot warning:', error);
          if (onError) onError(error);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Failed to start Firestore products subscription:', err);
      return () => {};
    }
  },

  // Subscribe to real-time orders collection updates
  subscribeToOrders(
    onUpdate: (orders: Order[]) => void,
    onError?: (error: unknown) => void
  ): () => void {
    if (!dbInstance) return () => {};
    try {
      const colRef = collection(dbInstance, COLLECTIONS.ORDERS);
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Order;
            if (data && data.id && !isOrderDeleted(data.id, data.orderNumber)) {
              list.push(data);
            }
          });
          // Sort by latest order first
          list.sort((a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime());
          console.log(`[Firestore Realtime] Received ${list.length} orders from cloud`);
          onUpdate(list);
        },
        (error) => {
          console.warn('Firestore orders onSnapshot warning:', error);
          if (onError) onError(error);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Failed to start Firestore orders subscription:', err);
      return () => {};
    }
  },

  // Subscribe to store settings
  subscribeToSettings(
    onUpdate: (settings: StoreSettings) => void
  ): () => void {
    if (!dbInstance) return () => {};
    try {
      const docRef = doc(dbInstance, COLLECTIONS.SETTINGS, 'global_settings');
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            onUpdate(docSnap.data() as StoreSettings);
          }
        },
        (error) => {
          console.warn('Firestore settings onSnapshot warning:', error);
        }
      );
      return unsubscribe;
    } catch (err) {
      return () => {};
    }
  }
};
