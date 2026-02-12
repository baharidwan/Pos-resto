
import React, { useState, useMemo } from 'react';
import { Product, OrderItem, Order, Table, SystemConfig } from '../types';

interface POSViewProps {
  products: Product[];
  categories: string[];
  tables: Table[];
  currentOrder: OrderItem[];
  addToOrder: (product: Product) => void;
  removeFromOrder: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  onCheckout: (customerName: string, table: string, cashReceived?: number, change?: number, isSelfOrder?: boolean) => Promise<Order | undefined>;
  systemConfig: SystemConfig;
  isCustomerMode?: boolean;
  pendingQRCount?: number;
  pendingOrders?: Order[];
  onPickupOrder?: (order: Order) => void;
  activeTable?: string;
  setActiveTable?: (t: string) => void;
  activeCustomerName?: string;
  setActiveCustomerName?: (n: string) => void;
  onCancelActive?: () => void;
}

const POSView: React.FC<POSViewProps> = ({ 
  products, categories, tables, currentOrder, addToOrder, removeFromOrder, updateQuantity, onCheckout, systemConfig,
  isCustomerMode = false, pendingQRCount = 0, pendingOrders = [], onPickupOrder, activeTable, setActiveTable, 
  activeCustomerName = '', setActiveCustomerName, onCancelActive
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [localCustomerName, setLocalCustomerName] = useState('');
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Sync props state to local for better control in this view
  const nameValue = isCustomerMode ? localCustomerName : (activeCustomerName || '');
  const setNameValue = isCustomerMode ? setLocalCustomerName : (setActiveCustomerName || (() => {}));
  
  const tableValue = activeTable || '';
  const setTableValue = setActiveTable || (() => {});

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
  
  const cashNum = parseFloat(cashReceived) || 0;
  const changeDue = Math.max(0, cashNum - grandTotal);
  
  // REQUIRED FIELDS VALIDATION
  const isDataValid = nameValue.trim().length > 0 && tableValue.trim().length > 0;
  const isPaymentValid = isDataValid && cashNum >= grandTotal && currentOrder.length > 0;
  const isCustomerCheckoutValid = isDataValid && currentOrder.length > 0;

  const totalItemsCount = currentOrder.reduce((acc, item) => acc + item.quantity, 0);

  const handlePay = async () => {
    const order = await onCheckout(nameValue, tableValue, cashNum, changeDue, false);
    if (order) {
      setCashReceived('');
      setLocalCustomerName('');
      setShowCartMobile(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <header className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{isCustomerMode ? 'Menu Digital' : 'Kasir Utama'}</h1>
            {activeTable && !isCustomerMode && (
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Memproses: {activeTable}</span>
                <button onClick={onCancelActive} className="text-red-500 text-[10px] font-bold uppercase hover:underline">Batal</button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isCustomerMode && (
              <button 
                onClick={() => setShowPendingModal(true)}
                className={`relative px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${pendingQRCount > 0 ? 'bg-amber-500 text-white animate-pulse shadow-lg ring-2 ring-amber-200' : 'bg-slate-200 text-slate-500'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                {pendingQRCount} Antrian QR
              </button>
            )}
            <div className="relative flex-1 sm:w-64">
              <input type="text" placeholder="Cari menu..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </header>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
          {['Semua', ...categories].map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{cat}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} onClick={() => addToOrder(product)} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col group">
                <div className="h-32 overflow-hidden"><img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-800 text-sm mb-1">{product.name}</h3>
                  <p className="text-orange-600 font-bold text-sm mt-auto">Rp {product.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`fixed lg:relative inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-slate-200 flex flex-col shadow-2xl z-[100] transition-transform duration-300 ${showCartMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Detail Pesanan</h2>
          <button onClick={() => setShowCartMobile(false)} className="lg:hidden p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="p-4 border-b border-slate-100 space-y-3 bg-orange-50/30">
           <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Pemesan *</label>
              <input 
                type="text" 
                placeholder="Masukkan nama..." 
                className={`w-full px-3 py-2 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all ${!nameValue && currentOrder.length > 0 ? 'border-amber-300 ring-2 ring-amber-50' : 'border-slate-200'}`}
                value={nameValue} 
                onChange={(e) => setNameValue(e.target.value)} 
              />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Meja *</label>
              <select 
                className={`w-full px-3 py-2 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 appearance-none transition-all ${!tableValue && currentOrder.length > 0 ? 'border-amber-300 ring-2 ring-amber-50' : 'border-slate-200'}`}
                value={tableValue}
                onChange={(e) => setTableValue(e.target.value)}
              >
                <option value="">-- Pilih Meja --</option>
                {tables.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
                <option value="Takeaway">Bawa Pulang (Takeaway)</option>
              </select>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {currentOrder.length === 0 ? <div className="h-full flex items-center justify-center text-slate-300 text-center px-6">Pilih menu untuk memulai pesanan</div> : currentOrder.map(item => (
            <div key={item.id} className="flex gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0"><img src={item.image} className="w-full h-full object-cover" /></div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 border rounded text-xs">-</button>
                    <span className="text-xs font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 border rounded text-xs">+</button>
                  </div>
                  <span className="text-xs font-bold text-slate-700">Rp {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-slate-500 text-xs"><span>Subtotal</span><span>Rp {subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-slate-500 text-xs"><span>PPN (10%)</span><span>Rp {tax.toLocaleString()}</span></div>
            <div className="flex justify-between text-slate-900 font-bold text-lg pt-2 border-t"><span>Total</span><span className="text-orange-600">Rp {grandTotal.toLocaleString()}</span></div>
          </div>

          {!isCustomerMode ? (
             <div className="space-y-3 pt-2">
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-400 uppercase">Uang Tunai</label>
                   <input 
                    type="number" 
                    placeholder="Masukkan jumlah..." 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-lg" 
                    value={cashReceived} 
                    onChange={(e) => setCashReceived(e.target.value)} 
                   />
                </div>
                {cashNum > 0 && (
                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-orange-700 uppercase">Kembalian</span>
                    <span className="text-lg font-black text-orange-700">Rp {changeDue.toLocaleString()}</span>
                  </div>
                )}
                <button 
                  onClick={handlePay} 
                  disabled={!isPaymentValid} 
                  className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all ${isPaymentValid ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  {!isDataValid ? 'Lengkapi Nama & Meja' : 'Bayar & Cetak Nota'}
                </button>
             </div>
          ) : (
             <button 
               onClick={() => onCheckout(nameValue, tableValue, undefined, undefined, true)} 
               disabled={!isCustomerCheckoutValid} 
               className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all ${isCustomerCheckoutValid ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
             >
                {!isDataValid ? 'Isi Nama & Pilih Meja' : 'Kirim Pesanan Ke Kasir'}
             </button>
          )}
        </div>
      </div>

      {showPendingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Daftar Antrian QR</h2>
              <button onClick={() => setShowPendingModal(false)}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {pendingOrders.map(order => (
                <div key={order.id} className="p-4 border border-slate-100 bg-slate-50 rounded-2xl flex justify-between items-center hover:border-orange-200 transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                       <p className="font-bold text-slate-800 text-lg">{order.tableNumber}</p>
                       <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">{order.customerName}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{order.id}</p>
                    <p className="text-xs text-slate-500 mt-1">{order.items.length} Item • Rp {order.total.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => { onPickupOrder?.(order); setShowPendingModal(false); }}
                    className="bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-700"
                  >
                    Proses
                  </button>
                </div>
              ))}
              {pendingOrders.length === 0 && <div className="text-center py-10 text-slate-400 font-medium">Tidak ada antrian saat ini</div>}
            </div>
          </div>
        </div>
      )}
      
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
         <button onClick={() => setShowCartMobile(true)} className="relative bg-orange-600 text-white p-4 rounded-2xl shadow-2xl">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {totalItemsCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">{totalItemsCount}</span>}
         </button>
      </div>
    </div>
  );
};

export default POSView;
