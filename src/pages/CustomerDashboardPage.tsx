import React, { useState, useEffect } from 'react';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  FileText, 
  Truck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../contexts/ToastContext';
import { StoreService, subscribeToStore } from '../services/store';
import { Order, Address } from '../types';
import { InvoiceModal } from '../components/InvoiceModal';
import { ProductCard } from '../components/ProductCard';

interface CustomerDashboardPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({ onNavigate }) => {
  const { currentUser, logout, updateUser } = useAuth();
  const { addToCart } = useCart();
  const { wishlistIds } = useWishlist();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<Order[]>(() => {
    return currentUser 
      ? StoreService.getOrders().filter(o => o.customerId === currentUser.id || o.phone === currentUser.phone)
      : StoreService.getOrders().slice(0, 5);
  });

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Address add form modal / state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newDivision, setNewDivision] = useState('Dhaka');
  const [newArea, setNewArea] = useState('');
  const [newFullAddress, setNewFullAddress] = useState('');

  // Profile form state
  const [profName, setProfName] = useState(currentUser?.name || '');
  const [profPhone, setProfPhone] = useState(currentUser?.phone || '');

  useEffect(() => {
    const unsub = subscribeToStore(() => {
      if (currentUser) {
        setOrders(StoreService.getOrders().filter(o => o.customerId === currentUser.id || o.phone === currentUser.phone));
      } else {
        setOrders(StoreService.getOrders().slice(0, 5));
      }
    });
    return unsub;
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4 my-8">
        <h2 className="text-lg font-bold text-slate-900">Please Sign In</h2>
        <p className="text-xs text-slate-500">Sign in to view your orders and manage your account.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim() || !profPhone.trim()) {
      showToast('Name and phone cannot be empty', 'error');
      return;
    }

    const updated = {
      ...currentUser,
      name: profName.trim(),
      phone: profPhone.trim()
    };
    updateUser(updated);
    showToast('Profile updated successfully!', 'success');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArea.trim() || !newFullAddress.trim()) {
      showToast('Please enter both area and street address', 'error');
      return;
    }

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      title: 'Home',
      recipientName: currentUser.name,
      phone: currentUser.phone,
      division: newDivision,
      district: 'Dhaka',
      area: newArea.trim(),
      fullAddress: newFullAddress.trim(),
      isDefault: (currentUser.savedAddresses || []).length === 0
    };

    const updated = {
      ...currentUser,
      savedAddresses: [...(currentUser.savedAddresses || []), newAddr]
    };
    updateUser(updated);
    showToast('New delivery address saved!', 'success');
    setIsAddingAddress(false);
    setNewArea('');
    setNewFullAddress('');
  };

  const handleDeleteAddress = (id: string) => {
    const updated = {
      ...currentUser,
      savedAddresses: (currentUser.savedAddresses || []).filter((a) => a.id !== id)
    };
    updateUser(updated);
    showToast('Address removed', 'info');
  };

  const handleReorder = (order: Order) => {
    let addedCount = 0;
    order.items.forEach((item) => {
      const prod = StoreService.getProducts().find((p) => p.id === item.productId);
      if (prod && prod.stockQuantity > 0) {
        addToCart(prod, item.quantity);
        addedCount++;
      }
    });
    showToast(`Added ${addedCount} items from #${order.orderNumber} to your cart!`, 'success');
    onNavigate('cart');
  };

  const wishlistedProducts = StoreService.getProducts().filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="space-y-8 pb-16">
      {/* Dashboard Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              Customer Portal ({currentUser.role.replace('_', ' ')})
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{currentUser.email} • {currentUser.phone}</p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Orders</span>
            <strong className="text-base text-white">{orders.length}</strong>
          </div>
          <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Grocery Spent</span>
            <strong className="text-base text-emerald-400">৳{totalSpent}</strong>
          </div>
          <button
            onClick={() => {
              logout();
              onNavigate('home');
            }}
            className="px-4 py-2.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-2xl font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
            activeTab === 'orders' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
            activeTab === 'addresses' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({(currentUser.savedAddresses || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
            activeTab === 'wishlist' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlistIds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
            activeTab === 'profile' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* Tab 1: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No orders placed yet</h3>
              <p className="text-xs text-slate-500">Start shopping fresh produce and get it delivered in 2 hours.</p>
              <button
                onClick={() => onNavigate('shop')}
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {order.orderNumber}
                      </span>
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md ${
                        order.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Placed on {new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>

                    <button
                      onClick={() => onNavigate('track-order', order.orderNumber)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track</span>
                    </button>

                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Reorder
                    </button>
                  </div>
                </div>

                {/* Items in order */}
                <div className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-[11px] text-slate-400">{item.unit} × {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">৳{item.total}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Payment: <strong className="uppercase text-slate-800">{order.paymentMethod}</strong> ({order.paymentStatus})
                  </span>
                  <div className="text-right">
                    <span className="text-slate-500 mr-2">Total Amount:</span>
                    <strong className="text-base text-emerald-700 font-black">৳{order.total}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Your Delivery Addresses</h3>
            <button
              onClick={() => setIsAddingAddress(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {isAddingAddress && (
            <form onSubmit={handleAddAddress} className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3 max-w-lg">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">New Address Details</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Division</label>
                  <select
                    value={newDivision}
                    onChange={(e) => setNewDivision(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Sylhet">Sylhet</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area / Thana *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhanmondi, Gulshan"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Full Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="House, Road, Block, Flat"
                    value={newFullAddress}
                    onChange={(e) => setNewFullAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(currentUser.savedAddresses || []).map((addr) => (
              <div
                key={addr.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{addr.area}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{addr.fullAddress}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{addr.division}, Bangladesh</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Your Saved Groceries ({wishlistedProducts.length})</h3>
          {wishlistedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <Heart className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">Your wishlist is empty. Tap the heart icon on any product to save it.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {wishlistedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-md space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Update Profile</h3>
          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mobile Phone</label>
              <input
                type="text"
                value={profPhone}
                onChange={(e) => setProfPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email (Read only)</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
};
