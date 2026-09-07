import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product, Coupon, DeliveryZone } from '../types';
import { StoreService, subscribeToStore } from '../services/store';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  deliveryCharge: number;
  total: number;
  isCartOpen: boolean;
  selectedZone: DeliveryZone;
  deliveryOption: 'standard' | 'express';
  setDeliveryOption: (opt: 'standard' | 'express') => void;
  setSelectedZone: (zone: DeliveryZone) => void;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message: string };
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'freshcart_cart_items_v1';
const COUPON_STORAGE_KEY = 'freshcart_cart_coupon_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedZone, setSelectedZoneState] = useState<DeliveryZone>(() => StoreService.getSelectedZone());
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express'>('standard');

  // Sync with store updates (e.g. if an admin modifies a product price or stock)
  useEffect(() => {
    const unsub = subscribeToStore(() => {
      setSelectedZoneState(StoreService.getSelectedZone());
      // Refresh items with updated product info if available
      setItems((prev) => {
        const freshProducts = StoreService.getProducts();
        return prev.map((item) => {
          const fresh = freshProducts.find((p) => p.id === item.product.id);
          return fresh ? { ...item, product: fresh } : item;
        });
      });
    });
    return unsub;
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [appliedCoupon]);

  const setSelectedZone = (zone: DeliveryZone) => {
    setSelectedZoneState(zone);
    StoreService.setSelectedZone(zone);
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  }, [items]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const res = StoreService.validateCoupon(appliedCoupon.code, subtotal);
    if (!res.valid) {
      return 0;
    }
    return res.discount;
  }, [appliedCoupon, subtotal]);

  const deliveryCharge = useMemo(() => {
    if (items.length === 0) return 0;
    const base = deliveryOption === 'express' ? selectedZone.expressCharge : selectedZone.standardCharge;
    if (deliveryOption === 'standard' && subtotal >= selectedZone.freeDeliveryThreshold) {
      return 0;
    }
    return base;
  }, [items.length, deliveryOption, selectedZone, subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - couponDiscount + deliveryCharge);
  }, [subtotal, couponDiscount, deliveryCharge]);

  const itemCount = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    const existing = items.find((i) => i.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const targetQty = currentQty + quantity;

    if (product.stockQuantity <= 0 || product.availability === 'out_of_stock') {
      return { success: false, message: `"${product.name}" is currently out of stock.` };
    }

    if (targetQty > product.stockQuantity) {
      return {
        success: false,
        message: `Only ${product.stockQuantity} ${product.unit} available in stock.`
      };
    }

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: targetQty };
        return next;
      }
      return [...prev, { product, quantity, selectedUnit: product.unit }];
    });

    return {
      success: true,
      message: `Added ${product.name} to cart.`
    };
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true, message: 'Item removed from cart.' };
    }

    const item = items.find((i) => i.product.id === productId);
    if (!item) return { success: false, message: 'Item not found in cart.' };

    if (quantity > item.product.stockQuantity) {
      return {
        success: false,
        message: `Cannot exceed available stock of ${item.product.stockQuantity}.`
      };
    }

    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
    return { success: true, message: 'Cart quantity updated.' };
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const res = StoreService.validateCoupon(code, subtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        appliedCoupon,
        couponDiscount,
        deliveryCharge,
        total,
        isCartOpen,
        selectedZone,
        deliveryOption,
        setDeliveryOption,
        setSelectedZone,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
