import { useState, useRef } from "react";
import {
  CheckRounded,
  ChevronRight,
} from "@mui/icons-material";
import {
  Box,
  Button,
  ClickAwayListener,
  Paper,
  Popper,
  Stack,
  Typography,
} from "@mui/material";
import { PRIORITY_COLORS, STATUS_COLORS } from "../../constants/colors";
import { type Priority, type Status } from "../../types/dashboard";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../../constants/task";

interface FilterDialogProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  selectedPriority: Set<Priority>;
  selectedStatus: Set<Status>;
  onTogglePriority: (p: Priority) => void;
  onToggleStatus: (s: Status) => void;
  onClear: () => void;
}

const FilterDialog = ({
  anchorEl,
  open,
  onClose,
  selectedPriority,
  selectedStatus,
  onTogglePriority,
  onToggleStatus,
  onClear,
}: FilterDialogProps) => {
  const hasFilters = selectedPriority.size > 0 || selectedStatus.size > 0;
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const priorityBtnRef = useRef<HTMLDivElement>(null);
  const statusBtnRef = useRef<HTMLDivElement>(null);

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      sx={{ zIndex: 30 }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          elevation={8}
          sx={{
            mt: 1,
            width: 260,
            borderRadius: "14px",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography fontWeight={700} fontSize="0.85rem">
              Filters
            </Typography>
            {hasFilters && (
              <Button
                size="small"
                onClick={onClear}
                sx={{
                  fontSize: "0.72rem",
                  color: "text.secondary",
                  p: 0,
                  minWidth: 0,
                  "&:hover": { color: "error.main", bgcolor: "transparent" },
                }}
              >
                Clear all
              </Button>
            )}
          </Stack>

          <Box sx={{ p: 1.5 }}>
            {/* Priority Section */}
            <Stack
              ref={priorityBtnRef}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              onClick={() =>
                setActiveSubmenu(
                  activeSubmenu === "priority" ? null : "priority"
                )
              }
              sx={{
                px: 1,
                py: 0.75,
                mb: 1,
                cursor: "pointer",
                borderRadius: "8px",
                bgcolor:
                  activeSubmenu === "priority"
                    ? "rgba(37,99,235,0.08)"
                    : "transparent",
                transition: "background 0.12s",
                "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
              }}
            >
              <Typography
                fontWeight={700}
                fontSize="0.9rem"
                color="text.primary"
              >
                Priority
              </Typography>
              <ChevronRight sx={{ fontSize: 20 }} />
            </Stack>

            {/* Status Section */}
            <Stack
              ref={statusBtnRef}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              onClick={() =>
                setActiveSubmenu(activeSubmenu === "status" ? null : "status")
              }
              sx={{
                px: 1,
                py: 0.75,
                cursor: "pointer",
                borderRadius: "8px",
                bgcolor:
                  activeSubmenu === "status"
                    ? "rgba(37,99,235,0.08)"
                    : "transparent",
                transition: "background 0.12s",
                "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
              }}
            >
              <Typography
                fontWeight={700}
                fontSize="0.9rem"
                color="text.primary"
              >
                Status
              </Typography>
              <ChevronRight sx={{ fontSize: 20 }} />
            </Stack>
          </Box>

          {/* Priority Submenu Popper */}
          <Popper
            open={activeSubmenu === "priority"}
            anchorEl={priorityBtnRef.current}
            placement="right-start"
            sx={{ zIndex: 31 }}
          >
            <Paper
              sx={{
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                mt: -1,
              }}
            >
              <Stack spacing={0} sx={{ py: 1 }}>
                {PRIORITY_OPTIONS.map((p) => {
                  const active = selectedPriority.has(p);
                  const style = PRIORITY_COLORS[p];
                  return (
                    <Stack
                      key={p}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      onClick={() => {
                        onTogglePriority(p);
                      }}
                      sx={{
                        px: 2,
                        py: 0.75,
                        cursor: "pointer",
                        bgcolor: active ? style.bg : "transparent",
                        transition: "background 0.12s",
                        "&:hover": {
                          bgcolor: active ? style.bg : "rgba(0,0,0,0.04)",
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.2}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: style.dot,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          fontSize="0.85rem"
                          fontWeight={active ? 600 : 400}
                          color={active ? style.color : "text.primary"}
                        >
                          {p}
                        </Typography>
                      </Stack>
                      {active && (
                        <CheckRounded
                          sx={{ fontSize: 16, color: style.color }}
                        />
                      )}
                    </Stack>
                  );
                })}
              </Stack>
            </Paper>
          </Popper>

          {/* Status Submenu Popper */}
          <Popper
            open={activeSubmenu === "status"}
            anchorEl={statusBtnRef.current}
            placement="right-start"
            sx={{ zIndex: 31 }}
          >
            <Paper
              sx={{
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                mt: -1,
              }}
            >
              <Stack spacing={0} sx={{ py: 1 }}>
                {STATUS_OPTIONS.filter((s) => s !== "All").map((s) => {
                  const active = selectedStatus.has(s);
                  const style = STATUS_COLORS[s];
                  return (
                    <Stack
                      key={s}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      onClick={() => {
                        onToggleStatus(s);
                      }}
                      sx={{
                        px: 2,
                        py: 0.75,
                        cursor: "pointer",
                        bgcolor: active ? style.bg : "transparent",
                        transition: "background 0.12s",
                        "&:hover": {
                          bgcolor: active ? style.bg : "rgba(0,0,0,0.04)",
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.2}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: style.dot,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          fontSize="0.85rem"
                          fontWeight={active ? 600 : 400}
                          color={active ? style.color : "text.primary"}
                        >
                          {s}
                        </Typography>
                      </Stack>
                      {active && (
                        <CheckRounded
                          sx={{ fontSize: 16, color: style.color }}
                        />
                      )}
                    </Stack>
                  );
                })}
              </Stack>
            </Paper>
          </Popper>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default FilterDialog;
