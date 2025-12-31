// Deprecated compatibility shim.
// Use `candidatesRoutes.ts` for canonical routes and OpenAPI annotations.

import { createCandidatesRoutes } from './candidatesRoutes';

export function createCandidatesRouter() {
  return createCandidatesRoutes();
}
