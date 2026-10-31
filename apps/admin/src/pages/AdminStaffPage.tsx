import React, { useState } from 'react';
import { Card, Button, Input, Alert } from '@voterrule/ui';
import { StaffRole } from '@voterrule/shared';
import { useAdmin } from '../context/AdminContext.js';

export const AdminStaffPage: React.FC = () => {
  const { staff } = useAdmin();
  const [targetUserId, setTargetUserId] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<StaffRole>(StaffRole.CASE_REVIEWER);
  const [secondAdminId, setSecondAdminId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/admin/staff/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': staff.userId,
          'x-actor-role': staff.roles[0] || 'PLATFORM_ADMIN',
        },
        body: JSON.stringify({
          targetUserId,
          email: targetEmail,
          roleToGrant: selectedRole,
          secondAdminId: selectedRole === StaffRole.PLATFORM_ADMIN ? secondAdminId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to grant staff role');
      }

      setSuccess(`Role ${selectedRole} granted successfully to ${targetEmail || targetUserId}.`);
      setTargetUserId('');
      setTargetEmail('');
      setSecondAdminId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-[#0B1030]">Staff Accounts & RBAC Permissions</h1>
        <p className="text-xs text-gray-500">
          Least-privilege role management with mandatory two-person sign-off for administrator role grants.
        </p>
      </div>

      <div className="bg-[#EFF2FE] p-4 rounded-xl border border-[#C5D0FB] text-xs text-gray-800 space-y-2">
        <span className="font-bold text-[#000080]">Security Architecture & Bootstrap Notice:</span>
        <p>
          First administrator bootstrap is executed via CLI: <code>pnpm admin:bootstrap</code> which prints a single-use, 15-minute enrollment token. No default password or backdoor exists. Granting PLATFORM_ADMIN to any staff account requires confirmation from a second platform admin.
        </p>
      </div>

      <Card title="Assign / Update Staff Roles">
        <form onSubmit={handleGrantRole} className="space-y-4 pt-2 text-xs">
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="staff-target-id"
              label="Target User ID *"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="e.g. synth-user-reviewer-01"
              required
            />
            <Input
              id="staff-target-email"
              type="email"
              label="Staff Email Address *"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="reviewer@voterrule.org"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-gray-800 block">Select Role to Grant *</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white"
            >
              <option value={StaffRole.CASE_REVIEWER}>CASE_REVIEWER (Case Queue & Intake Review)</option>
              <option value={StaffRole.DOCUMENT_REVIEWER}>DOCUMENT_REVIEWER (Proof Review & Signed Download)</option>
              <option value={StaffRole.DUPLICATE_MATCH_REVIEWER}>DUPLICATE_MATCH_REVIEWER (Candidate Reviews)</option>
              <option value={StaffRole.READ_ONLY_AUDITOR}>READ_ONLY_AUDITOR (Audit Log Verification)</option>
              <option value={StaffRole.ANALYTICS_VIEWER}>ANALYTICS_VIEWER (k-Suppressed Aggregates)</option>
              <option value={StaffRole.ASSISTED_SUPPORT_AGENT}>ASSISTED_SUPPORT_AGENT (Proxy for Authorized Principals)</option>
              <option value={StaffRole.PLATFORM_ADMIN}>PLATFORM_ADMIN (Superuser - Requires 2nd Admin)</option>
            </select>
          </div>

          {selectedRole === StaffRole.PLATFORM_ADMIN && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
              <span className="font-bold text-amber-900 block">Four-Eyes Security Requirement:</span>
              <Input
                id="staff-second-admin"
                label="Second Platform Admin User ID *"
                description="Must be an existing active platform administrator."
                value={secondAdminId}
                onChange={(e) => setSecondAdminId(e.target.value)}
                placeholder="e.g. synth-user-admin-01"
                required
              />
            </div>
          )}

          <Button type="submit" variant="primary" size="md" isLoading={loading}>
            Grant Staff Role
          </Button>
        </form>
      </Card>
    </div>
  );
};
