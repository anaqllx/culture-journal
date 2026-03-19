import { useEntries } from '@/hooks/useEntries';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { CATEGORY_CONFIG } from '@/components/CategoryBadge';
import { format, parseISO, startOfMonth } from 'date-fns';
import { Category } from '@/types/content'; // Додали імпорт типу

const CATEGORY_COLORS: Record<Category, string> = {
  book: '#B45309',
  movie: '#1D4ED8',
  game: '#047857',
  music: '#9F1239',
};

export default function StatsPage() {
  const { data: entries = [], isLoading } = useEntries();

  // Статистика за категоріями
  const byCat = (Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => ({
    name: CATEGORY_CONFIG[cat].label,
    value: entries.filter(e => e.category === cat).length,
    color: CATEGORY_COLORS[cat],
  })).filter(d => d.value > 0);

  // Статистика по місяцях (використовуємо дату споживання)
  const monthMap = new Map<string, number>();
  entries
    .filter(e => e.date_consumed)
    .forEach(e => {
      try {
        const month = format(startOfMonth(parseISO(e.date_consumed!)), 'MMM yy');
        monthMap.set(month, (monthMap.get(month) || 0) + 1);
      } catch (err) {
        console.error("Помилка дати:", e.date_consumed);
      }
    });
    
  const byMonth = Array.from(monthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .slice(-12);

  // Розподіл рейтингів
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
        <p className="font-display text-2xl text-foreground">Ще немає даних</p>
        <p className="text-sm mt-2">Додайте записи у бібліотеку, щоб побачити свою статистику.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground italic">Stats</h1>
        <p className="text-muted-foreground mt-1">Твій культурний прогрес у цифрах.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Усього записів', value: entries.length },
          { label: 'Завершено', value: entries.filter(e => e.status === 'completed').length },
          { label: 'В процесі', value: entries.filter(e => e.status === 'currently').length },
          { label: 'Сер. рейтинг', value: avgRating ? `${avgRating} / 10` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="gradient-card rounded-2xl p-5 border border-border/60 shadow-soft">
            <div className="font-display text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="gradient-card rounded-2xl border border-border/60 shadow-soft p-6">
          <h2 className="font-display text-lg font-semibold mb-6">Розподіл за категоріями</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={byCat} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                {byCat.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`${value} записів`, 'Кількість']} 
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        {byMonth.length > 0 && (
          <div className="gradient-card rounded-2xl border border-border/60 shadow-soft p-6">
            <h2 className="font-display text-lg font-semibold mb-6">Активність по місяцях</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                  contentStyle={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Distribution Chart */}
        {totalRated > 0 && (
          <div className="gradient-card rounded-2xl border border-border/60 shadow-soft p-6 lg:col-span-2">
            <h2 className="font-display text-lg font-semibold mb-6">Аналіз твоїх оцінок</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ratingDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="rating" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v) => [`${v} записів`, 'Оцінка']}
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