import { Action, Resource, can, ActorContext, ResourceContext } from '@matdata-setu/shared';

export interface RoutePolicyDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  action: Action;
  resource: Resource;
  description: string;
}

export class RoutePolicyRegistry {
  private static registeredPolicies: RoutePolicyDefinition[] = [];

  public static register(policy: RoutePolicyDefinition): void {
    this.registeredPolicies.push(policy);
  }

  public static getPolicies(): RoutePolicyDefinition[] {
    return this.registeredPolicies;
  }

  public static findPolicy(method: string, path: string): RoutePolicyDefinition | undefined {
    return this.registeredPolicies.find(
      (p) => p.method === method.toUpperCase() && (p.path === path || this.matchRoute(p.path, path))
    );
  }

  private static matchRoute(pattern: string, actual: string): boolean {
    const patternParts = pattern.split('/');
    const actualParts = actual.split('/');
    if (patternParts.length !== actualParts.length) return false;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i]?.startsWith(':')) continue; // param wildcard
      if (patternParts[i] !== actualParts[i]) return false;
    }
    return true;
  }

  public static authorize(
    method: string,
    path: string,
    actor: ActorContext,
    context?: ResourceContext
  ): { allowed: boolean; reason?: string } {
    const policy = this.findPolicy(method, path);
    if (!policy) {
      return {
        allowed: false,
        reason: `Access Denied: Route [${method} ${path}] has no declared central policy.`,
      };
    }

    const isAuthorized = can(actor, policy.action, policy.resource, context);
    if (!isAuthorized) {
      return {
        allowed: false,
        reason: `Access Denied: Actor role ${actor.role || 'ANONYMOUS'} cannot perform ${policy.action} on ${policy.resource}.`,
      };
    }

    return { allowed: true };
  }
}
