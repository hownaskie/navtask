import {
  ArrowDownward,
  ArrowUpward,
  DeleteOutline,
  EditOutlined,
  UnfoldMore,
} from "@mui/icons-material";
import {
  Button,
  Checkbox,
  Chip,
  IconButton,
  Paper,
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
import { PRIORITY_COLORS, STATUS_COLORS } from "../../constants/colors";
import type { SortDir, SortKey, Priority, Status } from "../../types/dashboard";
import type { TaskResponse } from '../../interfaces/task'
import { formatDate } from "../../utils";
import TaskTableSkeleton from "../TaskTableSkeleton";

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

interface TaskTableProps {
  loading: boolean;
  rowsPerPage: number;
  selectedCount: number;
  selectedIds: Set<number>;
  allPageSelected: boolean;
  somePageSelected: boolean;
  paginated: TaskResponse[];
  sortedCount: number;
  activeFilterCount: number;
  sortKey: SortKey;
  sortDir: SortDir;
  page: number;
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onSelectRow: (id: number) => void;
  onSort: (key: SortKey) => void;
  onViewTask: (id: number) => void;
  onEditTask: (id: number) => void;
  onPageChange: (_: unknown, newPage: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TaskTable = ({
  loading,
  rowsPerPage,
  selectedCount,
  selectedIds,
  allPageSelected,
  somePageSelected,
  paginated,
  sortedCount,
  activeFilterCount,
  sortKey,
  sortDir,
  page,
  onDeleteSelected,
  onSelectAll,
  onSelectRow,
  onSort,
  onViewTask,
  onEditTask,
  onPageChange,
  onRowsPerPageChange,
}: TaskTableProps) => {
  return (
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
      {loading ? (
        <TaskTableSkeleton rows={rowsPerPage} />
      ) : (
        <>
          {selectedCount > 0 && (
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
                {selectedCount} row{selectedCount !== 1 ? "s" : ""} selected
              </Typography>
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<DeleteOutline fontSize="small" />}
                onClick={onDeleteSelected}
                sx={{ borderRadius: "8px", fontSize: "0.78rem", py: 0.6 }}
              >
                Delete selected ({selectedCount})
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
                    onChange={onSelectAll}
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
                  onSort={onSort}
                />
                <SortHeader
                  label="Due Date"
                  sortKey="dueDate"
                  active={sortKey === "dueDate"}
                  direction={sortDir}
                  onSort={onSort}
                />
                <SortHeader
                  label="Priority"
                  sortKey="priority"
                  active={sortKey === "priority"}
                  direction={sortDir}
                  onSort={onSort}
                />
                <SortHeader
                  label="Status"
                  sortKey="status"
                  active={sortKey === "status"}
                  direction={sortDir}
                  onSort={onSort}
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
                  const isSelected = selectedIds.has(task.id);
                  const isDone = task.status === "COMPLETED";
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
                        onViewTask(task.id);
                      }}
                      sx={{
                        bgcolor: isSelected
                          ? "rgba(37,99,235,0.04) !important"
                          : isDone
                            ? "rgba(0,0,0,0.012)"
                            : "white",
                        opacity: isDone && !isSelected ? 0.65 : 1,
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
                          onChange={() => onSelectRow(task.id)}
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
                            textDecoration: isDone ? "line-through" : "none",
                            color: isDone ? "text.secondary" : "text.primary",
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
                          {task.dueDate ? formatDate(task.dueDate) : "No due date"}
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
                              onEditTask(task.id);
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
                  count={sortedCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={onPageChange}
                  onRowsPerPageChange={onRowsPerPageChange}
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
        </>
      )}
    </TableContainer>
  );
};

export default TaskTable;
