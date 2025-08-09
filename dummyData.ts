import { SaveData, Sex, DietHistory, LifestyleActivity, ExerciseActivity, OnboardingGoal, DietPhase, TrainingExperience, TrainingFrequency, Equipment, CheckInRecord, PlanWeek, WorkoutLog, TrainingPlan, AIRecommendation, CheckInData, MenstrualCyclePhase, DailyMealLog, MealPlan, DailyCoachingTip, Meal, ReverseDietPace, ProgressPhoto } from './types';

// ===================================================================================
// USER PERSONA & GOALS
// ===================================================================================
const USER = {
    age: 32,
    sex: Sex.MALE,
    height: 180,
    startWeight: 95, // kg
    startBodyFat: 25, // %
    goal: OnboardingGoal.FAT_LOSS,
    targetBodyFat: 15,
    experience: TrainingExperience.INTERMEDIATE,
    frequency: TrainingFrequency.FOUR_DAYS,
    equipment: Equipment.FULL_GYM,
};

const onboardingData: SaveData['onboardingData'] = {
  age: USER.age,
  sex: USER.sex,
  height: USER.height,
  weight: USER.startWeight,
  bodyFat: USER.startBodyFat,
  dietHistory: DietHistory.FREQUENT,
  lifestyleActivity: LifestyleActivity.SEDENTARY,
  exerciseActivity: ExerciseActivity.INTENSE,
  currentCardioMinutes: 60,
  goal: USER.goal,
  targetBodyFat: USER.targetBodyFat,
  trainingExperience: USER.experience,
  trainingFrequency: USER.frequency,
  equipment: Equipment.FULL_GYM,
  physiqueGoal: "Look leaner and more athletic",
  cheatDaysPerWeek: 1,
  cheatDays: [6], // Saturday
};

// ===================================================================================
// TRAINING PLAN (AI Generated for Full Gym - Upper/Lower Split)
// ===================================================================================
const trainingPlan: TrainingPlan = {
    weeklySplit: "4-Day Upper/Lower Strength & Hypertrophy",
    schedule: [
      { day: 1, dayOfWeek: 'Monday', focus: 'Upper Body Strength', exercises: [
          { name: 'Barbell Bench Press', sets: 3, reps: '5-8', rest: '120s', rir: '2', isBodyweight: false },
          { name: 'Barbell Row', sets: 3, reps: '6-10', rest: '90s', rir: '2', isBodyweight: false },
          { name: 'Dumbbell Overhead Press', sets: 3, reps: '8-12', rest: '90s', rir: '1', isBodyweight: false },
          { name: 'Dumbbell Bicep Curl', sets: 3, reps: '10-15', rest: '60s', rir: '1', isBodyweight: false },
      ]},
      { day: 2, dayOfWeek: 'Tuesday', focus: 'Lower Body Strength', exercises: [
          { name: 'Barbell Back Squat', sets: 3, reps: '5-8', rest: '120s', rir: '2', isBodyweight: false },
          { name: 'Dumbbell Romanian Deadlift (RDL)', sets: 3, reps: '8-12', rest: '90s', rir: '2', isBodyweight: false },
          { name: 'Leg Press', sets: 3, reps: '8-12', rest: '90s', rir: '1', isBodyweight: false },
          { name: 'Calf Raise', sets: 4, reps: '10-15', rest: '60s', rir: '1', isBodyweight: false },
      ]},
      { day: 3, dayOfWeek: 'Wednesday', focus: 'Rest', exercises: [] },
      { day: 4, dayOfWeek: 'Thursday', focus: 'Upper Body Hypertrophy', exercises: [
          { name: 'Incline Dumbbell Press', sets: 4, reps: '10-15', rest: '75s', rir: '1', isBodyweight: false },
          { name: 'Lat Pulldown Machine', sets: 4, reps: '12-15', rest: '60s', rir: '1', isBodyweight: false },
          { name: 'Cable Lateral Raise', sets: 3, reps: '15-20', rest: '60s', rir: '1', isBodyweight: false },
          { name: 'Cable Tricep Pushdown', sets: 3, reps: '12-15', rest: '60s', rir: '1', isBodyweight: false },
      ]},
      { day: 5, dayOfWeek: 'Friday', focus: 'Lower Body Hypertrophy', exercises: [
          { name: 'Dumbbell Goblet Squat', sets: 4, reps: '10-15', rest: '75s', rir: '1', isBodyweight: false },
          { name: 'Leg Curl', sets: 4, reps: '12-15', rest: '60s', rir: '1', isBodyweight: false },
          { name: 'Dumbbell Lunge', sets: 3, reps: '10-12', rest: '60s', rir: '1', isBodyweight: false },
          { name: 'Hip Thrust', sets: 3, reps: '10-15', rest: '75s', rir: '1', isBodyweight: false },
      ]},
      { day: 6, dayOfWeek: 'Saturday', focus: 'Rest', exercises: [] },
      { day: 7, dayOfWeek: 'Sunday', focus: 'Rest', exercises: [] },
    ]
};

