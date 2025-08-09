import { GoogleGenAI, Type, GenerateContentResponse, Chat, Part } from "@google/genai";
import { DietPhase, ReverseDietPace, Equipment } from '../types';
import type { CheckInData, AIRecommendation, OnboardingData, PlanWeek, CheckInRecord, Article, TrainingPlan, WorkoutLog, GroundingSource, MealAnalysis, MealPlan, DailyMealLog, ShoppingList, DailyCoachingTip, Meal, MonthlyReviewReport, Exercise, WorkoutDay, GoalTransitionPlan } from '../types';
import { articles } from '../content/articles';
import { supplements } from '../content/supplements';
import { calculateInitialPlan, calculateDietBreakPlan } from "./userProfileService";
import { KB_ENERGY_BALANCE, KB_METABOLIC_ADAPTATION, KB_NUTRITION, KB_FAT_LOSS, KB_REVERSE_DIETING, KB_TRAINING, KB_BEHAVIORAL, KB_EXERCISE_LIBRARY, KB_GOURMET_NUTRITION_RECIPES, KB_LAYNE_NORTON_TRAINING_SPLITS } from "../content/knowledgeBase";


if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const exerciseSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        sets: { type: Type.INTEGER },
        reps: { type: Type.STRING },
        rest: { type: Type.STRING },
        rir: { type: Type.STRING },
        isBodyweight: { type: Type.BOOLEAN }
    },
    required: ['name', 'sets', 'reps', 'rest', 'rir', 'isBodyweight']
};

const trainingPlanSchema = {
    type: Type.OBJECT,
    properties: {
        weeklySplit: { type: Type.STRING },
        schedule: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER },
                    dayOfWeek: { type: Type.STRING },
                    focus: { type: Type.STRING },
                    exercises: {
                        type: Type.ARRAY,
                        items: exerciseSchema
                    }
                },
                required: ['day', 'dayOfWeek', 'focus', 'exercises']
            }
        }
    },
    required: ['weeklySplit', 'schedule']
};

const weeklyCheckInResponseSchema = {
  type: Type.OBJECT,
  properties: {
    rationale: {
      type: Type.STRING,
      description: 'A concise, evidence-based summary explaining the decision. Address the user directly using "you" and "your". Be encouraging but precise.',
    },
    action: {
      type: Type.STRING,
      enum: ['INCREASE', 'HOLD', 'DECREASE', 'SUGGEST_BREAK'],
      description: 'The recommended action for macro adjustments.',
    },
    calorieAdjustment: {
      type: Type.INTEGER,
      description: 'The total change in daily calories.',
    },
    proteinAdjustment: {
      type: Type.INTEGER,
      description: 'The change in grams of protein. Usually 0 unless specified.',
    },
    carbAdjustment: {
      type: Type.INTEGER,
      description: 'The change in grams of carbohydrates.',
    },
    fatAdjustment: {
      type: Type.INTEGER,
      description: 'The change in grams of fat.',
    },
    cardioAdjustmentMinutes: {
        type: Type.INTEGER,
        description: 'The change in minutes of total weekly cardio. Can be positive or negative.'
    },
    recommendedArticleId: {
        type: Type.STRING,
        description: 'The ID of a relevant educational article if applicable. Otherwise null.',
    },
    recommendedSupplementId: {
        type: Type.STRING,
        description: 'The ID of a relevant supplement if a specific need is identified (e.g., strength stall, low energy). Otherwise null.',
    },
    updatedTrainingPlan: {
        ...trainingPlanSchema,
        description: "The complete, updated training plan for the next week based on performance. If no changes are needed, return the original plan. Can be null.",
    },
    updatedDietPhase: {
        type: Type.STRING,
        enum: ['Fat Loss', 'Reverse Dieting', 'Maintenance', 'Lean Gaining'],
        description: "The new diet phase if a change is warranted (e.g., from Reverse to Fat Loss). Otherwise null.",
    }
  },
  required: ['rationale', 'action', 'calorieAdjustment', 'proteinAdjustment', 'carbAdjustment', 'fatAdjustment', 'cardioAdjustmentMinutes'],
};

const mealLoggerResponseSchema = {
    type: Type.OBJECT,
    properties: {
        mealName: {
            type: Type.STRING,
            description: "A descriptive name for the meal identified in the image."
        },
        calories: {
            type: Type.INTEGER,
            description: "The estimated total calories for the meal."
        },
        protein: {
            type: Type.INTEGER,
            description: "The estimated grams of protein in the meal."
        },
        carbs: {
            type: Type.INTEGER,
            description: "The estimated grams of carbohydrates in the meal."
        },
        fat: {
            type: Type.INTEGER,
            description: "The estimated grams of fat in the meal."
        },
        rationale: {
            type: Type.STRING,
            description: "A brief explanation of how you arrived at this estimation, including portion size assumptions."
        }
    },
    required: ['mealName', 'calories', 'protein', 'carbs', 'fat', 'rationale']
};

