
import React, { useState } from 'react';
import { Product } from '../types';
import { generateProductDescription } from '../services/geminiService';

interface InventoryViewProps {
  products: Product[];
  syncProduct: (p: Product, isDelete?: boolean) => Promise<void>;
  categories: string[];
  syncCategory: (name: string, oldName?: string, isDelete?: boolean) => Promise<void>;
}

const InventoryView: React.FC<InventoryViewProps> = ({ products, syncProduct, categories, syncCategory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    costPrice: 0,
    category: categories[0] || 'Food',
    description: '',
    stock: 0,
    image: 'https://picsum.photos/seed/new/400/300'
  });

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{index: number, name: string} | null>(null);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: 0,
      costPrice: 0,
      category: categories[0] || 'Food',
      description: '',
      stock: 0,
      image: 'https://picsum.photos/seed/new/400/300'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) return;
    const p: Product = {
      id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name as string,
      price: Number(formData.price),
      costPrice: Number(formData.costPrice) || 0,
      category: formData.category || categories[0] || 'Food',
      description: formData.description || '',
      stock: Number(formData.stock) || 0,
      image: formData.image || 'https://picsum.photos/seed/new/400/300'
    };
    await syncProduct(p);
    setIsModalOpen(false);
  };

  const handleAutoGenerate = async () => {
    if (!formData.name) return;
    setIsGeneratingDesc(true);
    const desc = await generateProductDescription(formData.name, formData.category || 'Makanan');
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGeneratingDesc(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    await syncCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const deleteCategory = async (categoryName: string) => {
    if (confirm(`Hapus kategori "${categoryName}"? Produk di kategori ini akan dipindahkan ke Food.`)) {
      await syncCategory(categoryName, undefined, true);
    }
  };

  const startEditCategory = (index: number, name: string) => {
    setEditingCategory({ index, name });
  };

  const saveEditedCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    const oldName = categories[editingCategory.index];
    await syncCategory(editingCategory.name.trim(), oldName);
    setEditingCategory(null);
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Manajemen Inventori</h1>
          <p className="text-sm text-slate-500">Kelola item menu dan kategori Anda</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setIsManagingCategories(true)} className="flex-1 sm:flex-none border border-slate-200 bg-white text-slate-600 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            Kategori
          </button>
          <button onClick={handleOpenAdd} className="flex-1 sm:flex-none bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah Menu
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-white rounded-2xl border border-slate-200">
        <div className="min-w-[700px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 font-bold text-slate-600 text-sm">Produk</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm">Kategori</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm">Harga</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm">Stok</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-sm text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={p.image} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-sm" alt="" />
                      <div className="max-w-[200px]">
                        <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase">{p.category}</span></td>
                  <td className="px-6 py-4 font-medium text-slate-700 text-sm">Rp {p.price.toLocaleString()}</td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${p.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span><span className="text-xs font-medium">{p.stock} unit</span></div></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-2 text-slate-400 hover:text-orange-600 bg-slate-50 hover:bg-orange-50 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                      <button onClick={() => confirm('Hapus?') && syncProduct(p, true)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isManagingCategories && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Kelola Kategori</h2>
              <button onClick={() => setIsManagingCategories(false)} className="p-2 text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex gap-2 mb-6">
              <input type="text" className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="Kategori baru..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
              <button onClick={addCategory} className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-700">Tambah</button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {categories.map((cat, index) => (
                <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group">
                  {editingCategory?.index === index ? (
                    <div className="flex-1 flex gap-2">
                      <input className="flex-1 px-3 py-1 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 text-sm" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} autoFocus />
                      <button onClick={saveEditedCategory} className="text-orange-600 font-bold text-xs uppercase">Simpan</button>
                      <button onClick={() => setEditingCategory(null)} className="text-slate-400 font-bold text-xs uppercase">Batal</button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-slate-700 text-sm">{cat}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditCategory(index, cat)} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => deleteCategory(cat)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">{editingProduct ? 'Ubah Item' : 'Item Baru'}</h2>
            <div className="grid grid-cols-2 gap-4 mb-8 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Nama Item</label>
                <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Harga Jual</label>
                <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Harga Modal</label>
                <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Stok</label>
                <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
              </div>
              <div className="col-span-2 space-y-2">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi</label>
                   <button onClick={handleAutoGenerate} disabled={isGeneratingDesc || !formData.name} className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-md font-bold">✨ AI Generate</button>
                </div>
                <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl h-24 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Gambar</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-dashed flex items-center justify-center shrink-0">
                    {formData.image && <img src={formData.image} className="w-full h-full object-cover" />}
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="text-xs" />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold border rounded-xl">Batal</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
