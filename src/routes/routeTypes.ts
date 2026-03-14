export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  protected?: boolean;  // true → wrapped in ProtectedRoute
  index?: boolean;      // true → renders as an index redirect
}