const mealSchema = {
    type: Type.OBJECT,
    properties: {
        mealType: { type: Type.STRING, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
        recipeName: { type: Type.STRING },
        calories: { type: Type.INTEGER },
        protein: { type: Type.INTEGER },
        carbs: { type: Type.INTEGER },
        fat: { type: Type.INTEGER },
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
        instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
        rationale: { type: Type.STRING, description: "Explain why this meal is a good choice for the user's goals." },
    },
    required: ['mealType', 'recipeName', 'calories', 'protein', 'carbs', 'fat', 'ingredients', 'instructions', 'rationale']
};

const dailyMealPlanSchema = {
    type: Type.OBJECT,
    properties: {
        day: { type: Type.INTEGER, description: "The day number of the week (1-7)." },
        dayOfWeek: { type: Type.STRING, description: "The day of the week, e.g., 'Monday'." },
        meals: {
            type: Type.ARRAY,
            description: "An array of meals for this day.",
            items: mealSchema
        },
        dailyTotals: {
            type: Type.OBJECT,
            description: "The sum of all macronutrients for this day.",
            properties: {
                calories: { type: Type.INTEGER },
                protein: { type: Type.INTEGER },
                carbs: { type: Type.INTEGER },
                fat: { type: Type.INTEGER },
            },
            required: ['calories', 'protein', 'carbs', 'fat']
        },
    },
    required: ['day', 'dayOfWeek', 'meals', 'dailyTotals']
};

const mealPlanResponseSchema = {
    type: Type.OBJECT,
    properties: {
        weeklyPlan: {
            type: Type.ARRAY,
            description: "An array of 7 daily meal plans, one for each day of the week.",
            items: dailyMealPlanSchema
        },
        weeklyAverages: {
            type: Type.OBJECT,
            description: "The average daily macronutrients for the entire week.",
            properties: {
                calories: { type: Type.INTEGER },
                protein: { type: Type.INTEGER },
                carbs: { type: Type.INTEGER },
                fat: { type: Type.INTEGER },
            },
            required: ['calories', 'protein', 'carbs', 'fat']
        },
        chefNotes: { type: Type.STRING, description: "General tips for meal prep or a summary of the week's plan. Be encouraging and helpful." }
    },
    required: ['weeklyPlan', 'weeklyAverages', 'chefNotes']
};


const shoppingListItemSchema = {
    type: Type.OBJECT,
    properties: {
        item: { type: Type.STRING, description: 'The name of the grocery item, e.g., "Chicken Breast" or "Olive Oil".' },
        quantity: { type: Type.STRING, description: 'The consolidated quantity for the item, e.g., "500g" or "2 cups".' },
        notes: { type: Type.STRING, description: 'Optional notes, e.g., "diced" or "low-sodium".' },
    },
    required: ['item', 'quantity'],
};

const shoppingListResponseSchema = {
    type: Type.OBJECT,
    properties: {
        Produce: { type: Type.ARRAY, items: shoppingListItemSchema },
        'Meat & Seafood': { type: Type.ARRAY, items: shoppingListItemSchema },
        'Dairy & Eggs': { type: Type.ARRAY, items: shoppingListItemSchema },
        Pantry: { type: Type.ARRAY, items: shoppingListItemSchema },
        'Spices & Oils': { type: Type.ARRAY, items: shoppingListItemSchema },
        Other: { type: Type.ARRAY, items: shoppingListItemSchema },
    }
};

const dailyCoachingTipSchema = {
    type: Type.OBJECT,
    properties: {
        tip: {
            type: Type.STRING,
            description: "A short, actionable behavioral or mindset tip (1-2 sentences). Address the user directly."
        },
        rationale: {
            type: Type.STRING,
            description: "A brief explanation (1 sentence) of why this tip is relevant to the user's current diet phase or recent biofeedback trends, based on the provided data."
        }
    },
    required: ['tip', 'rationale']
};

const monthlyReviewResponseSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A compelling title for the report, e.g., 'Your 4-Week Progress Review'."
        },
        summary: {
            type: Type.STRING,
            description: "A concise (2-3 sentence) high-level overview of the last four weeks. Be encouraging and acknowledge their effort."
        },
        successes: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            },
            description: "A list of 2-3 key positive trends or achievements identified from the data. Quantify where possible (e.g., 'You've successfully lost 2.1kg')."
        },
        challenges: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            },
            description: "A list of 1-2 emerging challenges or areas for improvement. Be constructive and frame these as opportunities (e.g., 'We've noticed sleep quality has trended down slightly.')."
        },
        strategicFocus: {
            type: Type.STRING,
            description: "A clear, actionable strategic focus for the next 4 weeks. This should be a high-level goal, e.g., 'Our main focus for the next month will be on improving sleep hygiene to support recovery.'"
        },
    },
    required: ['title', 'summary', 'successes', 'challenges', 'strategicFocus']
};

