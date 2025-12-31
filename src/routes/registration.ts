// Deprecated compatibility shim.
// Use `registrationRoutes.ts` for canonical routes and OpenAPI annotations.

import { createRegistrationRoutes } from './registrationRoutes';

export function createRegistrationRouter(deps?: any) {
  return createRegistrationRoutes(deps);
}
