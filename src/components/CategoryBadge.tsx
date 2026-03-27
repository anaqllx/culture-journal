import { Category } from '@/types/content'; 
import { BookOpen, Film, Gamepad2, Music, LayoutGrid } from 'lucide-react';

// Конфігурація для стандартних категорій
export const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  book: { label: 'Book', icon: BookOpen, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  movie: { label: 'Movie', icon: Film, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  game: { label: 'Game', icon: Gamepad2, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  music: { label: 'Music', icon: Music, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
};

export const STATUS_CONFIG = {
  currently: { label: 'Currently', badge: 'bg-primary/10 text-primary border-primary/20' },
  completed: { label: 'Completed', badge: 'bg-sage/20 text-sage border-sage/30' },
  want: { label: 'Want to', badge: 'bg-dusty-rose/20 text-dusty-rose border-dusty-rose/30' },
};

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  // 1. Шукаємо конфіг. Якщо категорія кастомна — config буде undefined
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];

  // 2. Якщо конфігу немає (кастомна категорія), рендеримо універсальний варіант
  if (!config) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium bg-slate-50 border-slate-200 text-slate-700 ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
        <LayoutGrid className="w-3 h-3 opacity-70" />
        {/* Показуємо назву категорії (якщо це ID, можна потім додати логіку пошуку назви) */}
        {category.length > 15 ? 'Custom' : category} 
      </span>
    );
  }

  // 3. Якщо конфіг є, рендеримо стандартну іконку
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${config.bg} ${config.color} ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

interface StarRatingProps {
  rating: number | null;
  max?: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, max = 10, size = 'md' }: StarRatingProps) {
  if (!rating) return <span className="text-muted-foreground text-[10px]">No rating</span>;
  const filled = Math.round((rating / max) * 5);
  return (
    <div className={`flex items-center gap-0.5 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < filled ? 'text-amber-400' : 'text-muted-foreground/30'}>★</span>
      ))}
      <span className="ml-1 text-muted-foreground text-[10px]">{rating}/10</span>
    </div>
  );
}