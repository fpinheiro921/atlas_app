import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { OnboardingData, CheckInData, DailyMacros, SaveData } from '../types';
import { Sex, DietHistory, DietPhase, OnboardingGoal, ReverseDietPace } from '../types';
import { APP_VERSION } from '../App';

export const saveUserData = async (userId: string, data: SaveData): Promise<void> => {
  try {
    // Validate the user ID
    if (!userId?.trim()) {
      throw new Error("Invalid user ID");
    }

    // Create a sanitized copy of the data
    const sanitizedData = {
      ...data,
      trialStartDate: data.trialStartDate || new Date().toISOString(),
      version: APP_VERSION
    };

    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, sanitizedData, { merge: true });
  } catch (error) {
    console.error("Error saving user data to Firestore: ", error);
    throw new Error("Could not save your data. Please try again.");
  }
};

export const loadUserData = async (userId: string): Promise<SaveData | null> => {
  try {
    // Validate the user ID
    if (!userId?.trim()) {
      throw new Error("Invalid user ID");
    }

    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as SaveData;
      
      // Validate the data structure
      if (!data || typeof data !== 'object') {
        console.error("Invalid data structure in Firestore");
        return null;
      }

      // Add missing fields with default values
      const normalizedData: SaveData = {
        version: data.version || 1,
        isOnboarded: data.isOnboarded || false,
        onboardingData: data.onboardingData || null,
        checkInData: data.checkInData || null,
        history: data.history || [],
        planOverview: data.planOverview || null,
        planSources: data.planSources || null,
        readArticleIds: data.readArticleIds || [],
        trainingPlan: data.trainingPlan || null,
        workoutLogs: data.workoutLogs || [],
        loggedMeals: data.loggedMeals || [],
        mealPlan: data.mealPlan || null,
        dailyTip: data.dailyTip || null,
        savedRecipes: data.savedRecipes || [],
        progressPhotos: data.progressPhotos || [],
        trialStartDate: data.trialStartDate || new Date().toISOString()
      };

      return normalizedData;
    }
    return null;
  } catch (error) {
    console.error("Error loading user data from Firestore: ", error);
    throw new Error("Could not load your data. Please try again.");
  }
};

/**
 * Determines the protein intake multiplier based on age and deficit status,
 * according to the guidelines in "The Complete Reverse Dieting Guide" (Table 6.1).
 */
const getProteinMultiplier = (age: number, inDeficit: boolean): number => {
  const ranges = inDeficit
    ? { '0-30': 2.3, '31-40': 2.6, '41-50': 2.95, '51-60': 3.3, '61-99': 3.65 } // Midpoints of deficit ranges
    : { '0-30': 1.9, '31-40': 2.15, '41-50': 2.45, '51-60': 2.75, '61-99': 3.05 }; // Midpoints of non-deficit ranges

  if (age <= 30) return ranges['0-30'];
  if (age <= 40) return ranges['31-40'];
  if (age <= 50) return ranges['41-50'];
  if (age <= 60) return ranges['51-60'];
  return ranges['61-99'];
};

const calculateMacrosFromCalories = (totalCalories: number, lbm: number, proteinMultiplier: number): DailyMacros => {
    const targetProtein = Math.round(lbm * proteinMultiplier);
    const caloriesFromProtein = targetProtein * 4;
    const remainingCalories = totalCalories - caloriesFromProtein;
    
    const caloriesFromCarbs = Math.round(remainingCalories * 0.6);
    const targetCarbs = Math.round(caloriesFromCarbs / 4);
    const targetFat = Math.round((remainingCalories - caloriesFromCarbs) / 9);
    
    const finalTargetCalories = caloriesFromProtein + (targetCarbs * 4) + (targetFat * 9);
    const targetFiber = Math.round((finalTargetCalories / 1000) * 12.5);

    return {
        calories: finalTargetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
        fiber: targetFiber,
    };
}


