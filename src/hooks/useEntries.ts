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
  updateDoc,
  orderBy 
} from 'firebase/firestore';
import { Entry } from '@/types/content';

// 1. Отримання всіх записів користувача
export function useEntries() {
  return useQuery({
    // Ключ залежить від UID, щоб дані не "перемішувалися" при зміні акаунта
    queryKey: ['entries', auth.currentUser?.uid], 
    queryFn: async () => {
      const user = auth.currentUser;
      if (!user) return [];

      const q = query(
        collection(db, 'entries'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Entry[];
    },
    enabled: !!auth.currentUser, // Запит не піде, поки немає юзера
  });
}

// 2. Додавання нового запису
export function useAddEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEntry: Omit<Entry, 'id' | 'user_id' | 'created_at'>) => {
      const user = auth.currentUser;
      if (!user) throw new Error('Користувач не авторизований');

      const docRef = await addDoc(collection(db, 'entries'), {
        ...newEntry,
        user_id: user.uid,
        created_at: new Date().toISOString(),
      });

      return { id: docRef.id, ...newEntry };
    },
    onSuccess: () => {
      // Оновлюємо кеш, щоб нова картка з'явилася миттєво
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

// 4. Оновлення запису
export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Entry> & { id: string }) => {
      const docRef = doc(db, 'entries', id);
      await updateDoc(docRef, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
  });
}