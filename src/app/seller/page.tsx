'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Store, Package, Image as ImageIcon } from 'lucide-react';

export default function VIPSellerDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imgUrlInput, setImgUrlInput] = useState('');

  useEffect(() => {
    fetchProducts();
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  const fetchProducts = () => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  };

  const handleAddImage = () => {
    if (images.length >= 3) {
      alert("VIP mahsulotlar uchun maksimal 3 ta rasmga ruxsat berilgan!");
      return;
    }
    if (imgUrlInput) {
      setImages([...images, imgUrlInput]);
      setImgUrlInput('');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !stock || !categoryId) {
      alert("Barcha kerakli maydonlarni to'ldiring");
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price,
          stock,
          categoryId,
          images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400'],
        }),
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setPrice('');
        setStock('');
        setImages([]);
        fetchProducts();
        alert('Mahsulot muvaffaqiyatli qo\'shildi!');
      } else {
        const err = await res.json();
        alert(err.error || 'Xatolik yuz berdi');
      }
    } catch (e) {
      alert('Serverga ulanishda xatolik');
    }
  };

  const handleHardDelete = async (productId: string) => {
    if (!confirm("Haqiqatdan ham ushbu mahsulotni to'liq o'chirmoqchimisiz? Ma'lumotlar bazasidan va rasmlardan BUTUNLAY o'chiriladi!")) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchProducts();
        alert('Mahsulot to\'liq HARD DELETE qilindi!');
      } else {
        alert('O\'chirishda xatolik');
      }
    } catch (e) {
      alert('Serverga ulanishda xatolik');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <Store className="text-amber-400" size={20} />
          <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
            VIP Sotuvchi Paneli
          </h1>
        </div>
        <p className="text-xs text-slate-400">Mahsulotlarni boshqarish va sotuv paneli</p>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {/* Product Upload Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Plus size={16} className="text-amber-400" />
            <span>Yangi Mahsulot Qo'shish (Max 3 ta rasm)</span>
          </h2>

          <form onSubmit={handleCreateProduct} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Nomi</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mahsulot nomi"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Tavsif</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Qisqacha tavsif..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Narx (so'm)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="100000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Zaxira soni (Stock)</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Kategoriya</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                required
              >
                <option value="">Kategoriyani tanlang</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image URLs (Max 3) */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Rasm URL lari ({images.length}/3)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={imgUrlInput}
                  onChange={(e) => setImgUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl"
                >
                  Qo'shish
                </button>
              </div>

              {images.length > 0 && (
                <div className="flex gap-2">
                  {images.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Product preview"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-800"
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
            >
              VIP Mahsulotni joylash
            </button>
          </form>
        </div>

        {/* Existing Products List with Hard Delete */}
        <div className="space-y-3">
          <h2 className="font-bold text-sm text-slate-300 flex items-center gap-2">
            <Package size={16} className="text-amber-400" />
            <span>Mening mahsulotlarim ({products.length})</span>
          </h2>

          <div className="space-y-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={Array.isArray(p.images) && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400'}
                    alt={p.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-xs text-slate-100">{p.title}</h3>
                    <p className="text-[10px] text-amber-400 font-bold">
                      {p.price.toLocaleString()} so'm
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Zaxira: <span className="text-slate-200">{p.stock} ta</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleHardDelete(p.id)}
                  className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                  title="To'liq o'chirish (Hard Delete)"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