const goalTransitionResponseSchema = {
    type: Type.OBJECT,
    properties: {
        rationale: {
            type: Type.STRING,
            description: "A concise, encouraging rationale for the transition plan. Explain why the new macros and cardio are appropriate for the new goal, addressing the user directly."
        },
        newTargetCalories: { type: Type.INTEGER },
        newTargetProtein: { type: Type.INTEGER },
        newTargetCarbs: { type: Type.INTEGER },
        newTargetFat: { type: Type.INTEGER },
        newTargetFiber: { type: Type.INTEGER },
        newTargetCardioMinutes: { type: Type.INTEGER },
        updatedDietPhase: {
            type: Type.STRING,
            enum: ['Fat Loss', 'Reverse Dieting', 'Maintenance', 'Lean Gaining'],
            description: "The new diet phase the user is transitioning to. This MUST match the user's requested new goal."
        }
    },
    required: ['rationale', 'newTargetCalories', 'newTargetProtein', 'newTargetCarbs', 'newTargetFat', 'newTargetFiber', 'newTargetCardioMinutes', 'updatedDietPhase']
};

const availableArticles = articles.map(a => `- ID: "${a.id}", Title: "${a.title}"`).join('\n');
const availableSupplements = supplements.map(s => `- ID: "${s.id}", Name: "${s.title}", Use Case: "${s.category}"`).join('\n');

const getKnowledgeBasePrompt = (): string => {
    return `
# Atlas Coaching Knowledge Base
This is the core philosophy and scientific principles that you MUST adhere to. Your answers must align with these principles.

## Principle 1: Energy Balance
${KB_ENERGY_BALANCE}

## Principle 2: Metabolic Adaptation
${KB_METABOLIC_ADAPTATION}

## Principle 3: Nutrition Principles
${KB_NUTRITION}

## Principle 4: Fat Loss Strategy
${KB_FAT_LOSS}

## Principle 5: Reverse Dieting
${KB_REVERSE_DIETING}

## Principle 6: Training and Cardio
${KB_TRAINING}

## Principle 7: Behavioral Strategy
${KB_BEHAVIORAL}

## Principle 8: Sample Training Splits
${KB_LAYNE_NORTON_TRAINING_SPLITS}

## Exercise Library
This is the primary library of exercises you must use. Exercise names in your response MUST exactly match an exercise name from this library.
${KB_EXERCISE_LIBRARY}

## Recipe Library
This section contains recipes you can use as inspiration.
${KB_GOURMET_NUTRITION_RECIPES}
    `;
}


