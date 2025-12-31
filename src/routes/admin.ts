// Deprecated compatibility shim.
// OpenAPI annotations and the canonical routes have moved to `adminRoutes.ts`.
// This file forwards the legacy `createAdminRouter` symbol to the new factory
// so older imports remain functional while preventing duplicate OpenAPI JSDoc.

import { createAdminRoutes } from './adminRoutes';

export function createAdminRouter(deps?: any) {
  return createAdminRoutes(deps);
}
