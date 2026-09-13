'use client';

import React, { useState } from 'react';
import { User, Lock, LogIn } from 'lucide-react';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PartnerRegistrationModal({ isOpen, onClose }: PartnerModalProps) {
  const [phone, setPhone] = useState('111');
  const [password, setPassword] = useState('222');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          password,
          firstName,
          lastName,
          businessName,
          isPartner: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsPending(true);
        setMessage(data.message || 'Admin tasdiqlashini kuting');
      } else {
        setMessage(data.error || 'Xatolik yuz berdi');
      }
    } catch (e) {
      setMessage('Server bilan aloqa uzildi');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
          Hamkor Ro'yxatdan O'tish
        </h2>

        {isPending || message === 'Admin tasdiqlashini kuting' ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-center my-4">
            <div className="text-amber-400 font-semibold text-lg mb-1">⏳ Status: Kutilmoqda</div>
            <p className="text-amber-200/90 text-sm">Admin tasdiqlashini kuting</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Telefon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Parol</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Ism</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ismingiz"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Familiya</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Familiyangiz"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Biznes / Do'kon Nomi</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Masalan: VIP Express Store"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {message && <p className="text-xs text-red-400">{message}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-medium shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all text-sm"
            >
              Arizani yuborish
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
