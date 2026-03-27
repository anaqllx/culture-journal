export type Category = 'book' | 'movie' | 'game' | 'music' | string;
export type Status = 'currently' | 'completed' | 'want';

export interface Entry {
  id: string;
  user_id: string;
  title: string;
  category: Category;
  status: Status;
  created_at: string;
  date_consumed?: string | null;
  rating?: number | null;
  review?: string | null;
  author_creator?: string | null;
  year?: number | null;
  image_url?: string | null;
}