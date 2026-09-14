'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, CheckCircle2, Video, Play, ShieldCheck, ArrowLeft } from 'lucide-react';
import ServiceVideoModal from '@/components/ServiceVideoModal';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  // Video Modal State
  const [activeVideoModal, setActiveVideoModal] = useState<{
    isOpen: boolean;
    serviceName: string;
    videoUrl?: string;
  }>({ isOpen: false, serviceName: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => setServices(data.services || []));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (res.ok && result.url) {
        setAttachedFiles((prev) => [...prev, result.url]);
      } else {
        alert(result.error || 'Fayl yuklashda xatolik');
      }
    } catch (err) {
      alert('Upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType: 'SERVICE',
          serviceId: selectedService.id,
          customInputs: formData,
          attachedFiles,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedOrderId(data.order.id);
        setOrderSuccess(true);
      } else {
        alert(data.error || 'Xizmatga buyurtma berishda xatolik');
      }
    } catch (e) {
      alert('Server bilan aloqa uzildi');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Xizmatlar Katalogi & Video
          </h1>
          <p className="text-xs text-slate-400">Barcha xizmatlar va video qo'llanmalar</p>
        </div>
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          30+ Faol Xizmat
        </span>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {orderSuccess ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Buyurtma qabul qilindi!</h2>
            <p className="text-xs text-slate-400">
              Buyurtma ID: <span className="text-blue-400 font-mono font-bold">{createdOrderId}</span>
            </p>
            <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              🔒 Maxfiylik kafolati: Buyurtma bajarilgach (Topshirildi), barcha pasport, video va shaxsiy hujjat rasmlari serverdan avtomatik O'CHIRILADI!
            </p>
            <button
              onClick={() => {
                setOrderSuccess(false);
                setSelectedService(null);
                setAttachedFiles([]);
                setFormData({});
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition-all"
            >
              Yangi buyurtma yaratish
            </button>
          </div>
        ) : !selectedService ? (
          <div className="grid grid-cols-1 gap-3">
            {services
              .filter((s) => !s.isBlocked)
              .map((service) => (
                <div
                  key={service.id}
                  className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col gap-3 transition-all shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={service.iconImage}
                        alt={service.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800"
                      />
                      <div>
                        <h3 className="font-semibold text-sm text-slate-100">{service.name}</h3>
                        <p className="text-[10px] text-slate-400">
                          {service.customFields.length} ta majburiy maydon
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveVideoModal({
                          isOpen: true,
                          serviceName: service.name,
                          videoUrl: service.videoUrl,
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 text-xs font-medium transition-all"
                    >
                      <Play size={12} className="fill-blue-400" />
                      <span>Rolik</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedService(service)}
                    className="w-full py-2 bg-slate-950 hover:bg-blue-600 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1"
                  >
                    <span>Xizmatdan foydalanish</span>
                    <span>→</span>
                  </button>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedService.iconImage}
                  alt={selectedService.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h2 className="font-bold text-sm text-slate-100">{selectedService.name}</h2>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={12} />
                    <span>Auto-delete faol</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Orqaga
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              {selectedService.customFields.map((field: any) => (
                <div key={field.id}>
                  <label className="text-xs text-slate-300 font-medium mb-1 block">
                    {field.fieldName} {field.isRequired && <span className="text-red-400">*</span>}
                  </label>

                  {field.fieldType === 'file' ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Native File Picker */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center justify-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 hover:border-blue-500/50 transition-all"
                        >
                          <Upload size={16} className="text-blue-400" />
                          <span>Fayl/Video</span>
                        </button>

                        {/* Native Camera Integration capture="environment" */}
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="flex items-center justify-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 hover:border-emerald-500/50 transition-all"
                        >
                          <Camera size={16} className="text-emerald-400" />
                          <span>Kameradan olish</span>
                        </button>
                      </div>

                      {/* Hidden File & Camera Inputs */}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <input
                        type="file"
                        accept="image/*,video/*"
                        capture="environment"
                        ref={cameraInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {uploading && <p className="text-[10px] text-blue-400">Fayl/Video yuklanmoqda...</p>}

                      {attachedFiles.length > 0 && (
                        <div className="space-y-1">
                          {attachedFiles.map((url, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg"
                            >
                              <CheckCircle2 size={12} />
                              <span className="truncate">{url}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type={field.fieldType === 'number' ? 'number' : 'text'}
                      value={formData[field.fieldName] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.fieldName]: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                      required={field.isRequired}
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-xs shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
              >
                Xizmatga buyurtma berish (Naqd to'lov)
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Service Video Demo Modal */}
      <ServiceVideoModal
        isOpen={activeVideoModal.isOpen}
        onClose={() => setActiveVideoModal({ ...activeVideoModal, isOpen: false })}
        serviceName={activeVideoModal.serviceName}
        videoUrl={activeVideoModal.videoUrl}
      />
    </div>
  );
}