/**
 * Calculates a user's initial coaching plan based on their onboarding data.
 * This function now uses the Müller Equation for BMR, applies metabolic
 * reduction factors, and sets goals based on user's chosen path.
 */
export const calculateInitialPlan = (data: OnboardingData): CheckInData => {
  const { age, sex, height, weight, bodyFat, dietHistory, lifestyleActivity, exerciseActivity, currentCardioMinutes, goal, pace, targetBodyFat, cheatDaysPerWeek } = data;

  const fatMassKg = weight * (bodyFat / 100);
  const leanBodyMassKg = weight - fatMassKg;

  // 1. Calculate BMR using the Müller Equation
  const sexValue = sex === Sex.MALE ? 1 : 0;
  const bmr = (13.587 * leanBodyMassKg) + (9.613 * fatMassKg) + (198 * sexValue) - (3.351 * age) + 674;

  // 2. Apply metabolic reduction factor based on dieting history
  let metabolicReductionFactor = 0;
  switch (data.dietHistory) {
    case DietHistory.CHRONIC: metabolicReductionFactor = 0.15; break;
    case DietHistory.FREQUENT: metabolicReductionFactor = 0.10; break;
    case DietHistory.INFREQUENT: metabolicReductionFactor = 0.05; break;
    default: metabolicReductionFactor = 0; break;
  }
  const adjustedBmr = bmr * (1 - metabolicReductionFactor);
  
  // 3. Calculate dynamic TDEE multiplier
  const activityFactor = Number(lifestyleActivity) + Number(exerciseActivity);
  const tdee = adjustedBmr * activityFactor;

  let onPlanCalories = 0;
  let dietPhase: DietPhase;
  let inDeficit = false;

  // 4. Set initial calories based on goal
  switch(goal) {
    case OnboardingGoal.FAT_LOSS:
        dietPhase = DietPhase.FAT_LOSS;
        let dailyDeficit = 0;
        if (targetBodyFat) {
            // Precise deficit for 0.6% weekly loss
            const targetWeeklyLossKg = weight * 0.006;
            // From book: ~930 kcal/kg deficit for normal BF, HP diet, RT
            dailyDeficit = (targetWeeklyLossKg * 930);
        } else {
            dailyDeficit = tdee * 0.20; // Fallback to 20% deficit
        }
        
        const numCheatDays = cheatDaysPerWeek || 0;
        const numDietDays = 7 - numCheatDays;

        if (numDietDays > 0 && numDietDays < 7) {
            // The total weekly deficit needs to be spread over the diet days.
            // Assumes cheat days are eaten at maintenance (TDEE).
            const totalWeeklyDeficit = dailyDeficit * 7;
            const adjustedDailyDeficit = totalWeeklyDeficit / numDietDays;
            onPlanCalories = tdee - adjustedDailyDeficit;
        } else {
            // If all days are diet days, or all days are cheat days.
            onPlanCalories = tdee - dailyDeficit;
        }

        inDeficit = true;
        break;
    case OnboardingGoal.REVERSE_DIETING:
        dietPhase = DietPhase.REVERSE_DIETING;
        switch (pace) {
            case ReverseDietPace.MODERATE: onPlanCalories = tdee * 1.15; break; // Maintenance + 15%
            case ReverseDietPace.AGGRESSIVE: onPlanCalories = tdee * 1.25; break; // Maintenance + 25%
            case ReverseDietPace.CONSERVATIVE:
            default: onPlanCalories = tdee * 1.05; break; // Maintenance + 5%
        }
        break;
    case OnboardingGoal.LEAN_GAINING:
        dietPhase = DietPhase.LEAN_GAINING;
        onPlanCalories = tdee * 1.10; // Start with a modest 10% surplus
        break;
    case OnboardingGoal.MAINTENANCE:
    default:
        dietPhase = DietPhase.MAINTENANCE;
        onPlanCalories = tdee;
        break;
  }
  
  // 5. Calculate Macros for on-plan and off-plan days
  const onPlanProteinMultiplier = getProteinMultiplier(age, inDeficit);
  const onPlanMacros = calculateMacrosFromCalories(onPlanCalories, leanBodyMassKg, onPlanProteinMultiplier);

  let offPlanMacros: DailyMacros | undefined = undefined;
  if (cheatDaysPerWeek > 0) {
      const offPlanProteinMultiplier = getProteinMultiplier(age, false); // Not in deficit on these days
      offPlanMacros = calculateMacrosFromCalories(tdee, leanBodyMassKg, offPlanProteinMultiplier);
  }


  const initialPlan: CheckInData = {
    dietPhase,
    dietPace: pace,
    previousWeight: weight,
    currentWeight: weight,
    currentBodyFat: bodyFat,
    energy: 5,
    hunger: 5,
    mood: 5,
    sleep: 5,
    strength: 5,
    stress: 5,
    motivation: 5,
    adherence: 10,
    targetCalories: onPlanMacros.calories,
    targetProtein: onPlanMacros.protein,
    targetCarbs: onPlanMacros.carbs,
    targetFat: onPlanMacros.fat,
    targetFiber: onPlanMacros.fiber,
    targetCardioMinutes: currentCardioMinutes || 0,
    offPlanMacros: offPlanMacros,
    isDietBreak: false,
  };

  return initialPlan;
};

