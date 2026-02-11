
import React, { useState } from 'react';
import { User, SystemConfig } from '../types';

interface SettingsViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ users, setUsers, config, setConfig }) => {
  const [activeTab, setActiveTab] = useState<'user' | 'system'>('user');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'Cashier' as 'Admin' | 'Cashier' | 'Waiter' });

  // User CRUD
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({ username: '', password: '', role: 'Cashier' });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ username: user.username, password: user.password || '', role: user.role });
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Hapus pengguna ini?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userForm } : u));
    } else {
      setUsers(prev => [...prev, { id: Date.now().toString(), ...userForm }]);
    }
    setIsUserModalOpen(false);
  };

  // System Settings
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Pengaturan</h1>
        <p className="text-sm text-slate-500">Kelola pengguna dan konfigurasi sistem</p>
      </header>

      <div className="flex border-b border-slate-200 mb-8">
        <button onClick={() => setActiveTab('user')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'user' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Manajemen Pengguna</button>
        <button onClick={() => setActiveTab('system')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'system' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Profil Sistem</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'user' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Daftar Pengguna</h3>
              <button onClick={handleOpenAddUser} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100">Tambah Pengguna</button>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-3">Username</th>
                    <th className="px-6 py-3">Peran</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{u.username}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${u.role === 'Admin' ? 'bg-purple-50 text-purple-600' : u.role === 'Cashier' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>{u.role === 'Admin' ? 'Admin' : u.role === 'Cashier' ? 'Kasir' : 'Waiter'}</span></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleOpenEditUser(u)} className="p-2 text-slate-400 hover:text-indigo-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-slate-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-8">Profil Restoran</h3>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group shrink-0">
                    {config.logo ? <img src={config.logo} className="w-full h-full object-cover" alt="Logo" /> : <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold uppercase">Ubah Logo <input type="file" className="hidden" onChange={handleLogoUpload} /></label>
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Toko</label>
                      <input type="text" name="storeName" value={config.storeName} onChange={handleConfigChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Nomor Telepon</label>
                      <input type="text" name="phone" value={config.phone} onChange={handleConfigChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Alamat</label>
                  <textarea name="address" value={config.address} onChange={handleConfigChange} rows={3} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
              </div>
            </div>

            <div className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Konfigurasi Printer Thermal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Lebar Kertas</label>
                  <select 
                    name="printerWidth" 
                    value={config.printerWidth} 
                    onChange={handleConfigChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="58mm">58mm (Kecil)</option>
                    <option value="80mm">80mm (Standar)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ukuran Font</label>
                  <select 
                    name="printerFontSize" 
                    value={config.printerFontSize} 
                    onChange={handleConfigChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="Small">Kecil</option>
                    <option value="Medium">Sedang</option>
                    <option value="Large">Besar</option>
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic mt-4">*Pengaturan ini menyesuaikan tata letak dan penskalaan pratinjau nota untuk pencetakan thermal.</p>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">{editingUser ? 'Ubah Pengguna' : 'Pengguna Baru'}</h2>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                <input required type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Peran</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as any})}>
                  <option value="Admin">Admin</option>
                  <option value="Cashier">Kasir</option>
                  <option value="Waiter">Waiter</option>
                </select>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold border border-slate-200 rounded-xl">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Simpan Pengguna</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
