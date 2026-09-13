'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';

function OrderTrackerContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<string>('KUTILMOQDA');
  const [partnerCoords, setPartnerCoords] = useState<{ lat: number; lng: number } | null>(null);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <h1 className="text-lg font-bold text-slate-100">Jonli Kuzatuv (Live Tracking)</h1>
        <p className="text-xs text-slate-400">QR-code & Socket.io real-vaqt rejimi</p>
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

        {/* Status Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h2 className="text-xs font-semibold text-slate-400">Buyurtma Holati</h2>

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
                      <span className="text-[10px] text-blue-400/80 flex items-center gap-1">
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

        {/* Live GPS Tracking Display */}
        {status === 'YOLGA_CHIQDI' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="text-emerald-400" size={18} />
              <h3 className="font-bold text-xs text-slate-100">Jonli GPS Kuzatuv (Kuryer)</h3>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <p>Kuryer koordinatalari:</p>
              <p className="font-mono text-emerald-400 font-bold">
                Lat: {partnerCoords ? partnerCoords.lat : 41.3110}, Lng: {partnerCoords ? partnerCoords.lng : 69.2797}
              </p>
            </div>
          </div>
        )}

        {/* Simulation Control (Dev/Demo Helper) */}
        <button
          onClick={handleSimulateNextStep}
          className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
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
