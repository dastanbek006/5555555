'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Truck, Clock, ShieldCheck, MapPin, Navigation, UserCheck } from 'lucide-react';

function OrderTrackerContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<string>('KUTILMOQDA');
  const [partnerCoords, setPartnerCoords] = useState<{ lat: number; lng: number }>({
    lat: 41.3110,
    lng: 69.2797,
  });
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io();
    setSocket(s);

    if (orderId) {
      // Fetch initial order details
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order) {
            setOrder(data.order);
            setStatus(data.order.status);
            if (data.order.partnerLat && data.order.partnerLng) {
              setPartnerCoords({ lat: data.order.partnerLat, lng: data.order.partnerLng });
            }
          }
        });

      s.emit('join_order', orderId);

      s.on('status_updated', (data: { status: string }) => {
        setStatus(data.status);
      });

      s.on('location_updated', (data: { lat: number; lng: number }) => {
        setPartnerCoords(data);
      });
    }

    return () => {
      s.disconnect();
    };
  }, [orderId]);

  const handleSimulateNextStep = async () => {
    if (!orderId) return;

    let nextStatus = 'KORIB_CHIQILMOQDA';
    if (status === 'KUTILMOQDA') nextStatus = 'KORIB_CHIQILMOQDA';
    else if (status === 'KORIB_CHIQILMOQDA') nextStatus = 'YOLGA_CHIQDI';
    else if (status === 'YOLGA_CHIQDI') nextStatus = 'TOPSHIRILDI';

    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });

    const data = await res.json();
    if (res.ok) {
      setStatus(data.order.status);
      if (socket) {
        socket.emit('update_status', { orderId, status: data.order.status });
      }
    }
  };

  const steps = [
    { key: 'KUTILMOQDA', label: 'Kutilmoqda', icon: Clock },
    { key: 'KORIB_CHIQILMOQDA', label: 'Ko\'rib chiqilmoqda', icon: ShieldCheck },
    { key: 'YOLGA_CHIQDI', label: 'Yo\'lga chiqdi', icon: Truck },
    { key: 'TOPSHIRILDI', label: 'Topshirildi', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans antialiased">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100">Jonli GPS Kuzatuv</h1>
          <p className="text-xs text-slate-400">QR-code & Socket.io real-vaqt rejimi</p>
        </div>
        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full font-bold">
          LIVE GPS
        </span>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {/* Massive Framer Motion Spring-Animated Blue Checkmark Modal on TOPSHIRILDI */}
        <AnimatePresence>
          {status === 'TOPSHIRILDI' && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="bg-slate-900 border-2 border-blue-500/80 rounded-3xl p-6 text-center space-y-4 shadow-2xl shadow-blue-500/30"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: 'spring', delay: 0.2, stiffness: 200, damping: 15 }}
                className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-blue-500/40"
              >
                <CheckCircle2 size={56} />
              </motion.div>

              <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-white">
                TOPSHIRILDI!
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed">
                Buyurtma muvaffaqiyatli topshirildi. Maxfiylik qoidasiga ko'ra barcha biriktirilgan pasport va hujjat fayllari tizimdan to'liq O'CHIRILDI.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live GPS Map Canvas Canvas Visual */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl overflow-hidden relative">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-blue-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-100">Kuryer Marshruti (Xarita)</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">3D GPS Active</span>
          </div>

          <div className="relative w-full h-44 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Map grid lines background styling */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {/* Simulated route line */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d="M 50 120 Q 150 30 300 100"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray="6 6"
                className="animate-pulse"
              />
            </svg>

            {/* Courier GPS Pin */}
            <motion.div
              animate={{
                x: status === 'YOLGA_CHIQDI' ? [0, 80, 150] : 0,
                y: status === 'YOLGA_CHIQDI' ? [0, -30, 0] : 0,
              }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute left-10 bottom-8 z-10 flex flex-col items-center"
            >
              <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/50 border border-blue-400">
                <Truck size={18} />
              </div>
              <span className="text-[9px] font-bold text-blue-300 bg-slate-950/90 px-1.5 py-0.5 rounded border border-blue-500/30 mt-1">
                Kuryer: Sardor
              </span>
            </motion.div>

            {/* Customer Destination Pin */}
            <div className="absolute right-10 top-8 z-10 flex flex-col items-center">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/50 border border-emerald-400">
                <MapPin size={18} />
              </div>
              <span className="text-[9px] font-bold text-emerald-300 bg-slate-950/90 px-1.5 py-0.5 rounded border border-emerald-500/30 mt-1">
                Sizning Manzil
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono flex justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span>Lat: {partnerCoords.lat}</span>
            <span>Lng: {partnerCoords.lng}</span>
            <span className="text-emerald-400 font-bold">Yetib borish: ~12 min</span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Buyurtma Bosqichlari</h2>

          <div className="space-y-4 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-950 border border-slate-800 text-slate-600'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isCurrent ? 'text-blue-400' : 'text-slate-200'}`}>
                      {step.label}
                    </h3>
                    {isCurrent && (
                      <span className="text-[10px] text-blue-400/80 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                        Jarayon davom etmoqda...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulation Control (Dev/Demo Helper) */}
        <button
          onClick={handleSimulateNextStep}
          className="w-full py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-all shadow-md"
        >
          Statusni Keyingi Bosqichga O'tkazish (Simulyatsiya)
        </button>
      </main>
    </div>
  );
}

export default function OrderTrackerPage() {
  return (
    <Suspense fallback={<div className="p-4 text-xs text-slate-400">Yuklanmoqda...</div>}>
      <OrderTrackerContent />
    </Suspense>
  );
}
