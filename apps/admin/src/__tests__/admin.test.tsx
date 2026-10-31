import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AdminProvider } from '../context/AdminContext.js';
import { App } from '../App.js';

describe('Reviewer and Admin Application (apps/admin) Tests', () => {
  it('renders admin shell with navigation tabs and MFA status', () => {
    const html = renderToString(
      <AdminProvider>
        <App />
      </AdminProvider>
    );

    expect(html).toContain('Reviewer Console');
    expect(html).toContain('Case Queue');
    expect(html).toContain('Duplicate Review');
    expect(html).toContain('Deceased Reports');
    expect(html).toContain('Guidance &amp; Schedules');
    expect(html).toContain('Audit Trail');
    expect(html).toContain('MFA Verified');
  });
});
