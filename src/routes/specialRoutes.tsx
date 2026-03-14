import { Navigate } from "react-router-dom";
import NotFound from "../pages/NotFound";
import type { RouteConfig } from "./routeTypes";

/**
 * Root and special routes (redirects, 404 catch-all)
 */
const specialRoutes: RouteConfig[] = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
    index: true,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default specialRoutes;