export const getAIRecommendation = async (data: CheckInData, previousPlan: CheckInData | null, workoutLogs: WorkoutLog[], trainingPlan: TrainingPlan | null, history: CheckInRecord[]): Promise<AIRecommendation> => {
  const systemInstruction = `You are 'Atlas', an expert metabolic coach. Your personality is evidence-based, empowering, and precise. Your responses MUST be based on the principles outlined in the knowledge base provided below. Do not deviate from this philosophy.
You must also consider the user's specific data provided to give contextual answers. Your goal is to help them achieve sustainable results by making small, precise adjustments to NUTRITION, CARDIO, and their TRAINING PLAN.
You can also recommend a relevant educational article or supplement to help them.

# Proactive Diet Break Advisor
Before generating a standard adjustment, you MUST first analyze the user's long-term trends to determine if a diet break is warranted. A diet break should be proactively suggested IF ALL of the following conditions are met:
1.  The user has been in a 'Fat Loss' phase for at least 6 consecutive weeks without a diet break. You can determine this from the 'history' provided.
2.  Progress has significantly slowed or stalled over the last 2-3 weeks (i.e., minimal weight loss).
3.  Subjective biofeedback markers (like 'energy', 'mood', 'strength') are trending downwards.

If these conditions are met, you MUST return an 'action' of 'SUGGEST_BREAK'. The 'rationale' should explain to the user why the break is recommended, citing their data (e.g., "After 8 weeks of consistent dieting, your progress has slowed and your energy is trending down. I recommend a 1-week diet break to...").
When suggesting a break, set all numerical adjustment fields (calorieAdjustment, etc.) to 0.
If the conditions for a diet break are NOT met, proceed with the standard weekly adjustment logic.

# Phase Transition Logic
You have the authority to change the user's diet phase. A phase change is a major event. You should only trigger it at key moments:
1.  **Reverse Diet -> Fat Loss:** If the user was in a 'Reverse Dieting' phase and their maintenance calories have successfully increased (e.g., they are now at or above their predicted TDEE based on their stats) and they are mentally ready (positive biofeedback), you can transition them to a 'Fat Loss' phase. Your rationale must clearly explain this transition.
2.  **Fat Loss -> Reverse Diet:** If a user has completed their fat loss goal or has reached a point where further dieting is unsustainable (very low calories, poor biofeedback for multiple weeks), you should transition them to a 'Reverse Dieting' phase to rebuild their metabolic capacity.
If you decide to change the phase, set the 'updatedDietPhase' field to the new phase. Otherwise, it should be null.

Available Articles for Recommendation:
${availableArticles}

Available Supplements for Recommendation:
${availableSupplements}

${getKnowledgeBasePrompt()}
`;

  const { physiquePhoto, ...textData } = data;

  let promptText = `
    User's Current Check-in Data:
    ${JSON.stringify(textData, null, 2)}
    
    User's Previous Week's Plan (for context):
    ${previousPlan ? JSON.stringify(previousPlan, null, 2) : 'N/A'}

    User's Full Check-in History (newest first, up to 10 records):
    ${JSON.stringify(history.slice(0, 10), null, 2)}

    User's Current Training Plan:
    ${trainingPlan ? JSON.stringify(trainingPlan, null, 2) : 'N/A'}

    User's Workout Logs (Last 7 Days):
    ${workoutLogs.length > 0 ? JSON.stringify(workoutLogs, null, 2) : 'No workouts logged this week.'}

    INSTRUCTIONS:
    Act as the Atlas coach. Analyze all provided data and generate a complete recommendation based on the principles in your knowledge base. FIRST, check if a diet break is needed. SECOND, check if a phase transition is warranted. If neither, proceed with a normal adjustment. Your adjustments should apply to the 'on-plan' days (represented by targetCalories, etc.). The 'offPlanMacros' should not be adjusted by you.
    Your response must be a single JSON object conforming to the schema.
    `;
    
    if (physiquePhoto) {
        promptText += `\n**Physique Photo Analysis:** The user has provided a physique photo. Analyze it in conjunction with their numerical data to assess changes in body composition. Look for visual cues like muscle definition, fullness, and conditioning. Use this visual context to make a more nuanced recommendation. For example, if weight is up but they look leaner, it's likely muscle/glycogen, not fat.`
    }

    if (data.isDietBreak) {
        promptText = `
        User's Current Plan (DIET BREAK):
        ${JSON.stringify(textData, null, 2)}
        
        User's Plan BEFORE The Diet Break:
        ${previousPlan ? JSON.stringify(previousPlan, null, 2) : 'This is an error, there should be a previous plan.'}

        INSTRUCTIONS:
        The user has successfully completed their 1-week diet break. Your task is to transition them back to their fat loss plan.
        1. Write a rationale congratulating them on completing the break and explaining that you are returning them to their previous deficit to continue making progress.
        2. Set the 'action' to 'DECREASE' as you are moving from maintenance back to a deficit.
        3. Calculate the adjustments needed to return to the *previous* fat loss plan (the one before the break).
        4. Set 'recommendedArticleId' to 'diet-breaks' to reinforce the concept.
        5. The training plan does not need to be updated after a diet break. Return the original 'trainingPlan' as 'updatedTrainingPlan'.
        
        User's Current Training Plan:
        ${trainingPlan ? JSON.stringify(trainingPlan, null, 2) : 'N/A'}
        `;
    }
    
    const textPart = { text: promptText };
    const parts: Part[] = [textPart];

    if (physiquePhoto) {
        const mimeType = physiquePhoto.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';
        const imagePart = {
            inlineData: {
                mimeType,
                data: physiquePhoto.split(',')[1],
            },
        };
        parts.push(imagePart);
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: weeklyCheckInResponseSchema,
        }
    });

    return JSON.parse(response.text) as AIRecommendation;
};

