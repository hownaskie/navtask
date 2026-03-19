import {
  ArrowDownward,
  ArrowUpward,
  DeleteOutline,
  EditOutlined,
  UnfoldMore,
} from "@mui/icons-material";
import {
  Box,
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
  Typography,
} from "@mui/material";
import { PRIORITY_COLORS } from "../../constants/colors";
import { priorityLabelMap, statusLabelMap } from "../../constants/task";
import type { SortDir, SortKey } from "../../types/dashboard";
import type { TaskResponse } from "../../interfaces/task";
import { formatDate } from "../../utils";
import { getTaskProgress } from "../../utils";
import TaskTableSkeleton from "../TaskTableSkeleton";
import TaskProgressStatus from "../TaskProgressStatus/TaskProgressStatus";

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
  deleteLoading: boolean;
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
  deleteLoading,
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
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(37,99,235,0.03)" }}>
                <TableCell padding="checkbox" sx={{ pl: 2, width: 48 }}>
                  {selectedCount > 0 ? (
                    <Box sx={{ position: "relative", display: "inline-flex" }}>
                      <IconButton
                        size="small"
                        disabled={deleteLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSelected();
                        }}
                        sx={{
                          color: "#2563EB",
                          bgcolor: "rgba(59,130,246,0.14)",
                          borderRadius: "10px",
                          "&:hover": { bgcolor: "rgba(59,130,246,0.2)" },
                        }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                      <Box
                        sx={{
                          position: "absolute",
                          top: -6,
                          right: -8,
                          minWidth: 18,
                          height: 18,
                          px: 0.5,
                          borderRadius: "999px",
                          bgcolor: "#dbeafe",
                          color: "#1d4ed8",
                          display: "grid",
                          placeItems: "center",
                          border: "1px solid rgba(59,130,246,0.35)",
                        }}
                      >
                        <Typography sx={{ fontSize: "0.65rem", fontWeight: 700 }}>
                          {selectedCount}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
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
                  )}
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
                  const { completed: progressCompleted, total: progressTotal } =
                    getTaskProgress(task);
                  const pStyle = PRIORITY_COLORS[priorityLabelMap[task.priority]];
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
                          ? "rgba(37,99,235,0.08) !important"
                          : isDone
                            ? "action.hover"
                            : "background.paper",
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
                          {task.dueDate
                            ? formatDate(task.dueDate)
                            : "No due date"}
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
                        <TaskProgressStatus
                          status={statusLabelMap[task.status]}
                          completed={progressCompleted}
                          total={progressTotal}
                        />
                      </TableCell>

                      <TableCell sx={{ py: 1.5, px: 1 }}>
                        <IconButton
                          className="row-edit"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task.id);
                          }}
                          sx={{
                            color: "primary.secondary",
                          }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
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
