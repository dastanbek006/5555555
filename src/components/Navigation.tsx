'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Wrench, Shield, Store, ShoppingCart } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Bozor', href: '/', icon: ShoppingBag },
    { label: 'Xizmatlar', href: '/services', icon: Wrench },
    { label: 'Buyurtmalar', href: '/orders', icon: ShoppingCart },
    { label: 'VIP Sotuvchi', href: '/seller', icon: Store },
    { label: 'Admin', href: '/admin', icon: Shield },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : ''}`}>
                <Icon size={20} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
