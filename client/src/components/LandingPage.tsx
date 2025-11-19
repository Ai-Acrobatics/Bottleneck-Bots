
import React from 'react';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen font-sans overflow-y-auto">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/60 backdrop-blur-md border-b border-white/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <span className="text-xl font-bold text-slate-800 tracking-tight">GHL<span className="text-indigo-600">.AGENT</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#credits" className="hover:text-indigo-600 transition-colors">How it Works</a>
          </div>
          <button 
            onClick={onLogin}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-900/20"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">
             <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
             Now in Open Beta
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-tight">
            The First <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500">AI Workforce</span> <br/>for HighLevel Agencies
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Clone funnels, fix workflows, and manage subaccounts with voice commands. 
            The autonomous agent that understands your agency's SOPs.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <button onClick={onLogin} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:scale-105 transition-transform">
              Start Automating
            </button>
            <button className="px-8 py-4 rounded-2xl font-bold text-slate-600 border border-slate-200 hover:bg-white/50 transition-colors backdrop-blur-sm">
              View Demo
            </button>
          </div>
        </div>
        
        {/* Visual Mockup */}
        <div className="mt-16 max-w-5xl mx-auto relative group">
           <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
           <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center">
              <img src="https://placehold.co/1200x675/f8fafc/e2e8f0?text=GHL.AGENT+Dashboard+Preview" alt="Dashboard" className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent"></div>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why Top Agencies Choose GHL.Agent</h2>
            <p className="text-slate-500 mt-4">Built by agency owners, for agency owners.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Visual Building', desc: 'Describe a layout or provide a URL, and our AI rebuilds it inside the GHL Builder perfectly.', icon: '🎨' },
              { title: 'Workflow Debugging', desc: 'The agent scans your automations, identifies broken paths, and fixes them automatically.', icon: '🔧' },
              { title: 'Notion Integration', desc: 'Syncs directly with your Notion client DB. It knows your client\'s brand voice and goals.', icon: '📓' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-indigo-500/5 hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl mb-6">{f.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900">Membership Tiers</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              Premium tools for serious agencies. Choose the capacity that fits your growth.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* Starter */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
              <h3 className="text-2xl font-bold text-slate-800">Agency Starter</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-slate-900">$297</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-slate-600">
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> 1 AI Agent Instance</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> 500 Execution Credits /mo</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> 3 Team Members</li>
                <li className="flex gap-2"><span className="text-slate-400">✕</span> No White Labeling</li>
              </ul>
              <button onClick={onLogin} className="w-full py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Select Plan</button>
            </div>

            {/* Growth (Highlighted) */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-indigo-500 shadow-2xl relative scale-105 z-10 text-white">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold">Agency Growth</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">$497</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-slate-300">
                <li className="flex gap-2"><span className="text-emerald-400">✓</span> 3 Simultaneous Agents</li>
                <li className="flex gap-2"><span className="text-emerald-400">✓</span> 1,500 Execution Credits /mo</li>
                <li className="flex gap-2"><span className="text-emerald-400">✓</span> 10 Team Members</li>
                <li className="flex gap-2"><span className="text-emerald-400">✓</span> Priority Support</li>
              </ul>
              <button onClick={onLogin} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg transition-all">Get Started</button>
            </div>

            {/* White Label */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
              <h3 className="text-2xl font-bold text-slate-800">White Label Partner</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-slate-900">$1,497</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-slate-600">
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Unlimited Agents</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> 5,000 Execution Credits /mo</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Full CNAME / Custom Branding</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Re-sell to Sub-agencies</li>
              </ul>
              <button onClick={onLogin} className="w-full py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Contact Sales</button>
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
