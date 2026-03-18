import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useCreateEntry, useUpdateEntry } from '@/hooks/useEntries';
import { CATEGORY_CONFIG } from '@/components/CategoryBadge';
import type { CulturalEntry, NewCulturalEntry, Category, Status } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  category: z.enum(['book', 'movie', 'game', 'music'] as const),
  status: z.enum(['currently', 'completed', 'want'] as const),
  date_consumed: z.string().optional(),
  rating: z.number().min(1).max(10).nullable().optional(),
  reflections: z.string().max(5000).optional(),
  author_creator: z.string().max(200).optional(),
  year: z.number().min(1800).max(new Date().getFullYear() + 2).nullable().optional(),
  cover_url: z.string().url().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface EntryFormProps {
  entry?: CulturalEntry;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EntryForm({ entry, onSuccess, onCancel }: EntryFormProps) {
  const { toast } = useToast();
  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();
  const [uploading, setUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState(entry?.cover_url || '');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: entry?.title || '',
      category: (entry?.category as Category) || 'book',
      status: (entry?.status as Status) || 'completed',
      date_consumed: entry?.date_consumed || '',
      rating: entry?.rating || null,
      reflections: entry?.reflections || '',
      author_creator: entry?.author_creator || '',
      year: entry?.year || null,
      cover_url: entry?.cover_url || '',
    },
  });

  const category = watch('category');
  const ratingValue = watch('rating');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('covers').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('covers').getPublicUrl(path);
      setValue('cover_url', data.publicUrl);
      setCoverPreview(data.publicUrl);
    } catch (err: unknown) {
      toast({ title: 'Upload failed', description: err instanceof Error ? err.message : 'Try again', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload: NewCulturalEntry = {
        title: data.title,
        category: data.category,
        status: data.status,
        date_consumed: data.date_consumed || null,
        rating: data.rating ?? null,
        reflections: data.reflections || null,
        author_creator: data.author_creator || null,
        year: data.year ?? null,
        cover_url: data.cover_url || null,
      };
      if (entry) {
        await updateEntry.mutateAsync({ id: entry.id, ...payload });
        toast({ title: 'Entry updated!' });
      } else {
        await createEntry.mutateAsync(payload);
        toast({ title: 'Entry added to your diary!' });
      }
      onSuccess?.();
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Something went wrong', variant: 'destructive' });
    }
  };

  const isLoading = createEntry.isPending || updateEntry.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Cover art */}
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-20 h-28 rounded-lg border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden relative group">
            {coverPreview ? (
              <>
                <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setCoverPreview(''); setValue('cover_url', ''); }}
                  className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-1 p-2">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground text-center">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
            <Input id="title" {...register('title')} placeholder="Enter title…" className="mt-1 bg-background/60" />
            {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="author_creator" className="text-sm font-medium">Author / Creator</Label>
            <Input id="author_creator" {...register('author_creator')} placeholder="Who made it?" className="mt-1 bg-background/60" />
          </div>
        </div>
      </div>

      {/* Cover URL field */}
      <div>
        <Label htmlFor="cover_url" className="text-sm font-medium">Cover URL (optional)</Label>
        <Input
          id="cover_url"
          {...register('cover_url')}
          placeholder="https://…"
          className="mt-1 bg-background/60"
          onChange={e => { setValue('cover_url', e.target.value); setCoverPreview(e.target.value); }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Category */}
        <div>
          <Label className="text-sm font-medium">Category *</Label>
          <Select defaultValue={category} onValueChange={v => setValue('category', v as Category)}>
            <SelectTrigger className="mt-1 bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" /> {cfg.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Label className="text-sm font-medium">Status *</Label>
          <Select defaultValue={watch('status')} onValueChange={v => setValue('status', v as Status)}>
            <SelectTrigger className="mt-1 bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="currently">📖 Currently</SelectItem>
              <SelectItem value="completed">✅ Completed</SelectItem>
              <SelectItem value="want">⭐ Want to</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Year */}
        <div>
          <Label htmlFor="year" className="text-sm font-medium">Year</Label>
          <Input
            id="year"
            type="number"
            min={1800}
            max={new Date().getFullYear() + 2}
            placeholder={String(new Date().getFullYear())}
            className="mt-1 bg-background/60"
            onChange={e => setValue('year', e.target.value ? Number(e.target.value) : null)}
            defaultValue={entry?.year || ''}
          />
        </div>
        {/* Date consumed */}
        <div>
          <Label htmlFor="date_consumed" className="text-sm font-medium">Date consumed</Label>
          <Input id="date_consumed" type="date" {...register('date_consumed')} className="mt-1 bg-background/60" />
        </div>
      </div>

      {/* Rating */}
      <div>
        <Label className="text-sm font-medium">Rating: {ratingValue ? `${ratingValue}/10` : 'None'}</Label>
        <div className="flex gap-1 mt-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setValue('rating', ratingValue === i + 1 ? null : i + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all border ${
                ratingValue && ratingValue >= i + 1
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-border hover:bg-secondary'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Reflections */}
      <div>
        <Label htmlFor="reflections" className="text-sm font-medium">Reflections</Label>
        <Textarea
          id="reflections"
          {...register('reflections')}
          placeholder="What did you think? What stayed with you? Any personal connections…"
          className="mt-1 bg-background/60 min-h-[100px] resize-none"
        />
      </div>

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        )}
        <Button type="submit" className="flex-1" disabled={isLoading || uploading}>
          {isLoading ? 'Saving…' : entry ? 'Update Entry' : 'Add to Diary'}
        </Button>
      </div>
    </form>
  );
}
