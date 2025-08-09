import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import type { CheckInData, AIRecommendation, AppStatus, OnboardingData, SaveData, AppView, CheckInRecord, PlanWeek, Article, TrainingPlan, WorkoutLog, WorkoutDay, GroundingSource, Supplement, ChatMessage, MealAnalysis, DailyMealLog, MealPlan, ShoppingList, DailyCoachingTip, Meal, MonthlyReviewReport, ProgressPhoto } from './types';
import { isSaveData, OnboardingGoal, Sex, MenstrualCyclePhase, DietPhase, ReverseDietPace } from './types';
import { getAIRecommendation, reforecastFatLossPlan, generateInitialPlansAndRoadmap, createChat, generateShoppingList, getDailyCoachingTip, generateMonthlyReview, generateOrModifyRecipe, generateWeeklyMealPlan, getMealMacrosFromImage } from './services/geminiService';
import { calculateDietBreakPlan, saveUserData, loadUserData } from './services/userProfileService';
import { CheckInForm } from './components/CheckInForm';
import { RecommendationDisplay } from './components/RecommendationDisplay';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Dashboard } from './components/Dashboard';
import { Card } from './components/Card';
import { Spinner } from './components/Spinner';
import { useTheme } from './hooks/useTheme';
import { PlanGenerationLoader } from './components/PlanGenerationLoader';
import { EducationModal } from './components/EducationModal';
import { Header } from './components/Header';
import { articles } from './content/articles';
import { supplements } from './content/supplements';
import { WorkoutLogger } from './components/WorkoutLogger';
import { SupplementModal } from './components/SupplementModal';
import { ProgressView } from './components/ProgressView';
import { dummySaveData } from './dummyData';
import { Button } from './components/Button';
import { FloatingActionButton } from './components/FloatingActionButton';
import { ChatWindow } from './components/ChatWindow';
import { MealLogger } from './components/MealLogger';
import { MealPlanView } from './components/MealPlanView';
import type { Chat } from '@google/genai';
import { Auth } from './components/Auth';
import { LandingPage } from './components/LandingPage';
import { ShoppingListModal } from './components/ShoppingListModal';
import { ExerciseGuideModal } from './components/ExerciseGuideModal';
import { getExerciseGuideByName, ExerciseGuide } from './services/exerciseLibraryService';
import { RecipeView } from './components/RecipeView';
import { MonthlyReviewModal } from './components/MonthlyReviewModal';
import { WorkoutReviewModal } from './components/WorkoutReviewModal';
import { GoalSwitcherModal } from './components/GoalSwitcherModal';
import { TrialExpired } from './components/TrialExpired';

const ErrorDisplay: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <Card className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">warning</span>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">An Error Occurred</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
        <div className="mt-6">
            <button onClick={onRetry} className="text-brand hover:underline">Try again</button>
        </div>
    </Card>
);

export const APP_VERSION = 2;

