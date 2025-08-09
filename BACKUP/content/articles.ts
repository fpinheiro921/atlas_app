import type { Article } from '../types';

export const articles: Article[] = [
    {
        id: 'metabolic-adaptation',
        category: 'Science',
        title: 'Why Plateaus Happen: Understanding Metabolic Adaptation',
        summary: "Weight loss isn't linear. Learn why your body's metabolism adapts to dieting and how these 'plateaus' are a normal part of the process.",
        content: `
<p>If you've ever been frustrated by a weight loss plateau, you're not alone. It's a common experience, but it's not a sign of failure. It's a sign that your body is working exactly as it's designed to: to keep you alive.</p>
<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-900 dark:text-white">Your Body's Self-Defense System</h3>
<p>Dieting, or creating a caloric deficit, is interpreted by your body as a form of "controlled starvation." In response, it activates a powerful, three-pronged self-defense system:</p>
<ul class="list-disc list-inside space-y-2 mt-2 pl-4">
    <li><strong>Defend:</strong> It slows your metabolic rate to prevent further weight loss.</li>
    <li><strong>Restore:</strong> It increases hunger signals and the efficiency of fat storage to encourage weight regain.</li>
    <li><strong>Prevent:</strong> It makes future weight loss more difficult.</li>
</ul>
<p class="mt-4">This process is called <strong>metabolic adaptation</strong>. As you lose weight, your Total Daily Energy Expenditure (TDEE) decreases more than would be expected from just the loss of body mass. Your Basal Metabolic Rate (BMR) slows down, and your Non-Exercise Activity Thermogenesis (NEAT)—the calories you burn from fidgeting and subconscious movement—drops significantly. What was once a deficit becomes your new maintenance.</p>
<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-900 dark:text-white">What To Do About It</h3>
<p>A plateau doesn't mean your diet has failed. It means it's time for a strategic adjustment. Instead of making drastic, unsustainable cuts, a small, precise change to your calorie intake or activity level is usually enough to re-establish the deficit and get progress moving again. This is why weekly check-ins are so crucial. They allow us to identify a plateau and make a calculated change, breaking through the stall and continuing your journey sustainably.</p>
        `,
    },
    {
        id: 'diet-breaks',
        category: 'Strategy',
        title: 'The Power of Diet Breaks',
        summary: "Learn why taking a planned 1-2 week break at maintenance isn't 'cheating'—it's a powerful strategy to combat metabolic adaptation and improve long-term success.",
        content: `
<p>The idea of taking a "break" from your diet might sound counterintuitive, but it's one of the most effective strategies for long-term, sustainable fat loss. A planned diet break isn't a free-for-all; it's a structured, one to two-week period where you intentionally increase your calories back up to your current maintenance level.</p>
<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-900 dark:text-white">Why Take a Break?</h3>
<p>Diet breaks directly combat the negative effects of metabolic adaptation. By temporarily removing the caloric deficit, you give your body a chance to recover:</p>
<ul class="list-disc list-inside space-y-2 mt-2 pl-4">
    <li><strong>Metabolic Boost:</strong> Taking time at maintenance can help up-regulate your BMR and NEAT, making subsequent fat loss more efficient.</li>
    <li><strong>Hormonal Reset:</strong> It can help normalize hormones like leptin (which controls satiety) and ghrelin (the hunger hormone), making the diet easier to adhere to when you resume.</li>
    <li><strong>Psychological Relief:</strong> The mental fatigue of being in a prolonged deficit is real. A diet break provides a much-needed psychological reset, boosting motivation and preventing burnout.</li>
</ul>
<p class="mt-4">Research, like the MATADOR study, has shown that dieters who incorporate intermittent breaks lose more weight and maintain a higher metabolic rate compared to those who diet continuously. Think of it as taking one step back to take two steps forward. It's a strategic pause that sets you up for greater success in the long run.</p>
        `,
    },
    {
        id: 'reverse-dieting',
        category: 'Strategy',
        title: 'What is Reverse Dieting?',
        summary: 'Finished your diet? The work has just begun. Learn how slowly increasing your calories post-diet is the key to solidifying your results and preventing weight regain.',
        content: `
<p>The diet after the diet is the most crucial, yet most neglected, phase of a fat loss journey. This is where a Reverse Diet comes in. It's not a magic fix; it's a strategic process of slowly and methodically increasing your caloric intake over time after a fat loss phase.</p>
<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-900 dark:text-white">The Goal: Build, Don't Rebound</h3>
<p>After a diet, your metabolism is adapted to a lower calorie intake. If you immediately jump back to your old eating habits, you'll regain the weight rapidly—and often, you'll gain back more fat than you lost. The goal of a reverse diet is to prevent this by:</p>
<ul class="list-disc list-inside space-y-2 mt-2 pl-4">
    <li><strong>Increasing your metabolic rate:</strong> By adding calories back in a controlled manner, you give your metabolism a chance to adapt upwards, allowing you to maintain your new, leaner physique on a higher calorie budget.</li>
    <li><strong>Minimizing fat regain:</strong> The slow increase in calories allows your body to use the extra energy to fuel recovery and repair, rather than storing it as fat.</li>
    <li><strong>Improving your relationship with food:</strong> It provides a structured transition out of a deficit, helping to prevent the post-diet binging that can derail progress.</li>
</ul>
<p class="mt-4">A successful reverse diet takes patience and consistency. By carefully monitoring your weight and making small, weekly adjustments, you can increase your "metabolic capacity," making future fat loss phases easier and solidifying your hard-earned results for the long term.</p>
        `,
    },
    {
        id: 'atlas-methodology',
        category: 'Core Concepts',
        title: 'The Atlas Methodology: How Your Plan Works',
        summary: "A deep dive into how Atlas determines your diet phase, calculates your personalized macros, and uses strategic off-plan days to ensure your success.",
        content: `
<p>Welcome to Atlas! Understanding the 'why' behind your plan is crucial for long-term success. This guide breaks down the core principles your AI coach uses to build and adapt your personalized roadmap. It's not magic; it's a dynamic, evidence-based system designed to evolve with you.</p>
<h3 class="text-xl font-semibold mt-6 mb-2 text-slate-900 dark:text-white">Step 1: AI Determines Your Starting Phase</h3>
<p>Your stated goal is our ultimate destination. However, the smartest path isn't always a straight line. Based on your profile, particularly your dieting history and current body composition, Atlas determines the most effective starting phase to guarantee your success.</p>
<ul class="list-disc list-inside space-y-3 mt-2 pl-4">
    <li><strong>If you're starting on a Fat Loss Phase:</strong> This means your metabolic health and history indicate you're ready to enter a caloric deficit and see results efficiently.</li>
    <li><strong>If you're starting on a Reverse Dieting Phase:</strong> This is a crucial strategic step. If you have a history of frequent or chronic dieting, your metabolism is likely suppressed. Starting a "Reverse Diet" first is the <strong>fastest way to achieve long-term fat loss</strong>. We slowly add calories to "rev up" your metabolism, making the subsequent fat loss phase much more effective and sustainable. You have to <em>earn the right</em> to diet, and this is how you do it.</li>
    <li><strong>If you're starting on Lean Gaining or Maintenance:</strong> Your plan will be tailored to build muscle with minimal fat gain or to hold your current condition, respectively.</li>
</ul>
<h3 class="text-xl font-semibold mt-6 mb-2 text-slate-900 dark:text-white">Step 2: The Science of Your Macros</h3>
<p>Atlas calculates your initial calorie and macronutrient targets with precision:</p>
<ol class="list-decimal list-inside space-y-2 mt-2 pl-4">
    <li><strong>BMR Calculation:</strong> We start with the Müller Equation, an accurate formula that uses your lean body mass, fat mass, age, and sex to find your Basal Metabolic Rate (BMR).</li>
    <li><strong>Metabolic Adaptation Factor:</strong> We adjust your BMR based on your dieting history. A history of chronic dieting can suppress metabolism, and we account for this to find your true starting point.</li>
    <li><strong>Activity Multiplier:</strong> Your lifestyle and exercise activity levels are used to calculate your Total Daily Energy Expenditure (TDEE) — your estimated daily maintenance calories.</li>
</ol>
<h3 class="text-xl font-semibold mt-6 mb-2 text-slate-900 dark:text-white">Step 3: Calculating Your Daily Targets</h3>
<p>Your daily macro targets are set based on your TDEE and your current phase:</p>
<ul class="list-disc list-inside space-y-2 mt-2 pl-4">
    <li><strong>Fat Loss:</strong> We create a moderate deficit (typically around 20% below TDEE) designed to elicit a sustainable loss of about 0.4-0.8% of your body weight per week.</li>
    <li><strong>Reverse Dieting:</strong> We start you in a small surplus (e.g., 5-15% above TDEE) to kickstart metabolic recovery with minimal fat gain.</li>
    <li><strong>Lean Gaining:</strong> A modest surplus (~10% above TDEE) is used to fuel muscle growth while minimizing fat storage.</li>
</ul>
<h3 class="text-xl font-semibold mt-6 mb-2 text-slate-900 dark:text-white">Step 4: Strategic "Off-Plan" Days</h3>
<p>Consistency is key, but so is flexibility. Atlas incorporates "off-plan" days where you eat at your maintenance calories (TDEE). These are not "cheat days" — they are a planned part of the strategy.</p>
<p class="mt-2">To ensure you still hit your weekly fat loss goal, the AI intelligently adjusts your calories on your "on-plan" days. It calculates the total weekly deficit you need and distributes it across your diet days. This means your on-plan days will have slightly lower calories to compensate for the higher-calorie off-plan day, keeping your progress on track while giving you crucial psychological flexibility.</p>
<p class="mt-4">This entire system—phase, calories, macros, and flexibility—is dynamic. Every week, your AI coach analyzes your check-in data and makes precise adjustments, ensuring the plan evolves with you every step of the way.</p>
        `
    }
];