import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { SaveData } from '../types';
import { isSaveData } from '../types';

export const saveUserDataToFirestore = async (userId: string, data: Omit<SaveData, 'version'>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    // Add a timestamp for the last save
    const dataToSave = { ...data, lastSaved: new Date() };
    await setDoc(userDocRef, dataToSave, { merge: true });
  } catch (error) {
    console.error("Error saving user data to Firestore:", error);
    throw new Error("Could not save user data.");
  }
};

export const loadUserDataFromFirestore = async (userId: string): Promise<SaveData | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      // Validate the data structure before returning
      if (isSaveData(data)) {
        return data as SaveData;
      }
      console.warn("Firestore data is invalid:", data);
      return null;
    } else {
      return null; // New user
    }
  } catch (error) {
    console.error("Error loading user data from Firestore:", error);
    throw new Error("Could not load user data.");
  }
};
