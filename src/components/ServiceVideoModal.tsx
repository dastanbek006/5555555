'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Video, ShieldAlert } from 'lucide-react';

interface ServiceVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  videoUrl?: string;
}

export default function ServiceVideoModal({
  isOpen,
  onClose,
  serviceName,
  videoUrl,
}: ServiceVideoModalProps) {
  if (!isOpen) return null;

  const defaultDemoUrl =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-md shadow-2xl relative overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-950/80 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-all"
          >
            <X size={18} />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2 mb-3">
            <Video size={18} className="text-blue-400" />
            <h2 className="text-sm font-bold text-slate-100 truncate">
              {serviceName} — Video Qo'llanma
            </h2>
          </div>

          {/* HTML5 Video Player */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
            <video
              src={videoUrl || defaultDemoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Footer Warning & Guidance */}
          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <ShieldAlert size={16} className="text-amber-400 shrink-0" />
            <span>
              Xizmat rolikini tomosha qiling. Barcha hujjatlar va videolar topshirilgach avtomatik o'chiriladi.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
