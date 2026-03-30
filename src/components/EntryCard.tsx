import { useState, useEffect } from 'react';
import { CategoryBadge, StarRating, STATUS_CONFIG } from '@/components/CategoryBadge';
import { useDeleteEntry } from '@/hooks/useEntries';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, BookOpen, Calendar, Quote, Clock, User } from 'lucide-react';
import EntryForm from '@/components/EntryForm';
import { useToast } from '@/hooks/use-toast';
import { Entry } from '@/types/content';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface EntryCardProps {
  entry: Entry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [settings, setSettings] = useState({ rating: true, comments: true, status: true });
  
  const deleteEntry = useDeleteEntry();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      if (['book', 'movie', 'game', 'music'].includes(entry.category)) return;
      try {
        const snap = await getDoc(doc(db, "categories", entry.category));
        if (snap.exists()) setSettings(snap.data().settings);
      } catch (e) { console.error(e); }
    };
    fetchSettings();
  }, [entry.category]);

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation(); 
    if (!confirm('Delete this entry?')) return;
    try {
      await deleteEntry.mutateAsync(entry.id);
      toast({ title: 'Entry deleted' });
      setViewOpen(false);
    } catch (err) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handleOpenEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewOpen(false);
    setTimeout(() => {
      setEditOpen(true);
    }, 150);
  };

  const statusConfig = STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG];

  return (
    <>
      {/* КАРТКА БІБЛІОТЕКИ */}
      <div 
        onClick={() => setViewOpen(true)}
        className="gradient-card rounded-xl border border-border/60 shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden group animate-fade-in cursor-pointer"
      >
        <div className="flex gap-3 p-4">
          <div className="flex-shrink-0 w-16 h-22">
            {entry.image_url ? (
              <img src={entry.image_url} alt={entry.title} className="w-16 h-[88px] object-cover rounded-lg shadow-soft" />
            ) : (
              <div className="w-16 h-[88px] rounded-lg bg-muted flex items-center justify-center border border-border text-muted-foreground/40">
                <BookOpen className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-950 text-sm leading-tight truncate">{entry.title}</h3>
                {entry.author_creator && (
                  <p className="text-slate-700 dark:text-slate-800 text-xs mt-0.5 truncate font-medium">{entry.author_creator}</p>
                )}
              </div>
              
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditOpen(true)}><Pencil className="w-3.5 h-3.5 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleDelete(e)} className="text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <CategoryBadge category={entry.category} size="sm" />
              {settings.status && statusConfig && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.badge}`}>{statusConfig.label}</span>
              )}
            </div>

            {settings.rating && (
              <div className="mt-2">
                <StarRating rating={entry.rating} size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- МОДАЛЬНЕ ВІКНО ПЕРЕГЛЯДУ (VIEW) --- */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        {/* ЗБІЛЬШЕНО ВІКНО: max-w-5xl та h-[80vh] */}
        <DialogContent className="p-0 overflow-hidden border-none max-w-5xl w-[95vw] md:w-full h-[85vh] md:h-[80vh] rounded-[2rem] shadow-2xl bg-white">
          <div className="grid grid-cols-1 md:grid-cols-[40%_60%] h-full w-full overflow-hidden">
            
            {/* Ліва панель: ОБКЛАДИНКА */}
            <div className="relative h-[250px] md:h-full bg-slate-100 overflow-hidden border-r border-slate-50">
              {entry.image_url ? (
                <img 
                  src={entry.image_url} 
                  alt={entry.title} 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-50/50">
                   <BookOpen className="w-16 h-16 text-emerald-100" />
                </div>
              )}
              <div className="absolute top-6 left-6 z-10">
                <CategoryBadge category={entry.category} />
              </div>
            </div>

            {/* Права панель: КОНТЕНТ */}
            <div className="flex flex-col h-full min-w-0 bg-white text-left">
              
              {/* Скрол-зона */}
              <div className="flex-1 overflow-y-auto px-8 py-10 md:px-12 md:py-12 custom-scrollbar">
                <div className="max-w-full space-y-8">
                  
                  <div className="space-y-3">
                    <h2 className="font-display text-3xl md:text-4xl font-black text-slate-900 leading-[1.1] uppercase tracking-tighter break-words">
                      {entry.title}
                    </h2>
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                      <User className="w-4 h-4 shrink-0" />
                      <span className="truncate">{entry.author_creator || 'Unknown Creator'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-3 gap-x-6 py-5 border-y border-slate-100 text-slate-500">
                    {entry.year && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">{entry.year}</span>
                      </div>
                    )}
                    {entry.date_consumed && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">{entry.date_consumed}</span>
                      </div>
                    )}
                    {settings.rating && entry.rating && (
                      <div className="md:ml-auto">
                         <StarRating rating={entry.rating} size="md" />
                      </div>
                    )}
                  </div>

                  {/* ВІДГУК: ЗМЕНШЕНО ТА ПІДНЯТО (pt-0 та max-h-[180px]) */}
                  {settings.comments && entry.review && (
                    <div className="relative pt-0">
                      <Quote className="w-12 h-12 text-emerald-500/10 absolute -top-4 -left-6 z-0" />
                      <div className="relative z-10">
                        {/* Зменшена максимальна висота суто для тексту */}
                        <div className="max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                          <p className="text-slate-700 leading-relaxed text-lg font-medium font-display italic break-words whitespace-pre-wrap">
                            {entry.review}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Фіксований футер з кнопками (завжди знизу) */}
              <div className="p-6 md:p-8 bg-slate-50/50 border-t border-slate-100 flex gap-3 shrink-0 mt-auto">
                <Button 
                  onClick={handleOpenEdit}
                  className="flex-1 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold h-14 shadow-lg transition-all active:scale-[0.98]"
                >
                  <Pencil className="w-4 h-4 mr-2" /> Edit Record
                </Button>
                <Button 
                  variant="outline" 
                  onClick={(e) => handleDelete(e)}
                  className="w-14 h-14 rounded-2xl border-slate-200 text-destructive hover:bg-destructive/5 shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- МОДАЛЬНЕ ВІКНО РЕДАГУВАННЯ (EDIT) --- */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-widest text-xs text-muted-foreground">
              Edit Entry
            </DialogTitle>
          </DialogHeader>
          <EntryForm 
            entry={entry} 
            onSuccess={() => setEditOpen(false)} 
            onCancel={() => setEditOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}