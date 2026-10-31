import React from 'react';
import { BrandWordmark, DemoBanner } from '@matdata-setu/ui';
import { useAdmin } from '../context/AdminContext.js';

export interface AdminHeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ currentTab, onSelectTab }) => {
  const { staff, isDemo } = useAdmin();

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'cases', label: 'Case Queue' },
    { id: 'duplicates', label: 'Duplicate Review' },
    { id: 'deceased', label: 'Deceased Reports' },
    { id: 'guidance', label: 'Guidance & Schedules' },
    { id: 'audit', label: 'Audit Trail' },
    { id: 'analytics', label: 'Civic Analytics' },
    { id: 'staff', label: 'Staff RBAC' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <DemoBanner isDemo={isDemo} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <BrandWordmark size="sm" hideTagline={true} />
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 uppercase tracking-wider border border-gray-200">
              Reviewer Console
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-500 font-medium">Signed in as:</span>
            <span className="font-bold text-[#0B1030]">{staff.email}</span>
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-semibold">
              MFA Verified
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-1" aria-label="Admin Navigation Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                currentTab === tab.id
                  ? 'border-[#000080] text-[#000080] bg-[#EFF2FE]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
