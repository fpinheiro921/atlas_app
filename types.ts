

export enum UnitSystem {
  ORIGINAL = 'Original',
  METRIC = 'Grams',
  IMPERIAL = 'Pounds',
  VOLUME = 'Spoons',
}

export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
}

export enum DietHistory {
  NONE = 'none',
  INFREQUENT = 'infrequent', // Dieted <1/3 of the last year
  FREQUENT = 'frequent',   // Dieted 1/3 to 2/3 of the last year
  CHRONIC = 'chrexport interface SaveData {
    version?: number;
    isOnboarded: boolean;
    onboardingData: OnboardingData | null;
    checkInData: CheckInData | null;
    history: CheckInRecord[];
    planOverview: PlanWeek[] | null;
    planSources: GroundingSource[] | null;
    readArticleIds: string[];
    trainingPlan: TrainingPlan | null;
    workoutLogs: WorkoutLog[];
    loggedMeals: DailyMealLog[];
    mealPlan: MealPlan | null;
    dailyTip: DailyCoachingTip | null;
    savedRecipes: Meal[];
    progressPhotos: ProgressPhoto[];
    trialStartDate?: string; // ISO string date when the trial started
}ted >2/3 of the last year
}

export enum OnboardingGoal {
  FAT_LOSS = 'Fat Loss',
  REVERSE_DIETING = 'Reverse Dieting',
  LEAN_GAINING = 'Lean Gaining',
  MAINTENANCE = 'Maintenance',
}

export enum ReverseDietPace {
  CONSERVATIVE = 'Conservative',
  MODERATE = 'Moderate',
  AGGRESSIVE = 'Aggressive',
}

export enum LifestyleActivity {
    SEDENTARY = 0.6,
    LIGHT = 0.7,
    MODERATE = 0.8,
    HIGH = 0.9,
    EXTREME = 1.0
}

export enum ExerciseActivity {
    SEDENTARY = 0.55,
    LIGHT = 0.65,
    MODERATE = 0.75,
    INTENSE = 0.85,
    EXTREME = 0.95
}

export enum TrainingExperience {
    BEGINNER = 'Beginner',
    INTERMEDIATE = 'Intermediate',
    ADVANCED = 'Advanced'
}

export enum TrainingFrequency {
    THREE_DAYS = '3 days/week',
    FOUR_DAYS = '4 days/week',
    FIVE_DAYS = '5 days/week'
}

export enum Equipment {
    FULL_GYM = 'Full Gym',
    HOME_GYM = 'Home Gym (Dumbbells/Bands)',
    BODYWEIGHT = 'Bodyweight Only'
}


export interface OnboardingData {
  age: number;
  sex: Sex;
  height: number;
  weight: number;
  bodyFat: number;
  dietHistory: DietHistory;
  lifestyleActivity: LifestyleActivity;
  exerciseActivity: ExerciseActivity;
  currentCardioMinutes: number;
  goal: OnboardingGoal;
  pace?: ReverseDietPace;
  targetBodyFat?: number;
  trainingExperience: TrainingExperience;
  trainingFrequency: TrainingFrequency;
  equipment: Equipment;
  physiqueGoal?: string;
  cheatDaysPerWeek: number;
  cheatDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export enum DietPhase {
  FAT_LOSS = 'Fat Loss',
  REVERSE_DIETING = 'Reverse Dieting',
  MAINTENANCE = 'Maintenance',
  LEAN_GAINING = 'Lean Gaining',
}

export enum MenstrualCyclePhase {
  NOT_APPLICABLE = 'not_applicable',
  MENSTRUATING = 'menstruating',
  FOLLICULAR = 'follicular',
  LUTEAL = 'luteal',
}

export interface DailyMacros {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
}

export interface CheckInData {
  dietPhase: DietPhase;
  dietPace?: ReverseDietPace;
  currentWeight: number;
  previousWeight: number;
  currentBodyFat?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  thighs?: number;
  arms?: number;
  energy: number;
  hunger: number;
  mood: number;
  sleep: number;
  strength: number;
  stress: number;
  motivation: number;
  adherence: number;
  averageDailySteps?: number;
  menstrualCyclePhase?: MenstrualCyclePhase;
  notes?: string;
  physiquePhoto?: string; // For transient use during AI analysis
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
  targetCardioMinutes: number;
  offPlanMacros?: DailyMacros;
  actualCardioMinutes?: number;
  isDietBreak?: boolean;
}

export interface AIRecommendation {
  rationale: string;
  action: 'INCREASE' | 'HOLD' | 'DECREASE' | 'SUGGEST_BREAK';
  calorieAdjustment: number;
  proteinAdjustment: number;
  carbAdjustment: number;
  fatAdjustment: number;
  cardioAdjustmentMinutes: number;
  recommendedArticleId?: string | null;
  recommendedSupplementId?: string | null;
  updatedTrainingPlan?: TrainingPlan | null;
  updatedDietPhase?: DietPhase;
}

export interface CheckInRecord {
    date: string;
    checkInData: CheckInData;
    recommendation: AIRecommendation;
}

export interface PlanWeek {
    weekNumber: number;
    phase: 'Fat Loss' | 'Diet Break';
    projectedWeightKg: number;
}

export interface Article {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string; 
}

export interface Supplement {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string; 
}

export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    rest: string;
    rir: string; // Reps in Reserve
    isBodyweight: boolean;
}

