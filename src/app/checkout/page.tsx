'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCart = searchParams.get('cart') || '{}';
  const cart: { [key: string]: number } = JSON.parse(rawCart);

  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch authenticated user session
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user));

    // Fetch product details for cart
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const prod = products.find((p) => p.id === id);
      return prod ? { product: prod, quantity: qty } : null;
    })
    .filter(Boolean);

  const totalPrice = cartItems.reduce(
    (sum, item: any) => sum + item.product.price * item.quantity,
    0
  );

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PRODUCT',
          orderType: 'PRODUCT',
          items: cartItems.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/orders?id=${data.order.id}`);
      } else {
        alert(data.error || 'Buyurtma yaratishda xatolik');
      }
    } catch (e) {
      alert('Serverga ulanishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <h1 className="text-lg font-bold text-slate-100">Buyurtmani rasmiylashtirish</h1>
        <p className="text-xs text-slate-400">Avto-foydalanuvchi seansi orqali</p>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* User Session Info (No input fields required!) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs text-slate-400 font-medium">Buyurtmachi ma'lumotlari:</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Tizimdan olindi
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-100">
            {user ? `${user.firstName} ${user.lastName}` : 'Anvar Talaba'}
          </div>
          <div className="text-xs text-slate-400">
            Telefon: <span className="text-slate-200">{user ? user.phone : '998933333333'}</span>
          </div>
        </div>

        {/* Payment Method Option */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium block mb-2">To'lov usuli:</span>
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-blue-400" />
              <span className="text-xs font-semibold text-blue-300">Naqd to'lov</span>
            </div>
            <ShieldCheck size={16} className="text-blue-400" />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <span className="text-xs text-slate-400 font-medium block">Savatdagi mahsulotlar:</span>

          {cartItems.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Savat bo'sh</p>
          ) : (
            <div className="space-y-2">
              {cartItems.map((item: any) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-200">{item.product.name || item.product.title} x{item.quantity}</span>
                  <span className="font-semibold text-slate-100">
                    {(item.product.price * item.quantity).toLocaleString()} so'm
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-800 pt-2 flex items-center justify-between font-bold text-sm">
                <span>Jami:</span>
                <span className="text-blue-400">{totalPrice.toLocaleString()} so'm</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleCreateOrder}
          disabled={loading || cartItems.length === 0}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl text-xs shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
        >
          {loading ? 'Tasdiqlanmoqda...' : 'Buyurtmani tasdiqlash (Naqd to\'lov)'}
        </button>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-4 text-xs text-slate-400">Yuklanmoqda...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
