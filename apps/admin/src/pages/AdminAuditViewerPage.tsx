import React, { useEffect, useState } from 'react';
import { Card, Button, Alert } from '@voterrule/ui';
import { useAdmin } from '../context/AdminContext.js';

export const AdminAuditViewerPage: React.FC = () => {
  const { staff } = useAdmin();
  const [events, setEvents] = useState<any[]>([]);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAuditData = async () => {
    try {
      const res = await fetch('/api/v1/admin/audit', {
        headers: {
          'x-user-id': staff.userId,
          'x-actor-role': staff.roles[0] || 'READ_ONLY_AUDITOR',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.data.events || []);
        setVerification(data.data.verification);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [staff]);

  const handleVerifyChain = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/audit/verify', {
        method: 'POST',
        headers: {
          'x-user-id': staff.userId,
          'x-actor-role': staff.roles[0] || 'READ_ONLY_AUDITOR',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setVerification(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0B1030]">Audit Trail & Cryptographic Hash Chain</h1>
          <p className="text-xs text-gray-500">
            Append-only, SHA-256 chained audit events. The database role has INSERT-only privileges.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleVerifyChain}
          isLoading={loading}
        >
          Verify Cryptographic Chain Integrity
        </Button>
      </div>

      {verification && (
        <Alert
          type={verification.verified ? 'success' : 'error'}
          title={verification.verified ? 'Cryptographic Hash Chain Intact' : 'Integrity Alert'}
        >
          {verification.verified
            ? `All ${verification.totalEvents} audit events have been cryptographically verified against SHA-256 hash chains. No alterations, omissions, or sequence breaks detected.`
            : `Hash chain verification failed at index ${verification.brokenAtIndex}! Tampering or sequence break detected.`}
        </Alert>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Resource</th>
                <th className="p-3">Reason / Details</th>
                <th className="p-3">Event SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50/80">
                  <td className="p-3 whitespace-nowrap text-gray-500">{ev.timestamp.replace('T', ' ').slice(0, 19)}</td>
                  <td className="p-3 font-semibold text-gray-900">{ev.actor}</td>
                  <td className="p-3 font-bold text-[#000080]">{ev.action}</td>
                  <td className="p-3 text-gray-600">{ev.resourceType}:{ev.resourceRef}</td>
                  <td className="p-3 text-gray-500 font-sans max-w-xs truncate">{ev.reason || '-'}</td>
                  <td className="p-3 text-gray-400 font-mono" title={ev.hash}>
                    {ev.hash.slice(0, 14)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
