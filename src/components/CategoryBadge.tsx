import { BookOpen, Film, Gamepad2, Music } from 'lucide-react';
import type { Category } from '@/lib/supabase';

export const CATEGORY_CONFIG: Record<Category, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
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
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.bg} ${config.color} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
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
  if (!rating) return <span className="text-muted-foreground text-xs">No rating</span>;
  const filled = Math.round((rating / max) * 5);
  return (
    <div className={`flex items-center gap-0.5 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < filled ? 'text-gold' : 'text-muted'}>★</span>
      ))}
      <span className="ml-1 text-muted-foreground text-xs">{rating}/10</span>
    </div>
  );
}
