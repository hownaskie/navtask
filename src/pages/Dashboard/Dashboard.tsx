import { useState, useMemo, useRef } from "react";
import {
  Alert,
  Container,
  Snackbar,
} from "@mui/material";
import {
  getStatusCards,
  calculateDashboardStats,
  toggleSetItem,
  filterAndSortTasks,
  getMaxPageAfterDelete,
  getPageSelectionState,
} from "../../utils";
import { isDashboardStatusCardEnabled } from "../../utils/featureFlags";
import StatusCard from "../../components/StatusCard";
import {
  type SortKey,
  type SortDir,
  type Priority,
  type Status,
} from "../../types/dashboard";
import { useNavigate } from "react-router-dom";
import { useTask } from "../../hooks/useTask";
import FilterDialog from "../../components/FilterDialog";
import TaskTable from "../../components/TaskTable";
import AlertDialog from "../../components/AlertDialog";
import DashboardToolbar from "../../components/DashboardToolbar";
import { buildBreadcrumbTrail } from "../../components/Breadcrumbs";

// ── Page ──────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const showDashboardStatusCard = isDashboardStatusCardEnabled();
  const navigate = useNavigate();
  const { tasks, loading, deleteTasks, deleteTaskLoading } = useTask({
    autoFetch: true,
  });
  const [snack, setSnack] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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
  const { pageIds, allPageSelected, somePageSelected } =
    getPageSelectionState(paginated, selected);

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
    navigate(`/view/${id}`, {
      state: { breadcrumbs: buildBreadcrumbTrail(`/view/${id}`) },
    });
  };

  // ── CRUD
  const addTask = () => {
    navigate("/add");
  };

  const editTask = (id: number) => {
    navigate(`/edit/${id}`, {
      state: { breadcrumbs: buildBreadcrumbTrail(`/edit/${id}`) },
    });
  };

  const confirmDeleteSelected = () => {
    if (selected.size === 0) return;
    setOpenDeleteDialog(true);
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;

    const selectedIds = Array.from(selected);
    const isDeleted = await deleteTasks(selectedIds);

    if (!isDeleted) {
      setSnack("Failed to delete tasks. Please try again.");
      return;
    }

    const deletedCount = selectedIds.length;
    setSelected(new Set());

    const maxPage = getMaxPageAfterDelete(
      sorted.length,
      deletedCount,
      rowsPerPage,
    );
    setPage((prev) => Math.min(prev, maxPage));

    setSnack(`${deletedCount} task${deletedCount !== 1 ? "s" : ""} deleted`);
  };

  const { total, done, progress, highCount } = calculateDashboardStats(tasks);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ── Stat cards ── */}
      {showDashboardStatusCard && (
        <StatusCard
          card={getStatusCards({ total, done, highCount, progress })}
          totalProgress={progress}
        />
      )}

      <DashboardToolbar
        filterOpen={filterOpen}
        activeFilterCount={activeFilterCount}
        filterPriority={filterPriority}
        filterStatus={filterStatus}
        filterBtnRef={filterBtnRef}
        onToggleFilter={() => setFilterOpen((o) => !o)}
        onTogglePriority={togglePriority}
        onToggleStatus={toggleStatus}
        onClearFilters={clearAllFilters}
        onAddTask={addTask}
      />

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
        deleteLoading={deleteTaskLoading}
        onDeleteSelected={confirmDeleteSelected}
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

      <AlertDialog
        open={openDeleteDialog}
        content={`${selected.size} Task${selected.size !== 1 ? "s" : ""} will be deleted`}
        variant="warning"
        loading={deleteTaskLoading}
        confirmButtonPosition="right"
        leftButtonText={deleteTaskLoading ? "Deleting..." : "Delete"}
        rightButtonText="Cancel"
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={async () => {
          setOpenDeleteDialog(false);
          await deleteSelected();
        }}
      />
    </Container>
  );
};

export default Dashboard;