export const reforecastFatLossPlan = async (onboardingData: OnboardingData, currentCheckInData: CheckInData, history: CheckInRecord[]): Promise<{ plan: PlanWeek[], sources: GroundingSource[] | null }> => {
  const prompt = `You are 'Atlas', an expert metabolic coach. Your task is to re-forecast a user's long-term fat loss plan based on their progress to date.

    Original Onboarding Data:
    ${JSON.stringify(onboardingData, null, 2)}

    Current Status:
    - Current Weight: ${currentCheckInData.currentWeight} kg
    - Current Diet Phase: ${currentCheckInData.dietPhase}
    - Weeks Completed: ${history.length}

    Full Check-in History (newest first):
    ${JSON.stringify(history.slice(0, 10), null, 2)}

    INSTRUCTIONS:
    1.  Analyze the user's actual rate of weight loss from their history.
    2.  Project a new timeline to reach their 'targetBodyFat' of ${onboardingData.targetBodyFat}%. When projecting, you MUST account for the user's 'cheatDaysPerWeek' (${onboardingData.cheatDaysPerWeek}) from their onboarding data. A week with cheat days will result in a smaller total weekly deficit, thus extending the timeline.
    3.  Create a new week-by-week 'planOverview' from the current week (${history.length + 1}) until the goal is reached.
    4.  Strategically insert a 1-week "Diet Break" for every 8 weeks of "Fat Loss" in the *future* plan.
    5.  Your response MUST be a single, valid JSON object containing only the "planOverview" array, conforming to the schema.
    6.  If a 'physiqueGoal' is present, use Google Search to ensure the plan's timeline and structure are realistic and inspiring, then return the sources.

    JSON Schema for 'planOverview':
    ${JSON.stringify({type: Type.ARRAY, items: {type: Type.OBJECT, properties: {weekNumber: {type: Type.INTEGER}, phase: {type: Type.STRING, enum: ['Fat Loss', 'Diet Break']}, projectedWeightKg: {type: Type.NUMBER}}, required: ['weekNumber', 'phase', 'projectedWeightKg']}}, null, 2)}
    `;
    
    let finalResponse;
    if (onboardingData.physiqueGoal) {
         finalResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{parts: [{text: prompt}]}],
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
    } else {
        finalResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{parts: [{text: prompt}]}],
             config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        planOverview: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    weekNumber: { type: Type.INTEGER },
                                    phase: { type: Type.STRING, enum: ['Fat Loss', 'Diet Break'] },
                                    projectedWeightKg: { type: Type.NUMBER },
                                },
                                required: ['weekNumber', 'phase', 'projectedWeightKg'],
                            }
                        }
                    }
                }
            }
        });
    }
    
    const sources = finalResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk) as GroundingSource[] || null;
    const result = JSON.parse(finalResponse.text);

    return { plan: result.planOverview, sources };
};

const initialPlanResponseSchema = {
    type: Type.OBJECT,
    properties: {
        planOverview: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    weekNumber: { type: Type.INTEGER },
                    phase: { type: Type.STRING, enum: ['Fat Loss', 'Diet Break'] },
                    projectedWeightKg: { type: Type.NUMBER },
                },
                required: ['weekNumber', 'phase', 'projectedWeightKg'],
            },
        },
        trainingPlan: trainingPlanSchema,
    },
    required: ['trainingPlan']
};

