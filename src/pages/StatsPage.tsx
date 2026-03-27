import { useEntries } from '@/hooks/useEntries';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { CATEGORY_CONFIG } from '@/components/CategoryBadge';
import { format, parseISO, startOfMonth } from 'date-fns';
import { Category } from '@/types/content';

const CATEGORY_COLORS: Record<Category, string> = {
  book: '#B45309',
  movie: '#1D4ED8',
  game: '#047857',
  music: '#9F1239',
};

export default function StatsPage() {
  const { data: entries = [], isLoading } = useEntries();

  const byCat = (Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => ({
    name: CATEGORY_CONFIG[cat].label,
    value: entries.filter(e => e.category === cat).length,
    color: CATEGORY_COLORS[cat],
  })).filter(d => d.value > 0);

  const monthMap = new Map<string, number>();
  entries
    .filter(e => e.date_consumed)
    .forEach(e => {
      try {
        const month = format(startOfMonth(parseISO(e.date_consumed!)), 'MMM yy');
        monthMap.set(month, (monthMap.get(month) || 0) + 1);
      } catch (err) {
        console.error("Date error:", e.date_consumed);
      }
    });
    
  const byMonth = Array.from(monthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .slice(-12);

  const ratingDist = Array.from({ length: 10 }).map((_, i) => ({
    rating: i + 1,
    count: entries.filter(e => e.rating === i + 1).length,
  }));

  const totalRated = entries.filter(e => e.rating).length;
  const avgRating = totalRated
    ? (entries.reduce((s, e) => s + (e.rating || 0), 0) / totalRated).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-24 text-muted-foreground animate-fade-in">
        <div className="text-5xl mb-4 text-primary/20">📊</div>
        <p className="font-display text-2xl text-foreground">No data yet</p>
        <p className="text-sm mt-2">Add records to library to see your statistics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground italic">Stats</h1>
        <p className="text-muted-foreground mt-1">Your cultural progress in numbers.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total records', value: entries.length },
          { label: 'Completed', value: entries.filter(e => e.status === 'completed').length },
          { label: 'In progress', value: entries.filter(e => e.status === 'currently').length },
          { label: 'Avg. rating', value: avgRating ? `${avgRating} / 10` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="gradient-card rounded-2xl p-5 border border-border/60 shadow-soft">
            {/* ТУТ ЗМІНА: Замість text-foreground ставимо жорсткий темний колір */}
            <div className="font-display text-2xl font-bold text-slate-900 dark:text-slate-950">{value}</div>
            {/* ТУТ ЗМІНА: Замість text-muted-foreground ставимо темніший slate */}
            <div className="text-xs text-slate-600 dark:text-slate-800 mt-1 font-medium uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="gradient-card rounded-2xl border border-border/60 shadow-soft p-6">
          {/* ТУТ ЗМІНА: Заголовок теж робимо темним */}
          <h2 className="font-display text-lg font-semibold mb-6 text-slate-900 dark:text-slate-950">Distribution by categories</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={byCat} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                {byCat.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`${value} records`, 'Number']} 
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        {byMonth.length > 0 && (
          <div className="gradient-card rounded-2xl border border-border/60 shadow-soft p-6">
            <h2 className="font-display text-lg font-semibold mb-6 text-slate-900 dark:text-slate-950">Activity by month</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#475569" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Distribution Chart */}
        {totalRated > 0 && (
          <div className="gradient-card rounded-2xl border border-border/60 shadow-soft p-6 lg:col-span-2">
            <h2 className="font-display text-lg font-semibold mb-6 text-slate-900 dark:text-slate-950">Analysis of your grades</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ratingDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="rating" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v) => [`${v} records`, 'Grade']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {ratingDist.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={entry.rating >= 8 ? '#047857' : entry.rating >= 5 ? '#B45309' : '#9F1239'} 
                      fillOpacity={0.8}
                    />
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