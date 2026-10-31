import React, { useEffect, useState } from 'react';
import { Card, Badge, Alert } from '@voterrule/ui';
import { useAdmin } from '../context/AdminContext.js';

export const AdminOverviewPage: React.FC = () => {
  const { staff } = useAdmin();
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch('/api/v1/admin/overview', {
          headers: {
            'x-user-id': staff.userId,
            'x-actor-role': staff.roles[0] || 'PLATFORM_ADMIN',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setOverview(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, [staff]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading admin metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {overview?.isDemoData && (
        <Alert type="warning" title="DEMO DATA ENVIRONMENT">
          All statistics, cases, and reviewer queues displayed here represent synthetic demonstration data. No real electoral roll records are modified.
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <span className="text-xs font-semibold text-gray-500 block">Total Assistance Cases</span>
          <span className="text-3xl font-black text-[#0B1030] mt-1 block">
            {overview?.totalCases ?? 0}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">Cumulative intake</span>
        </Card>

        <Card className="bg-white">
          <span className="text-xs font-semibold text-gray-500 block">Awaiting Staff Review</span>
          <span className="text-3xl font-black text-[#000080] mt-1 block">
            {overview?.awaitingReview ?? 0}
          </span>
          <span className="text-[11px] text-blue-600 mt-1 block">Active reviewer queue</span>
        </Card>

        <Card className="bg-white">
          <span className="text-xs font-semibold text-gray-500 block">Duplicate Candidates Pending</span>
          <span className="text-3xl font-black text-[#9A4500] mt-1 block">
            {overview?.duplicatePending ?? 0}
          </span>
          <span className="text-[11px] text-amber-700 mt-1 block">Rule-scored discrepancies</span>
        </Card>

        <Card className="bg-white">
          <span className="text-xs font-semibold text-gray-500 block">Deceased Reports Pending</span>
          <span className="text-3xl font-black text-gray-700 mt-1 block">
            {overview?.deceasedPending ?? 0}
          </span>
          <span className="text-[11px] text-gray-500 mt-1 block">Third-party submissions</span>
        </Card>
      </div>

      {/* System & Integration Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="System & Infrastructure Health">
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Database & Repository Engine:</span>
              <Badge label={overview?.systemHealth?.database || 'HEALTHY'} variant="success" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Object Storage (MinIO / S3):</span>
              <Badge label={overview?.systemHealth?.storage || 'HEALTHY'} variant="success" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Cryptographic Audit Hash Chain:</span>
              <Badge label={overview?.systemHealth?.auditChain || 'VERIFIED'} variant="success" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Official Roll Integration Mode:</span>
              <Badge label="STANDALONE CIVIC" variant="neutral" />
            </div>
          </div>
        </Card>

        <Card title="Cases by Statutory Category">
          <div className="space-y-2.5 pt-2 text-xs">
            {overview?.casesByCategory &&
              Object.entries(overview.casesByCategory).map(([cat, count]: [string, any]) => (
                <div key={cat} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-medium text-gray-700">{cat.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
