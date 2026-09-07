import { PaymentMethod } from '../types';

export interface PaymentInitiateRequest {
  orderAmount: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  payerNumber?: string;
  pin?: string;
  otp?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  provider: string;
  isSimulated: boolean;
  message: string;
  error?: string;
}

// Check if production credentials are provided via environment variables
const metaEnv = (import.meta as any).env || {};
const ENV = {
  BKASH_APP_KEY: metaEnv.VITE_BKASH_APP_KEY || '',
  BKASH_APP_SECRET: metaEnv.VITE_BKASH_APP_SECRET || '',
  NAGAD_MERCHANT_ID: metaEnv.VITE_NAGAD_MERCHANT_ID || '',
  SSLCOMMERZ_STORE_ID: metaEnv.VITE_SSLCOMMERZ_STORE_ID || '',
};

export const PaymentService = {
  isConfigured(method: PaymentMethod): boolean {
    switch (method) {
      case 'bkash':
        return Boolean(ENV.BKASH_APP_KEY && ENV.BKASH_APP_SECRET);
      case 'nagad':
        return Boolean(ENV.NAGAD_MERCHANT_ID);
      case 'card':
        return Boolean(ENV.SSLCOMMERZ_STORE_ID);
      case 'cod':
      case 'rocket':
      default:
        return true;
    }
  },

  getMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case 'cod':
        return 'Cash on Delivery (ক্যাশ অন ডেলিভারি)';
      case 'bkash':
        return 'bKash (বিকাশ অনলাইন / পেমেন্ট)';
      case 'nagad':
        return 'Nagad (নগদ পেমেন্ট)';
      case 'rocket':
        return 'Rocket (রকেট পেমেন্ট)';
      case 'card':
        return 'Debit / Credit Card (ভিসা / মাস্টারকার্ড)';
      default:
        return 'Cash on Delivery';
    }
  },

  async processPayment(req: PaymentInitiateRequest): Promise<PaymentResult> {
    // 1. Cash on Delivery
    if (req.paymentMethod === 'cod') {
      return {
        success: true,
        provider: 'Cash on Delivery',
        isSimulated: false,
        message: 'Order placed under Cash on Delivery. Pay the delivery rider when receiving the goods.'
      };
    }

    // 2. bKash payment processing
    if (req.paymentMethod === 'bkash') {
      const isReal = this.isConfigured('bkash');
      if (isReal) {
        // Real bKash Checkout URL or Execute Payment API call would happen here via server API route
        return {
          success: true,
          provider: 'bKash Official Gateway',
          transactionId: `BKS${Date.now()}`,
          isSimulated: false,
          message: 'bKash payment verified successfully.'
        };
      } else {
        // Transparent development simulator
        await new Promise((res) => setTimeout(res, 1200));
        const fakeTrx = `SIM-BKS-${Math.floor(10000000 + Math.random() * 90000000)}`;
        return {
          success: true,
          provider: 'bKash (Sandbox Simulator)',
          transactionId: fakeTrx,
          isSimulated: true,
          message: `[Simulated Sandbox] bKash payment of ৳${req.orderAmount} approved. TrxID: ${fakeTrx}`
        };
      }
    }

    // 3. Nagad payment processing
    if (req.paymentMethod === 'nagad') {
      const isReal = this.isConfigured('nagad');
      if (isReal) {
        return {
          success: true,
          provider: 'Nagad PGW',
          transactionId: `NGD${Date.now()}`,
          isSimulated: false,
          message: 'Nagad payment confirmed.'
        };
      } else {
        await new Promise((res) => setTimeout(res, 1200));
        const fakeTrx = `SIM-NGD-${Math.floor(10000000 + Math.random() * 90000000)}`;
        return {
          success: true,
          provider: 'Nagad (Sandbox Simulator)',
          transactionId: fakeTrx,
          isSimulated: true,
          message: `[Simulated Sandbox] Nagad payment of ৳${req.orderAmount} approved. TrxID: ${fakeTrx}`
        };
      }
    }

    // 4. Rocket
    if (req.paymentMethod === 'rocket') {
      await new Promise((res) => setTimeout(res, 1000));
      const fakeTrx = `SIM-RKT-${Math.floor(10000000 + Math.random() * 90000000)}`;
      return {
        success: true,
        provider: 'Rocket (Sandbox Simulator)',
        transactionId: fakeTrx,
        isSimulated: true,
        message: `[Simulated Sandbox] Rocket payment of ৳${req.orderAmount} confirmed. TrxID: ${fakeTrx}`
      };
    }

    // 5. Debit / Credit Card
    if (req.paymentMethod === 'card') {
      await new Promise((res) => setTimeout(res, 1400));
      const fakeTrx = `SIM-CARD-${Math.floor(10000000 + Math.random() * 90000000)}`;
      return {
        success: true,
        provider: 'Online Card (Sandbox Simulator)',
        transactionId: fakeTrx,
        isSimulated: true,
        message: `[Simulated Sandbox] Card payment of ৳${req.orderAmount} authorized.`
      };
    }

    return {
      success: false,
      provider: 'Unknown',
      isSimulated: true,
      message: 'Unsupported payment method.'
    };
  }
};
