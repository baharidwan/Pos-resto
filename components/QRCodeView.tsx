
import React, { useState } from 'react';
import { Table } from '../types';

interface QRCodeViewProps {
  tables: Table[];
  syncTable: (t: Table, isDelete?: boolean) => Promise<void>;
}

const QRCodeView: React.FC<QRCodeViewProps> = ({ tables, syncTable }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({ name: '', status: 'Available' as 'Available' | 'Occupied' });

  const getAppDomain = () => window.location.origin + window.location.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const t: Table = {
      id: editingTable?.id || `TBL-${Date.now()}`,
      name: formData.name,
      status: formData.status
    };
    await syncTable(t);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Manajemen Menu QR</h1>
          <p className="text-sm text-slate-500">Buat kode QR untuk meja agar pelanggan bisa pesan sendiri</p>
        </div>
        <button onClick={() => { setEditingTable(null); setFormData({name: '', status: 'Available'}); setIsModalOpen(true); }} className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold">Tambah Meja</button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-1 custom-scrollbar">
        {tables.map(table => {
          const qrLink = `${getAppDomain()}?table=${encodeURIComponent(table.name)}`;
          return (
            <div key={table.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm group">
              <h3 className="font-bold text-slate-800 text-lg mb-4">{table.name}</h3>
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl aspect-square flex items-center justify-center relative overflow-hidden">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrLink)}`} alt="QR" className="w-32 h-32" />
                <div className="absolute inset-0 bg-orange-600/0 group-hover:bg-orange-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <a href={qrLink} target="_blank" className="bg-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg">Cek Menu QR</a>
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500 break-all">{qrLink}</div>
              <div className="flex gap-2 mt-4">
                 <button onClick={() => { setEditingTable(table); setFormData({name: table.name, status: table.status}); setIsModalOpen(true); }} className="flex-1 py-2 text-xs font-bold text-slate-400 bg-slate-50 rounded-lg">Edit</button>
                 <button onClick={() => confirm("Hapus meja?") && syncTable(table, true)} className="flex-1 py-2 text-xs font-bold text-red-400 bg-red-50 rounded-lg">Hapus</button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold">Konfigurasi Meja</h2>
            <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nama/Nomor Meja" />
            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
              <option value="Available">Tersedia</option>
              <option value="Occupied">Terisi</option>
            </select>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-400 font-bold">Batal</button>
              <button type="submit" className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default QRCodeView;
