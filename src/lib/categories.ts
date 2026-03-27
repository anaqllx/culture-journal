import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc, 
  deleteDoc 
} from "firebase/firestore";

export interface CategorySchema {
  id?: string;
  user_id: string;
  name: string;
  settings: {
    rating: boolean;
    comments: boolean;
    status: boolean;
  };
  createdAt: any;
}

// Створення нової категорії
export const createCategory = async (category: Omit<CategorySchema, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "categories"), category);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// Оновлення існуючої категорії
export const updateCategory = async (id: string, data: Partial<CategorySchema>) => {
  try {
    const docRef = doc(db, "categories", id);
    await updateDoc(docRef, data);
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
};

// Отримання даних однієї категорії за її ID
export const getCategory = async (id: string) => {
  try {
    const docRef = doc(db, "categories", id);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } as CategorySchema : null;
  } catch (e) {
    console.error("Error getting document: ", e);
    throw e;
  }
};

// Видалення категорії
export const deleteCategory = async (id: string) => {
  try {
    const docRef = doc(db, "categories", id);
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};