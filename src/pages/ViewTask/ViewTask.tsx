import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Container,
  CircularProgress,
} from "@mui/material";
import {
  CalendarToday,
  RadioButtonUnchecked,
  CheckCircle,
  EditOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import { PRIORITY_COLORS, STATUS_COLORS } from "../../constants/colors";
import StatusChip from "../../components/StatusChip";
import TaskProgressStatus from "../../components/TaskProgressStatus/TaskProgressStatus";
import SectionLabel from "../../components/SectionLabel";
import AlertDialog from "../../components/AlertDialog";
import { useTask } from "../../hooks/useTask";
import { getTaskProgressByStatus } from "../../utils";
import { formatDate, formatDateDdMmmYyyy } from "../../utils/dateFormat";
import type { Priority, Status } from "../../types/dashboard";
import { priorityLabelMap, statusLabelMap } from "../../constants/task";

type TaskSubtaskView = {
  id: number;
  title: string;
  status: Exclude<Status, "All">;
};

type TaskDetails = {
  id: number;
  title: string;
  details: string;
  createdDate: string;
  updatedDate: string;
  dueDate: string | null;
  priority: Priority;
  status: Exclude<Status, "All">;
};

const ViewTask = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getTaskById, deleteTask, deleteTaskLoading } = useTask();

  const [task, setTask] = useState<TaskDetails | null>(null);
  const [subtasks, setSubtasks] = useState<TaskSubtaskView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  useEffect(() => {
    const fetchTask = async () => {
      const taskId = Number(id);

      if (!taskId || Number.isNaN(taskId)) {
        setError("Invalid task id.");
        setLoading(false);
        return;
      }

      const data = await getTaskById(taskId);
      if (!data) {
        setError("Task not found.");
        setLoading(false);
        return;
      }

      setTask({
        id: data.id,
        title: data.title,
        details: data.details ?? "No details provided.",
        createdDate: data.createdDate,
        updatedDate: data.updatedDate,
        dueDate: data.dueDate,
        priority: priorityLabelMap[data.priority],
        status: statusLabelMap[data.status],
      });

      setSubtasks(
        data.subtasks.map((subtask) => ({
          id: subtask.id,
          title: subtask.name,
          status: statusLabelMap[subtask.status],
        })),
      );

      setLoading(false);
    };

    void fetchTask();
  }, [getTaskById, id]);

  const toggle = (id: number) =>
    setSubtasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "Completed" ? "Not Started" : "Completed",
            }
          : t,
      ),
    );

  const handleConfirmDelete = async () => {
    if (!task) return;

    const isDeleted = await deleteTask(task.id);
    if (isDeleted) {
      navigate("/dashboard", { replace: true });
      return;
    }

    setOpenDeleteDialog(false);
    setError("Failed to delete task. Please try again.");
  };

  const completed = subtasks.filter((t) => t.status === "Completed").length;
  const { completed: progressCompleted, total: progressTotal } =
    getTaskProgressByStatus(task?.status ?? "Not Started", completed, subtasks.length);
  const completionDate =
    task?.status === "Completed"
      ? formatDateDdMmmYyyy(task.updatedDate)
      : undefined;
  const progress =
    progressTotal > 0
      ? Math.round((progressCompleted / progressTotal) * 100)
      : 0;

  if (loading) {
    return (
      <Container
        sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, sm: 4 } }}
      >
        <Box sx={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
          <CircularProgress size={30} />
        </Box>
      </Container>
    );
  }

  if (error || !task) {
    return (
      <Container
        sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, sm: 4 } }}
      >
        <Box
          sx={{
            mx: "auto",
            mt: 10,
            p: 3,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "rgba(239,68,68,0.2)",
            bgcolor: "rgba(239,68,68,0.05)",
          }}
        >
          <Typography sx={{ color: "#b91c1c", fontWeight: 600 }}>
            {error ?? "Task not found."}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, sm: 4 } }}
    >
      <Box sx={{ mx: "auto" }}>
        {/* Card */}
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            p: { xs: 2.5, sm: 3.5 },
          }}
        >
          {/* Priority + Status row */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} gap={8}>
              <StatusChip value={task.priority} map={PRIORITY_COLORS} />

              {/* Circle progress status */}
              <TaskProgressStatus
                status={task.status}
                completed={progressCompleted}
                total={progressTotal}
                statusDate={completionDate}
              />
            </Stack>

            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  disabled={deleteTaskLoading}
                  onClick={() => setOpenDeleteDialog(true)}
                  sx={{ color: "text.secondary" }}
                >
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton size="small" sx={{ color: "text.secondary" }}>
                  <EditOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Title */}
          <Typography
            sx={{
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "text.primary",
              lineHeight: 1.35,
              mb: 2.5,
            }}
          >
            {task.title}
          </Typography>

          {/* Dates */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} mb={3}>
            <Box>
              <SectionLabel>Date Created</SectionLabel>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <CalendarToday sx={{ fontSize: 14, color: "text.disabled" }} />
                <Typography
                  sx={{ fontSize: "0.875rem", color: "text.secondary" }}
                >
                  {formatDate(task.createdDate)}
                </Typography>
              </Stack>
            </Box>
            <Box>
              <SectionLabel>Due Date</SectionLabel>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <CalendarToday sx={{ fontSize: 14, color: "warning.main" }} />
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "warning.main",
                    fontWeight: 500,
                  }}
                >
                  {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {/* Details fieldset */}
          <Box
            component="fieldset"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px",
              px: 2,
              pt: 0.5,
              pb: 2,
              mb: 3,
              legend: { px: 0.75, ml: 0.5, mr: "auto" },
            }}
          >
            <legend>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 400,
                  color: "text.secondary",
                }}
              >
                Details
              </Typography>
            </legend>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "text.secondary",
                lineHeight: 1.7,
                mt: 0.5,
              }}
            >
              {task.details}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3, borderColor: "divider" }} />

          {/* Subtasks */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={1.5}
            >
              <SectionLabel>Subtasks</SectionLabel>
              <Typography sx={{ fontSize: "0.75rem", color: "text.disabled" }}>
                {completed}/{subtasks.length} complete
              </Typography>
            </Stack>

            {/* Progress bar */}
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                mb: 2,
                height: 5,
                borderRadius: 4,
                bgcolor: "action.hover",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  bgcolor: "primary.main",
                },
              }}
            />

            <Stack spacing={0.75}>
              {subtasks.map((taskItem) => (
                <Stack
                  key={taskItem.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  onClick={() => toggle(taskItem.id)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor:
                      taskItem.status === "Completed"
                        ? "rgba(34,197,94,0.2)"
                        : "divider",
                    bgcolor:
                      taskItem.status === "Completed"
                        ? "rgba(34,197,94,0.03)"
                        : "background.paper",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.25}>
                    {taskItem.status === "Completed" ? (
                      <CheckCircle sx={{ fontSize: 18, color: "#22c55e" }} />
                    ) : (
                      <RadioButtonUnchecked
                        sx={{ fontSize: 18, color: "text.disabled" }}
                      />
                    )}
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color:
                          taskItem.status === "Completed"
                            ? "text.disabled"
                            : "text.primary",
                        textDecoration:
                          taskItem.status === "Completed"
                            ? "line-through"
                            : "none",
                      }}
                    >
                      {taskItem.title}
                    </Typography>
                  </Stack>
                  <StatusChip value={taskItem.status} map={STATUS_COLORS} />
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>

      <AlertDialog
        open={openDeleteDialog}
        variant="warning"
        leftButtonText={deleteTaskLoading ? "Deleting..." : "Delete"}
        rightButtonText="Cancel"
        content="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!deleteTaskLoading) {
            setOpenDeleteDialog(false);
          }
        }}
      />
    </Container>
  );
};

export default ViewTask;
