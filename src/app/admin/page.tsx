'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Image as ImageIcon,
  FolderPlus,
  Wrench,
  ToggleLeft,
  Users,
  ShoppingBag,
  Bell,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  TrendingUp,
  DollarSign,
  Activity,
  Award
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('1'); // 7 Strict Panels (1 to 7)

  // Data states
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Form states
  const [newBannerImg, setNewBannerImg] = useState('');
  const [newBannerText, setNewBannerText] = useState('');

  const [newCatName, setNewCatName] = useState('');
  const [newCatImg, setNewCatImg] = useState('');

  const [serviceName, setServiceName] = useState('');
  const [serviceIcon, setServiceIcon] = useState('');
  const [customFields, setCustomFields] = useState<any[]>([{ fieldName: '', fieldType: 'text' }]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = () => {
    fetch('/api/banners').then((res) => res.json()).then((d) => setBanners(d.banners || []));
    fetch('/api/categories').then((res) => res.json()).then((d) => setCategories(d.categories || []));
    fetch('/api/services').then((res) => res.json()).then((d) => setServices(d.services || []));
    fetch('/api/partners').then((res) => res.json()).then((d) => setPartners(d.partners || []));
    fetch('/api/orders').then((res) => res.json()).then((d) => setOrders(d.orders || []));
    fetch('/api/alerts').then((res) => res.json()).then((d) => setAlerts(d.alerts || []));
  };

  // 1. Create Banner Ad
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerImg || !newBannerText) return;
    await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: newBannerImg, text: newBannerText }),
    });
    setNewBannerImg('');
    setNewBannerText('');
    fetchAllData();
  };

  // 2. Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatImg) return;
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName, imageUrl: newCatImg }),
    });
    setNewCatName('');
    setNewCatImg('');
    fetchAllData();
  };

  // 3. Dynamic Service Builder
  const handleAddCustomField = () => {
    setCustomFields([...customFields, { fieldName: '', fieldType: 'text' }]);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !serviceIcon) return;
    await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: serviceName,
        imageUrl: serviceIcon,
        fields: customFields.map((f) => ({
          label: f.fieldName,
          fieldType: f.fieldType.toUpperCase(),
          required: true,
        })),
      }),
    });
    setServiceName('');
    setServiceIcon('');
    setCustomFields([{ fieldName: '', fieldType: 'text' }]);
    fetchAllData();
  };

  // 4. Toggle Service Block/Unblock
  const handleToggleService = async (serviceId: string, currentActive: boolean) => {
    await fetch('/api/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: serviceId, isActive: !currentActive }),
    });
    fetchAllData();
  };

  // 5. Upgrade Partner Tier / Status
  const handleUpdatePartner = async (partnerId: string, level: string, status: string) => {
    await fetch('/api/partners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId, level, status }),
    });
    fetchAllData();
  };

  // Panel 6 Analytics Math
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalOrdersCount = orders.length;
  const activePartnersCount = partners.filter((p) => p.status === 'APPROVED').length;

  // Panels List configuration
  const panels = [
    { id: '1', title: '1. Top Banner Ads', icon: ImageIcon },
    { id: '2', title: '2. Categories', icon: FolderPlus },
    { id: '3', title: '3. Service Builder', icon: Wrench },
    { id: '4', title: '4. Service Controller', icon: ToggleLeft },
    { id: '5', title: '5. Partners', icon: Users },
    { id: '6', title: '6. Analytics & Order Monitor', icon: ShoppingBag },
    { id: '7', title: '7. Alert Center (15m SLA)', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-blue-500" size={20} />
          <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Admin Boshqaruv Paneli (7 Panels)
          </h1>
        </div>
        <p className="text-xs text-slate-400">30+ xizmatlar va platforma nazorati</p>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Navigation Tabs Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {panels.map((p) => {
            const Icon = p.icon;
            const isActive = activeTab === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all border ${
                  isActive
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{p.title}</span>
              </button>
            );
          })}
        </div>

        {/* PANEL 1: Top Banner Ads */}
        {activeTab === '1' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h2 className="font-bold text-sm text-slate-100">Top Marquee Banners</h2>

            <form onSubmit={handleCreateBanner} className="space-y-3">
              <input
                type="text"
                placeholder="Rasm URL (https://...)"
                value={newBannerImg}
                onChange={(e) => setNewBannerImg(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                required
              />
              <input
                type="text"
                placeholder="Matn (Marquee e'loni)"
                value={newBannerText}
                onChange={(e) => setNewBannerText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium"
              >
                Banner Qo'shish
              </button>
            </form>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              {banners.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <img src={b.imageUrl} alt="Banner" className="w-10 h-10 rounded-lg object-cover" />
                  <p className="text-xs text-slate-200 line-clamp-1">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANEL 2: Category Manager */}
        {activeTab === '2' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h2 className="font-bold text-sm text-slate-100">Kategoriyalar Boshqaruvi</h2>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <input
                type="text"
                placeholder="Kategoriya Nomi (Masalan: Oziq-ovqat)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                required
              />
              <input
                type="text"
                placeholder="Muqova rasm URL"
                value={newCatImg}
                onChange={(e) => setNewCatImg(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium"
              >
                Kategoriya Qo'shish
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              {categories.map((c) => (
                <div key={c.id} className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
                  <img src={c.imageUrl || c.coverImage} alt={c.name} className="w-8 h-8 rounded-lg object-cover" />
                  <span className="text-xs text-slate-200 font-medium truncate">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANEL 3: Dynamic Service Builder */}
        {activeTab === '3' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h2 className="font-bold text-sm text-slate-100">Dinamik Xizmat Yaratish (Form Builder)</h2>

            <form onSubmit={handleCreateService} className="space-y-3">
              <input
                type="text"
                placeholder="Xizmat Nomi"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                required
              />
              <input
                type="text"
                placeholder="Icon / Rasm URL"
                value={serviceIcon}
                onChange={(e) => setServiceIcon(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                required
              />

              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium">Maydonlar (Custom Fields):</span>
                {customFields.map((field, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Maydon nomi (e.g. Mavzuni kiriting)"
                      value={field.fieldName}
                      onChange={(e) => {
                        const updated = [...customFields];
                        updated[idx].fieldName = e.target.value;
                        setCustomFields(updated);
                      }}
                      className="w-2/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100"
                      required
                    />
                    <select
                      value={field.fieldType}
                      onChange={(e) => {
                        const updated = [...customFields];
                        updated[idx].fieldType = e.target.value;
                        setCustomFields(updated);
                      }}
                      className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-100"
                    >
                      <option value="text">Matn</option>
                      <option value="file">Fayl/Rasm</option>
                      <option value="number">Raqam</option>
                    </select>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="text-xs text-blue-400 flex items-center gap-1 hover:underline pt-1"
                >
                  <Plus size={14} /> Qo'shimcha maydon qo'shish
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-medium"
              >
                Xizmatni Saqlash
              </button>
            </form>
          </div>
        )}

        {/* PANEL 4: Service Controller */}
        {activeTab === '4' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h2 className="font-bold text-sm text-slate-100">Xizmatlarni Bloklash / Yoqish</h2>
            <div className="space-y-2">
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src={s.imageUrl || s.iconImage} alt={s.name} className="w-9 h-9 rounded-xl object-cover" />
                    <span className="text-xs text-slate-100 font-medium">{s.name}</span>
                  </div>
                  <button
                    onClick={() => handleToggleService(s.id, s.isActive)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      !s.isActive
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {!s.isActive ? 'BLOKLANGAN (Yashirin)' : 'FAOL (Ko\'rinadi)'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANEL 5: Partner Manager */}
        {activeTab === '5' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h2 className="font-bold text-sm text-slate-100">Hamkorlar & VIP Status Boshqaruvi</h2>
            <div className="space-y-3">
              {partners.map((p) => (
                <div key={p.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-slate-100">{p.user?.firstName} {p.user?.lastName}</h3>
                      <p className="text-[10px] text-slate-400">Tel: {p.user?.phone}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {p.level} ({p.status})
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleUpdatePartner(p.id, 'VIP', 'APPROVED')}
                      className="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-[10px] font-semibold"
                    >
                      VIP Darajasiga Ko'tarish
                    </button>
                    <button
                      onClick={() => handleUpdatePartner(p.id, 'STANDARD', 'APPROVED')}
                      className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-semibold"
                    >
                      Tasdiqlash
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANEL 6: Order Monitor & Real-Time Analytics */}
        {activeTab === '6' && (
          <div className="space-y-4">
            {/* Analytics Metric Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
                <DollarSign size={16} className="text-emerald-400 mx-auto mb-1" />
                <span className="text-[9px] text-slate-400 block font-medium">Jami Tushum</span>
                <span className="text-xs font-black text-emerald-400">{totalRevenue.toLocaleString()} so'm</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
                <ShoppingBag size={16} className="text-blue-400 mx-auto mb-1" />
                <span className="text-[9px] text-slate-400 block font-medium">Buyurtmalar</span>
                <span className="text-xs font-black text-blue-400">{totalOrdersCount} ta</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
                <Award size={16} className="text-amber-400 mx-auto mb-1" />
                <span className="text-[9px] text-slate-400 block font-medium">Faol Hamkorlar</span>
                <span className="text-xs font-black text-amber-400">{activePartnersCount} ta</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <h2 className="font-bold text-sm text-slate-100">Barcha Buyurtmalar Monitoringi</h2>
              <div className="space-y-2">
                {orders.map((o) => (
                  <div key={o.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-blue-400">#{o.id.slice(0, 8)}</span>
                      <span className="text-[10px] font-semibold text-slate-300">{o.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Mijoz: {o.user?.firstName} {o.user?.lastName} ({o.user?.phone})
                    </p>
                    <p className="text-xs font-bold text-slate-100">
                      Jami: {o.totalPrice.toLocaleString()} so'm (Naqd to'lov)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 7: Alert Center (15-min SLA Timeout Alerts) */}
        {activeTab === '7' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="text-red-500" size={18} />
              <h2 className="font-bold text-sm text-slate-100">Alert Center (15m SLA Alert)</h2>
            </div>
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Xavfli taym-aut alertlari yo'q</p>
            ) : (
              <div className="space-y-2">
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl space-y-1"
                  >
                    <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                      <ShieldAlert size={16} />
                      <span>{al.message}</span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Hamkor: <span className="font-mono text-red-300 font-bold">{al.partner?.user?.firstName} {al.partner?.user?.lastName} ({al.partner?.user?.phone})</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Order ID: <span className="font-mono">{al.orderId}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
