import { useEffect, useState } from 'react';
import { useEntries } from '@/hooks/useEntries';
import EntryCard from '@/components/EntryCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Film, Gamepad2, Music, Search, Plus, LayoutGrid, Loader2, Edit2 } from 'lucide-react';
import { Category, Status } from '@/types/content';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

type SortKey = 'created_at' | 'rating' | 'date_consumed' | 'title';

interface CustomCategory {
  id: string;
  name: string;
  user_id: string;
}

export default function LibraryPage() {
  const navigate = useNavigate();
  const { data: entries = [], isLoading: entriesLoading } = useEntries();
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | string | 'all'>('all');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('created_at');

  useEffect(() => {
    const fetchCustom = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const q = query(collection(db, "categories"), where("user_id", "==", user.uid));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CustomCategory[];
        setCustomCategories(fetched);
      } catch (e) {
        console.error("Error loading custom categories:", e);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCustom();
  }, []);

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
      if (sort === 'title') return a.title.localeCompare(b.title);
      return (b.created_at || '').localeCompare(a.created_at || '');
    });

  const staticCats = [
    { key: 'all', label: 'All', icon: LayoutGrid },
    { key: 'book', label: 'Books', icon: BookOpen },
    { key: 'movie', label: 'Movies', icon: Film },
    { key: 'game', label: 'Games', icon: Gamepad2 },
    { key: 'music', label: 'Music', icon: Music },
  ];

  if (entriesLoading || categoriesLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin opacity-20" size={40} /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="font-display text-4xl font-bold italic">Library</h1>
          <p className="text-muted-foreground font-medium">Your personal cultural archive.</p>
        </div>
        <Link to="/custom-category">
          <Button variant="outline" className="rounded-xl border-dashed gap-2 hover:bg-primary/5 transition-colors">
            <Plus size={18} /> New Category
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search experiences..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-10 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <Select value={status} onValueChange={v => setStatus(v as any)}>
          <SelectTrigger className="w-[160px] rounded-xl bg-background/50"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="currently">Currently</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Collections</p>
        <div className="flex gap-2 flex-wrap">
          {staticCats.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={category === key ? 'default' : 'outline'}
              onClick={() => setCategory(key)}
              className="rounded-full gap-2 px-5 transition-all"
            >
              <Icon size={16} /> {label}
            </Button>
          ))}
          
          {customCategories.map((cat) => (
            <div key={cat.id} className="relative group">
              <Button
                variant={category === cat.id ? 'default' : 'outline'}
                onClick={() => setCategory(cat.id)}
                className={`rounded-full gap-2 pl-5 pr-10 border-primary/20 transition-all ${
                  category === cat.id ? 'shadow-md' : ''
                }`}
              >
                <LayoutGrid size={16} className={category === cat.id ? 'text-white' : 'text-primary/50'} />
                {cat.name}
              </Button>
              
              {/* Кнопка редагування кастомної категорії */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/custom-category/${cat.id}`);
                }}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all hover:bg-black/10 ${
                  category === cat.id ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-primary'
                }`}
                title="Edit Category"
              >
                <Edit2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-card/30 rounded-[2.5rem] border border-dashed border-border/60">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
             <LayoutGrid className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <h3 className="font-bold text-lg">No entries found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters or add a new entry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}