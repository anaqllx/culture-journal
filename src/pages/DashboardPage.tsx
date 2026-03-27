import { useEntries } from "@/hooks/useEntries";
import { BookOpen, Film, Gamepad2, Music, CheckCircle2, List } from "lucide-react";
import EntryCard from "@/components/EntryCard";
import { auth } from "@/lib/firebase";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";

export default function Dashboard() {
  const { data: entries = [], isLoading } = useEntries();
  const userName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "User";

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  // Рахуємо статистику
  const stats = {
    books: entries.filter(e => e.category === 'book').length,
    movies: entries.filter(e => e.category === 'movie').length,
    games: entries.filter(e => e.category === 'game').length,
    music: entries.filter(e => e.category === 'music').length,
    completed: entries.filter(e => e.status === 'completed').length,
    total: entries.length
  };

  const recentlyCompleted = entries
    .filter(e => e.status === 'completed')
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground italic">
          Hello, {userName}!
        </h1>
        <p className="text-muted-foreground mt-1">Every story you've lived, in one place.</p>
      </div>

      {/* Stats Cards */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {[
    { label: 'Books', count: stats.books, icon: BookOpen, color: 'text-amber-700', bg: 'bg-amber-100/90', textColor: 'text-amber-950' },
    { label: 'Movies', count: stats.movies, icon: Film, color: 'text-blue-700', bg: 'bg-blue-100/90', textColor: 'text-blue-950' },
    { label: 'Games', count: stats.games, icon: Gamepad2, color: 'text-emerald-700', bg: 'bg-emerald-100/90', textColor: 'text-emerald-950' },
    { label: 'Music', count: stats.music, icon: Music, color: 'text-rose-700', bg: 'bg-rose-100/90', textColor: 'text-rose-950' },
  ].map((s) => (
    <div key={s.label} className={`${s.bg} p-4 rounded-2xl border border-black/5 shadow-sm`}>
      <div className="flex items-center gap-3">
        {/* Іконка на білій підкладці */}
        <div className={`p-2 rounded-xl bg-white/80 shadow-sm ${s.color}`}>
          <s.icon className="w-5 h-5" />
        </div>
        <div>
          {/* Число: додаємо dark: префікс, щоб воно не біліло */}
          <p className={`text-2xl font-bold ${s.textColor} dark:${s.textColor}`}>
            {s.count}
          </p>
          {/* Підпис: теж форсуємо темний колір через dark: */}
          <p className={`text-xs font-semibold uppercase tracking-wider opacity-80 ${s.textColor} dark:${s.textColor}`}>
            {s.label}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>

      <div className="flex gap-4 flex-wrap">
        <div className="bg-secondary/30 px-4 py-2 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{stats.completed} completed</span>
        </div>
        <div className="bg-secondary/30 px-4 py-2 rounded-xl flex items-center gap-2">
          <List className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{stats.total} total entries</span>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" /> Recently Completed
        </h2>
        
        {recentlyCompleted.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentlyCompleted.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-3xl border border-dashed">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-muted-foreground">Your diary is empty</p>
            <p className="text-xs text-muted-foreground/60">Add your first cultural experience!</p>
          </div>
        )}
      </div>
    </div>
  );
}