// ===================================================================================
// MEAL PLAN - ALIGNED WITH CALCULATED MACROS
// ===================================================================================
const fatLossMealPlan: MealPlan = {
    weeklyAverages: { calories: 1937, protein: 185, carbs: 180, fat: 53 },
    chefNotes: "This fat loss plan prioritizes high protein to preserve muscle and high fiber to keep you full. Meals are simple and designed for easy prep. Drink plenty of water and stay consistent!",
    weeklyPlan: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((dayOfWeek, i) => ({
        day: i + 1,
        dayOfWeek,
        meals: [
            {
                mealType: 'Breakfast', recipeName: 'Protein Oatmeal & Berries', calories: 481, protein: 50, carbs: 58, fat: 5,
                ingredients: ['1 cup rolled oats (80g)', '1.5 scoops vanilla whey protein', '1 cup water', '100g mixed berries', '10g crushed almonds'],
                instructions: ['Cook oats with water.', 'Stir in protein powder, then top with berries and almonds.'],
                rationale: "High protein and complex carbs for sustained energy to start the day."
            },
            {
                mealType: 'Lunch', recipeName: 'Chicken & Rice Power Bowl', calories: 541, protein: 65, carbs: 55, fat: 6,
                ingredients: ['200g grilled chicken breast', '150g cooked brown rice', '150g steamed broccoli', '1 tbsp soy sauce'],
                instructions: ['Combine all ingredients in a large bowl and enjoy warm.'],
                rationale: "Classic muscle-building meal, perfect for post-workout recovery with high protein and moderate carbs."
            },
            {
                mealType: 'Dinner', recipeName: 'Lean Beef & Sweet Potato', calories: 520, protein: 50, carbs: 45, fat: 15,
                ingredients: ['150g 96% lean ground beef', '200g sweet potato', '1 tsp olive oil', 'Mixed spices (paprika, garlic powder)'],
                instructions: ['Bake sweet potato. Pan-fry ground beef with spices and olive oil. Serve together.'],
                rationale: "Nutrient-dense dinner with high-quality protein and slow-digesting carbs. Healthy fats support hormone function."
            },
            {
                mealType: 'Snack', recipeName: 'Greek Yogurt & Nuts', calories: 395, protein: 20, carbs: 22, fat: 27,
                ingredients: ['200g 5% Fat Greek Yogurt', '30g walnuts', '1 tsp honey'],
                instructions: ['Combine all ingredients in a bowl.'],
                rationale: "A satisfying, fat-rich, and protein-rich snack to bridge meals and prevent overeating."
            }
        ],
        dailyTotals: { calories: 1937, protein: 185, carbs: 180, fat: 53 }
    }))
};

const savedRecipes: Meal[] = [ fatLossMealPlan.weeklyPlan[0].meals[2] ];

const dailyCoachingTip: DailyCoachingTip = {
    tip: "Feeling hungry? Try a large glass of water or a cup of green tea. Sometimes our bodies mistake thirst for hunger, especially in a deficit.",
    rationale: "This is relevant to your fat loss phase, where managing hunger is key to adherence."
};

