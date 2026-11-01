import React, { useState } from 'react';
import { AdminHeader } from './AdminHeader.js';
import { AdminOverviewPage } from './AdminOverviewPage.js';
import { AdminCaseQueuePage } from './AdminCaseQueuePage.js';
import { AdminDuplicateReviewPage } from './AdminDuplicateReviewPage.js';
import { AdminDeceasedReviewPage } from './AdminDeceasedReviewPage.js';
import { AdminGuidanceManagerPage } from './AdminGuidanceManagerPage.js';
import { AdminAuditViewerPage } from './AdminAuditViewerPage.js';
import { AdminAnalyticsPage } from './AdminAnalyticsPage.js';
import { AdminStaffPage } from './AdminStaffPage.js';
import { AdminProvider, useAdmin } from './AdminContext.js';
import { useApp } from '../../context/AppContext.js';
import { StaffRole } from '@voterrule/shared';

export interface AdminHubProps {
  onNavigate: (path: string) => void;
}

const AdminContent: React.FC<AdminHubProps> = ({ onNavigate }) => {
  const { user } = useApp();
  const { setStaff } = useAdmin();
  const [currentTab, setCurrentTab] = useState<string>('overview');

  // Synchronize authenticated user details with AdminContext
  React.useEffect(() => {
    if (user && user.email) {
      setStaff({
        userId: user.id,
        email: user.email,
        roles: [StaffRole.PLATFORM_ADMIN, StaffRole.CASE_REVIEWER, StaffRole.DOCUMENT_REVIEWER],
        mfaVerified: true,
      });
    }
  }, [user, setStaff]);

  const renderTab = () => {
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
      {/* Top Bar with exit to main site */}
      <div className="bg-[#0B1030] text-white px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide">ADMINISTRATIVE CONSOLE ACTIVE</span>
          <span className="text-gray-400">({user?.email || 'Authorized Staff'})</span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/app')}
          className="text-gray-300 hover:text-white underline cursor-pointer"
        >
          ← Return to Citizen Dashboard
        </button>
      </div>

      <AdminHeader currentTab={currentTab} onSelectTab={setCurrentTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTab()}
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
        VoterRule Reviewer Console • Authorized administrative access only • Actions logged to immutable audit trail
      </footer>
    </div>
  );
};

export const AdminHub: React.FC<AdminHubProps> = ({ onNavigate }) => {
  return (
    <AdminProvider>
      <AdminContent onNavigate={onNavigate} />
    </AdminProvider>
  );
};
