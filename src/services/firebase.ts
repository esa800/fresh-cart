import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
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

// Firestore Collection References
export const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  SETTINGS: 'settings',
  CATEGORIES: 'categories',
  USERS: 'users',
  SMS_LOGS: 'sms_logs'
} as const;

// Firebase Realtime Cloud Service
export const FirebaseSyncService = {
  get isConnected(): boolean {
    return isConnected && !!dbInstance;
  },

  // Save or update product in Firestore
  async saveProduct(product: Product): Promise<void> {
    if (!dbInstance) return;
    try {
      const docRef = doc(dbInstance, COLLECTIONS.PRODUCTS, product.id);
      await setDoc(docRef, {
        ...product,
        updatedAt: new Date().toISOString()
      }, { merge: true });
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

  // Save new order to Firestore
  async saveOrder(order: Order): Promise<void> {
    if (!dbInstance) return;
    try {
      const docRef = doc(dbInstance, COLLECTIONS.ORDERS, order.id);
      await setDoc(docRef, {
        ...order,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveOrder error:', err);
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
      await updateDoc(docRef, updateData);
    } catch (err) {
      console.warn('Firestore updateOrderStatus error:', err);
    }
  },

  // Save store settings to Firestore
  async saveSettings(settings: StoreSettings): Promise<void> {
    if (!dbInstance) return;
    try {
      const docRef = doc(dbInstance, COLLECTIONS.SETTINGS, 'global_settings');
      await setDoc(docRef, settings, { merge: true });
    } catch (err) {
      console.warn('Firestore saveSettings error:', err);
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
          if (!snapshot.empty) {
            const list: Order[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as Order);
            });
            // Sort by latest order first
            list.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
            onUpdate(list);
          }
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
