
import React, { useState, useEffect, useRef } from 'react';
import { View, Product, Order, OrderItem, Table, User, SystemConfig } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_USERS, INITIAL_SYSTEM_CONFIG } from './constants';
import Sidebar from './components/Sidebar';
import POSView from './components/POSView';
import InventoryView from './components/InventoryView';
import QRCodeView from './components/QRCodeView';
import OrdersView from './components/OrdersView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import Receipt from './components/Receipt';

const API_URL = 'api.php';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_SYSTEM_CONFIG);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeOrderTable, setActiveOrderTable] = useState<string>('');
  const [activeCustomerName, setActiveCustomerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [customerTable, setCustomerTable] = useState<string | null>(null);
  const [newOrderNotify, setNewOrderNotify] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<Order | null>(null);

  const prevPendingCount = useRef(0);

  const saveLocal = (key: string, data: any) => localStorage.setItem(`nara_db_${key}`, JSON.stringify(data));
  const loadLocal = (key: string, defaultValue: any) => {
    const saved = localStorage.getItem(`nara_db_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      const response = await fetch(`${API_URL}?action=get_initial_data`, { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Invalid API Response:", responseText);
        throw new Error("Invalid JSON");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setProducts(data.products?.length > 0 ? data.products.map((p: any) => ({ 
        ...p, 
        price: Number(p.price), 
        costPrice: Number(p.costPrice), 
        stock: Number(p.stock) 
      })) : INITIAL_PRODUCTS);
      
      setCategories(data.categories?.length > 0 ? data.categories : INITIAL_CATEGORIES);
      setTables(data.tables?.length > 0 ? data.tables : []);
      
      if (data.users && data.users.length > 0) {
        setUsers(data.users);
      }
      
      const rawOrders = data.orders || [];
      const formattedOrders = rawOrders.map((o: any) => ({
        ...o,
        total: Number(o.total),
        cashReceived: Number(o.cashReceived || 0),
        change: Number(o.changeDue || 0),
        timestamp: Number(o.timestamp),
        isPrinted: Boolean(o.isPrinted),
        items: (o.items || []).map((i: any) => ({
          ...i,
          price: Number(i.price),
          quantity: Number(i.quantity)
        }))
      }));

      const completed = formattedOrders.filter((o: any) => o.status === 'completed');
      const pending = formattedOrders.filter((o: any) => o.status === 'pending');
      
      setOrders(completed);
      setPendingOrders(pending);
      
      setIsOfflineMode(false);

      if (pending.length > prevPendingCount.current && currentView !== 'customer_menu') {
        setNewOrderNotify(true);
      }
      prevPendingCount.current = pending.length;

    } catch (error: any) {
      console.warn("Switching to Offline Mode:", error.message);
      setIsOfflineMode(true);
      
      setProducts(loadLocal('products', INITIAL_PRODUCTS));
      setCategories(loadLocal('categories', INITIAL_CATEGORIES));
      setTables(loadLocal('tables', []));
      setUsers(loadLocal('users', INITIAL_USERS));
      const savedOrders = loadLocal('orders', []);
      setOrders(savedOrders.filter((o: any) => o.status === 'completed'));
      setPendingOrders(savedOrders.filter((o: any) => o.status === 'pending'));
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      setCustomerTable(tableParam);
      setActiveOrderTable(tableParam);
      setCurrentView('customer_menu');
    }
    fetchData();

    const savedUser = localStorage.getItem('nara_current_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    const savedConfig = localStorage.getItem('nara_config');
    if (savedConfig) setSystemConfig(JSON.parse(savedConfig));

    const interval = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const syncData = async (action: string, payload: any, isDelete = false) => {
    if (!isOfflineMode) {
      try {
        const url = isDelete ? `${API_URL}?action=${action}&id=${payload.id || payload.name}` : `${API_URL}?action=${action}`;
        const response = await fetch(url, {
          method: isDelete ? 'GET' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: isDelete ? null : JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Sync Failed");
      } catch (e) { 
        console.error("Sync Error:", e);
        setIsOfflineMode(true);
      }
    }
    
    if (action.includes('product')) {
        const current = loadLocal('products', INITIAL_PRODUCTS);
        saveLocal('products', isDelete ? current.filter((i:any) => i.id !== payload.id) : [...current.filter((i:any) => i.id !== payload.id), payload]);
    } else if (action.includes('order')) {
        const currentOrders = loadLocal('orders', []);
        const filtered = currentOrders.filter((i:any) => i.id !== payload.id);
        saveLocal('orders', [...filtered, payload]);
        
        // REDUCE STOCK LOCALLY for offline/immediate consistency
        if (!isDelete && action === 'save_order') {
            const currentProducts = loadLocal('products', INITIAL_PRODUCTS);
            const updatedProducts = currentProducts.map((p: Product) => {
                const itemInOrder = payload.items.find((oi: OrderItem) => oi.id === p.id);
                if (itemInOrder) {
                    return { ...p, stock: Math.max(0, p.stock - itemInOrder.quantity) };
                }
                return p;
            });
            saveLocal('products', updatedProducts);
        }
    } else if (action.includes('table')) {
        const current = loadLocal('tables', []);
        saveLocal('tables', isDelete ? current.filter((i:any) => i.id !== payload.id) : [...current.filter((i:any) => i.id !== payload.id), payload]);
    } else if (action.includes('user')) {
        const current = loadLocal('users', INITIAL_USERS);
        saveLocal('users', isDelete ? current.filter((i:any) => i.id !== payload.id) : [...current.filter((i:any) => i.id !== payload.id), payload]);
    }
    
    await fetchData(true);
  };

  const markOrderAsPrinted = async (orderId: string) => {
    if (!isOfflineMode) {
      try {
        await fetch(`${API_URL}?action=mark_as_printed&id=${orderId}`);
      } catch (e) {
        console.error("Print Sync Error:", e);
      }
    }
    
    // Update local state for immediate feedback
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isPrinted: true } : o));
    
    // Also update storage
    const current = loadLocal('orders', []);
    const updated = current.map((o: any) => o.id === orderId ? { ...o, isPrinted: true } : o);
    saveLocal('orders', updated);
  };

  const checkout = async (customerName: string, tableNumber: string, cashReceived?: number, change?: number, isSelfOrder = false) => {
    if (currentOrder.length === 0 || !customerName || !tableNumber) return;
    
    const orderId = isSelfOrder ? (activeOrderId || `QR-${Date.now()}`) : (activeOrderId || `ORD-${Date.now()}`);
    
    const newOrder: Order = {
      id: orderId,
      customerName: customerName,
      items: [...currentOrder],
      total: currentOrder.reduce((acc, item) => acc + (item.price * item.quantity), 0),
      timestamp: Date.now(),
      tableNumber,
      status: isSelfOrder ? 'pending' : 'completed',
      cashReceived: cashReceived || 0,
      change: change || 0,
      isPrinted: false
    };

    await syncData('save_order', newOrder);
    
    if (!isSelfOrder) {
      setActiveOrderId(null);
      setActiveOrderTable('');
      setActiveCustomerName('');
      setLastReceipt(newOrder);
    }
    
    setCurrentOrder([]);
    if (isSelfOrder) alert("Pesanan Anda telah terkirim ke kasir. Silakan lakukan pembayaran di kasir.");
    
    return newOrder;
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-slate-400">Menghubungkan ke Nara...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {isOfflineMode && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-[10px] font-bold text-center py-1 z-[1000] uppercase tracking-widest shadow-md">
          Mode Lokal (Server Tidak Terjangkau)
        </div>
      )}
      
      {currentUser && currentView !== 'customer_menu' && (
        <Sidebar 
          currentView={currentView} 
          setView={setCurrentView} 
          storeName={systemConfig.storeName} 
          user={currentUser} 
          onLogout={() => { setCurrentUser(null); localStorage.removeItem('nara_current_user'); }} 
        />
      )}
      
      <main className="flex-1 overflow-hidden relative">
        {!currentUser && currentView !== 'customer_menu' ? (
          <LoginView 
            users={users} 
            onLogin={(u) => { setCurrentUser(u); localStorage.setItem('nara_current_user', JSON.stringify(u)); }} 
            storeName={systemConfig.storeName} 
            dbError={isOfflineMode ? "Koneksi ke api.php gagal. Pastikan file tersedia dan database aktif." : null} 
          />
        ) : (
          <>
            {(currentView === 'pos' || currentView === 'customer_menu') && (
              <POSView 
                products={products} 
                categories={categories} 
                tables={tables} 
                currentOrder={currentOrder} 
                addToOrder={(p) => setCurrentOrder(prev => {
                  const exists = prev.find(i => i.id === p.id);
                  if (exists) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
                  return [...prev, { ...p, quantity: 1 }];
                })} 
                removeFromOrder={(id) => setCurrentOrder(prev => prev.filter(i => i.id !== id))} 
                updateQuantity={(id, d) => setCurrentOrder(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity+d)} : i))} 
                onCheckout={checkout} 
                systemConfig={systemConfig} 
                pendingQRCount={pendingOrders.length} 
                pendingOrders={pendingOrders} 
                isCustomerMode={currentView === 'customer_menu'} 
                activeTable={activeOrderTable} 
                // Fixed: Changed from setActiveTable={setActiveTable} to setActiveOrderTable as setActiveTable was not defined
                setActiveTable={setActiveOrderTable} 
                activeCustomerName={activeCustomerName} 
                setActiveCustomerName={setActiveCustomerName} 
                onPickupOrder={(o) => { 
                  setActiveOrderId(o.id); 
                  setActiveOrderTable(o.tableNumber); 
                  setActiveCustomerName(o.customerName); 
                  setCurrentOrder(o.items); 
                }} 
                onCancelActive={() => { 
                  setActiveOrderId(null); 
                  setActiveOrderTable(''); 
                  setActiveCustomerName(''); 
                  setCurrentOrder([]); 
                }} 
              />
            )}
            {currentView === 'inventory' && <InventoryView products={products} syncProduct={(p, del) => syncData('save_product', p, del)} categories={categories} syncCategory={(n, o, del) => syncData('save_category', {name: n, oldName: o}, del)} />}
            {currentView === 'qr' && <QRCodeView tables={tables} syncTable={(t, del) => syncData('save_table', t, del)} />}
            {currentView === 'orders' && <OrdersView orders={orders} systemConfig={systemConfig} onMarkPrinted={markOrderAsPrinted} />}
            {currentView === 'reports' && <ReportsView orders={orders} products={products} onDeleteOrder={(id) => syncData('delete_order', {id}, true)} systemConfig={systemConfig} />}
            {currentView === 'settings' && <SettingsView users={users} syncUser={(u, del) => syncData('save_user', u, del)} config={systemConfig} setConfig={(c) => { setSystemConfig(c); localStorage.setItem('nara_config', JSON.stringify(c)); }} />}
          </>
        )}
      </main>
      {lastReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <Receipt order={lastReceipt} onClose={() => setLastReceipt(null)} systemConfig={systemConfig} />
        </div>
      )}
    </div>
  );
};

export default App;
