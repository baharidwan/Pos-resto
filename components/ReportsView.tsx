
import React, { useMemo, useState, useEffect } from 'react';
import { Order, Product, SystemConfig } from '../types';
import { analyzeProfitReport } from '../services/geminiService';
import Receipt from './Receipt';

interface ReportsViewProps {
  orders: Order[];
  products: Product[];
  onDeleteOrder: (orderId: string) => void;
  systemConfig?: SystemConfig;
}

const ReportsView: React.FC<ReportsViewProps> = ({ orders, products, onDeleteOrder, systemConfig }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'profit' | 'favorites' | 'history'>('summary');
  const [aiInsight, setAiInsight] = useState('Sedang membuat analisis bisnis...');
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);

  // 1. Sales Calculations
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Item popularity
    const itemSales: Record<string, { quantity: number; revenue: number; cost: number; name: string }> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSales[item.id]) {
          itemSales[item.id] = { quantity: 0, revenue: 0, cost: 0, name: item.name };
        }
        itemSales[item.id].quantity += item.quantity;
        itemSales[item.id].revenue += item.price * item.quantity;
        itemSales[item.id].cost += (item.costPrice || 0) * item.quantity;
      });
    });

    const favoriteItems = Object.values(itemSales).sort((a, b) => b.quantity - a.quantity);
    const totalCost = Object.values(itemSales).reduce((sum, item) => sum + item.cost, 0);
    const grossProfit = totalRevenue - totalCost;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      favoriteItems,
      totalCost,
      grossProfit
    };
  }, [orders]);

  // AI Insight Trigger
  useEffect(() => {
    if (orders.length > 0) {
      const top3Names = metrics.favoriteItems.slice(0, 3).map(i => i.name);
      analyzeProfitReport(metrics.totalRevenue, metrics.grossProfit, top3Names)
        .then(setAiInsight);
    }
  }, [metrics, orders]);

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Laporan Bisnis</h1>
        <p className="text-sm text-slate-500">Analisis komprehensif kesehatan finansial restoran Anda</p>
      </header>

      {/* AI Insights Card */}
      <div className="mb-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Analisis Strategis AI</span>
          </div>
          <p className="text-lg font-medium italic">"{aiInsight}"</p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('summary')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'summary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Ringkasan
        </button>
        <button 
          onClick={() => setActiveTab('profit')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'profit' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Laba & Rugi
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'favorites' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Menu Terlaris
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Riwayat Penjualan
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'summary' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Pendapatan</p>
                <p className="text-3xl font-black text-slate-800">Rp {metrics.totalRevenue.toLocaleString()}</p>
                <div className="mt-4 flex items-center gap-1 text-green-500 text-xs font-bold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                  <span>Real-time</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Jumlah Pesanan</p>
                <p className="text-3xl font-black text-slate-800">{metrics.totalOrders}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Rata-rata Pesanan</p>
                <p className="text-3xl font-black text-slate-800">Rp {Math.round(metrics.avgOrderValue).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profit' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Laporan Laba Rugi</h3>
              </div>
              <table className="w-full text-sm">
                 <tbody className="divide-y divide-slate-50">
                   <tr className="hover:bg-slate-50">
                     <td className="px-6 py-4 font-medium text-slate-600">Pendapatan (Penjualan)</td>
                     <td className="px-6 py-4 text-right font-bold text-slate-800">Rp {metrics.totalRevenue.toLocaleString()}</td>
                   </tr>
                   <tr className="hover:bg-slate-50">
                     <td className="px-6 py-4 font-medium text-slate-600">Beban Pokok (Modal)</td>
                     <td className="px-6 py-4 text-right font-bold text-red-500">- Rp {metrics.totalCost.toLocaleString()}</td>
                   </tr>
                   <tr className="bg-indigo-50/30">
                     <td className="px-6 py-4 font-black text-slate-800">Laba Kotor</td>
                     <td className="px-6 py-4 text-right font-black text-indigo-600 text-lg">Rp {metrics.grossProfit.toLocaleString()}</td>
                   </tr>
                 </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
             <div className="p-6 border-b border-slate-50">
                <h3 className="font-bold text-slate-800">Menu Paling Terlaris</h3>
             </div>
             <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3">Peringkat</th>
                    <th className="px-6 py-3">Item Menu</th>
                    <th className="px-6 py-3">Terjual</th>
                    <th className="px-6 py-3">Pendapatan</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {metrics.favoriteItems.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4"><span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">{index + 1}</span></td>
                      <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                      <td className="px-6 py-4 text-slate-600">{item.quantity} unit</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">Rp {item.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
             <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Daftar Laporan Penjualan</h3>
                <span className="text-xs text-slate-400 font-medium">{orders.length} Transaksi</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-3">ID Pesanan</th>
                      <th className="px-6 py-3">Waktu</th>
                      <th className="px-6 py-3">Meja</th>
                      <th className="px-6 py-3">Total (inc. tax)</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {orders.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400">Belum ada transaksi</td></tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-500 text-xs">{order.id}</td>
                          <td className="px-6 py-4 text-slate-600 text-sm">{new Date(order.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</td>
                          <td className="px-6 py-4 font-bold text-slate-800 text-sm">{order.tableNumber || 'Bawa Pulang'}</td>
                          <td className="px-6 py-4 font-bold text-indigo-600 text-sm">Rp {(order.total * 1.1).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => setSelectedOrderForView(order)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-all"
                                  title="Lihat Nota"
                                >
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </button>
                                <button 
                                  onClick={() => onDeleteOrder(order.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-all"
                                  title="Hapus Data"
                                >
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </div>

      {selectedOrderForView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <Receipt order={selectedOrderForView} onClose={() => setSelectedOrderForView(null)} systemConfig={systemConfig} />
        </div>
      )}
    </div>
  );
};

export default ReportsView;
