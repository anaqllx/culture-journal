import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = 'book' | 'movie' | 'game' | 'music';
export type Status = 'currently' | 'completed' | 'want';

export interface CulturalEntry {
  id: string;
  user_id: string;
  title: string;
  category: Category;
  status: Status;
  date_consumed: string | null;
  rating: number | null;
  reflections: string | null;
  cover_url: string | null;
  author_creator: string | null;
  year: number | null;
  created_at: string;
  updated_at: string;
}

export type NewCulturalEntry = Omit<CulturalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
