import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { ArrowBackIos, TaskAlt } from "@mui/icons-material";
import { useAuth } from "../../context/useAuthContext";
import { Sidebar, MobileMenuButton, SIDEBAR_WIDTH } from "../Sidebar";
import { getTheme } from "../../utils/theme";

/**
 * Shared layout for all protected routes.
 * Renders the Sidebar + Topbar, then <Outlet /> for the page content.
 * Any route wrapped in <ProtectedRoute> automatically gets this shell.
 */

// Map pathnames → readable page titles shown in the topbar
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "To-do",
  "/add": "New Task",
  "/edit": "Edit Task",
  "/view": "View Task",
};

const ProtectedLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle =
    PAGE_TITLES[location.pathname.replace(/\/\d+$/, "")] ?? "Dashboard";
  const shouldShowBack =
    location.pathname.startsWith("/add") ||
    location.pathname.startsWith("/view") ||
    location.pathname.startsWith("/edit");

  return (
    <ThemeProvider theme={getTheme(darkMode ? "dark" : "light")}>
    {/* height:100vh + overflow:hidden gives the flex children a real fixed height
        so the content area can actually scroll with overflow:auto */}
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {/* ── Sidebar ── */}
      <Sidebar
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* ── Main area — fills remaining width, constrained to viewport height ── */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        }}
      >
        {/* ── Topbar — fixed height, never scrolls away ── */}
        <Paper
          elevation={0}
          square
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            px: 2,
            py: 1.5,
            flexShrink: 0,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {/* Hamburger — visible on mobile only */}
              <MobileMenuButton onClick={() => setMobileOpen(true)} />

              {/* Mobile logo */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.2}
                sx={{ display: { xs: "flex", md: "none" } }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "8px",
                    background: "linear-gradient(135deg,#1D4ED8,#3B82F6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TaskAlt sx={{ color: "white", fontSize: 17 }} />
                </Box>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontSize: "1rem" }}
                >
                  Navtask
                </Typography>
              </Stack>

              {/* Desktop page title */}
              <Stack direction="row" alignItems="center" spacing={2}>
                {shouldShowBack && (
                  <>
                    <Button
                      size="small"
                      startIcon={<ArrowBackIos />}
                      onClick={() => window.history.back()}
                      sx={{ height: 10, width: 10 }}
                    >
                      Back
                    </Button>
                    <Divider orientation="vertical" flexItem />
                  </>
                )}

                <Typography
                  variant="h6"
                  sx={{
                    display: { xs: "none", md: "block" },
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  {pageTitle}
                </Typography>
              </Stack>
            </Stack>

            {/* Right side — user name */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              {user?.firstName + " " + user?.lastName}
            </Typography>
          </Stack>
        </Paper>

        {/* ── Scrollable content area ── */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
    </ThemeProvider>
  );
};

export default ProtectedLayout;
