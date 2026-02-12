
import React, { useState } from 'react';
import { User, SystemConfig } from '../types';

interface SettingsViewProps {
  users: User[];
  syncUser: (u: User, isDelete?: boolean) => Promise<void>;
  config: SystemConfig;
  setConfig: (config: SystemConfig) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ users, syncUser, config, setConfig }) => {
  const [activeTab, setActiveTab] = useState<'user' | 'system'>('user');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'Cashier' as 'Admin' | 'Cashier' | 'Waiter' });

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const u: User = {
      id: editingUser?.id || `USR-${Date.now()}`,
      ...userForm
    };
    await syncUser(u);
    setIsUserModalOpen(false);
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Pengaturan</h1>
        <p className="text-sm text-slate-500">Kelola pengguna dan konfigurasi sistem</p>
      </header>

      <div className="flex border-b border-slate-200 mb-8">
        <button onClick={() => setActiveTab('user')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'user' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400'}`}>Manajemen Pengguna</button>
        <button onClick={() => setActiveTab('system')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'system' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400'}`}>Profil Sistem</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'user' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Daftar Pengguna</h3>
              <button onClick={() => { setEditingUser(null); setUserForm({username: '', password: '', role: 'Cashier'}); setIsUserModalOpen(true); }} className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold">Tambah Pengguna</button>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr><th className="px-6 py-3">Username</th><th className="px-6 py-3">Peran</th><th className="px-6 py-3 text-right">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{u.username}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{u.role}</span></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setEditingUser(u); setUserForm({username: u.username, password: u.password || '', role: u.role}); setIsUserModalOpen(true); }} className="p-2 text-slate-400 hover:text-orange-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => confirm('Hapus?') && syncUser(u, true)} className="p-2 text-slate-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Toko</label>
              <input type="text" name="storeName" value={config.storeName} onChange={handleConfigChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Alamat</label>
              <textarea name="address" value={config.address} onChange={handleConfigChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" rows={3} />
            </div>
          </div>
        )}
      </div>

      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveUser} className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold">{editingUser ? 'Ubah Pengguna' : 'Pengguna Baru'}</h2>
            <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Username" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} />
            <input required type="password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as any})}>
              <option value="Admin">Admin</option>
              <option value="Cashier">Kasir</option>
              <option value="Waiter">Waiter</option>
            </select>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-3 text-slate-400 font-bold">Batal</button>
              <button type="submit" className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
