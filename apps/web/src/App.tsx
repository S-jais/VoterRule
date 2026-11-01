import React, { useState, useEffect } from 'react';
import { ChakraBackground } from './components/ChakraBackground.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { LandingPage } from './pages/LandingPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { CheckPage } from './pages/CheckPage.js';
import { MissingNamePage } from './pages/MissingNamePage.js';
import { IssuesPage } from './pages/IssuesPage.js';
import { DuplicateSelfCheckPage } from './pages/DuplicateSelfCheckPage.js';
import { DeceasedReportPage } from './pages/DeceasedReportPage.js';
import { CaseDetailPage } from './pages/CaseDetailPage.js';
import { CheckInPage } from './pages/CheckInPage.js';
import { AssistedSupportPage } from './pages/AssistedSupportPage.js';
import { EligibilityCheckPage } from './pages/EligibilityCheckPage.js';
import {
  HowItWorksPage,
  MethodologyPage,
  PrivacyPolicyPage,
  AccessibilityPage,
  StyleguidePage,
} from './pages/StaticPages.js';
import { AdminHub } from './pages/admin/AdminHub.js';
import { useApp } from './context/AppContext.js';
import { AssistantLauncher } from './components/ai/AssistantLauncher.js';
import { AssistantPanel } from './components/ai/AssistantPanel.js';

export const App: React.FC = () => {
  const { locale, setLocale, isAdmin, user } = useApp();
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const root = document.documentElement;

    // On all pages except home, chakra background is always visible
    if (currentPath !== '/' && currentPath !== '#top') {
      root.classList.add('past-hero');
      return undefined;
    }

    // On home page: check position against the hero (#top)
    const hero = document.getElementById('top');
    if (!hero || !('IntersectionObserver' in window)) {
      root.classList.remove('past-hero');
      return undefined;
    }

    // Determine initial state on home page: keep hidden until scrolled past hero
    const rect = hero.getBoundingClientRect();
    const isPastHero = window.scrollY > 150 || (rect.bottom < window.innerHeight * 0.3 && rect.top < 0);
    root.classList.toggle('past-hero', isPastHero);

    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        root.classList.toggle('past-hero', e.intersectionRatio < 0.3 && e.boundingClientRect.top < 0);
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] }
    );

    observer.observe(hero);

    return () => {
      observer.disconnect();
    };
  }, [currentPath]);

  const handleNavigate = (path: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentRoute = () => {
    if (currentPath === '/' || currentPath === '#top') return <LandingPage onNavigate={handleNavigate} />;
    if (currentPath.startsWith('/auth')) return <AuthPage currentPath={currentPath} onNavigate={handleNavigate} />;
    if (currentPath === '/app' || currentPath === '/app/cases') return <DashboardPage onNavigate={handleNavigate} />;
    if (currentPath === '/app/check') return <CheckPage onNavigate={handleNavigate} />;
    if (currentPath === '/app/missing-name') return <MissingNamePage onNavigate={handleNavigate} />;
    if (currentPath === '/app/issues/new' || currentPath === '/app/issues') return <IssuesPage onNavigate={handleNavigate} />;
    if (currentPath === '/app/duplicate-self-check') return <DuplicateSelfCheckPage onNavigate={handleNavigate} />;
    if (currentPath === '/app/report/deceased') return <DeceasedReportPage onNavigate={handleNavigate} />;
    if (currentPath.startsWith('/app/cases/')) {
      const ref = currentPath.replace('/app/cases/', '');
      return <CaseDetailPage caseRef={ref} onNavigate={handleNavigate} />;
    }
    if (currentPath === '/app/checkin') return <CheckInPage onNavigate={handleNavigate} />;
    if (currentPath === '/app/assist' || currentPath === '/support') return <AssistedSupportPage onNavigate={handleNavigate} />;
    if (currentPath === '/eligibility-check' || currentPath === '/learn/next-steps') return <EligibilityCheckPage onNavigate={handleNavigate} />;
    if (currentPath === '/how-it-works' || currentPath === '/about' || currentPath === '/learn') return <HowItWorksPage onNavigate={handleNavigate} />;
    if (currentPath === '/methodology' || currentPath === '#method') return <MethodologyPage />;
    if (currentPath === '/privacy' || currentPath === '/terms' || currentPath === '/security') return <PrivacyPolicyPage />;
    if (currentPath === '/accessibility') return <AccessibilityPage />;
    if (currentPath === '/styleguide') return <StyleguidePage />;
    if (currentPath.startsWith('/admin')) {
      if (isAdmin) {
        return <AdminHub onNavigate={handleNavigate} />;
      }
      return (
        <div className="max-w-md mx-auto py-24 px-4 text-center">
          <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
            <span className="text-4xl">🛡️</span>
            <h2 className="text-xl font-bold text-gray-900">Admin Access Restricted</h2>
            <p className="text-sm text-gray-600">
              The Administrative & Reviewer Console is restricted to authorized personnel.
              {user ? (
                <span> You are signed in as <strong>{user.email || user.displayName}</strong>, which does not have staff privileges.</span>
              ) : (
                <span> Please sign in with your authorized admin email address to access this portal.</span>
              )}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleNavigate('/auth/login')}
                className="btn btn-primary btn-sm"
              >
                Sign In with Admin Account
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <LandingPage onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col text-[var(--ink)]">
      <ChakraBackground />
      <Header currentPath={currentPath} onNavigate={handleNavigate} />
      <main id="main-content" className="flex-1">
        {renderCurrentRoute()}
      </main>
      <Footer onNavigate={handleNavigate} />
      <AssistantLauncher
        isOpen={isAIOpen}
        onToggle={() => setIsAIOpen(!isAIOpen)}
        voiceState="IDLE"
      />
      <AssistantPanel
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        currentPath={currentPath}
        onNavigate={handleNavigate}
        locale={locale}
        onSelectLocale={(l) => setLocale(l as any)}
      />
    </div>
  );
};
