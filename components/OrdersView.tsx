
import React, { useState, useEffect, useMemo } from 'react';
import { Order, SystemConfig } from '../types';
import { analyzeSales } from '../services/geminiService';
import Receipt from './Receipt';

interface OrdersViewProps {
  orders: Order[];
  systemConfig?: SystemConfig;
  onMarkPrinted?: (id: string) => void;
}

const OrdersView: React.FC<OrdersViewProps> = ({ orders, systemConfig, onMarkPrinted }) => {
  const [insight, setInsight] = useState('Sedang membuat wawasan bisnis...');
  const [selectedOrderForChecker, setSelectedOrderForChecker] = useState<Order | null>(null);

  const completedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'completed');
  }, [orders]);

  useEffect(() => {
    if (completedOrders.length > 0) {
      analyzeSales(completedOrders.slice(0, 10)).then(setInsight);
    }
  }, [completedOrders]);

  const handlePrintChecker = (order: Order) => {
    setSelectedOrderForChecker(order);
    if (onMarkPrinted && !order.isPrinted) {
      onMarkPrinted(order.id);
    }
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
       <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Riwayat Transaksi</h1>
          <p className="text-sm text-slate-500">Rekap pesanan selesai (Cetak untuk Checker Pelayan)</p>
       </header>

       {completedOrders.length > 0 && (
         <div className="bg-orange-600 rounded-3xl p-6 text-white mb-8 shadow-xl shadow-orange-200 relative overflow-hidden shrink-0">
            <div className="relative z-10">
              <h3 className="text-orange-100 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                Analisis Pintar AI
              </h3>
              <p className="text-base font-medium leading-relaxed">"{insight}"</p>
            </div>
         </div>
       )}

       <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {completedOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300 gap-4">
              <p className="font-medium">Belum ada transaksi selesai.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedOrders.map(order => (
                <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{order.id}</span>
                          {order.isPrinted && (
                            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ring-1 ring-emerald-100">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              Sudah Dicetak
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                           <h4 className="font-bold text-slate-800 text-lg">{order.tableNumber || 'Bawa Pulang'}</h4>
                           <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase">{order.customerName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-bold uppercase ring-1 ring-green-100">Lunas</span>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(order.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map(item => (
                        <div key={item.id} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:w-48 flex md:flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                      <p className="text-xl font-black text-slate-800">Rp {(order.total * 1.1).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => handlePrintChecker(order)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${order.isPrinted ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      {order.isPrinted ? 'Cetak Lagi' : 'Cetak Checker'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
       </div>

       {selectedOrderForChecker && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Receipt order={selectedOrderForChecker} onClose={() => setSelectedOrderForChecker(null)} systemConfig={systemConfig} isChecker={true} />
         </div>
       )}
    </div>
  );
};

export default OrdersView;
