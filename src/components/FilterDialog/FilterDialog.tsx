import { CheckRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  Paper,
  Popper,
  Stack,
  Typography,
} from "@mui/material";
import { PRIORITY_COLORS, STATUS_COLORS } from "../../constants/colors";
import {
  type Priority,
  type Status,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "../../types/dashboard";

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
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.disabled"
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.8,
                display: "block",
                px: 0.5,
                mb: 0.5,
              }}
            >
              Priority
            </Typography>
            <Stack spacing={0}>
              {PRIORITY_OPTIONS.map((p) => {
                const active = selectedPriority.has(p);
                const style = PRIORITY_COLORS[p];
                return (
                  <Stack
                    key={p}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={() => onTogglePriority(p)}
                    sx={{
                      px: 1,
                      py: 0.75,
                      borderRadius: "8px",
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
                      <CheckRounded sx={{ fontSize: 16, color: style.color }} />
                    )}
                  </Stack>
                );
              })}
            </Stack>

            <Divider sx={{ my: 1.2 }} />

            <Typography
              variant="caption"
              fontWeight={700}
              color="text.disabled"
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.8,
                display: "block",
                px: 0.5,
                mb: 0.5,
              }}
            >
              Status
            </Typography>
            <Stack spacing={0}>
              {STATUS_OPTIONS.map((s) => {
                const active = selectedStatus.has(s);
                const style = STATUS_COLORS[s];
                return (
                  <Stack
                    key={s}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={() => onToggleStatus(s)}
                    sx={{
                      px: 1,
                      py: 0.75,
                      borderRadius: "8px",
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
                      <CheckRounded sx={{ fontSize: 16, color: style.color }} />
                    )}
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default FilterDialog;