const emptySaveData: SaveData = {
    isOnboarded: false,
    onboardingData: null,
    checkInData: null,
    history: [],
    planOverview: null,
    planSources: null,
    readArticleIds: [],
    trainingPlan: null,
    workoutLogs: [],
    loggedMeals: [],
    mealPlan: null,
    dailyTip: null,
    savedRecipes: [],
    progressPhotos: [],
    trialStartDate: new Date().toISOString()
};


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<AppView>('landing');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [history, setHistory] = useState<CheckInRecord[]>([]);
  const [currentRecommendation, setCurrentRecommendation] = useState<AIRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckInData, setLastCheckInData] = useState<CheckInData | null>(null);
  const [planOverview, setPlanOverview] = useState<PlanWeek[] | null>(null);
  const [planSources, setPlanSources] = useState<GroundingSource[] | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Meal[]>([]);
  const [isPlanUpdating, setIsPlanUpdating] = useState(false);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const [isEducationLibraryOpen, setIsEducationLibraryOpen] = useState(false);
  const [readArticleIds, setReadArticleIds] = useState<Set<string>>(new Set());
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loggedMeals, setLoggedMeals] = useState<DailyMealLog[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutDay | null>(null);
  const [reviewingWorkout, setReviewingWorkout] = useState<WorkoutLog | null>(null);
  const [viewingSupplement, setViewingSupplement] = useState<Supplement | null>(null);
  const [isSupplementLibraryOpen, setIsSupplementLibraryOpen] = useState(false);
  const [isMealLoggerOpen, setIsMealLoggerOpen] = useState(false);
  const isInitialLoad = useRef(true);
  
  // Daily Tip state
  const [dailyTip, setDailyTip] = useState<DailyCoachingTip | null>(null);
  const [isTipLoading, setIsTipLoading] = useState(false);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Shopping List state
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [shoppingListStatus, setShoppingListStatus] = useState<AppStatus>('idle');
  const [isShoppingListModalOpen, setIsShoppingListModalOpen] = useState(false);

  // Exercise Guide state
  const [viewingExercise, setViewingExercise] = useState<ExerciseGuide | null>(null);
  
  // Monthly Review state
  const [monthlyReview, setMonthlyReview] = useState<MonthlyReviewReport | null>(null);

  // Goal Switcher state
  const [isGoalSwitcherOpen, setIsGoalSwitcherOpen] = useState(false);

  useTheme();

  // Calculate days remaining in trial
  const calculateTrialDaysRemaining = (trialStartDate: string): number => {
    const trialStart = new Date(trialStartDate);
    const now = new Date();
    const diffTime = now.getTime() - trialStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - diffDays); // 7-day trial
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Keep loading state while we fetch Firestore data
          setAuthLoading(true);
          const userData = await loadUserData(user.uid);
          
          if (userData) {
            // Initialize or validate trial start date
            if (!userData.trialStartDate) {
              userData.trialStartDate = new Date().toISOString();
              await saveUserData(user.uid, userData);
            }

            // Validate trial start date format
            const trialDate = new Date(userData.trialStartDate);
            if (isNaN(trialDate.getTime())) {
              userData.trialStartDate = new Date().toISOString();
              await saveUserData(user.uid, userData);
            }

            if (userData.isOnboarded) {
              setOnboardingData(userData.onboardingData);
              setCheckInData(userData.checkInData);
              setHistory(userData.history);
              setPlanOverview(userData.planOverview);
              setPlanSources(userData.planSources);
              setReadArticleIds(new Set(userData.readArticleIds));
              setTrainingPlan(userData.trainingPlan);
              setWorkoutLogs(userData.workoutLogs || []);
              setLoggedMeals(userData.loggedMeals || []);
              setMealPlan(userData.mealPlan || null);
              setDailyTip(userData.dailyTip || null);
              setSavedRecipes(userData.savedRecipes || []);
              setProgressPhotos(userData.progressPhotos || []);

              // Check trial status
              const daysRemaining = calculateTrialDaysRemaining(userData.trialStartDate);
              if (daysRemaining > 0) {
                setView('dashboard');
              } else {
                setView('trialExpired');
              }
            } else {
              setView('onboarding');
            }
          } else {
            // New user, set trial start date
            const newUserData = {
              ...emptySaveData,
              trialStartDate: new Date().toISOString()
            };
            await saveUserData(user.uid, newUserData);
            setView('onboarding');
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          setError("Failed to load your data. Please try refreshing the page.");
          setView('error');
        }
      } else {
        setView('landing');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const handleResetApp = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all your data? This will clear your entire history and plan.")) {
        if (user) {
            saveUserData(user.uid, emptySaveData);
        }
        setView('landing');
        setStatus('idle');
        setOnboardingData(null);
        setCheckInData(null);
        setHistory([]);
        setCurrentRecommendation(null);
        setError(null);
        setLastCheckInData(null);
        setPlanOverview(null);
        setPlanSources(null);
        setTrainingPlan(null);
        setMealPlan(null);
        setSavedRecipes([]);
        setReadArticleIds(new Set());
        setWorkoutLogs([]);
        setLoggedMeals([]);
        setProgressPhotos([]);
        setDailyTip(null);
        setChatSession(null);
        setChatMessages([]);
    }
  }, []);

  // Save to Firestore whenever critical data changes
  useEffect(() => {
    if (isInitialLoad.current || authLoading || !user) return;
    
    const saveData: SaveData = {
      version: APP_VERSION,
      isOnboarded: view !== 'onboarding' && view !== 'landing' && !!onboardingData,
      onboardingData,
      checkInData,
      history,
      planOverview,
      planSources,
      readArticleIds: Array.from(readArticleIds),
      trainingPlan,
      workoutLogs,
      loggedMeals,
      mealPlan,
      dailyTip,
      savedRecipes,
      progressPhotos,
    };
    
    saveUserData(user.uid, saveData);
  }, [user, authLoading, onboardingData, checkInData, history, planOverview, planSources, readArticleIds, trainingPlan, workoutLogs, loggedMeals, mealPlan, dailyTip, savedRecipes, progressPhotos, view]);
  
  const handleOnboardingComplete = useCallback(async (data: OnboardingData) => {
    setError(null);
    setOnboardingData(data);
    
    // Reset other data to ensure a clean slate
    setCheckInData(null);
    setPlanOverview(null); 
    setTrainingPlan(null);
    setMealPlan(null);
    setHistory([]);
    setReadArticleIds(new Set());
    setWorkoutLogs([]);
    setLoggedMeals([]);
    setProgressPhotos([]);
    setPlanSources(null);
    setDailyTip(null);
    setSavedRecipes([]);
    
    // Transition to loading view immediately
    setIsPlanLoading(true);
    setView('dashboard'); 

    try {
      const { checkInData: initialPlan, planOverview: overview, trainingPlan: plan, planSources: sources } = await generateInitialPlansAndRoadmap(data);
      setCheckInData(initialPlan);
      setPlanOverview(overview);
      setTrainingPlan(plan);
      setPlanSources(sources);
    } catch (err) {
      console.error("Failed to generate plans:", err);
      setError(err instanceof Error ? err.message : "Could not generate a complete AI plan at this time. Please check your inputs or try again.");
      setOnboardingData(data); // Keep form data on failure
      setView('onboarding'); // Go back to onboarding if it fails
    } finally {
      setIsPlanLoading(false);
    }
  }, []);

  const handleStartCheckIn = () => {
    if (!checkInData) return;

    const checkInWithDefaults: CheckInData = {
      ...checkInData,
      strength: checkInData.strength || 5,
      stress: checkInData.stress || 5,
      motivation: checkInData.motivation || 5,
      adherence: checkInData.adherence || 8, // Default to positive adherence
      averageDailySteps: checkInData.averageDailySteps || undefined,
      notes: checkInData.notes || '',
      physiquePhoto: undefined,
      ...(onboardingData?.sex === Sex.FEMALE && { menstrualCyclePhase: checkInData.menstrualCyclePhase || MenstrualCyclePhase.NOT_APPLICABLE })
    };
    
    setLastCheckInData(checkInData);
    setCheckInData(checkInWithDefaults);
    setView('checkingIn');
  };

  const handleStartDietBreak = () => {
    if (!checkInData || !onboardingData) return;
    setLastCheckInData(checkInData); 
    const dietBreakPlan = calculateDietBreakPlan(checkInData, onboardingData);
    setCheckInData(dietBreakPlan);
  };
  
  const handleCancelCheckIn = () => {
    if(lastCheckInData) {
        setCheckInData(lastCheckInData);
        setLastCheckInData(null);
    }
    setView('dashboard');
    setCurrentRecommendation(null);
    setStatus('idle');
    setError(null);
  }

  const handleNewCheckIn = useCallback(async (data: CheckInData) => {
    setStatus('loading');
    setError(null);
    setCurrentRecommendation(null);
    try {
      const result = await getAIRecommendation(data, lastCheckInData, workoutLogs, trainingPlan, history);
      setCurrentRecommendation(result);
      if (result.recommendedArticleId) {
        setReadArticleIds(prev => new Set(prev).add(result.recommendedArticleId!));
      }
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStatus('error');
    }
  }, [lastCheckInData, workoutLogs, trainingPlan, history]);

 const handleApplyChanges = async () => {
    if (!currentRecommendation || !checkInData || !onboardingData) return;

    const { physiquePhoto, ...checkInDataForHistory } = checkInData;
    const newRecord: CheckInRecord = {
        date: new Date().toISOString(),
        checkInData: checkInDataForHistory,
        recommendation: currentRecommendation,
    };
    const newHistory = [newRecord, ...history];
    setHistory(newHistory);

    let finalCheckInData: CheckInData;
    let finalTrainingPlan = trainingPlan;

    if (currentRecommendation.action === 'SUGGEST_BREAK') {
        finalCheckInData = calculateDietBreakPlan(checkInDataForHistory, onboardingData);
    } else {
        finalCheckInData = {
            ...checkInDataForHistory,
            previousWeight: checkInDataForHistory.currentWeight,
            targetCalories: checkInDataForHistory.targetCalories + currentRecommendation.calorieAdjustment,
            targetProtein: checkInDataForHistory.targetProtein + currentRecommendation.proteinAdjustment,
            targetCarbs: checkInDataForHistory.targetCarbs + currentRecommendation.carbAdjustment,
            targetFat: checkInDataForHistory.targetFat + currentRecommendation.fatAdjustment,
            targetCardioMinutes: checkInDataForHistory.targetCardioMinutes + currentRecommendation.cardioAdjustmentMinutes,
            isDietBreak: false,
        };

        if (currentRecommendation.updatedDietPhase) {
            finalCheckInData.dietPhase = currentRecommendation.updatedDietPhase;
            if (currentRecommendation.updatedDietPhase !== DietPhase.REVERSE_DIETING) {
                finalCheckInData.dietPace = undefined;
            } else {
                // Default to a conservative pace when switching to reverse
                finalCheckInData.dietPace = ReverseDietPace.CONSERVATIVE;
            }
        }

        finalTrainingPlan = currentRecommendation.updatedTrainingPlan || trainingPlan;
    }

    setCheckInData(finalCheckInData);
    setTrainingPlan(finalTrainingPlan);
    setMealPlan(null);
    setDailyTip(null);
    setCurrentRecommendation(null);
    setLastCheckInData(null);
    setStatus('idle');

    // Check if a monthly review is needed AFTER applying weekly changes
    const isMonthlyReviewTime = newHistory.length > 0 && newHistory.length % 4 === 0;

    if (isMonthlyReviewTime) {
        setStatus('loading');
        try {
            const lastFourWeeks = newHistory.slice(0, 4);
            const report = await generateMonthlyReview(lastFourWeeks);
            setMonthlyReview(report);
            // The view will NOT be changed to 'dashboard' yet. The modal's onClose will handle that.
        } catch (err) {
            console.error("Failed to generate monthly review:", err);
            setView('dashboard'); // Fail gracefully to dashboard
        } finally {
            setStatus('idle');
        }
    } else {
        setView('dashboard');
    }

    // Trigger plan re-forecasting in the background
    if (onboardingData.goal === OnboardingGoal.FAT_LOSS && onboardingData.targetBodyFat) {
        setIsPlanUpdating(true);
        try {
            const { plan: updatedOverview, sources } = await reforecastFatLossPlan(onboardingData, finalCheckInData, newHistory);
            const currentPlanProgress = planOverview ? planOverview.slice(0, newHistory.length) : [];
            const newPlanOverview = [...currentPlanProgress, ...updatedOverview];
            setPlanOverview(newPlanOverview);
            if (sources) setPlanSources(sources);
        } catch (err) {
            console.error("Failed to re-forecast plan:", err);
        } finally {
            setIsPlanUpdating(false);
        }
    }
};

  const handleSignOut = () => {
    auth.signOut();
    // Reset state to avoid showing old data while new user logs in
    setView('landing');
    setStatus('idle');
    setOnboardingData(null);
    setCheckInData(null);
    setHistory([]);
    setCurrentRecommendation(null);
    setError(null);
    setLastCheckInData(null);
    setPlanOverview(null);
    setPlanSources(null);
    setTrainingPlan(null);
    setMealPlan(null);
    setSavedRecipes([]);
    setReadArticleIds(new Set());
    setWorkoutLogs([]);
    setLoggedMeals([]);
    setProgressPhotos([]);
    setDailyTip(null);
    setChatSession(null);
    setChatMessages([]);
  };

  const handleViewArticle = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if(article) {
        setViewingArticle(article);
        setReadArticleIds(prev => new Set(prev).add(articleId));
    }
    setIsEducationLibraryOpen(false);
  }

  const handleViewSupplement = (supplementId: string) => {
    const supplement = supplements.find(s => s.id === supplementId);
    if(supplement) {
        setViewingSupplement(supplement);
    }
    setIsSupplementLibraryOpen(false);
  }

  const handleSaveWorkout = (log: WorkoutLog) => {
      const newWorkoutLogs = [log, ...workoutLogs];
      setWorkoutLogs(newWorkoutLogs);
      setActiveWorkout(null);
      setReviewingWorkout(log);
  };

  const handleLogMeal = (analysis: MealAnalysis) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    setLoggedMeals(prevLogs => {
      const newLogs = [...prevLogs];
      let todayLog = newLogs.find(log => log.date === today);

      if (todayLog) {
        todayLog.meals.push(analysis);
      } else {
        todayLog = { date: today, meals: [analysis] };
        newLogs.push(todayLog);
      }
      return newLogs;
    });
  };

  const handleSaveMealPlan = (plan: MealPlan) => {
    setMealPlan(plan);
    setView('dashboard');
  };

  const handleToggleChat = () => {
    if (!isChatOpen && !chatSession) {
      if (!onboardingData || !checkInData) return;
      
      const initialBotMessage: ChatMessage = {
          role: 'model',
          parts: [{ text: "Hi! I'm Atlas, your AI coach. I have your full profile and plan context. Feel free to ask me anything about your plan, nutrition, or training." }],
          timestamp: Date.now()
      };
      const newChatSession = createChat(onboardingData, checkInData, history);
      setChatSession(newChatSession);
      setChatMessages([initialBotMessage]);
    }
    setIsChatOpen(prev => !prev);
  };

  const handleSendMessage = async (messageText: string) => {
      if (!chatSession || !messageText.trim()) return;

      const userMessage: ChatMessage = {
          role: 'user',
          parts: [{ text: messageText }],
          timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, userMessage, { role: 'model', parts: [{ text: '' }], timestamp: Date.now() + 1 }]);
      setIsChatLoading(true);

      try {
          const stream = await chatSession.sendMessageStream({ message: messageText });
          for await (const chunk of stream) {
              const chunkText = chunk.text;
              setChatMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  lastMessage.parts[0].text += chunkText;
                  return newMessages;
              });
          }
      } catch (e) {
          console.error("Chat error:", e);
          setChatMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              lastMessage.parts[0].text = "Sorry, I encountered an error. Please try again.";
              return newMessages;
          });
      } finally {
          setIsChatLoading(false);
      }
  };

  const handleGenerateShoppingList = async () => {
    if (!mealPlan) return;
    setShoppingListStatus('loading');
    setShoppingList(null);
    setIsShoppingListModalOpen(true);
    try {
        const list = await generateShoppingList(mealPlan);
        setShoppingList(list);
        setShoppingListStatus('success');
    } catch (e) {
        console.error("Shopping list generation error:", e);
        setShoppingListStatus('error');
    }
  };

  const handleGetDailyTip = useCallback(async () => {
    if (!checkInData) return;
    setIsTipLoading(true);
    try {
        const tip = await getDailyCoachingTip(checkInData, history);
        setDailyTip(tip);
    } catch (e) {
        console.error("Failed to get daily tip:", e);
        // Fail silently, don't show an error to the user for this feature
    } finally {
        setIsTipLoading(false);
    }
  }, [checkInData, history]);

  useEffect(() => {
    if (view === 'dashboard' && !dailyTip && checkInData && !isInitialLoad.current) {
        handleGetDailyTip();
    }
  }, [view, dailyTip, checkInData, handleGetDailyTip]);
  
  const handleViewExercise = (exerciseName: string) => {
    const guide = getExerciseGuideByName(exerciseName);
    if (guide) {
        setViewingExercise(guide);
    } else {
        // Fallback for exercises not found in the library.
        setViewingExercise({
            name: exerciseName,
            description: "No detailed guide found for this exercise. Please refer to external resources for proper form.",
            equipment: "Unknown",
            bodyPart: "Unknown"
        });
    }
  };
  
  const handleSaveRecipe = (meal: Meal) => {
    setSavedRecipes(prev => {
        const isAlreadySaved = prev.some(r => r.recipeName.toLowerCase() === meal.recipeName.toLowerCase());
        if (isAlreadySaved) {
            return prev;
        }
        return [meal, ...prev];
    });
  };
  
  const handleDeleteRecipe = (recipeName: string) => {
    setSavedRecipes(prev => prev.filter(r => r.recipeName.toLowerCase() !== recipeName.toLowerCase()));
  };

  const isRecipeSaved = (recipeName: string): boolean => {
      return savedRecipes.some(r => r.recipeName.toLowerCase() === recipeName.toLowerCase());
  };

  const handleAddPhoto = (imageDataUrl: string) => {
    if (!checkInData) return;
    const newPhoto: ProgressPhoto = {
        id: `photo-${Date.now()}`,
        date: new Date().toISOString(),
        weight: checkInData.currentWeight,
        imageDataUrl,
    };
    // Add newest photo first and sort
    setProgressPhotos(prev => [newPhoto, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleDeletePhoto = (id: string) => {
    if (window.confirm("Are you sure you want to delete this photo? This action cannot be undone.")) {
        setProgressPhotos(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleApplyNewGoalPlan = (newPlanData: CheckInData) => {
    setCheckInData(newPlanData);
    // If the goal is no longer fat loss, clear the roadmap.
    if (newPlanData.dietPhase !== DietPhase.FAT_LOSS) {
        setPlanOverview(null);
    }
    setIsGoalSwitcherOpen(false);
  };

  const viewTitles: Record<AppView, { title: string; subtitle: string }> = {
      landing: { title: "Atlas", subtitle: "Stop Yo-Yo Dieting. Start Sustainable Results." },
      onboarding: { title: "Welcome to Atlas", subtitle: "Let's get you set up for success." },
      dashboard: { title: "Dashboard", subtitle: `Welcome back!` },
      checkingIn: { title: "Weekly Check-In", subtitle: "Let's review your week and adjust your plan." },
      progress: { title: "Progress Review", subtitle: "Analyze your long-term trends." },
      mealPlan: { title: "AI Meal Planner", subtitle: "Generate a weekly meal plan for your macros." },
      recipes: { title: "Recipe Book", subtitle: "Your collection of saved and adapted recipes." },
      trialExpired: { title: "Trial Expired", subtitle: "Upgrade to continue your transformation." },
  };

  const renderContent = () => {
    if (authLoading) {
        return <div className="w-full h-screen flex items-center justify-center"><Spinner /></div>;
    }

    if (!user) {
        if (view === 'auth') {
            return <Auth />;
        }
        return <LandingPage onStartOnboarding={() => setView('onboarding')} />;
    }

    // Calculate trial days remaining if user data is loaded
    const trialDaysRemaining = user && onboardingData ? calculateTrialDaysRemaining(onboardingData.trialStartDate || new Date().toISOString()) : 0;

    switch (view) {
      case 'landing':
        return <LandingPage onStartOnboarding={() => setView('auth')} />;
      case 'onboarding':
        return <OnboardingWizard onComplete={handleOnboardingComplete} error={error} />;
      case 'dashboard':
        return (
            <Dashboard
                onboardingData={onboardingData}
                checkInData={checkInData}
                history={history}
                onStartCheckIn={handleStartCheckIn}
                onStartDietBreak={handleStartDietBreak}
                planOverview={planOverview}
                trainingPlan={trainingPlan}
                onSwitchGoal={() => setIsGoalSwitcherOpen(true)}
                workoutLogs={workoutLogs}
                loggedMeals={loggedMeals}
                mealPlan={mealPlan}
                dailyTip={dailyTip}
                isTipLoading={isTipLoading}
                onGetNewTip={handleGetDailyTip}
                onStartWorkout={setActiveWorkout}
                onViewExercise={handleViewExercise}
                isPlanLoading={isPlanLoading}
                isPlanUpdating={isPlanUpdating}
                onStartOnboarding={() => setView('onboarding')}
                onStartMealLogger={() => setIsMealLoggerOpen(true)}
                onNavigate={setView}
                onGenerateShoppingList={handleGenerateShoppingList}
                isRecipeSaved={isRecipeSaved}
                trialDaysRemaining={trialDaysRemaining}
                isAdmin={false}
            />
        );
      case 'checkingIn':
        if (!checkInData) {
          setView('dashboard');
          return null;
        }

        if (status === 'success' && currentRecommendation) {
          return (
            <RecommendationDisplay
              recommendation={currentRecommendation}
              onApply={handleApplyChanges}
              onDiscard={handleCancelCheckIn}
              onViewArticle={handleViewArticle}
              onViewSupplement={handleViewSupplement}
            />
          );
        }

        if (status === 'error' && error) {
          return <ErrorDisplay message={error} onRetry={() => setStatus('idle')} />;
        }
        
        return (
          <CheckInForm
            data={checkInData}
            onboardingData={onboardingData}
            onFormChange={setCheckInData}
            onSubmit={handleNewCheckIn}
            isLoading={status === 'loading'}
          />
        );
       case 'progress':
            return <ProgressView 
                history={history} 
                workoutLogs={workoutLogs} 
                trainingPlan={trainingPlan}
                photos={progressPhotos}
                onAddPhoto={handleAddPhoto}
                onDeletePhoto={handleDeletePhoto}
            />;
       case 'mealPlan':
            return checkInData && onboardingData && <MealPlanView 
                onboardingData={onboardingData}
                checkInData={checkInData} 
                history={history}
                loggedMeals={loggedMeals}
                activePlan={mealPlan}
                onSavePlan={handleSaveMealPlan}
                onSaveRecipe={handleSaveRecipe}
                isRecipeSaved={isRecipeSaved}
            />;
        case 'recipes':
             return checkInData && <RecipeView 
                savedRecipes={savedRecipes} 
                checkInData={checkInData} 
                onSaveRecipe={handleSaveRecipe}
                onDeleteRecipe={handleDeleteRecipe}
            />;
      case 'trialExpired':
        return <TrialExpired onLogout={handleSignOut} />;
      default:
        // Fallback to dashboard if in a weird state
        setView(onboardingData ? 'dashboard' : 'landing');
        return null;
    }
  };
  
  if (view === 'landing') {
      return (
        <main className="w-full min-h-screen">
            {renderContent()}
        </main>
      );
  }

  return (
    <div className="w-full min-h-screen">
        <Header 
            onOpenLibrary={() => setIsEducationLibraryOpen(true)}
            onOpenSupplementLibrary={() => setIsSupplementLibraryOpen(true)}
            onNavigate={setView}
            onReset={handleResetApp}
            onSignOut={handleSignOut}
        />
        <main className="ml-20 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white uppercase">{viewTitles[view].title}</h1>
                    <p className="text-slate-600 dark:text-slate-400">{viewTitles[view].subtitle}</p>
                </div>
                {renderContent()}
            </div>
        </main>
        {viewingArticle && <EducationModal article={viewingArticle} onClose={() => setViewingArticle(null)} />}
        {isEducationLibraryOpen && (
            <EducationModal 
                isLibrary={true} 
                articles={articles} 
                readArticleIds={readArticleIds}
                onClose={() => setIsEducationLibraryOpen(false)} 
                onViewArticle={handleViewArticle}
            />
        )}
        {viewingSupplement && <SupplementModal supplement={viewingSupplement} onClose={() => setViewingSupplement(null)} />}
        {isSupplementLibraryOpen && (
            <SupplementModal
                isLibrary={true}
                supplements={supplements}
                onClose={() => setIsSupplementLibraryOpen(false)}
                onViewSupplement={handleViewSupplement}
            />
        )}
        {activeWorkout && onboardingData && (
            <WorkoutLogger
                workoutDay={activeWorkout}
                workoutLogs={workoutLogs}
                onboardingData={onboardingData}
                onSave={handleSaveWorkout}
                onClose={() => setActiveWorkout(null)}
            />
        )}
        {reviewingWorkout && (
            <WorkoutReviewModal
                workoutLog={reviewingWorkout}
                allLogs={workoutLogs}
                onClose={() => setReviewingWorkout(null)}
            />
        )}
        {isMealLoggerOpen && (
            <MealLogger
                onClose={() => setIsMealLoggerOpen(false)}
                onLogMeal={handleLogMeal}
            />
        )}
        {onboardingData && checkInData && (
            <>
                <FloatingActionButton onClick={handleToggleChat} />
                {isChatOpen && (
                    <ChatWindow 
                        messages={chatMessages}
                        onSendMessage={handleSendMessage}
                        isLoading={isChatLoading}
                        onClose={handleToggleChat}
                        onClearChat={() => {
                            if (window.confirm("Are you sure you want to clear this chat history?")) {
                                handleToggleChat(); // Close and reset
                                setChatSession(null);
                                setChatMessages([]);
                            }
                        }}
                    />
                )}
            </>
        )}
        {isShoppingListModalOpen && (
            <ShoppingListModal list={shoppingList} status={shoppingListStatus} onClose={() => setIsShoppingListModalOpen(false)} />
        )}
        {viewingExercise && (
            <ExerciseGuideModal guide={viewingExercise} onClose={() => setViewingExercise(null)} />
        )}
        {monthlyReview && (
            <MonthlyReviewModal report={monthlyReview} onClose={() => { setMonthlyReview(null); setView('dashboard'); }} />
        )}
        {isGoalSwitcherOpen && onboardingData && checkInData && (
            <GoalSwitcherModal 
                onboardingData={onboardingData}
                checkInData={checkInData}
                history={history}
                onClose={() => setIsGoalSwitcherOpen(false)}
                onApplyNewPlan={handleApplyNewGoalPlan}
            />
        )}
    </div>
  );
};

export default App;
