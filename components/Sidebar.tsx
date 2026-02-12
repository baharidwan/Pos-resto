
import React, { useState } from 'react';
import { View, User } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  storeName: string;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, storeName, user, onLogout }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // Define full menu
  const allMenuItems = [
    { id: 'pos', icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Kasir', roles: ['Admin', 'Cashier'] },
    { id: 'inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', label: 'Inventori', roles: ['Admin'] },
    { id: 'orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'Pesanan', roles: ['Admin', 'Waiter'] },
    { id: 'reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Laporan', roles: ['Admin'] },
    { id: 'qr', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', label: 'Menu QR', roles: ['Admin'] },
    { id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: 'Pengaturan', roles: ['Admin'] },
  ];

  // Filter based on user role
  const menuItems = allMenuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className={`bg-white border-r border-slate-200 flex flex-col h-full transition-all duration-300 ease-in-out relative z-30 ${isMinimized ? 'w-20' : 'w-20 md:w-64'}`}>
      <button onClick={() => setIsMinimized(!isMinimized)} className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-orange-600 shadow-sm hidden md:block">
        <svg className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      <div className={`p-6 border-b border-slate-100 flex items-center gap-3 overflow-hidden ${isMinimized ? 'justify-center' : ''}`}>
        <div className="min-w-[40px] w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0">N</div>
        <span className={`text-xl font-bold text-slate-800 whitespace-nowrap transition-opacity duration-200 ${isMinimized ? 'opacity-0 md:hidden' : 'opacity-100'}`}>{storeName}</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button key={item.id} onClick={() => setView(item.id as View)} title={isMinimized ? item.label : ''} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${isMinimized ? 'justify-center' : ''} ${currentView === item.id ? 'bg-orange-50 text-orange-600 border border-orange-100 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
            <span className={`font-medium text-sm whitespace-nowrap transition-all duration-200 ${isMinimized ? 'opacity-0 scale-95 w-0 pointer-events-none' : 'opacity-100 scale-100'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className={`flex items-center gap-3 p-2 bg-slate-50 rounded-xl overflow-hidden ${isMinimized ? 'justify-center' : ''}`}>
          <div className="min-w-[32px] w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-orange-600">{user.username.charAt(0).toUpperCase()}</span>
          </div>
          <div className={`flex-1 overflow-hidden transition-all duration-200 ${isMinimized ? 'opacity-0 w-0' : 'opacity-100'}`}>
            <p className="text-xs font-semibold text-slate-800 truncate">{user.username}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold">{user.role}</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all ${isMinimized ? 'justify-center' : ''}`}
          title={isMinimized ? 'Logout' : ''}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className={`text-xs font-bold whitespace-nowrap transition-all duration-200 ${isMinimized ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'}`}>Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