export const generateInitialPlansAndRoadmap = async (data: OnboardingData): Promise<{
    checkInData: CheckInData;
    planOverview: PlanWeek[] | null;
    trainingPlan: TrainingPlan | null;
    planSources: GroundingSource[] | null;
}> => {
    // 1. Calculate the nutrition plan locally. This is now the single source of truth.
    const nutritionPlan = calculateInitialPlan(data);

    const systemInstruction = `
You are 'Atlas', an expert metabolic and strength coach. Your entire coaching philosophy is based on the principles outlined in the knowledge base provided below. Do not deviate from this philosophy.
Your task is to generate a training plan and a long-term roadmap for a new user based on their profile and their pre-calculated nutrition plan.

CRITICAL INSTRUCTION: Analyze the user's profile and their pre-calculated starting nutrition plan. The user's starting 'dietPhase' has already been determined by the system. You MUST use this information as context to create the most appropriate training plan and, if applicable, a fat loss roadmap.

Your response MUST be a single, valid JSON object that can be parsed directly. It must contain "trainingPlan" and may contain "planOverview".

${getKnowledgeBasePrompt()}
`;
    
    let prompt = `
    User Profile: ${JSON.stringify(data, null, 2)}
    
    User's Pre-Calculated Initial Nutrition Plan (Context Only):
    ${JSON.stringify(nutritionPlan, null, 2)}

    INSTRUCTIONS:
    Act as the Atlas coach. Based on the user's profile, their calculated nutrition plan, and your knowledge base, generate the following:
    - **Training Plan (trainingPlan):** Generate a complete, new training plan based on the user's experience, frequency, and equipment. The exercises MUST be selected from the provided Exercise Library and their names must match exactly.
    - **Roadmap (planOverview):** If the user's starting phase is 'Fat Loss', create a week-by-week projection to their goal, including strategic diet breaks (1 week break for every 8-12 weeks of fat loss). The roadmap should start from week 1. If the starting phase is NOT 'Fat Loss', this field should be an empty array.

    Your entire response MUST be a single JSON object conforming to the schema.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: initialPlanResponseSchema,
        }
    });

    const result = JSON.parse(response.text);

    return {
        checkInData: nutritionPlan, // Use the locally calculated, correct plan
        planOverview: result.planOverview || null,
        trainingPlan: result.trainingPlan,
        planSources: null, // No search grounding in this call.
    };
};

export const createChat = (onboardingData: OnboardingData, checkInData: CheckInData, history: CheckInRecord[]): Chat => {
    const systemInstruction = `You are 'Atlas', an expert metabolic coach. Your personality is evidence-based, empowering, and precise. You have access to the user's full profile and history to provide contextual answers. Do not ask for information you already have. Your responses MUST be based on the principles outlined in the knowledge base provided below.

${getKnowledgeBasePrompt()}

# User Context (DO NOT repeat this back to the user):
- Onboarding Data: ${JSON.stringify(onboardingData)}
- Current Plan: ${JSON.stringify(checkInData)}
- Recent History: ${JSON.stringify(history.slice(0, 5))}
`;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        },
    });
    return chat;
};

export const getMealMacrosFromImage = async (base64Image: string): Promise<MealAnalysis> => {
    const systemInstruction = `You are a food analysis expert. Your task is to analyze an image of a meal and provide an estimated breakdown of its macronutrients (calories, protein, carbs, fat). Be as accurate as possible, stating your portion size assumptions in the rationale. Your response MUST be a single JSON object conforming to the schema.`;
    const prompt = `Analyze the meal in this image and provide your best estimate for its nutritional content.`;
    
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: mealLoggerResponseSchema,
        }
    });
    
    return JSON.parse(response.text) as MealAnalysis;
};

export const convertIngredients = async (meal: Meal, targetUnit: string): Promise<Meal> => {
    const systemInstruction = `You are an expert recipe assistant. Your task is to convert the ingredient quantities in a given recipe JSON object to a specified unit system.
    - For 'Grams', convert all units to metric grams (g). Use reasonable densities for volume-to-weight conversions (e.g., 1 cup flour ≈ 120g).
    - For 'Pounds', convert all units to imperial pounds (lbs) or ounces (oz).
    - For 'Spoons', convert all units to tablespoons (tbsp) or teaspoons (tsp).
    - If a unit is already in the target system, keep it.
    - If an ingredient is a whole item (e.g., "1 large onion", "1 scoop protein powder"), you can leave it as is, but if a conversion makes sense (e.g. a scoop of protein powder to grams), perform it.
    - Your response MUST be ONLY the modified JSON object for the meal, conforming to the provided schema. Do not add any other text.`;
    
    const prompt = `
    Please convert the 'ingredients' list in the following JSON object to the '${targetUnit}' unit system.
    
    Original Recipe JSON:
    ${JSON.stringify(meal, null, 2)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: mealSchema,
        }
    });

    return JSON.parse(response.text) as Meal;
};

