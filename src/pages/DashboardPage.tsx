import { useEntries } from '@/hooks/useEntries';
import { useAuth } from '@/hooks/useAuth';
import EntryCard from '@/components/EntryCard';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';
import { CATEGORY_CONFIG } from '@/components/CategoryBadge';
import type { Category } from '@/lib/supabase';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: entries = [], isLoading } = useEntries();

  const currentlyEntries = entries.filter(e => e.status === 'currently');
  const recentCompleted = entries.filter(e => e.status === 'completed').slice(0, 8);

  const categoryCounts = (Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => ({
    category: cat,
    count: entries.filter(e => e.category === cat).length,
    config: CATEGORY_CONFIG[cat],
  }));

  const totalCompleted = entries.filter(e => e.status === 'completed').length;
  const avgRating = (() => {
    const rated = entries.filter(e => e.rating);
    return rated.length ? (rated.reduce((s, e) => s + (e.rating || 0), 0) / rated.length).toFixed(1) : null;
  })();

  const firstName = user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Hello, <span className="italic">{firstName}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1">Your cultural journey at a glance.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categoryCounts.map(({ category, count, config }) => {
          const Icon = config.icon;
          return (
            <div key={category} className={`rounded-xl p-4 border gradient-card shadow-soft flex items-center gap-3`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.bg} border`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-foreground">{count}</div>
                <div className="text-xs text-muted-foreground">{config.label}s</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-sm">
          <CheckCircle className="w-4 h-4 text-sage" />
          <span className="font-medium">{totalCompleted}</span>
          <span className="text-muted-foreground">completed</span>
        </div>
        {avgRating && (
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-sm">
            <span className="text-gold">★</span>
            <span className="font-medium">{avgRating}</span>
            <span className="text-muted-foreground">avg rating</span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-sm">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="font-medium">{entries.length}</span>
          <span className="text-muted-foreground">total entries</span>
        </div>
      </div>

      {/* Currently consuming */}
      {currentlyEntries.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="font-display text-xl font-semibold">Currently Experiencing</h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2].map(i => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentlyEntries.map(entry => <EntryCard key={entry.id} entry={entry} />)}
            </div>
          )}
        </section>
      )}

      {/* Recently completed */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-sage" />
          <h2 className="font-display text-xl font-semibold">Recently Completed</h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : recentCompleted.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-display text-lg">Your diary is empty</p>
            <p className="text-sm mt-1">Add your first cultural experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentCompleted.map(entry => <EntryCard key={entry.id} entry={entry} />)}
          </div>
        )}
      </section>
    </div>
  );
}
