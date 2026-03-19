import AddTask from "../pages/AddTask";
import Dashboard from "../pages/Dashboard";
import EditTask from "../pages/EditTask/EditTask";
import ViewTask from "../pages/ViewTask";
import type { RouteConfig } from "./routeTypes";

/**
 * Protected routes (require authentication)
 */
const protectedRoutes: RouteConfig[] = [
  {
    path: "/dashboard",
    element: <Dashboard />,
    protected: true,
  },
  {
    path: "/add",
    element: <AddTask />,
    protected: true,
  },
  {
    path: "/edit/:id",
    element: <EditTask />,
    protected: true,
  },
  {
    path: "/view/:id",
    element: <ViewTask />,
    protected: true,
  },
];

export default protectedRoutes;
