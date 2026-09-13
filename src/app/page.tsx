'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PartnerRegistrationModal from '@/components/PartnerRegistrationModal';
import { ShoppingCart, Phone, Lock, User, Plus, Check } from 'lucide-react';

export default function HomePage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  // Auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  useEffect(() => {
    fetch('/api/banners').then((res) => res.json()).then((data) => setBanners(data.banners || []));
    fetch('/api/categories').then((res) => res.json()).then((data) => setCategories(data.categories || []));
    fetch('/api/products').then((res) => res.json()).then((data) => setProducts(data.products || []));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (data.triggerPartnerModal) {
        setShowAuthModal(false);
        setShowPartnerModal(true);
      } else if (res.ok) {
        setShowAuthModal(false);
        alert(`Xush kelibsiz, ${data.user.firstName}!`);
      } else {
        setAuthError(data.error || 'Xatolik yuz berdi');
      }
    } catch (e) {
      setAuthError('Serverga ulanishda xatolik');
    }
  };

  const addToCart = (productId: string) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter((p) => p.categoryId === selectedCategory);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top Banner Marquee Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="overflow-hidden bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 py-1.5 px-4">
          <div className="whitespace-nowrap animate-marquee flex gap-8 text-xs font-medium text-blue-200">
            <span>🚀 Platforma: TM Smart Market</span>
            <span>⚡ Tezkor yetkazib berish</span>
            <span>🎓 Talabalar uchun chegirma</span>
            <span>🚀 Platforma: TM Smart Market</span>
            <span>⚡ Tezkor yetkazib berish</span>
            <span>🎓 Talabalar uchun chegirma</span>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20">
              TM
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-none text-white">TM Smart Market</h1>
              <p className="text-[10px] text-slate-400">Rasmiy E-Commerce & Service Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAuthModal(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-xs flex items-center gap-1"
            >
              <User size={16} />
              <span>Kirish</span>
            </button>
            <Link
              href={{ pathname: '/checkout', query: { cart: JSON.stringify(cart) } }}
              className="relative p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-all"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {/* Top Image Slider / Banners */}
        {banners.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[21/9]">
            <img
              src={banners[0]?.imageUrl}
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-end p-3">
              <p className="text-xs font-semibold text-white drop-shadow-md">
                {banners[0]?.text}
              </p>
            </div>
          </div>
        )}

        {/* Category Horizontal Filter Bar */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Kategoriyalar</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Barchasi
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <img src={cat.coverImage} alt={cat.name} className="w-5 h-5 rounded-md object-cover" />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300">Mahsulotlar</h2>
            <span className="text-xs text-slate-500">{filteredProducts.length} ta mavjud</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((p) => {
              const images = Array.isArray(p.images) ? p.images : [];
              const mainImg = images[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400';
              const isAdded = (cart[p.id] || 0) > 0;

              return (
                <div
                  key={p.id}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                      <img src={mainImg} alt={p.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-blue-400 border border-blue-500/20 font-medium">
                        Zaxira: {p.stock}
                      </span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-xs text-slate-100 line-clamp-1">{p.title}</h3>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.description}</p>
                      <div className="mt-2 font-bold text-sm text-blue-400">
                        {p.price.toLocaleString()} so'm
                      </div>
                    </div>
                  </div>

                  <div className="p-3 pt-0">
                    <button
                      onClick={() => addToCart(p.id)}
                      className={`w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                        isAdded
                          ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} />
                          <span>Savatda ({cart[p.id]})</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Savatga</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-slate-100 mb-1">Tizimga kirish</h2>
            <p className="text-xs text-slate-400 mb-4">Telefon raqamingiz va parolingizni kiriting</p>

            {authError && <p className="text-xs text-red-400 mb-3">{authError}</p>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Telefon</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="998901234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Parol</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Parolingiz"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
              >
                Kirish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Auth Easter Egg Modal (111 / 222) */}
      <PartnerRegistrationModal
        isOpen={showPartnerModal}
        onClose={() => setShowPartnerModal(false)}
      />
    </div>
  );
}