// ===================================================================================
// HISTORICAL DATA SIMULATION (4 WEEKS FAT LOSS) - ALIGNED WITH CALCULATIONS
// ===================================================================================
const createCheckInHistory = (weeks: number): CheckInRecord[] => {
    let records: CheckInRecord[] = [];
    let previousWeight = USER.startWeight;
    let currentCalories = 1937;
    let currentCarbs = 180;
    let currentFat = 53;
    let currentProtein = 185;
    let currentCardio = 60;
    const currentFiber = 24;

    for (let i = 1; i <= weeks; i++) {
        let weightChange = -0.6 + (Math.random() * 0.2 - 0.1);
        let currentWeight = parseFloat((previousWeight + weightChange).toFixed(1));

        let recommendation: AIRecommendation = { action: 'HOLD', rationale: "Excellent progress, weight is dropping at the target rate. No changes needed, stay consistent!", calorieAdjustment: 0, proteinAdjustment: 0, carbAdjustment: 0, fatAdjustment: 0, cardioAdjustmentMinutes: 0 };
        
        const checkInDataForThisWeek: CheckInData = {
            dietPhase: DietPhase.FAT_LOSS,
            currentWeight,
            previousWeight,
            waist: parseFloat((90 - (i * 0.5)).toFixed(1)),
            energy: 7, hunger: 6, mood: 7, sleep: 8, strength: 8, stress: 4, motivation: 8, adherence: 9,
            targetCalories: currentCalories,
            targetProtein: currentProtein,
            targetCarbs: currentCarbs,
            targetFat: currentFat,
            targetFiber: currentFiber,
            targetCardioMinutes: currentCardio,
            offPlanMacros: { calories: 2563, protein: 153, carbs: 292, fat: 87, fiber: 32 }
        };

        if (i === 4) {
             recommendation = { action: 'DECREASE', rationale: "Weight loss has slowed slightly as expected due to metabolic adaptation. A small drop in carbs/fat and an increase in cardio should get things moving again.", calorieAdjustment: -58, proteinAdjustment: 0, carbAdjustment: -10, fatAdjustment: -2, cardioAdjustmentMinutes: 10 };
        }

        records.push({
            date: new Date(Date.now() - (weeks - i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
            checkInData: checkInDataForThisWeek,
            recommendation,
        });

        currentCalories += recommendation.calorieAdjustment;
        currentCarbs += recommendation.carbAdjustment;
        currentFat += recommendation.fatAdjustment;
        currentProtein += recommendation.proteinAdjustment;
        currentCardio += recommendation.cardioAdjustmentMinutes;
        previousWeight = checkInDataForThisWeek.currentWeight;
    }
    return records;
};

const NUM_WEEKS_HISTORY = 4;
const createdHistory = createCheckInHistory(NUM_WEEKS_HISTORY);
const finalHistory = [...createdHistory].reverse();

const lastCheckInRecord = finalHistory[0];
const lastCheckInData = lastCheckInRecord.checkInData;
const lastRecommendation = lastCheckInRecord.recommendation;

const currentCheckInData: CheckInData = {
    ...lastCheckInData,
    previousWeight: lastCheckInData.currentWeight,
    targetCalories: lastCheckInData.targetCalories + lastRecommendation.calorieAdjustment,
    targetProtein: lastCheckInData.targetProtein + lastRecommendation.proteinAdjustment,
    targetCarbs: lastCheckInData.targetCarbs + lastRecommendation.carbAdjustment,
    targetFat: lastCheckInData.targetFat + lastRecommendation.fatAdjustment,
    targetCardioMinutes: lastCheckInData.targetCardioMinutes + lastRecommendation.cardioAdjustmentMinutes,
    energy: 5, hunger: 5, mood: 5, sleep: 5, strength: 5, stress: 5, motivation: 5, adherence: 10,
};

// ===================================================================================
// WORKOUT LOGS
// ===================================================================================
const createWorkoutLogs = (): WorkoutLog[] => {
    let logs: WorkoutLog[] = [];
    const keyLifts = {
        'Barbell Back Squat': { start: 100, inc: 2.5 },
        'Barbell Bench Press': { start: 80, inc: 2.5 },
    };

    for (let i = 0; i < NUM_WEEKS_HISTORY; i++) {
        const mondayWorkout = trainingPlan.schedule[0];
        logs.push({
            logId: `log-mon-${i}`,
            workoutDay: mondayWorkout.day,
            completedAt: new Date(Date.now() - (NUM_WEEKS_HISTORY - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
            exercises: mondayWorkout.exercises.map(ex => ({
                exerciseName: ex.name,
                isBodyweight: ex.isBodyweight,
                sets: Array.from({ length: ex.sets }, (_, setIndex) => {
                    const lift = keyLifts[ex.name as keyof typeof keyLifts];
                    const weight = lift ? lift.start + i * lift.inc : 50;
                    return { set: setIndex + 1, weight: weight, reps: 6 };
                })
            }))
        });
    }
    return logs.reverse();
};

const workoutLogs = createWorkoutLogs();

const planOverview: PlanWeek[] = Array.from({ length: 16 }, (_, i) => ({
    weekNumber: i + 1,
    phase: (i + 1) % 9 === 0 ? 'Diet Break' : 'Fat Loss',
    projectedWeightKg: parseFloat((USER.startWeight - (i * 0.6)).toFixed(1)),
}));

const progressPhotos: ProgressPhoto[] = [
    {
        id: 'photo-1',
        date: new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000).toISOString(),
        weight: 95.0,
        imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAEaCAQAAACJ6wUXAAAAaUlEQVR42u3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8GYVnQABQcZ6dAAAAABJRU5ErkJggg==', // Placeholder
    },
    {
        id: 'photo-2',
        date: new Date(Date.now() - 1 * 7 * 24 * 60 * 60 * 1000).toISOString(),
        weight: 93.4,
        imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAEaCAQAAACJ6wUXAAAAaUlEQVR42u3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8GYVnQABQcZ6dAAAAABJRU5ErkJggg==', // Placeholder
    }
].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());


// ===================================================================================
// FINAL SAVE OBJECT
// ===================================================================================
export const dummySaveData: SaveData = {
  version: 2,
  isOnboarded: true,
  onboardingData,
  checkInData: currentCheckInData,
  history: finalHistory,
  planOverview: planOverview,
  planSources: null,
  readArticleIds: ['metabolic-adaptation', 'diet-breaks'],
  trainingPlan: trainingPlan,
  mealPlan: fatLossMealPlan,
  workoutLogs: workoutLogs,
  loggedMeals: [],
  dailyTip: dailyCoachingTip,
  savedRecipes: savedRecipes,
  progressPhotos: progressPhotos,
};
