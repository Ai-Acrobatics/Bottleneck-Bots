
import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, CheckCircle2, Zap, Globe, Mail, Phone, BarChart3, Shield, Users } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">GHL Agency AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#demo" className="hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onLogin} className="font-bold text-slate-600 hover:text-indigo-600">
              Log In
            </Button>
            <Button onClick={onLogin} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 rounded-full px-6">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white opacity-70"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">The AI Workforce for High-Growth Agencies</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Scale Your Agency, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Not Your Headcount.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Eliminate fulfillment headaches, reduce overhead, and stop micromanaging.
            Deploy autonomous AI agents to handle support, outreach, and operations 24/7.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Button onClick={onLogin} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/40 rounded-full px-8 h-14 text-lg">
              Deploy Your First Agent
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg border-slate-300 hover:bg-slate-50 text-slate-700">
              View Live Demo
            </Button>
          </div>

          {/* Hero Image / Dashboard Preview */}
          <div className="mt-20 relative max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-20 blur-2xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 bg-white">
              <img src="/assets/demo/global_ops_view_1763563925931.png" alt="Global Operations Dashboard" className="w-full" />
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">One Platform to Rule Them All</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Replace your fragmented stack with a unified command center powered by specialized AI agents.
            </p>
          </div>

        </div>

        <div className="container mx-auto px-6 space-y-32">
          {/* Feature 1: Global Ops */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Global Operations Center</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                See everything happening in your agency at a glance. Monitor active agents, live calls, and campaign performance across all sub-accounts from a single pane of glass.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Real-time agent activity feed</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Live revenue & pipeline tracking</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Instant intervention capabilities</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-50">
              <img src="/assets/demo/global_ops_view_1763563925931.png" alt="Global Ops UI" className="w-full" />
            </div>
          </div>

          {/* Feature 2: AI Ad Manager */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Autonomous Ad Manager</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Stop wasting hours in Ads Manager. Our agents analyze your campaigns, identify underperformers, and automatically suggest or apply optimizations.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Automated ROAS analysis</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>One-click copy variations</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Secure browser automation</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-50">
              <img src="https://placehold.co/800x600/fce7f3/be185d?text=AI+Ad+Manager+Demo" alt="Ad Manager UI" className="w-full" />
            </div>
          </div>

          {/* Feature 3: Marketplace */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Scale on Demand</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Need more power? Instantly add specialized agents, purchase credit packs, or upgrade your capacity directly from the integrated marketplace.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Instant feature activation</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Flexible billing options</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Enterprise-grade security</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-50">
              <img src="https://placehold.co/800x600/d1fae5/047857?text=Marketplace+Demo" alt="Marketplace UI" className="w-full" />
            </div>
          </div>

        </div>
      </section>

      {/* Credits & FAQ */}
      <section id="credits" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Understanding the Credit System</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-bold text-lg mb-4">How credits work</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Our AI agents perform complex tasks that consume computational resources. We utilize a credit-based system to ensure fair usage and scalability.
                Credits renew every month based on your plan.
              </p>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h4 className="font-bold text-indigo-600 mb-3 uppercase text-xs tracking-wider">Cost Examples</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-700">Analyze URL / UX Audit</span>
                    <span className="font-bold">1 Credit</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-700">Fix Workflow Error</span>
                    <span className="font-bold">5 Credits</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-700">Clone Landing Page Section</span>
                    <span className="font-bold">10 Credits</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-700">Build Full Funnel (5 steps)</span>
                    <span className="font-bold">100 Credits</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="collapse collapse-plus bg-white rounded-2xl border border-slate-200">
                <input type="radio" name="my-accordion-3" defaultChecked />
                <div className="collapse-title text-lg font-medium">What happens if I run out?</div>
                <div className="collapse-content">
                  <p className="text-slate-600 text-sm">You can purchase "Top-up Packs" at any time. 500 Credits for $50. Unused top-up credits roll over.</p>
                </div>
              </div>
              <div className="collapse collapse-plus bg-white rounded-2xl border border-slate-200">
                <input type="radio" name="my-accordion-3" />
                <div className="collapse-title text-lg font-medium">Can I control who uses credits?</div>
                <div className="collapse-content">
                  <p className="text-slate-600 text-sm">Yes. In the Team Permission settings, you can set daily or monthly credit limits for individual VAs or Managers.</p>
                </div>
              </div>
              <div className="collapse collapse-plus bg-white rounded-2xl border border-slate-200">
                <input type="radio" name="my-accordion-3" />
                <div className="collapse-title text-lg font-medium">Is the White Label version fully branded?</div>
                <div className="collapse-content">
                  <p className="text-slate-600 text-sm">Absolutely. Your clients will see your domain, your logo, and your colors. We operate purely in the background.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm">
        <p>&copy; 2025 GHL Agent Command Center. All rights reserved.</p>
      </footer>
    </div>
  );
};
