import React, { useState } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingFlow } from './components/OnboardingFlow';

type ViewState = 'LANDING' | 'LOGIN' | 'ONBOARDING' | 'DASHBOARD';
type UserTier = 'STARTER' | 'GROWTH' | 'WHITELABEL';

function App() {
  // NOTE: Defaulting to DASHBOARD for immediate access as requested ("Fast Start")
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [userTier, setUserTier] = useState<UserTier>('WHITELABEL'); // Default to max tier for testing
  const [credits, setCredits] = useState(5000);

  const handleLogin = (tier: UserTier) => {
    setUserTier(tier);
    // Set credits based on tier
    if (tier === 'STARTER') setCredits(500);
    if (tier === 'GROWTH') setCredits(1500);
    if (tier === 'WHITELABEL') setCredits(5000);
    
    // Route to dashboard normally
    setCurrentView('DASHBOARD');
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          {currentView === 'LANDING' && (
            <LandingPage onLogin={() => setCurrentView('LOGIN')} />
          )}

          {currentView === 'LOGIN' && (
            <LoginScreen 
              onAuthenticated={handleLogin} 
              onBack={() => setCurrentView('LANDING')} 
            />
          )}

          {currentView === 'ONBOARDING' && (
            <OnboardingFlow onComplete={() => setCurrentView('DASHBOARD')} />
          )}

          {currentView === 'DASHBOARD' && (
            <Dashboard userTier={userTier} credits={credits} />
          )}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
