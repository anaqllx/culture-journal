import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, type CulturalEntry, type NewCulturalEntry } from '@/lib/supabase';

export function useEntries() {
  return useQuery({
    queryKey: ['entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cultural_entries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CulturalEntry[];
    },
  });
}

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: NewCulturalEntry) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('cultural_entries')
        .insert({ ...entry, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as CulturalEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  });
}

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...entry }: Partial<CulturalEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('cultural_entries')
        .update(entry)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as CulturalEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cultural_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  });
}
