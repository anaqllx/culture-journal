import { useState } from 'react';
import { useEntries } from '@/hooks/useEntries';
import EntryCard from '@/components/EntryCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Film, Gamepad2, Music, Search, SlidersHorizontal } from 'lucide-react';
import { Category, Status } from '@/types/content';

type SortKey = 'created_at' | 'rating' | 'date_consumed' | 'title';

export default function LibraryPage() {
  const { data: entries = [], isLoading } = useEntries();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('created_at');

  const filtered = entries
    .filter(e => category === 'all' || e.category === category)
    .filter(e => status === 'all' || e.status === status)
    .filter(e =>
      search === '' ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.author_creator || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
      
      if (sort === 'title') {
        const titleA = a.title.trim();
        const titleB = b.title.trim();
        const isEngA = /^[a-zA-Z]/.test(titleA);
        const isEngB = /^[a-zA-Z]/.test(titleB);

        if (isEngA && !isEngB) return -1;
        if (!isEngA && isEngB) return 1;
        return titleA.localeCompare(titleB, 'en', { sensitivity: 'base' });
      }

      if (sort === 'date_consumed') return (b.date_consumed || '').localeCompare(a.date_consumed || '');
      // Сортування за часом (у Firebase це зазвичай ISO рядок)
      return (b.created_at || '').localeCompare(a.created_at || '');
    });

  const catButtons: { key: Category | 'all'; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
    { key: 'all', label: 'All' },
    { key: 'book', label: 'Books', icon: BookOpen },
    { key: 'movie', label: 'Movies', icon: Film },
    { key: 'game', label: 'Games', icon: Gamepad2 },
    { key: 'music', label: 'Music', icon: Music },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Library</h1>
        <p className="text-muted-foreground mt-1">All your cultural experiences in one place.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search by title or creator…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background/60 px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Select value={status} onValueChange={v => setStatus(v as Status | 'all')}>
          <SelectTrigger className="w-[140px] bg-background/60">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="currently">Currently</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="want">Want to</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={v => setSort(v as SortKey)}>
          <SelectTrigger className="w-[140px] bg-background/60">
            <div className="flex items-center">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue placeholder="Sort" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Latest Added</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="date_consumed">Date Consumed</SelectItem>
            <SelectItem value="title">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap">
        {catButtons.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={category === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(key)}
            className="rounded-full gap-1.5"
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
            <span className="ml-0.5 text-xs opacity-70">
              {key === 'all' ? entries.length : entries.filter(e => e.category === key).length}
            </span>
          </Button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="font-display text-xl">Nothing found</p>
          <p className="text-sm mt-1">Try adjusting your filters or add your first experience.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}