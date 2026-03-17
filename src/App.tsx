import { ThemeProvider, CssBaseline } from "@mui/material";

import "./App.css";
import { getTheme } from "./utils/theme";
import routes from "./routes";
import { AuthProvider } from "./context/useAuthContext";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

function App() {
  const theme = getTheme("light");
  // Separate routes by type so we can wrap protected ones in a single
  // <ProtectedRoute> outlet — same structure as before, but driven by config.
  const guestRoutes     = routes.filter(r => r.guestOnly);
  const openRoutes      = routes.filter(r => !r.protected && !r.guestOnly && r.path !== "*");
  const protectedRoutes = routes.filter(r => r.protected);
  const catchAll        = routes.find(r => r.path === "*");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          {/* Guest-only routes (login, signup) — redirect authenticated users away */}
          <Route element={<GuestRoute />}>
            {guestRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          {/* Open public routes (no auth requirement either way) */}
          {openRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Protected routes — all wrapped under a single <ProtectedRoute> outlet */}
          <Route element={<ProtectedRoute />}>
            {protectedRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          {/* 404 catch-all */}
          {catchAll && <Route path={catchAll.path} element={catchAll.element} />}
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
