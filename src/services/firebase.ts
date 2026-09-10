import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import type { Product, Order, StoreSettings } from '../types';

// 1. Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Initialize Firestore with the custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// 3. Initialize Firebase Auth
export const auth = getAuth(app);

// 4. Firestore Collection References
export const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  SETTINGS: 'settings',
  CATEGORIES: 'categories',
  USERS: 'users',
  SMS_LOGS: 'sms_logs'
} as const;

// 5. Firebase Realtime Cloud Service
export const FirebaseSyncService = {
  isConnected: true,

  // Save or update product in Firestore
  async saveProduct(product: Product): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
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
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deleteProduct error:', err);
    }
  },

  // Save new order to Firestore
  async saveOrder(order: Order): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, order.id);
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
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
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
    try {
      const docRef = doc(db, COLLECTIONS.SETTINGS, 'global_settings');
      await setDoc(docRef, settings, { merge: true });
    } catch (err) {
      console.warn('Firestore saveSettings error:', err);
    }
  },

  // Seed initial products to Firestore if empty
  async seedInitialProductsIfEmpty(initialProducts: Product[]): Promise<void> {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      if (snap.empty && initialProducts.length > 0) {
        console.log('Seeding initial products to Cloud Firestore...');
        for (const p of initialProducts) {
          await setDoc(doc(db, COLLECTIONS.PRODUCTS, p.id), p);
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
    try {
      const colRef = collection(db, COLLECTIONS.PRODUCTS);
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
    try {
      const colRef = collection(db, COLLECTIONS.ORDERS);
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
    try {
      const docRef = doc(db, COLLECTIONS.SETTINGS, 'global_settings');
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
