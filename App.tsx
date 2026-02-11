
import React, { useState, useEffect } from 'react';
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

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_SYSTEM_CONFIG);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);

  // Load initial data
  useEffect(() => {
    const savedProducts = localStorage.getItem('lumina_products');
    const savedOrders = localStorage.getItem('lumina_orders');
    const savedCategories = localStorage.getItem('lumina_categories');
    const savedTables = localStorage.getItem('lumina_tables');
    const savedUsers = localStorage.getItem('lumina_users');
    const savedConfig = localStorage.getItem('lumina_config');
    const savedUser = localStorage.getItem('lumina_current_user');
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('lumina_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (savedCategories) setCategories(JSON.parse(savedCategories));
    else {
      setCategories(INITIAL_CATEGORIES);
      localStorage.setItem('lumina_categories', JSON.stringify(INITIAL_CATEGORIES));
    }

    if (savedTables) setTables(JSON.parse(savedTables));
    else {
      const initialTables: Table[] = [
        { id: '1', name: 'Table 01', status: 'Available' },
        { id: '2', name: 'Table 02', status: 'Available' },
        { id: '3', name: 'Table 03', status: 'Available' },
      ];
      setTables(initialTables);
      localStorage.setItem('lumina_tables', JSON.stringify(initialTables));
    }

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    else {
      setUsers(INITIAL_USERS);
      localStorage.setItem('lumina_users', JSON.stringify(INITIAL_USERS));
    }

    if (savedConfig) setSystemConfig(JSON.parse(savedConfig));
    else {
      localStorage.setItem('lumina_config', JSON.stringify(INITIAL_SYSTEM_CONFIG));
    }

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      // Reset view to default for the role
      if (user.role === 'Cashier') setCurrentView('pos');
      else if (user.role === 'Waiter') setCurrentView('orders');
    }

    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Persistence effects
  useEffect(() => { if (products.length > 0) localStorage.setItem('lumina_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { if (categories.length > 0) localStorage.setItem('lumina_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('lumina_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('lumina_tables', JSON.stringify(tables)); }, [tables]);
  useEffect(() => { localStorage.setItem('lumina_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('lumina_config', JSON.stringify(systemConfig)); }, [systemConfig]);
  useEffect(() => { 
    if (currentUser) localStorage.setItem('lumina_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('lumina_current_user');
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'Cashier') setCurrentView('pos');
    else if (user.role === 'Waiter') setCurrentView('orders');
    else setCurrentView('pos');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('pos');
  };

  const addToOrder = (product: Product) => {
    setCurrentOrder(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromOrder = (productId: string) => {
    setCurrentOrder(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCurrentOrder(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const deleteOrder = (orderId: string) => {
    if (confirm('Hapus laporan penjualan ini? Data keuangan akan diperbarui secara otomatis.')) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const checkout = (tableNumber?: string, cashReceived?: number, change?: number) => {
    if (currentOrder.length === 0) return;
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items: [...currentOrder],
      total: currentOrder.reduce((acc, item) => acc + (item.price * item.quantity), 0),
      timestamp: Date.now(),
      tableNumber,
      status: 'completed',
      cashReceived,
      change
    };
    setOrders(prev => [newOrder, ...prev]);
    setCurrentOrder([]);
    setProducts(prev => prev.map(p => {
      const orderItem = currentOrder.find(oi => oi.id === p.id);
      if (orderItem) return { ...p, stock: Math.max(0, p.stock - orderItem.quantity) };
      return p;
    }));
    return newOrder;
  };

  if (!currentUser) {
    return <LoginView users={users} onLogin={handleLogin} storeName={systemConfig.storeName} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'pos':
        return (
          <POSView 
            products={products} categories={categories} tables={tables} 
            currentOrder={currentOrder} addToOrder={addToOrder} 
            removeFromOrder={removeFromOrder} updateQuantity={updateQuantity} 
            onCheckout={checkout} systemConfig={systemConfig}
          />
        );
      case 'inventory':
        if (currentUser.role !== 'Admin') return <div className="p-10 text-center">Unauthorized Access</div>;
        return <InventoryView products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} />;
      case 'qr':
        if (currentUser.role !== 'Admin') return <div className="p-10 text-center">Unauthorized Access</div>;
        return <QRCodeView tables={tables} setTables={setTables} />;
      case 'orders':
        if (currentUser.role === 'Cashier') return <div className="p-10 text-center">Unauthorized Access</div>;
        return <OrdersView orders={orders} systemConfig={systemConfig} />;
      case 'reports':
        if (currentUser.role !== 'Admin') return <div className="p-10 text-center">Unauthorized Access</div>;
        return <ReportsView orders={orders} products={products} onDeleteOrder={deleteOrder} systemConfig={systemConfig} />;
      case 'settings':
        if (currentUser.role !== 'Admin') return <div className="p-10 text-center">Unauthorized Access</div>;
        return (
          <SettingsView 
            users={users} setUsers={setUsers} 
            config={systemConfig} setConfig={setSystemConfig} 
          />
        );
      default:
        return <div className="p-10 text-center text-slate-400">View coming soon...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        storeName={systemConfig.storeName} 
        user={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-hidden relative">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
