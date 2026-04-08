import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { ArrowBackIos } from "@mui/icons-material";
import { useAuth } from "../../context/useAuthContext";
import Breadcrumbs from "../Breadcrumbs";
import type { BreadcrumbState } from "../Breadcrumbs";
import { Sidebar, MobileMenuButton, SIDEBAR_WIDTH } from "../Sidebar";
import { getTheme } from "../../utils/theme";
import NavtaskIcon from "../NavTaskIcon";

/**
 * Shared layout for all protected routes.
 * Renders the Sidebar + Topbar, then <Outlet /> for the page content.
 * Any route wrapped in <ProtectedRoute> automatically gets this shell.
 */

const ProtectedLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const breadcrumbState = location.state as BreadcrumbState | null;
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
                    bgcolor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <NavtaskIcon width={22} height={22} />
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
                      onClick={() => navigate(-1)}
                      sx={{ height: 10, width: 10 }}
                    >
                      Back
                    </Button>
                    <Divider orientation="vertical" flexItem />
                  </>
                )}

                <Breadcrumbs
                  pathname={location.pathname}
                  breadcrumbs={breadcrumbState?.breadcrumbs}
                />
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
