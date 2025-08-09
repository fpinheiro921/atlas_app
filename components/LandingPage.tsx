import React from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { DashboardMockup } from './landing/DashboardMockup';
import { CheckInMockup } from './landing/CheckInMockup';
import { MealPlanMockup } from './landing/MealPlanMockup';


interface LandingPageProps {
    onStartOnboarding: () => void;
}

const ValuePropCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 dark:bg-brand/20">
            <span className="material-symbols-outlined text-3xl text-brand">{icon}</span>
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{children}</p>
    </div>
);


export const LandingPage: React.FC<LandingPageProps> = ({ onStartOnboarding }) => {
  return (
    <div className="w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0c0c0c] dark:to-[#161616] font-sans text-slate-800 dark:text-slate-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 sm:pt-32 pb-16 sm:pb-24 px-4">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>
        <div className="container mx-auto relative grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
                <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
                    THE A.I. COACH FOR
                </h1>
                <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-brand tracking-tight uppercase mt-2">
                    A COMPLETE TRANSFORMATION.
                </h2>
                <p className="mt-6 max-w-2xl mx-auto md:mx-0 text-lg sm:text-xl text-slate-600 dark:text-slate-400">
                    Stop guessing. Atlas is your AI coach for a complete body transformation. Get a dynamic plan that evolves with you, log meals with your camera, and receive precise adjustments to guarantee you reach your goal—no matter your starting point.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Button onClick={onStartOnboarding} size="lg">
                        Start Your 7-Day Free Trial
                    </Button>
                </div>
            </div>
            <div className="relative">
               <DashboardMockup />
            </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Why Most Fitness Plans Fail.</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Generic plans work, until they don't. Your body is a complex system that adapts to everything you do. A static PDF or a cookie-cutter program can't adapt with you, leading to frustrating plateaus.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Card className="border-red-500/30">
              <h3 className="text-2xl font-bold text-red-500 text-center">The Static Plan Trap</h3>
              <p className="text-center text-slate-500 dark:text-slate-400 mt-2">The Vicious Cycle</p>
              <ul className="mt-6 space-y-4 text-left">
                <li className="flex items-start"><span className="material-symbols-outlined text-red-500 mr-3">calendar_today</span><div><span className="font-semibold">One-Size-Fits-All</span><br/>Your plan doesn't account for your unique metabolism or history.</div></li>
                <li className="flex items-start"><span className="material-symbols-outlined text-red-500 mr-3">stat_minus_1</span><div><span className="font-semibold">Metabolic Adaptation</span><br/>Your body adapts, progress stalls, and the plan doesn't change with it.</div></li>
                <li className="flex items-start"><span className="material-symbols-outlined text-red-500 mr-3">help</span><div><span className="font-semibold">Plateau Confusion</span><br/>You're stuck and have no idea how to adjust your macros to break through.</div></li>
              </ul>
            </Card>
            <Card className="border-green-500/30">
              <h3 className="text-2xl font-bold text-green-500 text-center">The AI-Powered Edge</h3>
              <p className="text-center text-slate-500 dark:text-slate-400 mt-2">The Path to Freedom</p>
              <ul className="mt-6 space-y-4 text-left">
                <li className="flex items-start"><span className="material-symbols-outlined text-green-500 mr-3">model_training</span><div><span className="font-semibold">Truly Personalized</span><br/>Your plan is built from day one for your body, goals, and experience.</div></li>
                <li className="flex items-start"><span className="material-symbols-outlined text-green-500 mr-3">precision_manufacturing</span><div><span className="font-semibold">Dynamic Adjustments</span><br/>The AI makes precise changes to your plan every week based on your data.</div></li>
                <li className="flex items-start"><span className="material-symbols-outlined text-green-500 mr-3">lock</span><div><span className="font-semibold">Achieve & Maintain</span><br/>Get to your goal and build a powerful metabolism that lets you stay lean.</div></li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Your AI Coach for a Complete Transformation</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Atlas replaces guesswork with a powerful, data-driven feedback loop.
            </p>
          </div>
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <CheckInMockup />
              </div>
              <h3 className="text-xl font-bold">1. Feed The AI Your Data</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Log your workouts, check in weekly, and snap photos of your meals. The more data, the smarter the coach.</p>
            </div>
             <div className="text-center">
               <div className="flex justify-center mb-6">
                 {/* A simple mockup for this step */}
                 <div className="bg-slate-800/80 backdrop-blur-xl rounded-card shadow-xl shadow-black/40 border border-white/10 overflow-hidden w-full max-w-sm mx-auto">
                    <div className="flex items-center gap-1.5 p-2 bg-slate-900/50">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                    </div>
                    <div className="p-4 space-y-3">
                         <div className="w-3/4 h-5 bg-slate-700 rounded animate-pulse"></div>
                         <div className="w-full h-20 bg-slate-700 rounded animate-pulse opacity-70"></div>
                         <div className="w-full h-10 bg-brand rounded-lg animate-pulse"></div>
                    </div>
                </div>
              </div>
              <h3 className="text-xl font-bold">2. Get Precision Adjustments</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">The AI analyzes your trends and delivers exact changes to your macros, cardio, and training to guarantee progress.</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <MealPlanMockup />
              </div>
              <h3 className="text-xl font-bold">3. Achieve Your Goal & Stay There</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Systematically strip away body fat and build a powerful metabolism that lets you stay lean, year-round.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">The Atlas Advantage</h2>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                    Atlas is more than a collection of features; it's a complete system designed to guarantee your success.
                </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <ValuePropCard icon="model_training" title="Eliminate Guesswork">The AI does the hard work, providing clear rationale for every adjustment. No more trial-and-error.</ValuePropCard>
                <ValuePropCard icon="savings" title="Save Significant Money">Get the core feedback loop of a high-end human coach (a $200-$500/mo value) for a fraction of the price.</ValuePropCard>
                <ValuePropCard icon="school" title="Build Real Knowledge">Learn the 'why' behind your plan with built-in articles and insights, empowering you for life.</ValuePropCard>
                <ValuePropCard icon="military_tech" title="Guaranteed Results">As long as you provide the data, the AI will adapt to ensure you never plateau again.</ValuePropCard>
            </div>
        </div>
      </section>

      {/* Competitor Comparison Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
                <p className="font-semibold text-brand uppercase">The Old Way vs. The Atlas Way</p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">There's a Smarter Way to Transform.</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">Your body is a dynamic system. Your fitness plan should be too. Here's how Atlas stacks up against other solutions.</p>
            </div>
            <div className="overflow-x-auto max-w-5xl mx-auto mt-12">
                <table className="w-full border-collapse text-center min-w-[640px]">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="p-4 text-left text-lg font-semibold text-slate-900 dark:text-white">Key Feature</th>
                            <th className="p-4 text-lg font-semibold text-brand">Atlas AI</th>
                            <th className="p-4 text-lg font-semibold text-slate-900 dark:text-white">Carbon Diet Coach</th>
                            <th className="p-4 text-lg font-semibold text-slate-900 dark:text-white">Human Coach</th>
                            <th className="p-4 text-lg font-semibold text-slate-900 dark:text-white">MyFitnessPal</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="p-4 text-left">Dynamic Weekly Adjustments</td>
                            <td><span className="material-symbols-outlined text-green-500">check_circle</span></td>
                            <td><span className="material-symbols-outlined text-green-500">check_circle</span></td>
                            <td><span className="material-symbols-outlined text-green-500">check_circle</span> (Manual)</td>
                            <td><span className="material-symbols-outlined text-red-500">cancel</span></td>
                        </tr>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="p-4 text-left">AI Photo Meal Logging</td>
                            <td><span className="material-symbols-outlined text-green-500">check_circle</span></td>
                            <td><span className="material-symbols-outlined text-red-500">cancel</span></td>
                            <td><span className="material-symbols-outlined text-red-500">cancel</span></td>
                            <td><span className="material-symbols-outlined text-red-500">cancel</span> (Manual Entry)</td>
                        </tr>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="p-4 text-left">Integrated & Progressive Training</td>
                            <td><span className="material-symbols-outlined text-green-500">check_circle</span></td>
                            <td><span className="material-symbols-outlined text-red-500">cancel</span></td>
                            <td><span className="material-symbols-outlined text-green-500">check_circle</span></td>
                            <td><span className="material-symbols-outlined text-red-500">cancel</span> (Generic Plans)</td>
                        </tr>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="p-4 text-left">24/7 AI Chat Support</td>
                            <td><span className="material-symbols-outlined text-green-500">check_circle</span></td>
                            <td><span className="material-symbols-outlined text-red-500">cancel</span></td>
                            <td><span className="material-symbols-outlined text-red-500">cancel</span> (Limited Hours)</td>
                            <td><span className="material-symbols-outlined text-red-500">cancel</span></td>
                        </tr>
                        <tr>
                            <td className="p-4 text-left font-semibold text-slate-800 dark:text-slate-200">Average Monthly Price</td>
                            <td className="p-4 font-bold text-lg text-brand">$19</td>
                            <td className="p-4 font-bold text-lg text-slate-800 dark:text-slate-200">$10</td>
                            <td className="p-4 font-bold text-lg text-slate-800 dark:text-slate-200">$500+</td>
                            <td className="p-4 font-bold text-lg text-slate-800 dark:text-slate-200">$20 (No Coaching)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="text-center mt-8">
                <p className="text-lg max-w-3xl mx-auto text-slate-600 dark:text-slate-400">While other apps offer basic adjustments, Atlas is the only platform that combines dynamic nutrition coaching with AI-powered meal logging and a fully integrated, progressive training plan. It's the complete transformation system.</p>
            </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <p className="font-semibold text-brand uppercase">Simple, Transparent Pricing</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">One Plan. Unlimited Results.</h2>
          </div>
          <div className="mt-12 max-w-lg mx-auto">
            <Card className="border-2 border-brand shadow-2xl shadow-brand/10">
                <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Atlas Full Access</h3>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Everything you need to transform your body and never hit a plateau again.</p>
                </div>
                <div className="mt-6 mb-8 flex justify-center items-baseline gap-2">
                    <span className="font-display text-5xl font-extrabold text-slate-900 dark:text-white">$19</span>
                    <span className="text-xl text-slate-500 dark:text-slate-400">/ month</span>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-green-500">check_circle</span> <div><span className="font-semibold text-slate-800 dark:text-slate-200">Unlimited</span> Dynamic Weekly AI Coaching</div></li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-green-500">check_circle</span> <div><span className="font-semibold text-slate-800 dark:text-slate-200">Unlimited</span> AI Photo Meal Logs</div></li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-green-500">check_circle</span> <div><span className="font-semibold text-slate-800 dark:text-slate-200">Unlimited</span> 24/7 AI Chat Coach Access</div></li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-green-500">check_circle</span> Personalized Training & AI Meal Planner</li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-green-500">check_circle</span> Full Progress Tracking & Education Library</li>
                </ul>
                <Button onClick={onStartOnboarding} size="lg" className="w-full mt-8">Start My Transformation</Button>
                <div className="text-center mt-4">
                    <p className="font-semibold text-sm">
                        Or save 17% with our{' '}
                        <button onClick={onStartOnboarding} className="text-brand hover:underline focus:outline-none">
                            Best Value Plan
                        </button>
                        {' '}— $199 per year.
                    </p>
                </div>
            </Card>
            <div className="mt-10 text-center">
                <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg inline-block text-sm">
                    <p><span className="font-bold text-slate-800 dark:text-slate-200">Your Plateau-Proof Guarantee:</span> Not seeing results? If you complete your weekly check-ins for 30 days and don't see progress, we'll send you a full refund. No questions asked.</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Atlas AI. All Rights Reserved.
          </div>
      </footer>
    </div>
  );
};
