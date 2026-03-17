import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuthContext";

/**
 * Wraps guest-only routes (login, signup).
 * Redirects authenticated users to /dashboard.
 */
const GuestRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
