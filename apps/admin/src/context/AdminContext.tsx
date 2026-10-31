import React, { createContext, useContext, useState } from 'react';
import { StaffRole } from '@voterrule/shared';

interface AdminStaffSession {
  userId: string;
  email: string;
  roles: StaffRole[];
  mfaVerified: boolean;
}

interface AdminContextType {
  staff: AdminStaffSession;
  setStaff: (s: AdminStaffSession) => void;
  isDemo: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staff, setStaff] = useState<AdminStaffSession>({
    userId: 'synth-user-admin-01',
    email: 'admin.demo@voterrule.org',
    roles: [StaffRole.PLATFORM_ADMIN, StaffRole.CASE_REVIEWER],
    mfaVerified: true,
  });
  const [isDemo] = useState<boolean>(true);

  return (
    <AdminContext.Provider value={{ staff, setStaff, isDemo }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};
