import { useState } from 'react';
import type { CulturalEntry } from '@/lib/supabase';
import { CategoryBadge, StarRating, STATUS_CONFIG } from '@/components/CategoryBadge';
import { useDeleteEntry } from '@/hooks/useEntries';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, BookOpen } from 'lucide-react';
import EntryForm from '@/components/EntryForm';
import { useToast } from '@/hooks/use-toast';

interface EntryCardProps {
  entry: CulturalEntry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const deleteEntry = useDeleteEntry();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Delete this entry?')) return;
    try {
      await deleteEntry.mutateAsync(entry.id);
      toast({ title: 'Entry deleted' });
    } catch {
      toast({ title: 'Error', description: 'Could not delete entry', variant: 'destructive' });
    }
  };

  const statusConfig = STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG];

  return (
    <>
      <div className="gradient-card rounded-xl border border-border/60 shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden group animate-fade-in">
        <div className="flex gap-3 p-4">
          {/* Cover */}
          <div className="flex-shrink-0 w-16 h-22">
            {entry.cover_url ? (
              <img
                src={entry.cover_url}
                alt={entry.title}
                className="w-16 h-[88px] object-cover rounded-lg shadow-soft"
              />
            ) : (
              <div className="w-16 h-[88px] rounded-lg bg-muted flex items-center justify-center border border-border">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-semibold text-foreground text-sm leading-tight truncate">
                  {entry.title}
                </h3>
                {entry.author_creator && (
                  <p className="text-muted-foreground text-xs mt-0.5 truncate">{entry.author_creator}</p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-6 h-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <CategoryBadge category={entry.category as any} size="sm" />
              {statusConfig && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${statusConfig.badge}`}>
                  {statusConfig.label}
                </span>
              )}
              {entry.year && <span className="text-xs text-muted-foreground">{entry.year}</span>}
            </div>

            <div className="mt-2">
              <StarRating rating={entry.rating} size="sm" />
            </div>

            {entry.reflections && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                "{entry.reflections}"
              </p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Entry</DialogTitle>
          </DialogHeader>
          <EntryForm entry={entry} onSuccess={() => setEditOpen(false)} onCancel={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
