import specialRoutes from "./specialRoutes";
import publicRoutes from "./publicRoutes";
import protectedRoutes from "./protectedRoutes";
import type { RouteConfig } from "./routeTypes";

export type { RouteConfig };

/**
 * Central route registry.
 * To add a new route, add an entry to the appropriate route file:
 *   - specialRoutes.tsx    — root redirects and 404
 *   - publicRoutes.tsx     — routes without auth requirement
 *   - protectedRoutes.tsx  — routes that require authentication
 */

// ── Combine all routes ───────────────────────────────────────────────────────
const routes: RouteConfig[] = [
  ...specialRoutes,
  ...publicRoutes,
  ...protectedRoutes,
];

export default routes;