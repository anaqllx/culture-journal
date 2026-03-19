import { useEntries } from "@/hooks/useEntries";
import { BookOpen, Film, Gamepad2, Music, CheckCircle2, List } from "lucide-react";
import EntryCard from "@/components/EntryCard";
import { auth } from "@/lib/firebase";

export default function Dashboard() {
  const { data: entries = [], isLoading } = useEntries();
  const userName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "User";

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
    .slice(0, 3); // Останні 3 завершені

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground italic">
          Hello, {userName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Your cultural journey at a glance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Books', count: stats.books, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Movies', count: stats.movies, icon: Film, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Games', count: stats.games, icon: Gamepad2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Music', count: stats.music, icon: Music, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} p-4 rounded-2xl border border-border/50 shadow-sm`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-white shadow-sm ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
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