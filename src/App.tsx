import React, { useState, useEffect } from 'react';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

// Core Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { DeliveryAreaModal } from './components/DeliveryAreaModal';
import { MobileBottomNav } from './components/MobileBottomNav';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AuthPage } from './pages/AuthPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { FaqPage } from './pages/FaqPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StoreService } from './services/store';

function MainApp() {
  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);

  // Global Modals State
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);

  // Real-time Global Store Version (Auto-triggers instantaneous re-render across the entire website on any Admin update)
  const [, setStoreVersion] = useState(0);

  useEffect(() => {
    const unsub = StoreService.subscribeToStore(() => {
      setStoreVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, viewParam]);

  // Record visitor on app load
  useEffect(() => {
    StoreService.recordVisitor();
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
  };

  const handleOrderPlaced = (orderNumber: string) => {
    setCurrentView('order-confirmation');
    setViewParam(orderNumber);
  };

  // Determine if Admin view is active
  const isAdminView = currentView === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Header is hidden or minimized if in full admin screen, but kept accessible */}
      <Header
        currentView={currentView}
        viewParam={viewParam}
        onNavigate={handleNavigate}
        onOpenAreaModal={() => setIsAreaModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className={isAdminView ? "flex-1 w-full bg-slate-100" : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6"}>
        {currentView === 'home' && (
          <HomePage 
            onNavigate={handleNavigate} 
            onOpenAreaModal={() => setIsAreaModalOpen(true)}
          />
        )}

        {(currentView === 'shop' || currentView === 'category-products') && (
          <ShopPage
            initialCategory={viewParam}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'product-detail' && (
          <ProductDetailPage
            slug={viewParam || ''}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'cart' && (
          <CartPage
            onNavigate={handleNavigate}
            onOpenAreaModal={() => setIsAreaModalOpen(true)}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onNavigate={handleNavigate}
            onOrderPlaced={handleOrderPlaced}
          />
        )}

        {currentView === 'order-confirmation' && (
          <OrderConfirmationPage
            orderNumber={viewParam || ''}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'track-order' && (
          <TrackOrderPage
            initialOrderNumber={viewParam}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'login' && (
          <AuthPage onNavigate={handleNavigate} />
        )}

        {currentView === 'customer-dashboard' && (
          <CustomerDashboardPage onNavigate={handleNavigate} />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onNavigate={handleNavigate} />
        )}

        {(currentView === 'about' || currentView === 'about-us') && (
          <AboutUsPage />
        )}

        {currentView === 'faq' && (
          <FaqPage />
        )}

        {(currentView === 'contact' || currentView === 'contact-us') && (
          <ContactUsPage />
        )}

        {currentView === 'return-refund' && (
          <PoliciesPage type="return-refund" />
        )}

        {currentView === 'privacy' && (
          <PoliciesPage type="privacy" />
        )}

        {currentView === 'terms' && (
          <PoliciesPage type="terms" />
        )}
      </main>

      {/* Footer (hidden on full-screen admin view for cleaner workspace) */}
      {!isAdminView && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Mobile Sticky Bottom Bar (hidden on admin view) */}
      {!isAdminView && (
        <MobileBottomNav
          activeView={currentView}
          onNavigate={handleNavigate}
          onOpenCart={() => setIsCartDrawerOpen(true)}
        />
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        onNavigate={handleNavigate}
        onOpenAreaModal={() => setIsAreaModalOpen(true)}
      />

      {/* Zone Delivery Modal */}
      <DeliveryAreaModal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <MainApp />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