export const generateWeeklyMealPlan = async (checkInData: CheckInData, onboardingData: OnboardingData, history: CheckInRecord[], loggedMeals: DailyMealLog[], preferences: string): Promise<MealPlan> => {
    const systemInstruction = `You are 'Atlas', an expert nutrition coach and chef. Your task is to create a realistic, delicious, and macro-compliant 7-day meal plan for a user based on their current targets and preferences.
    - Adhere strictly to the user's calorie and macro targets FOR EACH SPECIFIC DAY TYPE (on-plan vs off-plan).
    - Ensure meal variety and ease of preparation.
    - You have a library of "Gourmet Nutrition" recipes available in your knowledge base. You should use these recipes as inspiration and incorporate them or variations of them into the plan where they fit the user's macros and preferences.
    - Your response MUST be a single JSON object conforming to the mealPlanResponseSchema.
    ${getKnowledgeBasePrompt()}
    `;

    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const offPlanDays = onboardingData.cheatDays && onboardingData.cheatDays.length > 0
        ? onboardingData.cheatDays.map(dayIndex => dayMap[dayIndex]).join(', ')
        : 'None. All days are on-plan.';

    const prompt = `
    User's On-Plan Macro Targets (for diet days):
    ${JSON.stringify({ calories: checkInData.targetCalories, protein: checkInData.targetProtein, carbs: checkInData.targetCarbs, fat: checkInData.targetFat }, null, 2)}

    User's Off-Plan Macro Targets (for maintenance/cheat days):
    ${checkInData.offPlanMacros ? JSON.stringify(checkInData.offPlanMacros, null, 2) : "Not applicable. User has 0 off-plan days."}
    
    User's Preferences/Restrictions:
    ${preferences || 'None specified.'}
    
    User's Recently Logged Meals (for variety inspiration):
    ${JSON.stringify(loggedMeals, null, 2)}

    CRITICAL INSTRUCTIONS:
    1.  Generate a complete 7-day meal plan. The week starts on Monday (day 1) and ends on Sunday (day 7).
    2.  The user's designated off-plan (cheat) days are: **${offPlanDays}**.
    3.  You MUST use the 'Off-Plan Macro Targets' for the specified off-plan days.
    4.  You MUST use the 'On-Plan Macro Targets' for all other days.
    5.  The 'dailyTotals' for each of the 7 days in your response MUST accurately reflect the correct macros for that specific day (on-plan vs off-plan).
    6.  The final 'weeklyAverages' in your JSON response must be the mathematical average of the 7 distinct daily totals you generate.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: mealPlanResponseSchema,
        }
    });

    return JSON.parse(response.text) as MealPlan;
};

export const generateShoppingList = async (mealPlan: MealPlan): Promise<ShoppingList> => {
    const systemInstruction = `You are a helpful shopping assistant. Your task is to consolidate all ingredients from a weekly meal plan into a categorized shopping list. Consolidate quantities (e.g., if Monday needs 100g chicken and Wednesday needs 150g, list "250g Chicken Breast"). Your response MUST be a single JSON object conforming to the shoppingListResponseSchema.`;

    const prompt = `
    Generate a categorized shopping list based on this weekly meal plan. Consolidate all items.

    Meal Plan:
    ${JSON.stringify(mealPlan.weeklyPlan, null, 2)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: shoppingListResponseSchema,
        }
    });

    return JSON.parse(response.text) as ShoppingList;
};

export const getDailyCoachingTip = async (checkInData: CheckInData, history: CheckInRecord[]): Promise<DailyCoachingTip> => {
    const systemInstruction = `You are 'Atlas', an expert behavioral coach. Your task is to provide a short, actionable daily tip based on the user's current situation. Your response MUST be a single JSON object conforming to the dailyCoachingTipSchema.
    ${KB_BEHAVIORAL}
    `;

    const prompt = `
    User's Current Plan and Status:
    ${JSON.stringify({ dietPhase: checkInData.dietPhase, isDietBreak: checkInData.isDietBreak, targetCalories: checkInData.targetCalories })}
    
    User's Recent Biofeedback (last 2 weeks):
    ${JSON.stringify(history.slice(0, 2).map(r => r.checkInData), null, 2)}

    INSTRUCTIONS: Generate a relevant, encouraging, and actionable daily tip. Focus on mindset, behavior, or adherence.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: dailyCoachingTipSchema,
        }
    });

    return JSON.parse(response.text) as DailyCoachingTip;
};

export const generateMonthlyReview = async (lastFourWeeks: CheckInRecord[]): Promise<MonthlyReviewReport> => {
    const systemInstruction = `You are 'Atlas', an expert data analyst and coach. Your task is to synthesize the last four weeks of check-in data into a motivating and insightful monthly review. Your response MUST be a single JSON object conforming to the monthlyReviewResponseSchema.
    ${getKnowledgeBasePrompt()}
    `;

    const prompt = `
    User's Last 4 Weeks of Data (newest first):
    ${JSON.stringify(lastFourWeeks, null, 2)}

    INSTRUCTIONS: Analyze the trends in weight, biofeedback, and adherence over the last month. Generate a monthly review that highlights successes, identifies challenges, and sets a strategic focus for the upcoming month. Be encouraging and data-driven.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: monthlyReviewResponseSchema,
        }
    });

    return JSON.parse(response.text) as MonthlyReviewReport;
};

