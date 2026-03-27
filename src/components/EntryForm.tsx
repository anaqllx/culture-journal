import { useEffect, useState } from 'react';
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
import { Upload, X, ImageIcon, Loader2, LayoutGrid } from 'lucide-react';
import { Category, Status, Entry } from '@/types/content';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { db, auth } from '@/lib/firebase'; // Додано для завантаження категорій
import { collection, query, where, getDocs } from 'firebase/firestore'; // Додано

// Змінено схему: category тепер string, бо це може бути ID з бази
const schema = z.object({
  title: z.string().min(1, 'Name required').max(200),
  category: z.string().min(1, 'Category required'), 
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
  const [isUploading, setIsUploading] = useState(false);
  
  // Стейт для списку всіх доступних категорій
  const [availableCategories, setAvailableCategories] = useState<{id: string, label: string, isCustom?: boolean}[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: entry?.title || '',
      category: entry?.category || 'book',
      status: (entry?.status as Status) || 'completed',
      date_consumed: entry?.date_consumed || '',
      rating: entry?.rating || null,
      review: entry?.review || '',
      author_creator: entry?.author_creator || '',
      year: entry?.year || null,
      image_url: entry?.image_url || '',
    },
  });

  // Завантажуємо кастомні категорії з Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(collection(db, "categories"), where("user_id", "==", user.uid));
        const snap = await getDocs(q);
        
        const custom = snap.docs.map(doc => ({
          id: doc.id,
          label: doc.data().name,
          isCustom: true
        }));

        // Стандартні категорії
        const defaults = (Object.entries(CATEGORY_CONFIG) as [Category, any][]).map(([key, cfg]) => ({
          id: key,
          label: cfg.label
        }));

        setAvailableCategories([...defaults, ...custom]);
      } catch (e) {
        console.error("Error fetching categories:", e);
      }
    };

    fetchCategories();
  }, []);

  const currentCategory = watch('category');
  const ratingValue = watch('rating');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const imageUrl = await uploadToCloudinary(file);
      setValue('image_url', imageUrl);
      setCoverPreview(imageUrl);
      toast({ title: 'Photo uploaded!', description: 'Cover saved successfully' });
    } catch (error) {
      toast({ title: 'Upload error', variant: 'destructive' });
    } finally { setIsUploading(false); }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload = { ...data, date_consumed: data.date_consumed || null };
      if (entry?.id) {
        await updateEntry.mutateAsync({ id: entry.id, ...payload } as any );
        toast({ title: 'Updated!', description: 'Entry changed successfully' });
      } else {
        await addEntry.mutateAsync(payload as any);
        toast({ title: 'Added!', description: 'New entry added to your journal' });
      }
      onSuccess?.();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const isLoading = addEntry.isPending || updateEntry.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
      {/* Photo & Title block */}
      <div className="flex gap-4">
        <div className="flex-shrink-0 flex flex-col gap-2">
          <div className="w-24 h-32 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden relative group shadow-sm">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : coverPreview ? (
              <>
                <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setCoverPreview(''); setValue('image_url', ''); }} className="absolute top-1 right-1 bg-background/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3 text-destructive" />
                </button>
              </>
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground opacity-40" />
            )}
          </div>
          <Label htmlFor="file-upload" className="cursor-pointer text-[11px] font-semibold text-center bg-secondary py-1.5 px-2 rounded-lg hover:bg-secondary/80 border border-border/50">
            {isUploading ? "Processing..." : "Choose File"}
          </Label>
          <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <Label htmlFor="title" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Title *</Label>
            <Input id="title" {...register('title')} placeholder="Book, movie title..." className="mt-1 bg-background" />
            {errors.title && <p className="text-destructive text-[10px] mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="author_creator" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Author / Creator</Label>
            <Input id="author_creator" {...register('author_creator')} placeholder="Who created this?" className="mt-1 bg-background" />
          </div>
        </div>
      </div>

      {/* Category & Status Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Category *</Label>
          <Select value={currentCategory} onValueChange={v => setValue('category', v)}>
            <SelectTrigger className="mt-1 bg-background">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    {cat.isCustom ? <LayoutGrid className="w-4 h-4 text-primary/60" /> : null}
                    {cat.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-destructive text-[10px] mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status *</Label>
          <Select defaultValue={watch('status')} onValueChange={v => setValue('status', v as Status)}>
            <SelectTrigger className="mt-1 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="currently">📖 In Progress</SelectItem>
              <SelectItem value="completed">✅ Completed</SelectItem>
              <SelectItem value="want">⭐ Want to</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rest of the form (Year, Date, Rating, Review) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Release Year</Label>
          <Input id="year" type="number" className="mt-1 bg-background" {...register('year', { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="date_consumed" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Date Consumed</Label>
          <Input id="date_consumed" type="date" {...register('date_consumed')} className="mt-1 bg-background" />
        </div>
      </div>

      <div>
        <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Rating: {ratingValue ? `${ratingValue}/10` : 'No rating'}</Label>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button key={num} type="button" onClick={() => setValue('rating', ratingValue === num ? null : num)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border shadow-sm ${ratingValue && ratingValue >= num ? 'bg-primary text-primary-foreground border-primary scale-105' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
              {num}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="review" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Reflections</Label>
        <Textarea id="review" {...register('review')} placeholder="What do you remember?" className="mt-1 bg-background min-h-[100px] resize-none" />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>}
        <Button type="submit" className="flex-1 rounded-xl shadow-md" disabled={isLoading || isUploading}>
          {isUploading ? 'Uploading...' : isLoading ? 'Saving...' : entry ? 'Update' : 'Add to Journal'}
        </Button>
      </div>
    </form>
  );
}