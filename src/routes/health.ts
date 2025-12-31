// Deprecated compatibility shim.
// Use `healthRoutes.ts` for canonical routes and OpenAPI annotations.

import { createHealthRoutes } from './healthRoutes';

export function createHealthRouter() {
  return createHealthRoutes();
}
