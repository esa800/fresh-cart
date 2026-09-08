import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types';
import { QuickOrderModal } from '../components/QuickOrderModal';

interface QuickOrderContextType {
  openQuickOrder: (product: Product) => void;
  closeQuickOrder: () => void;
}

const QuickOrderContext = createContext<QuickOrderContextType | undefined>(undefined);

export const QuickOrderProvider: React.FC<{
  children: React.ReactNode;
  onOrderSuccess: (orderNumber: string) => void;
}> = ({ children, onOrderSuccess }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openQuickOrder = (product: Product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const closeQuickOrder = () => {
    setIsOpen(false);
    setSelectedProduct(null);
  };

  return (
    <QuickOrderContext.Provider value={{ openQuickOrder, closeQuickOrder }}>
      {children}
      <QuickOrderModal
        product={selectedProduct}
        isOpen={isOpen}
        onClose={closeQuickOrder}
        onSuccess={onOrderSuccess}
      />
    </QuickOrderContext.Provider>
  );
};

export const useQuickOrder = () => {
  const context = useContext(QuickOrderContext);
  if (!context) {
    throw new Error('useQuickOrder must be used within a QuickOrderProvider');
  }
  return context;
};
