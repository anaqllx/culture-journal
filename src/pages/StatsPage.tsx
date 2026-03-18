import { useEntries } from '@/hooks/useEntries';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { CATEGORY_CONFIG } from '@/components/CategoryBadge';
import type { Category } from '@/lib/supabase';
import { format, parseISO, startOfMonth } from 'date-fns';

const CATEGORY_COLORS: Record<Category, string> = {
  book: '#B45309',
  movie: '#1D4ED8',
  game: '#047857',
  music: '#9F1239',
};

export default function StatsPage() {
  const { data: entries = [], isLoading } = useEntries();

  // By category
  const byCat = (Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => ({
    name: CATEGORY_CONFIG[cat].label,
    value: entries.filter(e => e.category === cat).length,
    color: CATEGORY_COLORS[cat],
  })).filter(d => d.value > 0);

  // Per month (last 12 months)
  const monthMap = new Map<string, number>();
  entries
    .filter(e => e.date_consumed)
    .forEach(e => {
      const month = format(startOfMonth(parseISO(e.date_consumed!)), 'MMM yy');
      monthMap.set(month, (monthMap.get(month) || 0) + 1);
    });
  const byMonth = Array.from(monthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .slice(-12);

  // Ratings distribution
  const ratingDist = Array.from({ length: 10 }).map((_, i) => ({
    rating: i + 1,
    count: entries.filter(e => e.rating === i + 1).length,
  }));

  const totalRated = entries.filter(e => e.rating).length;
  const avgRating = totalRated
    ? (entries.reduce((s, e) => s + (e.rating || 0), 0) / totalRated).toFixed(2)
    : null;

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-24 text-muted-foreground animate-fade-in">
        <div className="text-5xl mb-4">📊</div>
        <p className="font-display text-2xl">No data yet</p>
        <p className="text-sm mt-2">Add entries to see your stats.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Stats</h1>
        <p className="text-muted-foreground mt-1">Patterns in your cultural consumption.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total entries', value: entries.length },
          { label: 'Completed', value: entries.filter(e => e.status === 'completed').length },
          { label: 'In progress', value: entries.filter(e => e.status === 'currently').length },
          { label: 'Avg rating', value: avgRating ? `${avgRating} / 10` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="gradient-card rounded-xl p-4 border border-border/60 shadow-soft">
            <div className="font-display text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By category pie */}
        <div className="gradient-card rounded-xl border border-border/60 shadow-soft p-5">
          <h2 className="font-display text-lg font-semibold mb-4">By Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCat} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {byCat.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} entries`, '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By month bar */}
        {byMonth.length > 0 && (
          <div className="gradient-card rounded-xl border border-border/60 shadow-soft p-5">
            <h2 className="font-display text-lg font-semibold mb-4">Items per Month</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byMonth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Ratings distribution */}
        {totalRated > 0 && (
          <div className="gradient-card rounded-xl border border-border/60 shadow-soft p-5 lg:col-span-2">
            <h2 className="font-display text-lg font-semibold mb-4">Rating Distribution</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ratingDist} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="rating" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(v) => [`${v} entries`, 'Count']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {ratingDist.map((entry, index) => (
                    <Cell key={index} fill={entry.rating >= 7 ? '#047857' : entry.rating >= 5 ? '#B45309' : '#9F1239'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