/**
 * Calculates a user's diet break plan based on their current status.
 * This sets calories to estimated maintenance to support metabolic recovery.
 */
export const calculateDietBreakPlan = (currentCheckInData: CheckInData, onboardingData: OnboardingData): CheckInData => {
  const { age, sex, height, bodyFat, dietHistory, lifestyleActivity, exerciseActivity } = onboardingData;
  const { currentWeight } = currentCheckInData;

  // Re-calculate TDEE with the latest weight but original BF% as a proxy.
  const fatMassKg = currentWeight * (bodyFat / 100);
  const leanBodyMassKg = currentWeight - fatMassKg;

  // 1. Calculate BMR using the Müller Equation
  const sexValue = sex === Sex.MALE ? 1 : 0;
  const bmr = (13.587 * leanBodyMassKg) + (9.613 * fatMassKg) + (198 * sexValue) - (3.351 * age) + 674;

  // 2. Apply metabolic reduction factor from original onboarding.
  let metabolicReductionFactor = 0;
  switch (dietHistory) {
    case DietHistory.CHRONIC: metabolicReductionFactor = 0.15; break;
    case DietHistory.FREQUENT: metabolicReductionFactor = 0.10; break;
    case DietHistory.INFREQUENT: metabolicReductionFactor = 0.05; break;
    default: metabolicReductionFactor = 0; break;
  }
  const adjustedBmr = bmr * (1 - metabolicReductionFactor);
  
  // 3. Calculate dynamic TDEE multiplier
  const activityFactor = Number(lifestyleActivity) + Number(exerciseActivity);
  const tdee = adjustedBmr * activityFactor;

  // 4. Set calories to maintenance (TDEE)
  const maintenanceCalories = tdee;
  
  // 5. Calculate Macros for maintenance
  const proteinMultiplier = getProteinMultiplier(age, false); // false = Not in deficit
  const maintenanceMacros = calculateMacrosFromCalories(maintenanceCalories, leanBodyMassKg, proteinMultiplier);

  const dietBreakPlan: CheckInData = {
    ...currentCheckInData,
    isDietBreak: true,
    targetCalories: maintenanceMacros.calories,
    targetProtein: maintenanceMacros.protein,
    targetCarbs: maintenanceMacros.carbs,
    targetFat: maintenanceMacros.fat,
    targetFiber: maintenanceMacros.fiber,
    targetCardioMinutes: 0, // Typically cardio is dropped during a diet break.
    offPlanMacros: undefined, // No 'off-plan' days during a structured diet break week.
  };

  return dietBreakPlan;
};
