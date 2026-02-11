
import React, { useRef } from 'react';
import { Order, SystemConfig } from '../types';

interface ReceiptProps {
  order: Order;
  onClose: () => void;
  systemConfig?: SystemConfig;
}

const Receipt: React.FC<ReceiptProps> = ({ order, onClose, systemConfig }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const tax = order.total * 0.1;
  const grandTotal = order.total + tax;

  const config = systemConfig || {
    storeName: 'LuminaPOS Resto',
    address: 'Jl. Menteng Raya No. 42, Jakarta',
    phone: '(021) 555-0123',
    logo: '',
    printerWidth: '80mm',
    printerFontSize: 'Medium'
  };

  // Dynamic Styles based on printer settings
  const widthClasses = config.printerWidth === '58mm' ? 'max-w-[280px]' : 'max-w-sm';
  const fontSizeClass = config.printerFontSize === 'Small' ? 'text-[11px]' : config.printerFontSize === 'Large' ? 'text-base' : 'text-sm';
  const itemFontSizeClass = config.printerFontSize === 'Small' ? 'text-[10px]' : config.printerFontSize === 'Large' ? 'text-sm' : 'text-[13px]';

  return (
    <div className={`bg-white rounded-3xl p-6 md:p-8 w-full ${widthClasses} animate-in zoom-in-95 duration-200 shadow-2xl no-print-container overflow-y-auto max-h-[90vh] custom-scrollbar`}>
      <div className="text-center mb-6 no-print">
        {config.logo ? (
          <img src={config.logo} alt="Store Logo" className="w-16 h-16 object-cover rounded-2xl mx-auto mb-4" />
        ) : (
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-4">L</div>
        )}
        <h2 className="text-xl font-bold text-slate-800">Preview Nota</h2>
        <p className="text-xs text-slate-400">Siap untuk dicetak ({config.printerWidth})</p>
      </div>

      <div ref={receiptRef} className={`receipt-font ${fontSizeClass} text-slate-700 bg-white p-4 rounded-xl border border-slate-200 shadow-inner overflow-hidden`}>
        <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
          <h3 className="font-bold text-lg uppercase tracking-widest mb-1 leading-tight">{config.storeName}</h3>
          <p className="text-[10px] leading-relaxed break-words">{config.address}<br/>Telp: {config.phone}</p>
        </div>

        <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-3 text-[11px] space-y-0.5">
          <div className="flex justify-between font-bold"><span>ID:</span> <span>{order.id.slice(-6)}</span></div>
          <div className="flex justify-between"><span>Meja:</span> <span className="text-base font-black">{order.tableNumber || 'Takeaway'}</span></div>
          <div className="flex justify-between"><span>Waktu:</span> <span>{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
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

        <div className="border-t-2 border-dashed border-slate-300 pt-3 space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp {order.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>PPN (10%)</span>
            <span>Rp {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-200 mt-2">
            <span>TOTAL</span>
            <span className="text-indigo-600">Rp {grandTotal.toLocaleString()}</span>
          </div>
          
          {order.cashReceived !== undefined && order.cashReceived > 0 && (
            <div className="pt-2 border-t border-slate-200 mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Tunai</span>
                <span>Rp {order.cashReceived.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-indigo-700">
                <span>Kembali</span>
                <span>Rp {order.change?.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-[10px] uppercase tracking-widest opacity-60 leading-relaxed border-t border-slate-100 pt-4">
          <p>Terima kasih!</p>
          <p className="mt-1">Instagram: @luminapos</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 no-print">
         <button 
           onClick={onClose}
           className="flex-1 py-3 text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm"
         >
           Tutup
         </button>
         <button 
           onClick={handlePrint}
           className="flex-[1.5] py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 text-sm"
         >
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
           </svg>
           Cetak Nota
         </button>
      </div>
    </div>
  );
};

export default Receipt;
