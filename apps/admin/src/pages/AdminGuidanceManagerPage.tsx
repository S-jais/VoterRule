import React, { useEffect, useState } from 'react';
import { Card, Badge, Alert } from '@voterrule/ui';

export const AdminGuidanceManagerPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function loadGuidance() {
      try {
        const res = await fetch('/api/v1/guidance/items');
        if (res.ok) {
          const data = await res.json();
          setItems(data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadGuidance();
  }, []);

  const unverified = items.filter((i) => i.requiresVerification && !i.verifiedOn);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-[#0B1030]">Statutory Guidance & Rules Engine</h1>
        <p className="text-xs text-gray-500">
          Versioned, dated, and source-attributed guidance items under Section 5.
        </p>
      </div>

      {unverified.length > 0 && (
        <Alert type="warning" title="Statutory Guidance Pending Verification">
          {unverified.length} guidance item(s) are marked as <code>requires_verification: true</code> without verification sign-off. In production mode (<code>APP_MODE=production</code>), the system fails closed at boot until all user-facing statutory items are verified.
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0B1030]">{item.titleEn}</h3>
                  <Badge
                    label={item.requiresVerification && !item.verifiedOn ? 'Pending Verification' : 'Verified'}
                    variant={item.requiresVerification && !item.verifiedOn ? 'warning' : 'success'}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  Topic: {item.topic} • Version: {item.version} • Effective: {item.effectiveFrom}
                </span>
              </div>

              <div className="text-xs text-right text-gray-500">
                <span>Verified On: {item.verifiedOn || 'NULL'}</span>
              </div>
            </div>

            <div className="pt-3 text-xs space-y-2 text-gray-700">
              <p><strong>Statutory Source:</strong> {item.sourceTitle}</p>
              <p className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                {item.textEn}
              </p>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#000080] font-semibold underline block"
              >
                Inspect Official Statutory Source ({item.sourceUrl}) →
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
