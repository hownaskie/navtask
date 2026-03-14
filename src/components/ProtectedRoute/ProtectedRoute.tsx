import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../context/useAuthContext";
import ProtectedLayout from "../ProtectedLayout";

/**
 * Wraps all protected routes. Three possible outcomes:
 *
 * 1. Auth is still loading (hydrating from localStorage)
 *    → Show a centered spinner to prevent a flash-redirect to /login
 *
 * 2. Not authenticated
 *    → Redirect to /login, saving the intended path in location.state
 *      so LoginPage can send the user back after a successful login.
 *
 * 3. Authenticated
 *    → Render ProtectedLayout (sidebar + topbar + <Outlet>)
 */
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Still hydrating auth from localStorage — don't redirect yet
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Not logged in — redirect to /login and remember where they were headed
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated — render the shared layout + page outlet
  return <ProtectedLayout />;
};

export default ProtectedRoute;