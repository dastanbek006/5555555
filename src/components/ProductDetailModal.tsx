'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingCart, ShieldCheck, Heart, Share2, Plus, Check } from 'lucide-react';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onAddToCart: (productId: string) => void;
  isAdded: boolean;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  isAdded,
}: ProductDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [reviews, setReviews] = useState<any[]>([
    {
      id: '1',
      name: 'Otabek M.',
      rating: 5,
      comment: 'Juda sifatli va tezkor yetkazib berishdi! Rahmat!',
      date: 'Kecha, 18:30',
    },
    {
      id: '2',
      name: 'Malika K.',
      rating: 5,
      comment: 'Talabalar uchun juda qulay narxda ekan.',
      date: '2 kun oldin',
    },
  ]);

  if (!isOpen || !product) return null;

  const images: string[] = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images || '[]')
    : [];

  const mainImg =
    images[activeImageIndex] ||
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400';

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;

    const newRev = {
      id: Date.now().toString(),
      name: 'Siz (Talaba)',
      rating: userRating,
      comment: userComment,
      date: 'Hozircha',
    };

    setReviews([newRev, ...reviews]);
    setUserComment('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-md shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto scrollbar-none"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/80 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-all shadow-lg"
          >
            <X size={18} />
          </button>

          {/* Product Main Image Slider */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 mb-3 shadow-inner">
            <img src={mainImg} alt={product.title} className="w-full h-full object-cover" />

            <span className="absolute top-3 left-3 bg-blue-600/90 text-white font-bold text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md shadow-md border border-blue-400/30">
              {product.category?.name || 'Mahsulot'}
            </span>

            <span className="absolute bottom-3 right-3 bg-slate-950/80 text-amber-400 font-bold text-xs px-2.5 py-1 rounded-full backdrop-blur-md border border-slate-800 flex items-center gap-1">
              <Star size={12} className="fill-amber-400" /> 4.9 (12 sharh)
            </span>
          </div>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx ? 'border-blue-500 scale-105' : 'border-slate-800 opacity-60'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Product Metadata */}
          <div className="space-y-2 mb-4">
            <h2 className="text-lg font-extrabold text-slate-100 leading-snug">{product.title}</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{product.description}</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Narxi:</span>
                <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                  {product.price.toLocaleString()} so'm
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Ombordagi zaxira:</span>
                <span className="text-xs font-bold text-emerald-400">{product.stock} ta mavjud</span>
              </div>
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={() => onAddToCart(product.id)}
            className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg mb-5 ${
              isAdded
                ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-500'
            }`}
          >
            {isAdded ? (
              <>
                <Check size={16} />
                <span>Savatga qo'shildi</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Savatga qo'shish</span>
              </>
            )}
          </button>

          {/* Reviews Section */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Mijozlar sharhlari ({reviews.length})</span>
              <span className="text-[10px] text-blue-400">★ 5.0 Rating</span>
            </h3>

            {/* Submit New Review Form */}
            <form onSubmit={handleAddReview} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Baho bering:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="p-0.5 text-amber-400"
                    >
                      <Star size={14} className={star <= userRating ? 'fill-amber-400' : 'text-slate-700'} />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Fikringizni yozing..."
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-xl transition-all"
              >
                Sharh qoldirish
              </button>
            </form>

            {/* Existing Reviews List */}
            <div className="space-y-2 pt-1">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-[11px]">{rev.name}</span>
                    <span className="text-[9px] text-slate-500">{rev.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
