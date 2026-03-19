import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddEntry, useUpdateEntry } from '@/hooks/useEntries';
import { CATEGORY_CONFIG } from '@/components/CategoryBadge';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
// ПЕРЕВІР ЦЕЙ ІМПОРТ - він має вести на твій новий файл типів
import { Category, Status, Entry } from '@/types/content';

const schema = z.object({
  title: z.string().min(1, 'Назва обов’язкова').max(200),
  category: z.enum(['book', 'movie', 'game', 'music'] as const),
  status: z.enum(['currently', 'completed', 'want'] as const),
  date_consumed: z.string().optional().nullable(),
  rating: z.number().min(1).max(10).nullable().optional(),
  review: z.string().max(5000).optional().nullable(),
  author_creator: z.string().max(200).optional().nullable(),
  year: z.number().min(1800).max(new Date().getFullYear() + 2).nullable().optional(),
  image_url: z.string().url().optional().or(z.literal('')).nullable(),
});

type FormData = z.infer<typeof schema>;

interface EntryFormProps {
  entry?: Entry;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EntryForm({ entry, onSuccess, onCancel }: EntryFormProps) {
  const { toast } = useToast();
  const addEntry = useAddEntry();
  const updateEntry = useUpdateEntry();
  const [coverPreview, setCoverPreview] = useState(entry?.image_url || '');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: entry?.title || '',
      category: (entry?.category as Category) || 'book',
      status: (entry?.status as Status) || 'completed',
      date_consumed: entry?.date_consumed || '',
      rating: entry?.rating || null,
      review: entry?.review || '',
      author_creator: entry?.author_creator || '',
      year: entry?.year || null,
      image_url: entry?.image_url || '',
    },
  });

  const category = watch('category');
  const ratingValue = watch('rating');

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        title: data.title,
        category: data.category,
        status: data.status,
        date_consumed: data.date_consumed || null,
        rating: data.rating ?? null,
        review: data.review || null,
        author_creator: data.author_creator || null,
        year: data.year ?? null,
        image_url: data.image_url || null,
      };

      if (entry?.id) {
        await updateEntry.mutateAsync({ id: entry.id, ...payload });
        toast({ title: 'Оновлено!', description: 'Запис успішно змінено' });
      } else {
        await addEntry.mutateAsync(payload);
        toast({ title: 'Додано!', description: 'Новий запис з’явився у щоденнику' });
      }
      onSuccess?.();
    } catch (err: any) {
      toast({ 
        title: 'Помилка', 
        description: err.message || 'Щось пішло не так', 
        variant: 'destructive' 
      });
    }
  };

  const isLoading = addEntry.isPending || updateEntry.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-20 h-28 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden relative group shadow-sm">
            {coverPreview ? (
              <>
                <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setCoverPreview(''); setValue('image_url', ''); }}
                  className="absolute top-1 right-1 bg-background/90 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-destructive" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
                <Upload className="w-5 h-5 opacity-40" />
                <span className="text-[10px] text-center font-medium">URL ілюстрації</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <Label htmlFor="title" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Назва *</Label>
            <Input id="title" {...register('title')} placeholder="Назва книги, фільму..." className="mt-1 bg-background" />
            {errors.title && <p className="text-destructive text-[10px] mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="author_creator" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Автор / Творець</Label>
            <Input id="author_creator" {...register('author_creator')} placeholder="Хто автор?" className="mt-1 bg-background" />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="image_url" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Посилання на обкладинку (URL)</Label>
        <Input
          id="image_url"
          {...register('image_url')}
          placeholder="https://images..."
          className="mt-1 bg-background"
          onChange={e => { setValue('image_url', e.target.value); setCoverPreview(e.target.value); }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Категорія *</Label>
          <Select defaultValue={category} onValueChange={v => setValue('category', v as Category)}>
            <SelectTrigger className="mt-1 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(CATEGORY_CONFIG) as [Category, any][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" /> {cfg.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Статус *</Label>
          <Select defaultValue={watch('status')} onValueChange={v => setValue('status', v as Status)}>
            <SelectTrigger className="mt-1 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="currently">📖 В процесі</SelectItem>
              <SelectItem value="completed">✅ Завершено</SelectItem>
              <SelectItem value="want">⭐ В планах</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Рік виходу</Label>
          <Input
            id="year"
            type="number"
            className="mt-1 bg-background"
            {...register('year', { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label htmlFor="date_consumed" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Дата ознайомлення</Label>
          <Input id="date_consumed" type="date" {...register('date_consumed')} className="mt-1 bg-background" />
        </div>
      </div>

      <div>
        <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Твоя оцінка: {ratingValue ? `${ratingValue}/10` : 'Без оцінки'}</Label>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setValue('rating', ratingValue === num ? null : num)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                ratingValue && ratingValue >= num
                  ? 'bg-primary text-primary-foreground border-primary scale-105'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="review" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Враження (Reflections)</Label>
        <Textarea
          id="review"
          {...register('review')}
          placeholder="Що тобі запам'яталося?"
          className="mt-1 bg-background min-h-[100px] resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Скасувати</Button>
        )}
        <Button type="submit" className="flex-1 rounded-xl shadow-md" disabled={isLoading}>
          {isLoading ? 'Збереження...' : entry ? 'Оновити' : 'Додати в щоденник'}
        </Button>
      </div>
    </form>
  );
}