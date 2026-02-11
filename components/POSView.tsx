
import React, { useState, useMemo } from 'react';
import { Product, OrderItem, Order, Table, SystemConfig } from '../types';
import Receipt from './Receipt';

interface POSViewProps {
  products: Product[];
  categories: string[];
  tables: Table[];
  currentOrder: OrderItem[];
  addToOrder: (product: Product) => void;
  removeFromOrder: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  onCheckout: (table?: string, cashReceived?: number, change?: number) => Order | undefined;
  systemConfig: SystemConfig;
}

const POSView: React.FC<POSViewProps> = ({ 
  products, 
  categories,
  tables,
  currentOrder, 
  addToOrder, 
  removeFromOrder, 
  updateQuantity,
  onCheckout,
  systemConfig
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [lastReceipt, setLastReceipt] = useState<Order | null>(null);
  const [showCartMobile, setShowCartMobile] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const subtotal = currentOrder.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + tax;

  const cashAmount = parseFloat(cashReceived) || 0;
  const changeDue = Math.max(0, cashAmount - grandTotal);
  const isSufficient = cashAmount >= grandTotal && grandTotal > 0;

  const handlePay = () => {
    const order = onCheckout(tableNumber || 'Bawa Pulang', cashAmount, changeDue);
    if (order) {
      setLastReceipt(order);
      setTableNumber('');
      setCashReceived('');
      setShowCartMobile(false);
    }
  };

  const totalItems = currentOrder.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Products Section */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <header className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Katalog Menu</h1>
            <p className="text-sm text-slate-500">Pilih menu untuk ditambahkan ke pesanan</p>
          </div>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Cari menu..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </header>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
          {['Semua', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                selectedCategory === cat 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => addToOrder(product)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full"
              >
                <div className="relative h-28 sm:h-32 md:h-40 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-slate-700 border border-slate-100 uppercase tracking-wider">
                    {product.category}
                  </div>
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 mb-1">{product.name}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-2 mb-3 flex-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-indigo-600 text-xs sm:text-sm">Rp {product.price.toLocaleString()}</span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Cart Trigger */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
           <button 
             onClick={() => setShowCartMobile(true)}
             className="bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-2 active:scale-95 transition-all"
           >
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="font-bold text-sm pr-2">Ringkasan Pesanan</span>
           </button>
        </div>
      </div>

      {/* Cart Sidebar / Drawer */}
      <div className={`
        fixed lg:relative inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-slate-200 flex flex-col shadow-2xl z-50 transition-transform duration-300
        ${showCartMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Pesanan Saat Ini
          </h2>
          <button 
            onClick={() => setShowCartMobile(false)}
            className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg"
          >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {currentOrder.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-60">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm font-medium">Belum ada menu dipilih</p>
            </div>
          ) : (
            currentOrder.map(item => (
              <div key={item.id} className="flex gap-3 group">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 mb-1">{item.name}</h4>
                  <p className="text-xs text-indigo-600 font-bold mb-2">Rp {item.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => removeFromOrder(item.id)}
                      className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Meja</label>
                <select 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                >
                  <option value="">Pilih Meja</option>
                  <option value="Takeaway">Bawa Pulang</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Uang Tunai</label>
                <input 
                  type="number" 
                  placeholder="0"
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-2 outline-none transition-all ${cashAmount > 0 && !isSufficient ? 'border-red-300 ring-red-100' : 'border-slate-200 focus:ring-indigo-500'}`}
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                />
             </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-sm">
              <span>PPN (10%)</span>
              <span>Rp {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-lg pt-2 border-t border-slate-200">
              <span>Total Akhir</span>
              <span className="text-indigo-600">Rp {grandTotal.toLocaleString()}</span>
            </div>
            {cashAmount > 0 && (
              <div className="flex justify-between items-center bg-indigo-50 px-3 py-2 rounded-lg mt-2">
                <span className="text-indigo-600 text-xs font-bold uppercase">Kembalian</span>
                <span className={`font-bold ${isSufficient ? 'text-indigo-700' : 'text-red-500'}`}>
                  Rp {changeDue.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <button 
            disabled={!isSufficient}
            onClick={handlePay}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {!isSufficient && cashAmount > 0 ? 'Uang Kurang' : 'Konfirmasi & Cetak'}
          </button>
        </div>
      </div>

      {lastReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
           <Receipt order={lastReceipt} onClose={() => setLastReceipt(null)} systemConfig={systemConfig} />
        </div>
      )}

      {/* Mobile Cart Overlay Backdrop */}
      {showCartMobile && (
        <div 
          onClick={() => setShowCartMobile(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-[1px]"
        />
      )}
    </div>
  );
};

export default POSView;
