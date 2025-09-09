
import { prisma } from './db';

/**
 * Very simple tenant resolver for demo:
 * - Accepts ?tenant=<tenantId> in URL, or
 * - X-Tenant-Id header in API calls
 * - If none, pick the first tenant for demo purposes.
 */
export async function resolveTenantId(searchParams?: URLSearchParams, headers?: Headers) {
  const q = searchParams?.get('tenant');
  if (q) return q;

  const h = headers?.get('x-tenant-id');
  if (h) return h;

  const first = await prisma.tenant.findFirst();
  return first?.id ?? null;
}
