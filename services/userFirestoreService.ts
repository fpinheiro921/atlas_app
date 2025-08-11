import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { SaveData, UsageData } from '../types';
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

export const getUserUsageData = async (userId: string): Promise<UsageData> => {
    try {
        const usageDocRef = doc(db, 'users', userId, 'usage', 'main');
        const usageDocSnap = await getDoc(usageDocRef);
        if (usageDocSnap.exists()) {
            // TODO: Add logic to check and reset counts based on resetsOn date
            return usageDocSnap.data() as UsageData;
        } else {
            // Create default usage data if it doesn't exist
            const now = new Date();
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const nextWeek = new Date(now.setDate(now.getDate() + 7));

            const defaultUsage: UsageData = {
                trialStartedAt: new Date().toISOString(),
                mealPlanGenerations: { count: 0, resetsOn: nextWeek.toISOString() },
                mealPhotoLogs: { count: 0, resetsOn: nextMonth.toISOString() },
                weeklyCheckIns: { count: 0, resetsOn: nextMonth.toISOString() },
                dailyCoachingTips: { count: 0, resetsOn: nextMonth.toISOString() },
                recipeGenerations: { count: 0, resetsOn: nextMonth.toISOString() },
                shoppingListGenerations: { count: 0, resetsOn: nextMonth.toISOString() },
                monthlyReviews: { count: 0, resetsOn: nextMonth.toISOString() },
                goalTransitionPlans: { count: 0, resetsOn: nextMonth.toISOString() },
            };
            await setDoc(usageDocRef, defaultUsage);
            return defaultUsage;
        }
    } catch (error) {
        console.error("Error loading user usage data from Firestore:", error);
        throw new Error("Could not load user usage data.");
    }
};

export const updateUserUsageData = async (userId: string, data: Partial<UsageData>): Promise<void> => {
    try {
        const usageDocRef = doc(db, 'users', userId, 'usage', 'main');
        await setDoc(usageDocRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating user usage data in Firestore:", error);
        throw new Error("Could not update user usage data.");
    }
};
