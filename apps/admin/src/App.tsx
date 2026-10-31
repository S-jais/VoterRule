import React, { useState } from 'react';
import { AdminHeader } from './components/AdminHeader.js';
import { AdminOverviewPage } from './pages/AdminOverviewPage.js';
import { AdminCaseQueuePage } from './pages/AdminCaseQueuePage.js';
import { AdminDuplicateReviewPage } from './pages/AdminDuplicateReviewPage.js';
import { AdminDeceasedReviewPage } from './pages/AdminDeceasedReviewPage.js';
import { AdminGuidanceManagerPage } from './pages/AdminGuidanceManagerPage.js';
import { AdminAuditViewerPage } from './pages/AdminAuditViewerPage.js';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage.js';
import { AdminStaffPage } from './pages/AdminStaffPage.js';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('overview');

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return <AdminOverviewPage />;
      case 'cases':
        return <AdminCaseQueuePage />;
      case 'duplicates':
        return <AdminDuplicateReviewPage />;
      case 'deceased':
        return <AdminDeceasedReviewPage />;
      case 'guidance':
        return <AdminGuidanceManagerPage />;
      case 'audit':
        return <AdminAuditViewerPage />;
      case 'analytics':
        return <AdminAnalyticsPage />;
      case 'staff':
        return <AdminStaffPage />;
      default:
        return <AdminOverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-[#0B1030] flex flex-col">
      <AdminHeader currentTab={currentTab} onSelectTab={setCurrentTab} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
        VoterRule Reviewer Portal • Internal authorized use only • All actions logged in append-only audit trail
      </footer>
    </div>
  );
};
