import { Add, FilterList } from "@mui/icons-material";
import { Badge, Button, Chip, Paper, Stack, Tooltip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { PRIORITY_COLORS, STATUS_COLORS } from "../../constants/colors";
import { type Priority, type Status } from "../../types/dashboard";

interface DashboardToolbarProps {
  filterOpen: boolean;
  activeFilterCount: number;
  filterPriority: Set<Priority>;
  filterStatus: Set<Status>;
  filterBtnRef: React.RefObject<HTMLButtonElement | null>;
  onToggleFilter: () => void;
  onTogglePriority: (p: Priority) => void;
  onToggleStatus: (s: Status) => void;
  onClearFilters: () => void;
  onAddTask: () => void;
}

const DashboardToolbar = ({
  filterOpen,
  activeFilterCount,
  filterPriority,
  filterStatus,
  filterBtnRef,
  onToggleFilter,
  onTogglePriority,
  onToggleStatus,
  onClearFilters,
  onAddTask,
}: DashboardToolbarProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const filterButtonActiveBg = alpha(
    theme.palette.primary.main,
    isDarkMode ? 0.24 : 0.08,
  );
  const chipBg = (hex: string) => alpha(hex, isDarkMode ? 0.24 : 0.12);

  return (
    <Paper
      elevation={0}
      sx={{
        px: 1.5,
        py: 1,
        mb: 3,
        border: "1.5px solid",
        borderColor: "divider",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{ flex: 1, flexWrap: "wrap", minWidth: 0, gap: 0.75 }}
      >
        <Tooltip title={filterOpen ? "Close filters" : "Open filters"}>
          <Button
            ref={filterBtnRef}
            size="small"
            onClick={onToggleFilter}
            startIcon={
              <Badge
                badgeContent={activeFilterCount}
                color="primary"
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "0.6rem",
                    minWidth: 15,
                    height: 15,
                    p: 0,
                  },
                }}
              >
                <FilterList fontSize="small" />
              </Badge>
            }
            sx={{
              color:
                filterOpen || activeFilterCount > 0
                  ? "primary.main"
                  : "text.secondary",
              bgcolor:
                filterOpen || activeFilterCount > 0
                  ? filterButtonActiveBg
                  : "transparent",
              borderRadius: "8px",
              flexShrink: 0,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.82rem",
              px: 1.2,
              py: 0.6,
              minWidth: 0,
              "&:hover": {
                bgcolor: filterButtonActiveBg,
                color: "primary.main",
              },
            }}
          >
            Filter
          </Button>
        </Tooltip>

        {Array.from(filterPriority).map((p) => (
          <Chip
            key={p}
            label={p}
            size="small"
            onDelete={() => onTogglePriority(p)}
            sx={{
              height: 24,
              fontSize: "0.75rem",
              bgcolor: chipBg(PRIORITY_COLORS[p].dot),
              color: PRIORITY_COLORS[p].dot,
              "& .MuiChip-deleteIcon": {
                fontSize: 14,
                color: PRIORITY_COLORS[p].dot,
              },
            }}
          />
        ))}

        {Array.from(filterStatus).map((s) => (
          <Chip
            key={s}
            label={s}
            size="small"
            onDelete={() => onToggleStatus(s)}
            sx={{
              height: 24,
              fontSize: "0.75rem",
              bgcolor: chipBg(STATUS_COLORS[s].dot),
              color: STATUS_COLORS[s].dot,
              "& .MuiChip-deleteIcon": {
                fontSize: 14,
                color: STATUS_COLORS[s].dot,
              },
            }}
          />
        ))}

        {activeFilterCount > 0 && (
          <Chip
            label="Clear all"
            size="small"
            onClick={onClearFilters}
            sx={{
              height: 24,
              fontSize: "0.75rem",
              cursor: "pointer",
              color: "text.secondary",
              bgcolor: "transparent",
              border: "1px solid",
              borderColor: "divider",
            }}
          />
        )}
      </Stack>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={onAddTask}
        sx={{
          borderRadius: "10px",
          flexShrink: 0,
          whiteSpace: "nowrap",
          fontSize: "0.85rem",
        }}
      >
        Add Task
      </Button>
    </Paper>
  );
};

export default DashboardToolbar;
