import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ImageIcon, Loader2, X } from 'lucide-react';

import { useAddEntry, useUpdateEntry } from '@/hooks/useEntries';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Entry } from '@/types/content';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const currentYear = new Date().getFullYear();
const today = new Date().toISOString().split('T')[0];

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.string(),
  author_creator: z.string().optional(),
  year: z.number()
    .min(0, 'Year must be a positive number') // Забороняємо мінусові значення
    .nullable()
    .optional()
    .refine((val) => val === null || val === undefined || val <= currentYear, {
      message: "Year cannot be in the future",
    }),
  date_consumed: z.string()
    .optional()
    .nullable()
    .refine((val) => !val || val <= today, {
      message: "Date cannot be in the future",
    }),
  rating: z.number().min(0).max(10).nullable().optional(),
  review: z.string().optional().nullable(),
  image_url: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EntryForm({ entry, onSuccess, onCancel }: { entry?: Entry, onSuccess?: () => void, onCancel?: () => void }) {
  const { toast } = useToast();
  const addEntry = useAddEntry();
  const updateEntry = useUpdateEntry();

  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState(entry?.image_url || '');
  const [categories, setCategories] = useState<{ id: string, label: string }[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: entry?.title || '',
      category: entry?.category || 'book',
      status: entry?.status || 'completed',
      author_creator: entry?.author_creator || '',
      year: entry?.year || null,
      date_consumed: entry?.date_consumed || '',
      rating: entry?.rating || null,
      review: entry?.review || '',
      image_url: entry?.image_url || '',
    },
  });

  const currentRating = watch('rating');
  const currentCategory = watch('category');

  useEffect(() => {
    const fetchCategories = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const q = query(collection(db, "categories"), where("user_id", "==", user.uid));
        const snap = await getDocs(q);
        const customCats = snap.docs.map(doc => ({ id: doc.id, label: doc.data().name }));
        const defaultCats = [
          { id: 'book', label: 'Book' },
          { id: 'movie', label: 'Movie / Series' },
          { id: 'game', label: 'Game' },
          { id: 'music', label: 'Music' }
        ];
        setCategories([...defaultCats, ...customCats]);
      } catch (err) { console.error("Failed to fetch categories"); }
    };
    fetchCategories();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadToCloudinary(file);
      setValue('image_url', uploadedUrl, { shouldDirty: true });
      setLocalPreview(uploadedUrl);
      toast({ title: "Image uploaded successfully" });
    } catch (err) {
      setLocalPreview(entry?.image_url || '');
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const onFormSubmit = async (data: FormData) => {
    if (isUploading) return;
    const payload = { ...data, date_consumed: data.date_consumed || null, updated_at: new Date().toISOString() };
    try {
      if (entry?.id) await updateEntry.mutateAsync({ id: entry.id, ...payload } as any);
      else await addEntry.mutateAsync(payload as any);
      onSuccess?.();
    } catch (err: any) {
      toast({ title: "Error saving entry", description: err.message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 text-left p-1">
      <div className="flex gap-4 items-start">
        <div className="relative group">
          <div className="w-28 h-40 rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50">
            {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : localPreview ? <img src={localPreview} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-muted-foreground/30" />}
            {!isUploading && localPreview && (
              <button type="button" onClick={() => { setValue('image_url', ''); setLocalPreview(''); }} className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
            )}
          </div>
          <label className="mt-2 block">
            <span className="text-[10px] uppercase font-bold text-center block cursor-pointer bg-secondary py-1 rounded-md hover:bg-secondary/80">{isUploading ? "Wait..." : "Add cover"}</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
          </label>
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Title *</Label>
            <Input {...register('title')} className="mt-1 font-medium" placeholder="What did you consume?" />
            {errors.title && <p className="text-[10px] text-destructive mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Author / Creator</Label>
            <Input {...register('author_creator')} className="mt-1" placeholder="Artist, writer, director..." />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Category</Label>
          <Select value={currentCategory} onValueChange={(v) => setValue('category', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>{categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Status</Label>
          <Select value={watch('status')} onValueChange={(v) => setValue('status', v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="currently">Currently</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="want">Planned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Release Year</Label>
          <Input 
            type="number" 
            max={currentYear}
            /* Прибираємо стрілочки */
            className="mt-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            {...register('year', { valueAsNumber: true })} 
            placeholder="YYYY"
          />
          {errors.year && <p className="text-[10px] text-destructive mt-1">{errors.year.message}</p>}
        </div>
        <div>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Date Finished</Label>
          <Input type="date" max={today} className="mt-1" {...register('date_consumed')} />
          {errors.date_consumed && <p className="text-[10px] text-destructive mt-1">{errors.date_consumed.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Rating: {currentRating || '?'}/10</Label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setValue('rating', currentRating === num ? null : num)}
              /* Змінено rounded-2xl для більш круглої форми та колір тексту */
              className={`flex-1 h-10 rounded-2xl text-[10px] font-bold border transition-all ${
                currentRating && currentRating >= num 
                ? 'bg-[#E6DED1] border-[#E6DED1] text-slate-900' /* Текст стає темним */
                : 'bg-background border-input text-muted-foreground'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-[10px] uppercase font-bold text-muted-foreground">My Reflections</Label>
        <Textarea {...register('review')} className="mt-1 min-h-[80px] text-sm resize-none" placeholder="What did you feel?" />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>}
        <Button type="submit" className="flex-1 rounded-xl bg-primary hover:bg-primary/90" disabled={isUploading || isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {entry ? "Update Entry" : "Save Entry"}
        </Button>
      </div>
    </form>
  );
}