import { Fragment, useState } from "react";
import {
  AttachFile,
  ArrowDownward,
  ArrowUpward,
  DeleteOutline,
  EditOutlined,
  KeyboardArrowDown,
  KeyboardArrowRight,
  UnfoldMore,
} from "@mui/icons-material";
import {
  Box,
  Checkbox,
  Chip,
  Collapse,
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
import {
  formatDate,
  getDueDateMeta,
  getTaskProgress,
} from "../../utils";
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
      color: "text.secondary",
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
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<number>>(new Set());

  const toggleExpandedTask = (taskId: number) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

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
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    color: "text.secondary",
                    whiteSpace: "nowrap",
                    py: 1.5,
                    px: 2,
                  }}
                >
                  Title
                </TableCell>
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
                  const dueDateMeta = getDueDateMeta(task.dueDate, task.priority, task.status);
                  const hasSubtasks = task.subtasks.length > 0;
                  const isExpanded = expandedTaskIds.has(task.id);
                  const { completed: progressCompleted, total: progressTotal } =
                    getTaskProgress(task);
                  const pStyle = PRIORITY_COLORS[priorityLabelMap[task.priority]];
                  return (
                    <Fragment key={task.id}>
                      <TableRow
                        selected={isSelected}
                        onClick={selectedCount > 0 ? () => onSelectRow(task.id) : undefined}
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
                          cursor: selectedCount > 0 ? "pointer" : "default",
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
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            {hasSubtasks && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpandedTask(task.id);
                                }}
                                sx={{
                                  p: 0.25,
                                  width: 22,
                                  height: 22,
                                  color: "text.secondary",
                                  flexShrink: 0,
                                }}
                              >
                                {isExpanded ? (
                                  <KeyboardArrowDown fontSize="small" />
                                ) : (
                                  <KeyboardArrowRight fontSize="small" />
                                )}
                              </IconButton>
                            )}
                            <Typography
                              variant="body2"
                              component="button"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (selectedCount > 0) {
                                  onSelectRow(task.id);
                                  return;
                                }
                                onViewTask(task.id);
                              }}
                              sx={{
                                p: 0,
                                border: 0,
                                bgcolor: "transparent",
                                fontWeight: 700,
                                fontSize: "0.875rem",
                                textDecoration: isDone ? "underline line-through" : "underline",
                                color: isDone ? "text.secondary" : "text.primary",
                                textAlign: "left",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                "&:hover": {
                                  color: "primary.main",
                                },
                              }}
                            >
                              {task.title}
                            </Typography>
                            {task.attachments.length > 0 && (
                              <AttachFile
                                sx={{
                                  fontSize: 16,
                                  color: isDone ? "text.disabled" : "text.secondary",
                                  transform: "rotate(-45deg)",
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </Stack>
                        </TableCell>

                        <TableCell sx={{ py: 1.5, px: 2 }}>
                          <Stack spacing={0.15}>
                            <Typography
                              variant="body2"
                              color={dueDateMeta.color}
                              fontWeight={task.dueDate ? 500 : 400}
                              fontSize="0.82rem"
                            >
                              {task.dueDate
                                ? formatDate(task.dueDate)
                                : "No due date"}
                            </Typography>
                            {dueDateMeta.label && (
                              <Typography
                                variant="caption"
                                color={dueDateMeta.labelColor}
                                sx={{ fontWeight: dueDateMeta.label === "Overdue" ? 700 : 600, lineHeight: 1.2 }}
                              >
                                {dueDateMeta.label}
                              </Typography>
                            )}
                          </Stack>
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
                              border: "1px solid",
                              borderColor: pStyle.dot,
                              borderRadius: 0.5,
                              "& .MuiChip-label": { px: 1 },
                            }}
                          />
                        </TableCell>

                        <TableCell sx={{ py: 1.5, px: 2 }}>
                          <TaskProgressStatus
                            status={statusLabelMap[task.status]}
                            completed={progressCompleted}
                            total={progressTotal}
                            dateLayout="vertical"
                            statusDate={
                              task.status === "COMPLETED" && task.completedDate
                                ? formatDate(task.completedDate)
                                : undefined
                            }
                          />
                        </TableCell>

                        <TableCell sx={{ py: 1.5, px: 1 }}>
                          <IconButton
                            className="row-edit"
                            size="small"
                            disabled={task.status === "CANCELLED"}
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
                      {hasSubtasks && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            sx={{
                              py: 0,
                              px: 0,
                              border: 0,
                              bgcolor: "background.paper",
                            }}
                          >
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box
                                sx={{
                                  borderTop: "1px solid",
                                  borderColor: "divider",
                                  bgcolor: "background.paper",
                                }}
                              >
                                <Table size="small" sx={{ tableLayout: "fixed" }}>
                                  <TableBody>
                                    {task.subtasks.map((subtask, subtaskIndex) => (
                                      <TableRow key={subtask.id}>
                                        <TableCell
                                          sx={{
                                            width: 48,
                                            py: 1.5,
                                            pl: 2,
                                            borderTop: subtaskIndex === 0 ? "none" : "1px solid",
                                            borderColor: "divider",
                                          }}
                                        />
                                        <TableCell
                                          sx={{
                                            py: 1.5,
                                            px: 2,
                                            borderTop: subtaskIndex === 0 ? "none" : "1px solid",
                                            borderColor: "divider",
                                          }}
                                        >
                                          <Stack direction="row" alignItems="center" spacing={0.75}>
                                            <Box sx={{ width: 22, height: 22, flexShrink: 0 }} />
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontWeight: 700,
                                                fontSize: "0.875rem",
                                                color: "text.primary",
                                              }}
                                            >
                                              {subtask.name}
                                            </Typography>
                                          </Stack>
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            py: 1.5,
                                            px: 2,
                                            borderTop: subtaskIndex === 0 ? "none" : "1px solid",
                                            borderColor: "divider",
                                          }}
                                        />
                                        <TableCell
                                          sx={{
                                            py: 1.5,
                                            px: 2,
                                            borderTop: subtaskIndex === 0 ? "none" : "1px solid",
                                            borderColor: "divider",
                                          }}
                                        />
                                        <TableCell
                                          sx={{
                                            py: 1.5,
                                            px: 2,
                                            borderTop: subtaskIndex === 0 ? "none" : "1px solid",
                                            borderColor: "divider",
                                          }}
                                        >
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              fontWeight: 600,
                                              fontSize: "0.78rem",
                                              color: subtask.status === "COMPLETED" ? "success.main" : "text.secondary",
                                            }}
                                          >
                                            {subtask.status === "COMPLETED" ? "Done" : "Not Done"}
                                          </Typography>
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            width: 48,
                                            py: 1.5,
                                            px: 1,
                                            borderTop: subtaskIndex === 0 ? "none" : "1px solid",
                                            borderColor: "divider",
                                          }}
                                        />
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
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
