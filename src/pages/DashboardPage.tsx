import { useEffect, useState } from 'react';
import { useEntries } from "@/hooks/useEntries";
import { BookOpen, Film, Gamepad2, Music, CheckCircle2, List, LayoutGrid, Loader2, Star } from "lucide-react";
import EntryCard from "@/components/EntryCard";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";
import { CATEGORY_PALETTE } from "@/pages/CustomCategoryPage";
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: entries = [], isLoading: entriesLoading } = useEntries();
  const [customCategories, setCustomCategories] = useState<{id: string, name: string, colorIndex?: number}[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const userName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "User";

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
        setCustomCategories(fetched);
      } catch (e) {
        console.error("Error loading categories for dashboard:", e);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCustom();
  }, []);

  if (entriesLoading || categoriesLoading) {
    return (
      <div className="p-8 text-left">
        <h1 className="text-3xl font-bold mb-6 italic">Dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  const staticStats = [
    { id: 'book', label: 'Books', icon: BookOpen, color: 'text-amber-700', bg: 'bg-amber-100/90', textColor: 'text-amber-950' },
    { id: 'movie', label: 'Movies', icon: Film, color: 'text-blue-700', bg: 'bg-blue-100/90', textColor: 'text-blue-950' },
    { id: 'game', label: 'Games', icon: Gamepad2, color: 'text-emerald-700', bg: 'bg-emerald-100/90', textColor: 'text-emerald-950' },
    { id: 'music', label: 'Music', icon: Music, color: 'text-rose-700', bg: 'bg-rose-100/90', textColor: 'text-rose-950' },
  ];

  const allCategoryCards = [
    ...staticStats.map(s => ({
      ...s,
      count: entries.filter(e => e.category === s.id).length
    })),
    ...customCategories.map(cat => {
      const style = CATEGORY_PALETTE[cat.colorIndex ?? 0] || CATEGORY_PALETTE[0];
      return {
        id: cat.id,
        label: cat.name,
        icon: LayoutGrid,
        count: entries.filter(e => e.category === cat.id).length,
        color: style.color,
        bg: style.bg,
        textColor: style.textColor
      };
    })
  ];

  // Фільтрація по статусах
  const recentlyCompleted = entries.filter(e => e.status === 'completed').slice(0, 3);
  const wantToSee = entries.filter(e => e.status === 'want').slice(0, 3);
  const totalCompleted = entries.filter(e => e.status === 'completed').length;

  return (
    <div className="space-y-10 animate-fade-in text-left pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground italic">
          Hello, {userName}!
        </h1>
        <p className="text-muted-foreground mt-1 font-medium">Every story you've lived, in one place.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allCategoryCards.map((s) => (
          <div key={s.id} className={`${s.bg} p-4 rounded-2xl border border-black/5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md cursor-default`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-white/80 shadow-sm ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-2xl font-bold leading-tight ${s.textColor}`}>{s.count}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider opacity-70 ${s.textColor}`}>
                  {s.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Summary Chips */}
      <div className="flex gap-4 flex-wrap">
        <div className="bg-secondary/30 px-4 py-2 rounded-xl flex items-center gap-2 border border-border/50">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{totalCompleted} completed</span>
        </div>
        <div className="bg-secondary/30 px-4 py-2 rounded-xl flex items-center gap-2 border border-border/50">
          <List className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{entries.length} total entries</span>
        </div>
      </div>

      {/* Section 1: Recently Completed */}
      <section>
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2 italic">
          <CheckCircle2 className="w-5 h-5 text-primary" /> Recently Completed
        </h2>
        
        {recentlyCompleted.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentlyCompleted.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/10 rounded-[2.5rem] border border-dashed border-border/60">
            <p className="text-muted-foreground text-sm font-medium">No completed entries yet.</p>
          </div>
        )}
      </section>

      {/* Section 2: Watchlist (Want to) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2 italic">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> My Wishlist
          </h2>
          {wantToSee.length > 0 && (
             <button 
               onClick={() => navigate('/library')} 
               className="text-xs font-bold uppercase tracking-tighter text-primary hover:underline"
             >
               View all
             </button>
          )}
        </div>
        
        {wantToSee.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wantToSee.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/10 rounded-[2.5rem] border border-dashed border-border/60">
            <p className="text-muted-foreground text-sm font-medium">Your wislist is empty.</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest">Plan your next adventure!</p>
          </div>
        )}
      </section>
    </div>
  );
}