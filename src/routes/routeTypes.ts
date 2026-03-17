export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  protected?: boolean;   // true → wrapped in ProtectedRoute
  guestOnly?: boolean;   // true → wrapped in GuestRoute (redirects authenticated users away)
  index?: boolean;       // true → renders as an index redirect
}