export const generateOrModifyRecipe = async (checkInData: CheckInData, prompt: string, existingRecipe?: Meal): Promise<Meal> => {
    const systemInstruction = `You are 'Atlas', an expert recipe creator. Your task is to generate a new recipe or modify an existing one based on user requests, ensuring it's macro-friendly and fits their current goals. Your response MUST be a single JSON object conforming to the 'mealSchema'.`;

    let fullPrompt = `
    User's Current Macro Targets (for a single meal, roughly 1/3 to 1/4 of daily total):
    - Calories: ~${Math.round(checkInData.targetCalories / 3.5)}
    - Protein: ~${Math.round(checkInData.targetProtein / 3.5)}

    User's Request: "${prompt}"
    `;

    if (existingRecipe) {
        fullPrompt += `
        
        Modify this existing recipe:
        ${JSON.stringify(existingRecipe, null, 2)}
        `;
    } else {
        fullPrompt += `
        
        Generate a brand new recipe based on the request.
        `;
    }
    
    fullPrompt += `\nINSTRUCTIONS: Create a single recipe that fits the user's request and is a good choice for their goals. Populate all fields in the mealSchema.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: fullPrompt }] }],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: mealSchema,
        }
    });

    return JSON.parse(response.text) as Meal;
};

export const getExerciseSwapSuggestion = async (
    exerciseToSwap: Exercise,
    workoutDay: WorkoutDay,
    onboardingData: OnboardingData
): Promise<Exercise> => {
    const systemInstruction = `You are 'Atlas', an expert strength and conditioning coach. Your task is to provide a smart, biomechanically similar exercise substitution. You MUST select an exercise from the provided Exercise Library.
    ${getKnowledgeBasePrompt()}`;
    
    const prompt = `
    A user needs to swap an exercise in their current workout.
    
    User's Profile:
    - Experience: ${onboardingData.trainingExperience}
    - Available Equipment: ${onboardingData.equipment}
    
    Current Workout Day:
    - Focus: ${workoutDay.focus}
    - Original Schedule: ${JSON.stringify(workoutDay.exercises)}
    
    Exercise to Swap:
    ${JSON.stringify(exerciseToSwap)}
    
    INSTRUCTIONS:
    1. Analyze the exercise to swap, paying attention to the primary muscles worked (e.g., Barbell Bench Press targets chest, shoulders, triceps) and the intended stimulus (e.g., ${exerciseToSwap.reps} reps suggests ${parseInt(exerciseToSwap.reps.split('-')[0]) < 10 ? 'strength' : 'hypertrophy'}).
    2. Suggest ONE single, effective replacement exercise that targets the same primary muscle groups.
    3. The replacement MUST be possible with the user's available equipment.
    4. The replacement's name MUST EXACTLY match an exercise from your Exercise Library.
    5. Adjust the sets, reps, RIR, and rest period to be appropriate for the new exercise and the workout's focus, but keep them similar to the original exercise.
    6. Your response MUST be a single JSON object conforming to the exercise schema.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: exerciseSchema,
        }
    });

    return JSON.parse(response.text) as Exercise;
};

export const generateGoalTransitionPlan = async (
    onboardingData: OnboardingData,
    currentCheckInData: CheckInData,
    history: CheckInRecord[],
    newGoal: DietPhase
): Promise<GoalTransitionPlan> => {
    const systemInstruction = `You are 'Atlas', an expert metabolic coach. Your personality is evidence-based, empowering, and precise. Your responses MUST be based on the principles outlined in the knowledge base provided below.
    Your task is to create a seamless transition plan for a user who wants to change their diet phase.
    ${getKnowledgeBasePrompt()}`;
    
    const prompt = `
    A user wants to change their primary goal. Generate a transition plan with new macros and cardio targets.

    User's Onboarding Profile:
    ${JSON.stringify(onboardingData, null, 2)}

    User's Current Plan:
    ${JSON.stringify(currentCheckInData, null, 2)}
    
    User's Recent History (for context on metabolic state):
    ${JSON.stringify(history.slice(0, 5), null, 2)}

    **Transition Request:**
    - From Current Phase: ${currentCheckInData.dietPhase}
    - To New Goal: ${newGoal}

    **INSTRUCTIONS:**
    1.  Analyze the user's current situation and their desired new goal.
    2.  Calculate a new set of daily macro targets (calories, protein, carbs, fat, fiber) and weekly cardio minutes that are appropriate for the **new goal**.
    3.  When transitioning, consider their current metabolic state. For example:
        -   If moving from 'Fat Loss' to 'Maintenance', calculate their current estimated TDEE based on their progress and set macros accordingly.
        -   If moving from 'Fat Loss' to 'Reverse Dieting', start with a conservative calorie increase (e.g., +100-150 kcal) above their current deficit macros and reduce cardio slightly.
        -   If moving from 'Maintenance' to 'Fat Loss', create a reasonable deficit (e.g., 20%) from their current maintenance intake.
    4.  Write a clear, encouraging 'rationale' explaining the changes and what the user can expect.
    5.  The 'updatedDietPhase' in your response MUST be '${newGoal}'.
    6.  Your response MUST be a single JSON object conforming to the schema.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: goalTransitionResponseSchema,
        }
    });

    return JSON.parse(response.text) as GoalTransitionPlan;
};