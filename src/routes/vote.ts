// Deprecated compatibility shim.
// Use `voteRoutes.ts` for canonical routes and OpenAPI annotations.

import { createVoteRoutes } from './voteRoutes';

export function createVoteRouter(deps?: any) {
  return createVoteRoutes(deps);
}
