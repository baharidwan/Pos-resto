
import React, { useState } from 'react';
import { Table } from '../types';

interface QRCodeViewProps {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}

const QRCodeView: React.FC<QRCodeViewProps> = ({ tables, setTables }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({ name: '', status: 'Tersedia' as 'Available' | 'Occupied' });

  const handleOpenAdd = () => {
    setEditingTable(null);
    setFormData({ name: '', status: 'Available' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({ name: table.name, status: table.status });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus meja ini?')) {
      setTables(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingTable) {
      setTables(prev => prev.map(t => t.id === editingTable.id ? { ...t, name: formData.name, status: formData.status } : t));
    } else {
      const newTable: Table = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        status: formData.status
      };
      setTables(prev => [...prev, newTable]);
    }
    setIsModalOpen(false);
  };

  const getAppDomain = () => window.location.origin;

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Manajemen Menu QR</h1>
          <p className="text-sm text-slate-500">Buat kode QR unik untuk setiap meja menggunakan domain Anda</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Meja Baru
        </button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map(table => (
            <div key={table.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{table.name}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${table.status === 'Available' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                    {table.status === 'Available' ? 'Tersedia' : 'Terisi'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(table)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  {/* Fixed line 85: changed 'id' to 'table.id' */}
                  <button onClick={() => handleDelete(table.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl aspect-square flex items-center justify-center relative group/qr overflow-hidden">
                <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-lg border border-slate-100">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${getAppDomain()}/order/${table.id}`)}`} 
                    alt="Kode QR" 
                    className="w-full h-full opacity-90"
                  />
                </div>
                <div className="absolute inset-0 bg-indigo-600/0 group-hover/qr:bg-indigo-600/10 transition-colors flex items-center justify-center opacity-0 group-hover/qr:opacity-100">
                  <a href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${getAppDomain()}/order/${table.id}`)}`} target="_blank" rel="noopener noreferrer" className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold shadow-lg text-sm">
                    Lihat Kode QR
                  </a>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">URL Target</p>
                <p className="text-[10px] text-indigo-600 font-medium break-all leading-tight">
                  {getAppDomain().replace(/(^\w+:|^)\/\//, '')}/order/{table.id}
                </p>
              </div>
            </div>
          ))}

          {tables.length === 0 && (
            <div className="col-span-full py-20 bg-white border border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-slate-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              <p className="font-medium text-lg">Tidak ada meja ditemukan</p>
              <p className="text-sm">Klik tombol di atas untuk menambah meja restoran pertama Anda.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">{editingTable ? 'Ubah Meja' : 'Meja Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Nama / Nomor Meja</label>
                <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="misal: Meja VIP 05" autoFocus />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Status Awal</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'Available' | 'Occupied'})}>
                  <option value="Available">Tersedia</option>
                  <option value="Occupied">Terisi</option>
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">{editingTable ? 'Ubah Meja' : 'Buat Meja'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeView;
