import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import {
  DashboardOutlined,
  Inventory2Outlined,
  Logout,
  MenuOutlined,
  NightlightRound,
  TaskAlt,
} from "@mui/icons-material";
import { useAuth } from "../../context/useAuthContext";
import { AvatarUrl } from "../../utils";
import AlertDialog from "../AlertDialog";
import { SIDEBAR_WIDTH } from "./constants";

// ── Nav item config ───────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: <DashboardOutlined />, path: "/dashboard" },
  { label: "Products", icon: <Inventory2Outlined />, path: "/products" },
];

// ── MobileMenuButton ──────────────────────────────────────────────────────────
const MobileMenuButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton
    onClick={onClick}
    size="small"
    sx={{ display: { md: "none" }, color: "text.primary", mr: 0.5 }}
  >
    <MenuOutlined />
  </IconButton>
);

// ── Sidebar inner content ─────────────────────────────────────────────────────
interface ContentProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

const SidebarContent = ({ darkMode, onToggleDark }: ContentProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleLogout = () => setOpenDialog(true);

  const handleOnConfirmLogout = () => {
    setOpenDialog(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      {/* ── Logo ── */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ px: 2.5, pt: 3, pb: 2.5 }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <TaskAlt sx={{ color: "white", fontSize: 20 }} />
        </Box>
        <Typography
          sx={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 700,
            fontSize: "0.95rem",
            letterSpacing: "0.1em",
            color: "text.primary",
          }}
        >
          TASKLY
        </Typography>
      </Stack>

      {/* ── User profile ── */}
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Stack direction="column" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: "primary.main",
              fontWeight: 700,
              fontSize: "1rem",
            }}
            src={AvatarUrl({ seed: user?.username })}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={700}
              noWrap
              sx={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {user?.username}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mx: 2, mb: 1.5 }} />

      {/* ── Nav items ── */}
      <List disablePadding sx={{ flex: 1, px: 1.5, overflowY: "auto" }}>
        {NAV_ITEMS.map(({ label, icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <ListItemButton
              key={path}
              onClick={() => navigate(path)}
              selected={isActive}
              sx={{
                borderRadius: "10px",
                mb: 0.5,
                px: 1.5,
                py: 0.9,
                position: "relative",
                transition: "all 0.15s ease",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "& .MuiListItemIcon-root": { color: "white" },
                  "&:hover": { bgcolor: "primary.dark" },
                },
                "&:not(.Mui-selected):hover": {
                  bgcolor: "rgba(37,99,235,0.06)",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                  "& .MuiListItemText-primary": { color: "primary.main" },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 34,
                  color: isActive ? "white" : "text.secondary",
                  transition: "color 0.15s",
                  "& svg": { fontSize: 20 },
                }}
              >
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: "'Outfit', sans-serif",
                  color: isActive ? "white" : "text.primary",
                }}
              />
              {/* Right accent bar when active */}
              {isActive && (
                <Box
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: "20%",
                    height: "60%",
                    width: 4,
                    borderRadius: "4px 0 0 4px",
                    bgcolor: "rgba(255,255,255,0.5)",
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ mx: 2, mt: 1 }} />

      {/* ── Logout ── */}
      <List disablePadding sx={{ px: 1.5, pt: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: "10px",
            px: 1.5,
            py: 0.9,
            transition: "all 0.15s",
            "&:hover": {
              bgcolor: "rgba(239,68,68,0.07)",
              "& .MuiListItemIcon-root": { color: "error.main" },
              "& .MuiListItemText-primary": { color: "error.main" },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 34,
              color: "text.secondary",
              "& svg": { fontSize: 20 },
            }}
          >
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: "0.85rem",
              fontWeight: 500,
              fontFamily: "'Outfit', sans-serif",
            }}
          />
        </ListItemButton>
      </List>

      {/* ── Dark mode toggle ── */}
      <Box
        sx={{
          mx: 1.5,
          mb: 2.5,
          mt: 0.5,
          px: 1.5,
          py: 1,
          borderRadius: "10px",
          bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(37,99,235,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <NightlightRound
            sx={{
              fontSize: 18,
              color: darkMode ? "primary.light" : "text.secondary",
            }}
          />
          <Typography
            sx={{
              fontSize: "0.82rem",
              fontWeight: 500,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Dark Mode
          </Typography>
        </Stack>
        <Switch
          checked={darkMode}
          onChange={onToggleDark}
          size="small"
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": { color: "primary.main" },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              bgcolor: "primary.light",
            },
          }}
        />
      </Box>

      <AlertDialog
        open={openDialog}
        title="Sign out"
        leftButtonText="Sign out"
        rightButtonText="Cancel"
        content={
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography>Are you sure you want to sign out?</Typography>
            <Typography>All unsaved changes will be lost.</Typography>
          </Box>
        }
        onConfirm={handleOnConfirmLogout}
        onClose={() => setOpenDialog(false)}
      />

      {/* ── Alert Dialog ── */}
    </Box>
  );
};

// ── Sidebar — desktop permanent + mobile temporary drawer ─────────────────────
interface SidebarProps extends ContentProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar = ({
  darkMode,
  onToggleDark,
  mobileOpen,
  onMobileClose,
}: SidebarProps) => (
  <>
    {/* Desktop permanent */}
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
          border: "none",
          boxShadow: "2px 0 16px rgba(0,0,0,0.06)",
        },
      }}
    >
      <SidebarContent darkMode={darkMode} onToggleDark={onToggleDark} />
    </Drawer>

    {/* Mobile temporary */}
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: "block", md: "none" },
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
          border: "none",
          boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
        },
      }}
    >
      <SidebarContent darkMode={darkMode} onToggleDark={onToggleDark} />
    </Drawer>
  </>
);

export { Sidebar, MobileMenuButton, SIDEBAR_WIDTH };
