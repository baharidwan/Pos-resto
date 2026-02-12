
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

type DateRange = 'today' | 'week' | 'month' | 'all';

const ReportsView: React.FC<ReportsViewProps> = ({ orders, products, onDeleteOrder, systemConfig }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'profit' | 'favorites' | 'history'>('summary');
  const [dateFilter, setDateFilter] = useState<DateRange>('all');
  const [aiInsight, setAiInsight] = useState('Sedang membuat analisis bisnis...');
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);

  // Logic Filtering yang lebih akurat
  const filteredOrders = useMemo(() => {
    const now = new Date();
    
    // Start of Today (00:00:00)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of This Week (Monday 00:00:00)
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday
    const startOfWeek = new Date(now.setDate(diff)).setHours(0, 0, 0, 0);
    
    // Start of This Month (1st 00:00:00)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return orders.filter(order => {
      if (dateFilter === 'today') return order.timestamp >= startOfToday;
      if (dateFilter === 'week') return order.timestamp >= startOfWeek;
      if (dateFilter === 'month') return order.timestamp >= startOfMonth;
      return true; // 'all'
    });
  }, [orders, dateFilter]);

  // Kalkulasi Metrik berdasarkan filteredOrders
  const metrics = useMemo(() => {
    const totalGrossRevenue = filteredOrders.reduce((sum, order) => sum + (Number(order.total) * 1.1), 0);
    const totalNetRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalGrossRevenue / totalOrders : 0;

    const itemSales: Record<string, { quantity: number; revenue: number; cost: number; name: string }> = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSales[item.id]) {
          itemSales[item.id] = { quantity: 0, revenue: 0, cost: 0, name: item.name };
        }
        itemSales[item.id].quantity += Number(item.quantity);
        itemSales[item.id].revenue += Number(item.price) * Number(item.quantity);
        itemSales[item.id].cost += (Number(item.costPrice) || 0) * Number(item.quantity);
      });
    });

    const favoriteItems = Object.values(itemSales).sort((a, b) => b.quantity - a.quantity);
    const totalCost = Object.values(itemSales).reduce((sum, item) => sum + item.cost, 0);
    const grossProfit = totalNetRevenue - totalCost;

    return {
      totalGrossRevenue,
      totalNetRevenue,
      totalOrders,
      avgOrderValue,
      favoriteItems,
      totalCost,
      grossProfit
    };
  }, [filteredOrders]);

  useEffect(() => {
    if (filteredOrders.length > 0) {
      const top3Names = metrics.favoriteItems.slice(0, 3).map(i => i.name);
      analyzeProfitReport(metrics.totalNetRevenue, metrics.grossProfit, top3Names)
        .then(setAiInsight);
    } else {
      setAiInsight("Belum ada data transaksi untuk rentang waktu ini.");
    }
  }, [metrics.totalNetRevenue, metrics.grossProfit, metrics.favoriteItems, filteredOrders.length]);

  const handleExportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const filterLabel = dateFilter === 'today' ? 'Harian' : dateFilter === 'week' ? 'Mingguan' : dateFilter === 'month' ? 'Bulanan' : 'Semua';
    let fileName = `Laporan_${activeTab}_${filterLabel}.csv`;

    if (activeTab === 'summary') {
      csvContent += "Metrik,Nilai\n";
      csvContent += `Periode,${filterLabel}\n`;
      csvContent += `Total Omzet,"Rp ${metrics.totalGrossRevenue.toLocaleString()}"\n`;
      csvContent += `Total Pesanan,${metrics.totalOrders}\n`;
    } else if (activeTab === 'profit') {
      csvContent += "Kategori,Jumlah\n";
      csvContent += `Pendapatan Bersih,"Rp ${metrics.totalNetRevenue.toLocaleString()}"\n`;
      csvContent += `Modal,"Rp ${metrics.totalCost.toLocaleString()}"\n`;
      csvContent += `Laba Kotor,"Rp ${metrics.grossProfit.toLocaleString()}"\n`;
    } else if (activeTab === 'favorites') {
      csvContent += "Menu,Terjual,Pendapatan\n";
      metrics.favoriteItems.forEach(item => {
        csvContent += `"${item.name}",${item.quantity},"Rp ${item.revenue.toLocaleString()}"\n`;
      });
    } else {
      csvContent += "ID,Waktu,Meja,Total\n";
      filteredOrders.forEach(o => {
        csvContent += `${o.id},"${new Date(o.timestamp).toLocaleString()}",${o.tableNumber},"Rp ${(o.total * 1.1).toLocaleString()}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterLabels = {
    all: 'Semua Waktu',
    today: 'Hari Ini',
    week: 'Minggu Ini',
    month: 'Bulan Ini'
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-slate-50/50">
      <header className="mb-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Laporan Penjualan</h1>
            <p className="text-sm text-slate-500">Pantau performa bisnis Anda secara real-time</p>
          </div>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Ekspor CSV
          </button>
        </div>

        {/* Filter Bar yang Lebih Menonjol */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter Rentang Waktu</p>
              <p className="text-xs font-bold text-slate-700">{filterLabels[dateFilter]}</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {(['all', 'month', 'week', 'today'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateFilter(range)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  dateFilter === range 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {range === 'all' ? 'Semua' : range === 'month' ? 'Bulanan' : range === 'week' ? 'Mingguan' : 'Harian'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* AI Insights Card */}
      <div className="mb-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           </div>
           <div>
              <h3 className="text-sm font-bold text-slate-800">Insight Nara AI</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Analisis Strategis Berdasarkan {filterLabels[dateFilter]}</p>
           </div>
        </div>
        <p className="text-slate-600 text-sm italic font-medium leading-relaxed">"{aiInsight}"</p>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-50 rounded-full blur-2xl opacity-50"></div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar gap-2">
        {[
          { id: 'summary', label: 'Ringkasan' },
          { id: 'profit', label: 'Laba & Rugi' },
          { id: 'favorites', label: 'Menu Favorit' },
          { id: 'history', label: 'Riwayat Transaksi' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-orange-600 text-orange-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Omzet</p>
              <p className="text-3xl font-black text-slate-800">Rp {metrics.totalGrossRevenue.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-500 font-bold mt-2 uppercase">Termasuk PPN 10%</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Jumlah Pesanan</p>
              <p className="text-3xl font-black text-slate-800">{metrics.totalOrders}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Transaksi Selesai</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Rata-rata Struk</p>
              <p className="text-3xl font-black text-slate-800">Rp {Math.round(metrics.avgOrderValue).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Per Pelanggan</p>
            </div>
          </div>
        )}

        {activeTab === 'profit' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Analisis Laba Rugi</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filterLabels[dateFilter]}</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 font-medium">Pendapatan Bersih (Excl. PPN)</span>
                <span className="font-bold text-slate-800">Rp {metrics.totalNetRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 font-medium">Beban Pokok Penjualan (HPP)</span>
                <span className="font-bold text-red-500">- Rp {metrics.totalCost.toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-100 my-2"></div>
              <div className="flex justify-between items-center py-4 bg-orange-50 px-4 rounded-2xl">
                <span className="font-black text-slate-800 uppercase text-xs tracking-wider">Laba Kotor</span>
                <span className="font-black text-orange-600 text-xl">Rp {metrics.grossProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
             <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Top 10 Menu Terlaris</h3>
             </div>
             <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Peringkat</th>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Terjual</th>
                    <th className="px-6 py-4">Total Penjualan</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {metrics.favoriteItems.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium">Tidak ada data transaksi</td></tr>
                  ) : (
                    metrics.favoriteItems.slice(0, 10).map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${index < 3 ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                        <td className="px-6 py-4 text-slate-600">{item.quantity} porsi</td>
                        <td className="px-6 py-4 font-bold text-orange-600">Rp {item.revenue.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
               </tbody>
             </table>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">ID / Waktu</th>
                      <th className="px-6 py-4">Meja</th>
                      <th className="px-6 py-4">Total (Inc. Tax)</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium">Belum ada transaksi di periode ini</td></tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{order.id}</p>
                            <p className="text-xs text-slate-600">{new Date(order.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</p>
                          </td>
                          <td className="px-6 py-4">
                             <span className="font-bold text-slate-800 text-sm">{order.tableNumber || 'Bawa Pulang'}</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-orange-600 text-sm">Rp {(order.total * 1.1).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                                <button onClick={() => setSelectedOrderForView(order)} className="p-2 text-slate-400 hover:text-orange-600 bg-slate-50 rounded-lg transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                                <button onClick={() => confirm('Hapus transaksi ini?') && onDeleteOrder(order.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
