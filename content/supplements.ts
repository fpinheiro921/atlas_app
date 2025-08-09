import type { Supplement } from '../types';

export const supplements: Supplement[] = [
    {
        id: 'whey-protein',
        category: 'Muscle & Recovery',
        title: 'Whey Protein',
        summary: "A high-quality, fast-digesting protein derived from milk, excellent for stimulating muscle protein synthesis and meeting daily protein goals.",
        content: `
<p>Whey protein is an extremely high-quality protein derived from milk. Its effectiveness stems from high bioavailability, a complete amino acid profile, and a high concentration of Leucine.</p>
<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-900 dark:text-white">Why it Works</h3>
<p>Leucine is the key branched-chain amino acid (BCAA) responsible for stimulating the mTOR pathway, which triggers muscle protein synthesis (MPS). Whey protein contains around 11% leucine, which is higher than most other protein sources, making it very effective for anabolism.</p>
<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-900 dark:text-white">Types of Whey</h3>
<ul class="list-disc list-inside space-y-2 mt-2 pl-4">
    <li><strong>Concentrate (WPC):</strong> The least processed form, contains some fat and lactose. Rich in beneficial bioactive compounds.</li>
    <li><strong>Isolate (WPI):</strong> Further filtered to remove most fat and lactose, resulting in a higher protein concentration. Good for those with mild lactose sensitivity.</li>
    <li><strong>Hydrolysate (WPH):</strong> "Pre-digested" whey that is absorbed very rapidly. It's the most expensive and often has a bitter taste.</li>
</ul>
<p class="mt-4">For most people, WPC or WPI are excellent choices. There is little evidence that WPH provides a significant advantage for muscle growth.</p>
<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-900 dark:text-white">Dosing</h3>
<p>20 to 40 grams per serving is typically effective for maximizing MPS. It can be used anytime throughout the day to help you meet your daily protein target, but it's commonly used post-workout due to its rapid digestion.</p>
        `,
    },
    {
        id: 'creatine',
        category: 'Strength & Performance',
        title: 'Creatine Monohydrate',
        summary: "The most researched and effective legal supplement for increasing high-intensity exercise performance, strength, and lean body mass.",
        content: `
<p>Creatine Monohydrate is arguably the most effective legal non-hormonal ergogenic aid available. It is backed by hundreds of studies demonstrating its effectiveness.</p>
<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-900 dark:text-white">How it Works</h3>
<p>Creatine works by increasing the stores of phosphocreatine in your muscles. Phosphocreatine is a high-energy compound that donates a phosphate group to ADP to rapidly regenerate ATP, the primary energy currency of the cell. This is crucial for short, explosive efforts like weightlifting and sprinting.</p>
<ul class="list-disc list-inside space-y-2 mt-2 pl-4">
    <li>Increases strength and power output.</li>
    <li>Improves performance in repeated bouts of high-intensity exercise.</li>
    <li>Increases lean body mass by drawing water into muscle cells and potentially stimulating anabolic signaling.</li>
    <li>Enhances fatigue resistance.</li>
</ul>
<p class="mt-4">Many different forms of creatine exist, but none have been shown to be superior to the original, most-studied form: creatine monohydrate.</p>
<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-900 dark:text-white">Dosing</h3>
<p>A daily maintenance dose of <strong>3-5 grams</strong> is effective. Some choose to start with a "loading phase" of 20 grams per day (split into 4 doses) for 5-7 days to saturate the muscles faster, but this is not necessary and can cause GI distress in some individuals. Consistent daily intake is the key.</p>
        `,
    },
    {
        id: 'caffeine',
        category: 'Energy & Focus',
        title: 'Caffeine',
        summary: "A powerful central nervous system stimulant that can reduce fatigue, increase alertness, and improve performance during intense workouts.",
        content: `
<p>Caffeine is one of the most effective and widely used performance-boosting supplements. It provides a reliable way to increase energy, focus, and workout capacity, which is particularly useful during a fat loss phase when calories are low.</p>
<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-900 dark:text-white">Key Benefits</h3>
<ul class="list-disc list-inside space-y-2 mt-2 pl-4">
    <li><strong>Decreased Perception of Fatigue:</strong> Caffeine blocks adenosine receptors in the brain, making you feel less tired.</li>
    <li><strong>Improved Performance:</strong> Shown to increase strength, power output, and endurance.</li>
    <li><strong>Enhanced Focus:</strong> Increases alertness and concentration.</li>
</ul>
<p class="mt-4">It's important to note that everyone responds differently to caffeine. Some are very sensitive and may experience anxiety or jitters, while others have a high tolerance.</p>
<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-900 dark:text-white">Dosing and Tolerance</h3>
<p>Effective doses for performance typically range from <strong>3 to 6 milligrams per kilogram of body weight</strong>, taken 45-60 minutes before exercise. However, tolerance builds up quickly with regular use, diminishing the effects. To manage this, it's wise to:</p>
<ul class="list-disc list-inside space-y-2 mt-2 pl-4">
    <li>Save higher doses for your most difficult workouts.</li>
    <li>Consider taking periodic week-long breaks to reset your tolerance, perhaps during a diet break or a deload week from training.</li>
</ul>
        `,
    }
];
