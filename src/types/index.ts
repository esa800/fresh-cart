export type Role = 'customer' | 'super_admin' | 'manager' | 'order_manager' | 'product_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl?: string;
  savedAddresses?: Address[];
  wishlistProductIds?: string[];
  createdAt: string;
}

export interface Address {
  id: string;
  title: string; // e.g. 'Home', 'Office'
  recipientName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  fullAddress: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  banglaName: string;
  slug: string;
  image: string;
  iconName?: string;
  icon?: string;
  description?: string;
  featured?: boolean;
  productCount?: number;
  displayOrder?: number;
  isActive?: boolean;
  subcategories?: string[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  banglaName: string;
  slug: string;
  sku: string;
  category: string;
  categoryId: string;
  subcategory?: string;
  brand: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  regularPrice: number; // in BDT (৳)
  salePrice: number;    // in BDT (৳)
  discountPercentage: number;
  unit: string;         // e.g. '1kg', '500g', '1 litre', '1 dozen', '1 piece'
  weightSize: string;
  stockQuantity: number;
  lowStockThreshold: number;
  availability: 'in_stock' | 'out_of_stock' | 'low_stock';
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isDarazMall?: boolean;
  isFreeDelivery?: boolean;
  isFlashSale?: boolean;
  variants?: string[];
  tags: string[];
  rating: number;       // 1.0 - 5.0
  reviewCount: number;
  origin?: string;      // e.g. 'Dinajpur', 'Bogura', 'Chattogram Sea'
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedUnit?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  banglaName?: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
  total: number;
}

export type OrderStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  address: {
    division: string;
    district: string;
    area: string;
    fullAddress: string;
    deliveryNote?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  couponDiscount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryStatus: string;
  deliveryOption: 'standard' | 'express';
  estimatedDelivery: string;
  orderDate: string;
  notes?: string;
  courierService?: 'Steadfast' | 'Pathao' | 'RedX' | 'Sundarban' | string;
  courierTrackingId?: string;
  paymentDetails?: {
    transactionId?: string;
    senderNumber?: string;
    simulated?: boolean;
    provider?: string;
  };
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  usageLimit?: number;
  usageCount?: number;
  isActive: boolean;
  description?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  bgGradient: string;
  image: string;
  buttonText: string;
  targetUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  division: string;
  standardCharge: number;
  expressCharge: number;
  freeDeliveryThreshold: number;
  estimatedTime: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface StoreSettings {
  storeName: string;
  brandTagline: string;
  hotline: string;
  whatsappNumber?: string;
  supportEmail: string;
  officeAddress: string;
  bkashMerchantNumber: string;
  nagadMerchantNumber: string;
  taxPercentage: number;
  announcementText: string;
  isAnnouncementActive?: boolean;
  currency: string;
  currencySymbol: string;
  adminPassword?: string;
  aboutUsText?: string;
}
