
import React, { useState, useEffect } from 'react';
import { Order, SystemConfig } from '../types';
import { analyzeSales } from '../services/geminiService';
import Receipt from './Receipt';

interface OrdersViewProps {
  orders: Order[];
  systemConfig?: SystemConfig;
}

const OrdersView: React.FC<OrdersViewProps> = ({ orders, systemConfig }) => {
  const [insight, setInsight] = useState('Sedang membuat wawasan bisnis...');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  useEffect(() => {
    if (orders.length > 0) {
      analyzeSales(orders.slice(0, 10)).then(setInsight);
    }
  }, [orders]);

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
       <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Riwayat Penjualan</h1>
          <p className="text-sm text-slate-500">Pantau dan analisis performa restoran Anda</p>
       </header>

       <div className="bg-indigo-600 rounded-3xl p-6 text-white mb-8 shadow-xl shadow-indigo-200 relative overflow-hidden shrink-0">
          <div className="relative z-10">
            <h3 className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Wawasan Bisnis AI
            </h3>
            <p className="text-base md:text-lg font-medium">"{insight}"</p>
          </div>
          <svg className="absolute top-0 right-0 w-32 h-32 text-indigo-500 opacity-20 -mr-10 -mt-10" fill="currentColor" viewBox="0 0 20 20">
             <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 15.657a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM16.343 14.94l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414z" />
          </svg>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300 gap-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-medium">Belum ada pesanan tercatat.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow group">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.id}</span>
                        <h4 className="font-bold text-slate-800 text-lg">{order.tableNumber || 'Bawa Pulang'}</h4>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-[10px] font-bold uppercase ring-1 ring-green-100">{order.status}</span>
                        <p className="text-[11px] text-slate-400 mt-1.5">{new Date(order.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map(item => (
                        <div key={item.id} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                          <span className="font-bold text-indigo-600">{item.quantity}x</span>
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:w-56 flex md:flex-col justify-between md:justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Total Pembayaran</p>
                      <p className="text-xl font-bold text-indigo-600">Rp {(order.total * 1.1).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedOrderForPrint(order)}
                      className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-100 no-print"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Cetak Nota
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
       </div>

       {selectedOrderForPrint && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <Receipt order={selectedOrderForPrint} onClose={() => setSelectedOrderForPrint(null)} systemConfig={systemConfig} />
         </div>
       )}
    </div>
  );
};

export default OrdersView;