export interface WorkoutDay {
    day: number;
    dayOfWeek: string;
    focus: string;
    exercises: Exercise[];
}

export interface TrainingPlan {
    weeklySplit: string;
    schedule: WorkoutDay[];
}

// New types for workout logging
export interface SetLog {
    set: number;
    weight: number; // For bodyweight, this can be added weight. 0 if none.
    reps: number;
    e1rm?: number; // Optional e1rm for analysis
}

export interface ExerciseLog {
    exerciseName: string;
    isBodyweight: boolean;
    sets: SetLog[];
}

export interface WorkoutLog {
    logId: string; // e.g., new Date().toISOString()
    workoutDay: number;
    completedAt: string;
    exercises: ExerciseLog[];
}

export interface GroundingSource {
    web: {
        uri: string;
        title: string;
    };
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    timestamp: number;
}

export interface MealAnalysis {
    mealName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    rationale: string;
}

export interface DailyMealLog {
    date: string; // YYYY-MM-DD
    meals: MealAnalysis[];
}

// Updated types for AI Meal Planner to support a weekly structure
export interface Meal {
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    recipeName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
    instructions: string[];
    rationale: string;
}

export interface DailyMealPlan {
    day: number; // 1-7
    dayOfWeek: string;
    meals: Meal[];
    dailyTotals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

export interface MealPlan {
    weeklyPlan: DailyMealPlan[];
    weeklyAverages: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    chefNotes: string;
}


// New types for Shopping List
export interface ShoppingListItem {
    item: string;
    quantity: string;
    notes?: string;
}

export interface ShoppingList {
    Produce: ShoppingListItem[];
    'Meat & Seafood': ShoppingListItem[];
    'Dairy & Eggs': ShoppingListItem[];
    Pantry: ShoppingListItem[];
    'Spices & Oils': ShoppingListItem[];
    Other: ShoppingListItem[];
}

// New type for Daily Coaching Tip
export interface DailyCoachingTip {
    tip: string;
    rationale: string;
}

// New type for Monthly Review
export interface MonthlyReviewReport {
    title: string;
    summary: string;
    successes: string[];
    challenges: string[];
    strategicFocus: string;
}

// New type for Progress Photos
export interface ProgressPhoto {
    id: string;
    date: string;
    weight: number;
    imageDataUrl: string;
}

// New Types for Workout Performance Review
export interface ExercisePerformance {
  exerciseName: string;
  status: 'PR' | 'PROGRESSION' | 'MAINTAINED' | 'REGRESSION' | 'FIRST_TIME';
  todayBestSet: SetLog;
  previousBestSet: SetLog | null;
  e1rm: number;
  previousE1rm: number | null;
}

export interface PerformanceAnalysis {
  summary: {
    newPRs: number;
    progressions: number;
    maintenances: number;
  };
  exerciseAnalyses: ExercisePerformance[];
}

export interface GoalTransitionPlan {
    rationale: string;
    newTargetCalories: number;
    newTargetProtein: number;
    newTargetCarbs: number;
    newTargetFat: number;
    newTargetFiber: number;
    newTargetCardioMinutes: number;
    updatedDietPhase: DietPhase;
}

export interface SaveData {
    version?: number; // Added for future migrations
    isOnboarded: boolean;
    onboardingData: OnboardingData | null;
    checkInData: CheckInData | null;
    history: CheckInRecord[];
    planOverview: PlanWeek[] | null;
    planSources: GroundingSource[] | null;
    readArticleIds: string[];
    trainingPlan: TrainingPlan | null;
    workoutLogs: WorkoutLog[];
    loggedMeals: DailyMealLog[];
    mealPlan: MealPlan | null;
    dailyTip: DailyCoachingTip | null;
    savedRecipes?: Meal[];
    progressPhotos?: ProgressPhoto[];
    trialStartDate?: string; // ISO string date when the trial started
}


export type AppStatus = 'idle' | 'loading' | 'success' | 'error';
export type AppView = 'landing' | 'onboarding' | 'dashboard' | 'checkingIn' | 'progress' | 'mealPlan' | 'recipes' | 'trialExpired';


// New Type Guards for Logging
export const isSetLog = (obj: any): obj is SetLog => {
    return obj && typeof obj.set === 'number' && typeof obj.weight === 'number' && typeof obj.reps === 'number';
}
export const isExerciseLog = (obj: any): obj is ExerciseLog => {
    return obj && typeof obj.exerciseName === 'string' && typeof obj.isBodyweight === 'boolean' && Array.isArray(obj.sets) && obj.sets.every(isSetLog);
}
export const isWorkoutLog = (obj: any): obj is WorkoutLog => {
    return obj && typeof obj.logId === 'string' && typeof obj.workoutDay === 'number' && typeof obj.completedAt === 'string' && Array.isArray(obj.exercises) && obj.exercises.every(isExerciseLog);
}

export const isExercise = (obj: any): obj is Exercise => {
    return (
        obj &&
        typeof obj.name === 'string' &&
        typeof obj.sets === 'number' &&
        typeof obj.reps === 'string' &&
        typeof obj.rest === 'string' &&
        typeof obj.rir === 'string' &&
        typeof obj.isBodyweight === 'boolean'
    );
};

export const isWorkoutDay = (obj: any): obj is WorkoutDay => {
    return (
        obj &&
        typeof obj.day === 'number' &&
        typeof obj.dayOfWeek === 'string' &&
        typeof obj.focus === 'string' &&
        Array.isArray(obj.exercises) && obj.exercises.every(isExercise)
    );
};

export const isTrainingPlan = (obj: any): obj is TrainingPlan => {
    return (
        obj &&
        typeof obj.weeklySplit === 'string' &&
        Array.isArray(obj.schedule) && obj.schedule.every(isWorkoutDay)
    );
};


export const isOnboardingData = (obj: any): obj is OnboardingData => {
    return (
        obj &&
        typeof obj.age === 'number' &&
        typeof obj.sex === 'string' &&
        Object.values(Sex).includes(obj.sex as Sex) &&
        typeof obj.height === 'number' &&
        typeof obj.weight === 'number' &&
        typeof obj.bodyFat === 'number' &&
        typeof obj.dietHistory === 'string' &&
        Object.values(DietHistory).includes(obj.dietHistory as DietHistory) &&
        typeof obj.lifestyleActivity === 'number' &&
        typeof obj.exerciseActivity === 'number' &&
        typeof obj.currentCardioMinutes === 'number' &&
        typeof obj.goal === 'string' &&
        Object.values(OnboardingGoal).includes(obj.goal as OnboardingGoal) &&
        (obj.pace === undefined || (typeof obj.pace === 'string' && Object.values(ReverseDietPace).includes(obj.pace as ReverseDietPace))) &&
        (obj.targetBodyFat === undefined || typeof obj.targetBodyFat === 'number') &&
        typeof obj.trainingExperience === 'string' && Object.values(TrainingExperience).includes(obj.trainingExperience as TrainingExperience) &&
        typeof obj.trainingFrequency === 'string' && Object.values(TrainingFrequency).includes(obj.trainingFrequency as TrainingFrequency) &&
        typeof obj.equipment === 'string' && Object.values(Equipment).includes(obj.equipment as Equipment) &&
        typeof obj.cheatDaysPerWeek === 'number' &&
        (obj.cheatDays === undefined || (Array.isArray(obj.cheatDays) && obj.cheatDays.every((d: any) => typeof d === 'number'))) &&
        (obj.physiqueGoal === undefined || typeof obj.physiqueGoal === 'string')
    );
};

export const isDailyMacros = (obj: any): obj is DailyMacros => {
    return obj &&
        typeof obj.calories === 'number' &&
        typeof obj.protein === 'number' &&
        typeof obj.carbs === 'number' &&
        typeof obj.fat === 'number' &&
        typeof obj.fiber === 'number';
};

export const isCheckInData = (obj: any): obj is CheckInData => {
    return (
        obj &&
        typeof obj.dietPhase === 'string' &&
        Object.values(DietPhase).includes(obj.dietPhase as DietPhase) &&
        (obj.dietPace === undefined || (typeof obj.dietPace === 'string' && Object.values(ReverseDietPace).includes(obj.dietPace as ReverseDietPace))) &&
        typeof obj.currentWeight === 'number' &&
        typeof obj.previousWeight === 'number' &&
        (obj.currentBodyFat === undefined || typeof obj.currentBodyFat === 'number') &&
        (obj.waist === undefined || typeof obj.waist === 'number') &&
        (obj.hips === undefined || typeof obj.hips === 'number') &&
        (obj.chest === undefined || typeof obj.chest === 'number') &&
        (obj.thighs === undefined || typeof obj.thighs === 'number') &&
        (obj.arms === undefined || typeof obj.arms === 'number') &&
        typeof obj.energy === 'number' &&
        typeof obj.hunger === 'number' &&
        typeof obj.mood === 'number' &&
        typeof obj.sleep === 'number' &&
        typeof obj.strength === 'number' &&
        typeof obj.stress === 'number' &&
        typeof obj.motivation === 'number' &&
        typeof obj.adherence === 'number' &&
        (obj.averageDailySteps === undefined || typeof obj.averageDailySteps === 'number') &&
        (obj.menstrualCyclePhase === undefined || (typeof obj.menstrualCyclePhase === 'string' && Object.values(MenstrualCyclePhase).includes(obj.menstrualCyclePhase as MenstrualCyclePhase))) &&
        (obj.notes === undefined || typeof obj.notes === 'string') &&
        (obj.physiquePhoto === undefined || typeof obj.physiquePhoto === 'string') &&
        typeof obj.targetCalories === 'number' &&
        typeof obj.targetProtein === 'number' &&
        typeof obj.targetCarbs === 'number' &&
        typeof obj.targetFat === 'number' &&
        typeof obj.targetFiber === 'number' &&
        typeof obj.targetCardioMinutes === 'number' &&
        (obj.offPlanMacros === undefined || isDailyMacros(obj.offPlanMacros)) &&
        (obj.actualCardioMinutes === undefined || typeof obj.actualCardioMinutes === 'number') &&
        (obj.isDietBreak === undefined || typeof obj.isDietBreak === 'boolean')
    );
};

export const isAIRecommendation = (obj: any): obj is AIRecommendation => {
    return (
        obj &&
        typeof obj.rationale === 'string' &&
        typeof obj.action === 'string' &&
        ['INCREASE', 'HOLD', 'DECREASE', 'SUGGEST_BREAK'].includes(obj.action) &&
        typeof obj.calorieAdjustment === 'number' &&
        typeof obj.proteinAdjustment === 'number' &&
        typeof obj.carbAdjustment === 'number' &&
        typeof obj.fatAdjustment === 'number' &&
        typeof obj.cardioAdjustmentMinutes === 'number' &&
        (obj.recommendedArticleId === undefined || obj.recommendedArticleId === null || typeof obj.recommendedArticleId === 'string') &&
        (obj.recommendedSupplementId === undefined || obj.recommendedSupplementId === null || typeof obj.recommendedSupplementId === 'string') &&
        (obj.updatedTrainingPlan === undefined || obj.updatedTrainingPlan === null || isTrainingPlan(obj.updatedTrainingPlan)) &&
        (obj.updatedDietPhase === undefined || (typeof obj.updatedDietPhase === 'string' && Object.values(DietPhase).includes(obj.updatedDietPhase as DietPhase)))
    );
};

export const isCheckInRecord = (obj: any): obj is CheckInRecord => {
    return (
        obj &&
        typeof obj.date === 'string' &&
        isCheckInData(obj.checkInData) &&
        isAIRecommendation(obj.recommendation)
    );
};

export const isPlanWeek = (obj: any): obj is PlanWeek => {
    return (
        obj &&
        typeof obj.weekNumber === 'number' &&
        typeof obj.phase === 'string' &&
        ['Fat Loss', 'Diet Break'].includes(obj.phase) &&
        typeof obj.projectedWeightKg === 'number'
    );
};

export const isGroundingSource = (obj: any): obj is GroundingSource => {
    return obj && obj.web && typeof obj.web.uri === 'string' && typeof obj.web.title === 'string';
};

export const isMealAnalysis = (obj: any): obj is MealAnalysis => {
    return (
        obj &&
        typeof obj.mealName === 'string' &&
        typeof obj.calories === 'number' &&
        typeof obj.protein === 'number' &&
        typeof obj.carbs === 'number' &&
        typeof obj.fat === 'number' &&
        typeof obj.rationale === 'string'
    );
};

export const isDailyMealLog = (obj: any): obj is DailyMealLog => {
    return obj && typeof obj.date === 'string' && Array.isArray(obj.meals) && obj.meals.every(isMealAnalysis);
}

export const isMeal = (obj: any): obj is Meal => {
    return (
        obj &&
        typeof obj.mealType === 'string' && ['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(obj.mealType) &&
        typeof obj.recipeName === 'string' &&
        typeof obj.calories === 'number' &&
        typeof obj.protein === 'number' &&
        typeof obj.carbs === 'number' &&
        typeof obj.fat === 'number' &&
        Array.isArray(obj.ingredients) && obj.ingredients.every((i: any) => typeof i === 'string') &&
        Array.isArray(obj.instructions) && obj.instructions.every((i: any) => typeof i === 'string') &&
        typeof obj.rationale === 'string'
    );
};

export const isDailyMealPlan = (obj: any): obj is DailyMealPlan => {
    return (
        obj &&
        typeof obj.day === 'number' &&
        typeof obj.dayOfWeek === 'string' &&
        Array.isArray(obj.meals) && obj.meals.every(isMeal) &&
        obj.dailyTotals &&
        typeof obj.dailyTotals.calories === 'number' &&
        typeof obj.dailyTotals.protein === 'number' &&
        typeof obj.dailyTotals.carbs === 'number' &&
        typeof obj.dailyTotals.fat === 'number'
    );
};


export const isMealPlan = (obj: any): obj is MealPlan => {
    return (
        obj &&
        Array.isArray(obj.weeklyPlan) && obj.weeklyPlan.every(isDailyMealPlan) &&
        obj.weeklyAverages &&
        typeof obj.weeklyAverages.calories === 'number' &&
        typeof obj.weeklyAverages.protein === 'number' &&
        typeof obj.weeklyAverages.carbs === 'number' &&
        typeof obj.weeklyAverages.fat === 'number' &&
        typeof obj.chefNotes === 'string'
    );
};

export const isShoppingListItem = (obj: any): obj is ShoppingListItem => {
    return obj && typeof obj.item === 'string' && typeof obj.quantity === 'string' && (obj.notes === undefined || typeof obj.notes === 'string');
};

export const isDailyCoachingTip = (obj: any): obj is DailyCoachingTip => {
    return obj && typeof obj.tip === 'string' && typeof obj.rationale === 'string';
};

export const isProgressPhoto = (obj: any): obj is ProgressPhoto => {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.date === 'string' &&
        typeof obj.weight === 'number' &&
        typeof obj.imageDataUrl === 'string';
};

export const isGoalTransitionPlan = (obj: any): obj is GoalTransitionPlan => {
    return (
        obj &&
        typeof obj.rationale === 'string' &&
        typeof obj.newTargetCalories === 'number' &&
        typeof obj.newTargetProtein === 'number' &&
        typeof obj.newTargetCarbs === 'number' &&
        typeof obj.newTargetFat === 'number' &&
        typeof obj.newTargetFiber === 'number' &&
        typeof obj.newTargetCardioMinutes === 'number' &&
        typeof obj.updatedDietPhase === 'string' && Object.values(DietPhase).includes(obj.updatedDietPhase as DietPhase)
    );
};

export const isSaveData = (obj: any): obj is SaveData => {
    return !!obj &&
        (obj.version === undefined || typeof obj.version === 'number') &&
        typeof obj.isOnboarded === 'boolean' &&
        (obj.onboardingData === null || isOnboardingData(obj.onboardingData)) &&
        (obj.checkInData === null || isCheckInData(obj.checkInData)) &&
        Array.isArray(obj.history) && obj.history.every(isCheckInRecord) &&
        (obj.planOverview === null || (Array.isArray(obj.planOverview) && obj.planOverview.every(isPlanWeek))) &&
        (obj.planSources === null || (Array.isArray(obj.planSources) && obj.planSources.every(isGroundingSource))) &&
        Array.isArray(obj.readArticleIds) && obj.readArticleIds.every((id: any) => typeof id === 'string') &&
        (obj.trainingPlan === null || isTrainingPlan(obj.trainingPlan)) &&
        Array.isArray(obj.workoutLogs) && obj.workoutLogs.every(isWorkoutLog) &&
        Array.isArray(obj.loggedMeals) && obj.loggedMeals.every(isDailyMealLog) &&
        (obj.mealPlan === null || isMealPlan(obj.mealPlan)) &&
        (obj.dailyTip === null || isDailyCoachingTip(obj.dailyTip)) &&
        (obj.savedRecipes === undefined || (Array.isArray(obj.savedRecipes) && obj.savedRecipes.every(isMeal))) &&
        (obj.progressPhotos === undefined || (Array.isArray(obj.progressPhotos) && obj.progressPhotos.every(isProgressPhoto)));
};