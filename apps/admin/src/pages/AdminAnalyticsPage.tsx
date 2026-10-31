import React, { useEffect, useState } from 'react';
import { Card, Badge } from '@voterrule/ui';
import { useAdmin } from '../context/AdminContext.js';

export const AdminAnalyticsPage: React.FC = () => {
  const { staff } = useAdmin();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/v1/admin/analytics', {
          headers: {
            'x-user-id': staff.userId,
            'x-actor-role': staff.roles[0] || 'ANALYTICS_VIEWER',
          },
        });
        if (res.ok) {
          const resData = await res.json();
          setData(resData.data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadAnalytics();
  }, [staff]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-[#0B1030]">Civic Analytics (k-Anonymity Suppressed)</h1>
        <p className="text-xs text-gray-500">
          Aggregated civic inclusion metrics. Suppresses any geographical cell with fewer than 10 cases to prevent re-identification.
        </p>
      </div>

      <div className="bg-[#EDF8EE] p-4 rounded-xl border border-[#B7E2B9] text-xs text-gray-800 space-y-1">
        <span className="font-bold text-[#0D5C05]">DPDP Privacy & Anti-Profiling Rule:</span>
        <p>
          Geography is bounded to district level. No individual behavioral analytics or political profiling is permitted anywhere on this platform.
        </p>
      </div>

      <Card title="District-Level Assistance Case Distribution (k ≥ 10)">
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-3">State & District</th>
                <th className="p-3">Case Count</th>
                <th className="p-3">Suppression Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.aggregates?.map((row: any, i: number) => {
                const isSuppressed = typeof row.caseCount === 'string' && row.caseCount.includes('Suppressed');
                return (
                  <tr key={i} className="hover:bg-gray-50/80">
                    <td className="p-3 font-semibold text-gray-900">{row.district}</td>
                    <td className="p-3 font-mono font-bold text-[#000080]">{row.caseCount}</td>
                    <td className="p-3">
                      <Badge
                        label={isSuppressed ? 'k < 10 Suppressed' : 'Public Aggregate'}
                        variant={isSuppressed ? 'warning' : 'success'}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
