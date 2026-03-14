import { ThemeProvider, CssBaseline } from "@mui/material";

import "./App.css";
import { getTheme } from "./utils/theme";
import routes from "./routes";
import { AuthProvider } from "./context/useAuthContext";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const theme = getTheme("light");
  // Separate routes by type so we can wrap protected ones in a single
  // <ProtectedRoute> outlet — same structure as before, but driven by config.
  const publicRoutes    = routes.filter(r => !r.protected && r.path !== "*");
  const protectedRoutes = routes.filter(r => r.protected);
  const catchAll        = routes.find(r => r.path === "*");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          {/* Public + redirect routes */}
          {publicRoutes.map(({ path, element }) => (
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
