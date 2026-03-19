import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { Entry } from '@/types/content';

// 1. Отримання всіх записів користувача
export function useEntries() {
  return useQuery({
    queryKey: ['entries', auth.currentUser?.uid], // Ключ залежить від юзера
    queryFn: async () => {
      const user = auth.currentUser;
      if (!user) return [];

      console.log("Запит власних даних для:", user.uid);

      const q = query(
        collection(db, 'entries'),
        where('user_id', '==', user.uid), // Фільтр: тільки моє
        orderBy('created_at', 'desc')    // Сортування: нові зверху
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Entry[];
    },
    enabled: !!auth.currentUser, // Не робити запит, поки юзер не залогінився
  });
}

// 2. Додавання нового запису (книги, гри тощо)
export function useAddEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEntry: Omit<Entry, 'id' | 'user_id' | 'created_at'>) => {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const docRef = await addDoc(collection(db, 'entries'), {
        ...newEntry,
        user_id: user.uid,
        created_at: new Date().toISOString(), // або serverTimestamp()
      });

      return docRef.id;
    },
    onSuccess: () => {
      // Оновлюємо список у бібліотеці автоматично
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
  });
}

// 3. Видалення запису
export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      await deleteDoc(doc(db, 'entries', entryId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Entry> & { id: string }) => {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'entries', id), updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
  });
}