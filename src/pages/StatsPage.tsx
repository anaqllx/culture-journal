import { useEffect, useState, useRef } from 'react';
import { useEntries } from '@/hooks/useEntries';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { CATEGORY_CONFIG } from '@/components/CategoryBadge';
import { format, parseISO, startOfMonth } from 'date-fns';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { CATEGORY_PALETTE } from "@/pages/CustomCategoryPage";
import { toPng } from 'html-to-image';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// ТУТ ВПИШИ СВОЄ ПОСИЛАННЯ, КОЛИ ЗАПУСТИШ ПРОЄКТ
const PROJECT_URL = "culture-journal.vercel.app";

const STATIC_COLORS: Record<string, string> = {
  book: '#B45309',
  movie: '#1D4ED8',
  game: '#047857',
  music: '#9F1239',
};

export default function StatsPage() {
  const { data: entries = [], isLoading: entriesLoading } = useEntries();
  const [customCats, setCustomCats] = useState<{id: string, name: string, colorIndex?: number}[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const { toast } = useToast();
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCustom = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const q = query(collection(db, "categories"), where("user_id", "==", user.uid));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ 
          id: doc.id, 
          name: doc.data().name,
          colorIndex: doc.data().colorIndex 
        }));
        setCustomCats(fetched);
      } catch (e) { console.error(e); }
      finally { setCatsLoading(false); }
    };
    fetchCustom();
  }, []);

  const handleExport = async () => {
    if (statsRef.current === null) return;
    try {
      const dataUrl = await toPng(statsRef.current, { cacheBust: true, backgroundColor: '#f0fff4' });
      const link = document.createElement('a');
      link.download = `my-cultural-archive.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Success!", description: "Your cultural card is ready!" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to generate image", variant: "destructive" });
    }
  };

  const byCat = [
    ...Object.entries(CATEGORY_CONFIG).map(([id, cfg]) => ({
      name: cfg.label,
      value: entries.filter(e => e.category === id).length,
      color: STATIC_COLORS[id] || '#64748b',
    })),
    ...customCats.map(cat => {
      const paletteStyle = CATEGORY_PALETTE[cat.colorIndex ?? 0] || CATEGORY_PALETTE[0];
      return {
        name: cat.name,
        value: entries.filter(e => e.category === cat.id).length,
        color: paletteStyle.bg.includes('purple') ? '#7e22ce' : 
               paletteStyle.bg.includes('orange') ? '#d2f65c' :
               paletteStyle.bg.includes('cyan') ? '#0e7490' :
               paletteStyle.bg.includes('pink') ? '#be185d' :
               paletteStyle.bg.includes('indigo') ? '#4338ca' :
               paletteStyle.bg.includes('teal') ? '#0f766e' : '#4d7c0f'
      };
    })
  ].filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  const totalEntries = entries.length;
  let currentPercent = 0;
  const pieCardData = byCat.map(c => {
    const percent = totalEntries > 0 ? (c.value / totalEntries) * 100 : 0;
    const start = currentPercent;
    currentPercent += percent;
    return { ...c, start, percent };
  });

  const monthMap = new Map<string, number>();
  entries.filter(e => e.date_consumed).forEach(e => {
    try {
      const month = format(startOfMonth(parseISO(e.date_consumed!)), 'MMM yy');
      monthMap.set(month, (monthMap.get(month) || 0) + 1);
    } catch (err) { console.error(err); }
  });
  const byMonth = Array.from(monthMap.entries()).map(([month, count]) => ({ month, count })).slice(-12);

  const ratingDist = Array.from({ length: 10 }).map((_, i) => ({
    rating: i + 1,
    count: entries.filter(e => e.rating === i + 1).length,
  }));

  const totalRated = entries.filter(e => e.rating).length;
  const avgRating = totalRated ? (entries.reduce((s, e) => s + (e.rating || 0), 0) / totalRated).toFixed(1) : null;

  if (entriesLoading || catsLoading) return <div className="p-8 animate-pulse bg-muted rounded-xl h-64" />;

  return (
    <div className="space-y-8 animate-fade-in pb-10 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold italic">Your Archive Stats</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">A deep dive into your cultural journey.</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="rounded-xl gap-2 border-primary/20 hover:bg-primary/5 transition-all">
          <Share2 className="w-4 h-4" /> Share with friends
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total records', value: entries.length },
          { label: 'Completed', value: entries.filter(e => e.status === 'completed').length },
          { label: 'Upcoming', value: entries.filter(e => e.status === 'want').length },
          { label: 'Avg. rating', value: avgRating ? `${avgRating} / 10` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card rounded-2xl p-5 border border-border/60 shadow-sm">
            <div className="font-display text-2xl font-bold">{value}</div>
            <div className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-widest">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border/60 p-6">
          <h2 className="font-display text-lg font-bold mb-6 italic">Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={byCat} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                {byCat.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {byMonth.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/60 p-6">
            <h2 className="font-display text-lg font-bold mb-6 italic">Activity Timeline</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="count" fill="#334155" radius={[6, 6, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {totalRated > 0 && (
          <div className="bg-card rounded-2xl border border-border/60 p-6 lg:col-span-2 shadow-sm">
            <h2 className="font-display text-lg font-bold mb-6 italic">Rating Analysis</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ratingDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="rating" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {ratingDist.map((entry, index) => (
                    <Cell key={index} fill={entry.rating >= 8 ? '#059669' : entry.rating >= 5 ? '#d97706' : '#be185d'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* КАРТКА ДЛЯ ЕКСПОРТУ (М'ЯТНА) */}
<div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
  <div ref={statsRef} className="w-[650px] p-16 bg-[#f0fff4] border-[16px] border-white rounded-[4rem] text-slate-800 space-y-10 shadow-2xl">
    
    <div className="text-center space-y-3">
      <h2 className="font-display text-5xl font-extrabold italic tracking-tighter text-emerald-950">Cultural Snapshot</h2>
      <p className="text-xs uppercase tracking-[0.5em] font-black text-emerald-700/80">Personal Archive Summary</p>
    </div>
    
    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-emerald-100/50 space-y-8">
      <div className="text-center">
        <p className="text-7xl font-black text-emerald-950">{entries.length}</p>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-800/50 mt-1">Total Cultural Entries</p>
      </div>

      <div className="flex items-center gap-12 pt-8 border-t border-emerald-100">
         {/* CSS Pie Chart */}
         <div className="w-40 h-40 rounded-full relative flex-shrink-0 border-4 border-emerald-50 shadow-inner" 
              style={{ background: `conic-gradient(${pieCardData.map(c => `${c.color} ${c.start}% ${c.start + c.percent}%`).join(', ')})` }} 
         />
         
         {/* Легенда без truncate та з "Entries" */}
         <div className="flex-1 grid grid-cols-1 gap-y-3">
           {byCat.map((c, idx) => (
             <div key={idx} className="flex items-center gap-3 text-sm">
               <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
               <span className="font-bold text-emerald-950 whitespace-nowrap">{c.name}</span>
               <div className="flex-1 border-b border-dotted border-emerald-100 mx-2 mb-1" />
               <span className="font-black text-emerald-700 flex-shrink-0">{c.value} entries</span>
             </div>
           ))}
         </div>
      </div>
    </div>

    <div className="space-y-4 bg-emerald-950 p-10 rounded-[2.5rem] text-center shadow-xl">
       <h3 className="font-display text-2xl font-bold text-white italic">Why I keep this Diary?</h3>
       <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
         "This is more than just a list. It's a collection of emotions, ideas, and stories that shaped my personality. Every book, movie, or game is a step in my journey. Tracking my archive helps me reflect on art and discover what truly resonates. It's my story."
       </p>
    </div>

    <div className="pt-8 text-center space-y-5 border-t border-emerald-100">
      <div className="inline-block bg-white text-emerald-950 px-10 py-3 rounded-full text-xs font-bold shadow-md border border-emerald-100">
        Start your journey at {PROJECT_URL}
      </div>
      <p className="text-xs font-bold text-emerald-900/40 uppercase tracking-[0.3em]">
        {PROJECT_URL} • Cultural Archive App
      </p>
    </div>
  </div>
</div>
    </div>
  );
}