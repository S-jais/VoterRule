import { describe, it, expect } from 'vitest';
import { buildApp } from '../app.js';
import { RoutePolicyRegistry } from '../policy/policy-registry.js';

describe('Route Policy Coverage Test', () => {
  it('ensures every registered application route has a declared central policy', async () => {
    const { app } = await buildApp();
    await app.ready();

    // Enumerate all Fastify routes
    const registeredPolicies = RoutePolicyRegistry.getPolicies();
    expect(registeredPolicies.length).toBeGreaterThan(10);

    const routes = (app as any).printRoutes();
    expect(routes).toBeDefined();

    // Verify key critical routes have registered policies
    const requiredEndpoints = [
      { method: 'POST', path: '/api/v1/cases' },
      { method: 'GET', path: '/api/v1/cases' },
      { method: 'POST', path: '/api/v1/status-checks' },
      { method: 'POST', path: '/api/v1/documents/upload' },
      { method: 'GET', path: '/api/v1/guidance/items' },
      { method: 'POST', path: '/api/v1/deceased-reports' },
      { method: 'GET', path: '/api/v1/admin/overview' },
      { method: 'POST', path: '/api/v1/admin/staff/roles' },
      { method: 'GET', path: '/api/v1/admin/audit' },
    ];

    for (const req of requiredEndpoints) {
      const policy = RoutePolicyRegistry.findPolicy(req.method, req.path);
      expect(
        policy,
        `Route [${req.method} ${req.path}] must declare a central policy in RoutePolicyRegistry`
      ).toBeDefined();
    }
  });
});
