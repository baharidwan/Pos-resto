
import React, { useRef, useState } from 'react';
import { Order, SystemConfig } from '../types';
import { printerService } from '../services/printerService';

interface ReceiptProps {
  order: Order;
  onClose: () => void;
  systemConfig?: SystemConfig;
  isChecker?: boolean; // Mode baru untuk pelayan/dapur
}

const Receipt: React.FC<ReceiptProps> = ({ order, onClose, systemConfig, isChecker = false }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isPrintingBT, setIsPrintingBT] = useState(false);
  const [btError, setBtError] = useState<string | null>(null);

  const handlePrintSystem = () => {
    window.print();
  };

  const handlePrintBluetooth = async () => {
    try {
      setIsPrintingBT(true);
      setBtError(null);
      await printerService.printOrder(order, config, isChecker);
    } catch (err: any) {
      console.error(err);
      setBtError(err.message || 'Gagal mencetak ke Bluetooth');
    } finally {
      setIsPrintingBT(false);
    }
  };

  const tax = order.total * 0.1;
  const grandTotal = order.total + tax;

  const config = systemConfig || {
    storeName: 'Nara Resto',
    address: 'Jl. Menteng Raya No. 42, Jakarta',
    phone: '(021) 555-0123',
    logo: '',
    printerWidth: '80mm',
    printerFontSize: 'Medium'
  };

  const widthClasses = config.printerWidth === '58mm' ? 'max-w-[280px]' : 'max-w-sm';
  const fontSizeClass = config.printerFontSize === 'Small' ? 'text-[11px]' : config.printerFontSize === 'Large' ? 'text-base' : 'text-sm';
  const itemFontSizeClass = config.printerFontSize === 'Small' ? 'text-[10px]' : config.printerFontSize === 'Large' ? 'text-sm' : 'text-[13px]';

  return (
    <div className={`bg-white rounded-3xl p-6 md:p-8 w-full ${widthClasses} animate-in zoom-in-95 duration-200 shadow-2xl no-print-container overflow-y-auto max-h-[90vh] custom-scrollbar`}>
      <div className="text-center mb-6 no-print">
        <h2 className="text-xl font-bold text-slate-800">{isChecker ? 'Checker Order' : 'Preview Nota'}</h2>
        <p className="text-xs text-slate-400">{isChecker ? 'Untuk pelayan/dapur' : 'Untuk pelanggan'}</p>
      </div>

      {btError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-600 font-bold uppercase no-print">
          ⚠️ {btError}
        </div>
      )}

      <div ref={receiptRef} className={`receipt-font ${fontSizeClass} text-slate-700 bg-white p-4 rounded-xl border border-slate-200 shadow-inner overflow-hidden`}>
        <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
          {isChecker ? (
             <h3 className="font-bold text-lg uppercase tracking-widest">ORDER CHECKER</h3>
          ) : (
            <>
              <h3 className="font-bold text-lg uppercase tracking-widest mb-1 leading-tight">{config.storeName}</h3>
              <p className="text-[10px] leading-relaxed break-words">{config.address}</p>
            </>
          )}
        </div>

        <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-3 text-[11px] space-y-0.5">
          <div className="flex justify-between font-bold"><span>ID:</span> <span>{order.id}</span></div>
          <div className="flex justify-between"><span>Pelanggan:</span> <span className="text-sm font-black uppercase">{order.customerName}</span></div>
          <div className="flex justify-between"><span>Meja:</span> <span className="text-base font-black">{order.tableNumber || 'Takeaway'}</span></div>
          <div className="flex justify-between"><span>Waktu:</span> <span>{new Date(order.timestamp).toLocaleString()}</span></div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="text-[10px] font-bold border-b border-slate-200 pb-1 flex justify-between uppercase text-slate-400">
            <span>Item</span>
            <span>Qty</span>
          </div>
          {order.items.map(item => (
            <div key={item.id} className={`flex justify-between items-start gap-2 ${itemFontSizeClass}`}>
              <span className="flex-1 font-medium leading-tight">{item.name}</span>
              <span className="font-black">x{item.quantity}</span>
            </div>
          ))}
        </div>

        {!isChecker && (
          <div className="border-t-2 border-dashed border-slate-300 pt-3 space-y-1.5 text-[11px]">
            <div className="flex justify-between"><span>Subtotal</span><span>Rp {order.total.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>PPN (10%)</span><span>Rp {tax.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-200 mt-2">
              <span>TOTAL</span>
              <span className="text-orange-600">Rp {grandTotal.toLocaleString()}</span>
            </div>
            {order.cashReceived !== undefined && order.cashReceived > 0 && (
              <div className="pt-2 border-t border-slate-200 mt-2 space-y-1">
                <div className="flex justify-between"><span>Tunai</span><span>Rp {order.cashReceived.toLocaleString()}\n</span></div>
                <div className="flex justify-between font-bold text-orange-700"><span>Kembali</span><span>Rp {order.change?.toLocaleString()}</span></div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center text-[10px] uppercase tracking-widest opacity-60 leading-relaxed border-t border-slate-100 pt-4">
          <p>{isChecker ? '--- END OF ORDER ---' : 'Terima kasih atas kunjungannya!'}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 no-print">
         <div className="flex gap-2">
            <button 
              onClick={handlePrintBluetooth} 
              disabled={isPrintingBT}
              className={`flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-700 transition-all shadow-lg active:scale-95 text-xs ${isPrintingBT ? 'opacity-50 cursor-wait' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.828a5 5 0 117.07 0M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {isPrintingBT ? 'Mencetak...' : 'Cetak Bluetooth'}
            </button>
            <button 
              onClick={handlePrintSystem} 
              className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 text-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Sistem Print
            </button>
         </div>
         <button onClick={onClose} className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-all text-xs">Tutup</button>
      </div>
    </div>
  );
};

export default Receipt;
