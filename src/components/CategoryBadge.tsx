import { useEffect, useState } from 'react';
import { Category } from '@/types/content'; 
import { BookOpen, Film, Gamepad2, Music, LayoutGrid } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CATEGORY_PALETTE } from "@/pages/CustomCategoryPage";

// Конфігурація для стандартних категорій
export const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  book: { label: 'Book', icon: BookOpen, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  movie: { label: 'Movie', icon: Film, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  game: { label: 'Game', icon: Gamepad2, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  music: { label: 'Music', icon: Music, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
};

export const STATUS_CONFIG = {
  currently: { label: 'Currently', badge: 'bg-primary/10 text-primary border-primary/20' },
  completed: { label: 'Completed', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  want: { label: 'Want to', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
};

interface CategoryBadgeProps {
  category: string; // Змінено на string, щоб приймати ID
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const [customData, setCustomData] = useState<{ name: string, color: string, bg: string } | null>(null);
  
  // 1. Шукаємо стандартний конфіг
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];

  // 2. Якщо категорія кастомна (немає в стандартному конфігу), завантажуємо дані
  useEffect(() => {
    if (!config && category) {
      const fetchCategoryName = async () => {
        try {
          const docRef = doc(db, "categories", category);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const palette = CATEGORY_PALETTE[data.colorIndex ?? 0] || CATEGORY_PALETTE[0];
            setCustomData({
              name: data.name,
              color: palette.textColor, // Використовуємо колір з твоєї палітри
              bg: palette.bg
            });
          }
        } catch (e) {
          console.error("Error fetching category name:", e);
        }
      };
      fetchCategoryName();
    }
  }, [category, config]);

  // Рендер для кастомної категорії
  if (!config) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-bold shadow-sm transition-all ${customData?.bg || 'bg-slate-100 border-slate-200'} ${customData?.color || 'text-slate-600'} ${size === 'sm' ? 'text-[9px]' : 'text-[11px]'}`}>
        <LayoutGrid className="w-2.5 h-2.5 opacity-60" />
        {customData?.name || 'Loading...'} 
      </span>
    );
  }

  // Рендер для стандартної категорії
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-bold shadow-sm ${config.bg} ${config.color} ${size === 'sm' ? 'text-[9px]' : 'text-[11px]'}`}>
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </span>
  );
}

// Решта коду StarRating залишається без змін
interface StarRatingProps {
  rating: number | null;
  max?: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, max = 10, size = 'md' }: StarRatingProps) {
  if (!rating) return <span className="text-muted-foreground text-[10px] font-medium opacity-60">No rating yet</span>;
  const filled = Math.round((rating / max) * 5);
  return (
    <div className={`flex items-center gap-0.5 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < filled ? 'text-amber-400 drop-shadow-sm' : 'text-muted-foreground/20'}>★</span>
      ))}
      <span className="ml-1 text-slate-400 font-bold text-[10px]">{rating}/10</span>
    </div>
  );
}