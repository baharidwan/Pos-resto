
import React, { useState } from 'react';
import { User } from '../types';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
  storeName: string;
  dbError: string | null;
}

const LoginView: React.FC<LoginViewProps> = ({ users, onLogin, storeName, dbError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (dbError) {
      setError("Sistem tidak dapat memproses login karena database bermasalah.");
      return;
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">N</div>
            <h1 className="text-2xl font-bold text-slate-800">{storeName}</h1>
            <p className="text-sm text-slate-500">Panel Kasir & Administrasi</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {dbError && (
              <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl text-xs space-y-2 animate-pulse">
                <p className="font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  Koneksi Database Gagal
                </p>
                <p>{dbError}</p>
                <div className="mt-2 pt-2 border-t border-red-100 italic">
                  Solusi: Buka XAMPP Control Panel dan pastikan <strong>MySQL</strong> dalam status <strong>Running</strong>.
                </div>
              </div>
            )}

            {error && !dbError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-xl text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Contoh: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!!dbError}
              className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] ${dbError ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-100'}`}
            >
              Masuk ke POS
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
             <div className="flex items-center justify-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${dbError ? 'bg-red-500' : 'bg-green-500'}`}></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  DB: {dbError ? 'Disconnected' : 'Connected'}
                </span>
             </div>
            <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">
              Nara • Modern Resto Suite
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
