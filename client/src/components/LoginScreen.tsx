
import React, { useState } from 'react';
import { GlassPane } from './GlassPane';

interface LoginScreenProps {
  onAuthenticated: (tier: 'STARTER' | 'GROWTH' | 'WHITELABEL') => void;
  onBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthenticated, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
      // For demo purposes, map generic logins to tiers
      if (email.includes('starter')) onAuthenticated('STARTER');
      else if (email.includes('whitelabel')) onAuthenticated('WHITELABEL');
      else onAuthenticated('GROWTH');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-2 text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Home
        </button>
      </div>

      <div className="w-full max-w-md relative">
        {/* Decoration */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

        <GlassPane className="p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
               <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500 text-sm mt-2">Enter your agency credentials to access the command center.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="agency@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Authenticating...</>
              ) : (
                'Access Terminal'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Protected by Enterprise Encryption. <br/>
              <a href="#" className="text-indigo-500 hover:underline">Forgot Password?</a>
            </p>
          </div>
        </GlassPane>
      </div>
    </div>
  );
};
