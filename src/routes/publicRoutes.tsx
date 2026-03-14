import Login from "../pages/Login";
import Signup from "../pages/Signup";
import OAuth2CallbackPage from "../pages/Oauth2Callback";
import type { RouteConfig } from "./routeTypes";

/**
 * Public routes (no authentication required)
 */
const publicRoutes: RouteConfig[] = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/oauth2/callback",
    element: <OAuth2CallbackPage />,
  },
];

export default publicRoutes;
