import { useState, useMemo, useRef } from "react";
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  CheckRounded,
  DeleteOutline,
  EditOutlined,
  FilterList,
  UnfoldMore,
} from "@mui/icons-material";
import {
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Chip,
  ClickAwayListener,
  Container,
  Divider,
  IconButton,
  Paper,
  Popper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  getStatusCards,
  calculateDashboardStats,
  formatDate,
  toggleSetItem,
  filterAndSortTasks,
} from "../../utils";
import StatusCard from "../../components/StatusCard";
import type { Task } from "../../data/mockTasks";
import { SEED_TASKS } from "../../data/mockTasks";
import {
  type SortKey,
  type SortDir,
  type Priority,
  type Status,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "../../types/dashboard";
import { PRIORITY_COLORS, STATUS_COLORS } from "../../constants/colors";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";

// ── Sortable column header ────────────────────────────────────────────────────
const SortHeader = ({
  label,
  sortKey,
  active,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  direction: SortDir;
  onSort: (key: SortKey) => void;
}) => (
  <TableCell
    onClick={(e) => {
      e.stopPropagation();
      onSort(sortKey);
    }}
    sx={{
      cursor: "pointer",
      userSelect: "none",
      fontWeight: 600,
      fontSize: "0.78rem",
      color: active ? "primary.main" : "text.secondary",
      whiteSpace: "nowrap",
      py: 1.5,
      px: 2,
      "&:hover": { color: "primary.main" },
      transition: "color 0.15s",
    }}
  >
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <span>{label}</span>
      {active ? (
        direction === "asc" ? (
          <ArrowUpward sx={{ fontSize: 14 }} />
        ) : (
          <ArrowDownward sx={{ fontSize: 14 }} />
        )
      ) : (
        <UnfoldMore sx={{ fontSize: 14, opacity: 0.35 }} />
      )}
    </Stack>
  </TableCell>
);

// ── Filter dialog ─────────────────────────────────────────────────────────────
const FilterDialog = ({
  anchorEl,
  open,
  onClose,
  selectedPriority,
  selectedStatus,
  onTogglePriority,
  onToggleStatus,
  onClear,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  selectedPriority: Set<Priority>;
  selectedStatus: Set<Status>;
  onTogglePriority: (p: Priority) => void;
  onToggleStatus: (s: Status) => void;
  onClear: () => void;
}) => {
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
          {/* Header */}
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
            {/* Priority section */}
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
                      {/* Colored dot */}
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

            {/* Status section */}
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

// ── Page ──────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const {users, loading} = useUser();
  console.log(users, loading);
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [snack, setSnack] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // ── Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<Set<Priority>>(
    new Set(),
  );
  const [filterStatus, setFilterStatus] = useState<Set<Status>>(new Set());
  const filterBtnRef = useRef<HTMLButtonElement>(null);

  const activeFilterCount = filterPriority.size + filterStatus.size;

  const clearAllFilters = () => {
    setFilterPriority(new Set());
    setFilterStatus(new Set());
    setPage(0);
  };

  const togglePriority = (p: Priority) => {
    setFilterPriority((prev) => toggleSetItem(prev, p));
    setPage(0);
  };

  const toggleStatus = (s: Status) => {
    setFilterStatus((prev) => toggleSetItem(prev, s));
    setPage(0);
  };

  // ── Sort
  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  // ── Filtered + sorted
  const sorted = useMemo(() => {
    return filterAndSortTasks(
      tasks,
      { title: "", priority: filterPriority, status: filterStatus },
      sortKey,
      sortDir,
    );
  }, [tasks, sortKey, sortDir, filterPriority, filterStatus]);

  // ── Paginated slice
  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // ── Select-all
  const pageIds = paginated.map((t) => t.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected =
    pageIds.some((id) => selected.has(id)) && !allPageSelected;

  const handleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleSelectRow = (id: number) => {
    setSelected((prev) => toggleSetItem(prev, id));
  };

  const handleViewTask = (id: number) => {
    navigate(`/view/${id}`);
  };

  // ── CRUD
  const addTask = () => {
    navigate("/add");
  };

  const editTask = (id: number) => {
    navigate(`/edit/${id}`);
  };

  const deleteSelected = () => {
    const count = selected.size;
    setTasks((prev) => {
      const next = prev.filter((t) => !selected.has(t.id));
      const maxPage = Math.max(0, Math.ceil(next.length / rowsPerPage) - 1);
      if (page > maxPage) setPage(maxPage);
      return next;
    });
    setSelected(new Set());
    setSnack(`${count} task${count !== 1 ? "s" : ""} deleted`);
  };

  const { total, done, progress, highCount } = calculateDashboardStats(tasks);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ── Header ── */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track, sort and manage all your tasks in one place.
        </Typography>
      </Box>

      {/* ── Stat cards ── */}
      <StatusCard
        card={getStatusCards({ total, done, highCount, progress })}
        totalProgress={progress}
      />

      {/* ── Toolbar bar ── */}
      <Paper
        elevation={0}
        sx={{
          px: 1.5,
          py: 1,
          mb: 3,
          border: "1.5px solid rgba(37,99,235,0.15)",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          bgcolor: "white",
        }}
      >
        {/* Left — filter button + active chips */}
        <Stack
          direction="row"
          alignItems="center"
          sx={{ flex: 1, flexWrap: "wrap", minWidth: 0, gap: 0.75 }}
        >
          <Tooltip title={filterOpen ? "Close filters" : "Open filters"}>
            <Button
              ref={filterBtnRef}
              size="small"
              onClick={() => setFilterOpen((o) => !o)}
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
                    ? "rgba(37,99,235,0.08)"
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
                  bgcolor: "rgba(37,99,235,0.08)",
                  color: "primary.main",
                },
              }}
            >
              Filter
            </Button>
          </Tooltip>

          {/* Active filter chips */}
          {Array.from(filterPriority).map((p) => (
            <Chip
              key={p}
              label={p}
              size="small"
              onDelete={() => togglePriority(p)}
              sx={{
                height: 24,
                fontSize: "0.75rem",
                bgcolor: PRIORITY_COLORS[p].bg,
                color: PRIORITY_COLORS[p].color,
                "& .MuiChip-deleteIcon": {
                  fontSize: 14,
                  color: PRIORITY_COLORS[p].color,
                },
              }}
            />
          ))}
          {Array.from(filterStatus).map((s) => (
            <Chip
              key={s}
              label={s}
              size="small"
              onDelete={() => toggleStatus(s)}
              sx={{
                height: 24,
                fontSize: "0.75rem",
                bgcolor: STATUS_COLORS[s].bg,
                color: STATUS_COLORS[s].color,
                "& .MuiChip-deleteIcon": {
                  fontSize: 14,
                  color: STATUS_COLORS[s].color,
                },
              }}
            />
          ))}
          {activeFilterCount > 0 && (
            <Chip
              label="Clear all"
              size="small"
              onClick={clearAllFilters}
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

        {/* Right — add button */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={addTask}
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

      {/* ── Filter dialog (Popper) ── */}
      <FilterDialog
        // eslint-disable-next-line react-hooks/refs
        anchorEl={filterBtnRef.current}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        selectedPriority={filterPriority}
        selectedStatus={filterStatus}
        onTogglePriority={togglePriority}
        onToggleStatus={toggleStatus}
        onClear={clearAllFilters}
      />

      {/* ── Task table ── */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1.5px solid",
          borderColor: "divider",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {/* Bulk toolbar */}
        {selected.size > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 2,
              py: 1.2,
              bgcolor: "rgba(37,99,235,0.06)",
              borderBottom: "1.5px solid rgba(37,99,235,0.15)",
            }}
          >
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {selected.size} row{selected.size !== 1 ? "s" : ""} selected
            </Typography>
            <Button
              size="small"
              variant="contained"
              color="error"
              startIcon={<DeleteOutline fontSize="small" />}
              onClick={deleteSelected}
              sx={{ borderRadius: "8px", fontSize: "0.78rem", py: 0.6 }}
            >
              Delete selected ({selected.size})
            </Button>
          </Stack>
        )}

        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(37,99,235,0.03)" }}>
              <TableCell padding="checkbox" sx={{ pl: 2, width: 48 }}>
                <Checkbox
                  checked={allPageSelected}
                  indeterminate={somePageSelected}
                  onChange={handleSelectAll}
                  size="small"
                  sx={{
                    color: "#CBD5E1",
                    "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                      color: "primary.main",
                    },
                  }}
                />
              </TableCell>
              <SortHeader
                label="Title"
                sortKey="title"
                active={sortKey === "title"}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Due Date"
                sortKey="dueDate"
                active={sortKey === "dueDate"}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Priority"
                sortKey="priority"
                active={sortKey === "priority"}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Status"
                sortKey="status"
                active={sortKey === "status"}
                direction={sortDir}
                onSort={handleSort}
              />
              <TableCell sx={{ width: 48 }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center", py: 8 }}>
                  <Typography sx={{ fontSize: "2rem", mb: 1 }}>📭</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeFilterCount > 0
                      ? "No tasks match your filters"
                      : "No tasks yet — click Add Task to get started"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((task, idx) => {
                const isSelected = selected.has(task.id);
                const pStyle =
                  PRIORITY_COLORS[task.priority as Priority] ??
                  PRIORITY_COLORS["High"];
                const sStyle =
                  STATUS_COLORS[task.status as Status] ??
                  STATUS_COLORS["Not Started"];
                return (
                  <TableRow
                    key={task.id}
                    selected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTask(task.id);
                    }}
                    sx={{
                      bgcolor: isSelected
                        ? "rgba(37,99,235,0.04) !important"
                        : task.done
                          ? "rgba(0,0,0,0.012)"
                          : "white",
                      opacity: task.done && !isSelected ? 0.65 : 1,
                      transition: "all 0.15s",
                      borderTop: idx === 0 ? "none" : "1px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "rgba(37,99,235,0.025)" },
                      "&.Mui-selected:hover": {
                        bgcolor: "rgba(37,99,235,0.07) !important",
                      },
                      "&:hover .row-edit": { opacity: 1 },
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ pl: 2 }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectRow(task.id)}
                        onClick={(e) => e.stopPropagation()}
                        size="small"
                        sx={{
                          color: "#CBD5E1",
                          "&.Mui-checked": { color: "primary.main" },
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          textDecoration: task.done ? "line-through" : "none",
                          color: task.done ? "text.secondary" : "text.primary",
                        }}
                      >
                        {task.title}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontSize="0.82rem"
                      >
                        {formatDate(task.dueDate)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Chip
                        label={task.priority}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.72rem",
                          height: 22,
                          bgcolor: pStyle.bg,
                          color: pStyle.color,
                          border: "none",
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Chip
                        label={task.status}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.72rem",
                          height: 22,
                          bgcolor: sStyle.bg,
                          color: sStyle.color,
                          border: "none",
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 1.5, px: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          className="row-edit"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            editTask(task.id);
                          }}
                          sx={{
                            opacity: 0,
                            transition: "opacity 0.15s",
                            color: "primary.main",
                          }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={sorted.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                  "& .MuiTablePagination-toolbar": { px: 2 },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                    { fontSize: "0.8rem", color: "text.secondary" },
                  "& .MuiTablePagination-select": { fontSize: "0.8rem" },
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* ── Below-table actions ── */}
      {done > 0 && (
        <Box sx={{ mt: 1, textAlign: "right" }}>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setTasks((prev) => prev.filter((t) => !t.done));
              setSelected(new Set());
              setPage(0);
              setSnack("Completed tasks cleared");
            }}
            sx={{
              fontSize: "0.75rem",
              color: "text.secondary",
              "&:hover": { color: "error.main" },
            }}
          >
            Clear completed ({done})
          </Button>
        </Box>
      )}

      <Snackbar
        open={!!snack}
        autoHideDuration={2500}
        onClose={() => setSnack("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack("")}
          severity="info"
          sx={{ borderRadius: 3 }}
        >
          {snack}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
