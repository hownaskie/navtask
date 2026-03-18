import { useState, useMemo, useRef } from "react";
import { Add, FilterList } from "@mui/icons-material";
import {
  Alert,
  Badge,
  Button,
  Chip,
  Container,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  getStatusCards,
  calculateDashboardStats,
  toggleSetItem,
  filterAndSortTasks,
} from "../../utils";
import StatusCard from "../../components/StatusCard";
import {
  type SortKey,
  type SortDir,
  type Priority,
  type Status,
} from "../../types/dashboard";
import { PRIORITY_COLORS, STATUS_COLORS } from "../../constants/colors";
import { useNavigate } from "react-router-dom";
import { useTask } from "../../hooks/useTask";
import FilterDialog from "../../components/FilterDialog";
import TaskTable from "../../components/TaskTable";

// ── Page ──────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { tasks, loading } = useTask({ autoFetch: true });
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
    // const count = selected.size;
    // setTasks((prev) => {
    //   const next = prev.filter((t) => !selected.has(t.id));
    //   const maxPage = Math.max(0, Math.ceil(next.length / rowsPerPage) - 1);
    //   if (page > maxPage) setPage(maxPage);
    //   return next;
    // });
    // setSelected(new Set());
    // setSnack(`${count} task${count !== 1 ? "s" : ""} deleted`);
  };

  const { total, done, progress, highCount } = calculateDashboardStats(tasks);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        anchorEl={filterBtnRef.current}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        selectedPriority={filterPriority}
        selectedStatus={filterStatus}
        onTogglePriority={togglePriority}
        onToggleStatus={toggleStatus}
        onClear={clearAllFilters}
      />

      <TaskTable
        loading={loading}
        rowsPerPage={rowsPerPage}
        selectedCount={selected.size}
        selectedIds={selected}
        allPageSelected={allPageSelected}
        somePageSelected={somePageSelected}
        paginated={paginated}
        sortedCount={sorted.length}
        activeFilterCount={activeFilterCount}
        sortKey={sortKey}
        sortDir={sortDir}
        page={page}
        onDeleteSelected={deleteSelected}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        onSort={handleSort}
        onViewTask={handleViewTask}
        onEditTask={editTask}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

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
