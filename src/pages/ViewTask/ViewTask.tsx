import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Container,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  CalendarToday,
  EditOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import { PRIORITY_COLORS } from "../../constants/colors";
import StatusChip from "../../components/StatusChip";
import TaskProgressStatus from "../../components/TaskProgressStatus/TaskProgressStatus";
import SectionLabel from "../../components/SectionLabel";
import AlertDialog from "../../components/AlertDialog";
import AttachmentCard from "../../components/AttachmentCard";
import { useTask } from "../../hooks/useTask";
import {
  getTaskProgressByStatus,
  getAttachmentName,
  getAttachmentType,
  getAttachmentUrl,
  resolveAttachmentSize,
} from "../../utils";
import {
  formatDateDdMmmYyyy,
  formatDateMmmDdYyyy,
} from "../../utils/dateFormat";
import type { Priority, Status } from "../../types/dashboard";
import { getStatusLabel, priorityLabelMap } from "../../constants/task";
import { getSubtaskStatusLabel } from "../../constants/taskForm";
import {
  buildBreadcrumbTrail,
  type BreadcrumbState,
} from "../../components/Breadcrumbs";

type TaskSubtaskView = {
  id: number;
  title: string;
  status: "Not Done" | "Done";
};

type TaskDetails = {
  id: number;
  title: string;
  details: string;
  createdDate: string;
  completedDate: string | null;
  updatedDate: string;
  dueDate: string | null;
  priority: Priority;
  status: Exclude<Status, "All">;
  attachments: { id: number; attachmentUrl: string }[];
};

const ViewTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { getTaskById, deleteTask, deleteTaskLoading } = useTask();

  const [task, setTask] = useState<TaskDetails | null>(null);
  const [subtasks, setSubtasks] = useState<TaskSubtaskView[]>([]);
  const [attachmentSizes, setAttachmentSizes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const currentBreadcrumbs =
    (location.state as BreadcrumbState | null)?.breadcrumbs ??
    buildBreadcrumbTrail(location.pathname);

  useEffect(() => {
    const fetchTask = async () => {
      const taskId = Number(id);

      if (!taskId || Number.isNaN(taskId)) {
        setAttachmentSizes({});
        setError("Invalid task id.");
        setLoading(false);
        return;
      }

      const data = await getTaskById(taskId);
      if (!data) {
        setAttachmentSizes({});
        setError("Task not found.");
        setLoading(false);
        return;
      }

      setAttachmentSizes({});

      setTask({
        id: data.id,
        title: data.title,
        details: data.details ?? "No details provided.",
        createdDate: data.createdDate,
        completedDate: data.completedDate,
        updatedDate: data.updatedDate,
        dueDate: data.dueDate,
        priority: priorityLabelMap[data.priority],
        status: getStatusLabel(data.status),
        attachments: data.attachments,
      });

      setSubtasks(
        data.subtasks.map((subtask) => ({
          id: subtask.id,
          title: subtask.name,
          status: getSubtaskStatusLabel(subtask.status),
        })),
      );

      setLoading(false);
    };

    void fetchTask();
  }, [getTaskById, id]);

  useEffect(() => {
    if (!task || task.attachments.length === 0) {
      return;
    }

    let cancelled = false;

    void Promise.all(
      task.attachments.map(async (attachment) => {
        const attachmentUrl = getAttachmentUrl(attachment.attachmentUrl);
        const size = await resolveAttachmentSize(attachmentUrl);
        return { id: attachment.id, size };
      }),
    ).then((results) => {
      if (cancelled) {
        return;
      }

      const nextSizes: Record<number, string> = {};
      results.forEach(({ id: attachmentId, size }) => {
        nextSizes[attachmentId] = size;
      });
      setAttachmentSizes(nextSizes);
    });

    return () => {
      cancelled = true;
    };
  }, [task]);

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

  const completed = subtasks.filter((t) => t.status === "Done").length;
  const { completed: progressCompleted, total: progressTotal } =
    getTaskProgressByStatus(task?.status ?? "Not Started", completed, subtasks.length);
  const completionDate =
    task?.status === "Complete"
      ? task.completedDate
        ? formatDateDdMmmYyyy(task.completedDate)
        : undefined
      : undefined;

  const renderSubtaskStatus = (status: TaskSubtaskView["status"]) => {
    const isDone = status === "Done";
    return (
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={18}
            thickness={4}
            sx={{ color: "#3b82f6" }}
          />
          <CircularProgress
            variant="determinate"
            value={isDone ? 100 : 0}
            size={18}
            thickness={22}
            sx={{
              color: "#3b82f6",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </Box>
        <Typography
          sx={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "text.secondary",
          }}
        >
          {status}
        </Typography>
      </Stack>
    );
  };

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
          sx={(theme) => ({
            mx: "auto",
            mt: 10,
            p: 3,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: alpha(theme.palette.error.main, 0.28),
            bgcolor: alpha(theme.palette.error.main, theme.palette.mode === "dark" ? 0.16 : 0.06),
          })}
        >
          <Typography sx={{ color: "error.main", fontWeight: 600 }}>
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
                <IconButton
                  size="small"
                  onClick={() =>
                    navigate(`/edit/${task.id}`, {
                      state: {
                        breadcrumbs: [
                          ...currentBreadcrumbs,
                          {
                            label: "Edit",
                            href: `/edit/${task.id}`,
                          },
                        ],
                      },
                    })
                  }
                  sx={{ color: "text.secondary" }}
                >
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
                  {formatDateMmmDdYyyy(task.createdDate)}
                </Typography>
              </Stack>
            </Box>
            <Box>
              <SectionLabel>Due Date</SectionLabel>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <CalendarToday sx={{ fontSize: 14, color: "text.disabled" }} />
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "text.secondary",
                    fontWeight: 500,
                  }}
                >
                  {task.dueDate ? formatDateMmmDdYyyy(task.dueDate) : "No due date"}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {/* Details */}
          <Box sx={{ mb: 3 }}>
            <SectionLabel>Details</SectionLabel>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "text.secondary",
                lineHeight: 1.7,
                mt: 0.25,
              }}
            >
              {task.details}
            </Typography>
          </Box>

          {task.attachments.length > 0 && (
            <Box mb={3}>
              <SectionLabel>Attachments</SectionLabel>
              <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
                {task.attachments.map((attachment) => {
                  const fileName = getAttachmentName(
                    attachment.attachmentUrl,
                    attachment.id,
                  );
                  const attachmentUrl = getAttachmentUrl(attachment.attachmentUrl);
                  const attachmentType = getAttachmentType(attachment.attachmentUrl);

                  return (
                    <AttachmentCard
                      key={attachment.id}
                      fileName={fileName}
                      attachmentUrl={attachmentUrl}
                      attachmentType={attachmentType}
                      attachmentSize={attachmentSizes[attachment.id]}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}

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

            {subtasks.length === 0 ? (
              <Typography sx={{ fontSize: "0.875rem", color: "text.disabled" }}>
                No subtasks yet.
              </Typography>
            ) : (
              <Stack spacing={0.75}>
                {subtasks.map((taskItem) => (
                  <Stack
                    key={taskItem.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor:
                        taskItem.status === "Done"
                          ? "rgba(34,197,94,0.2)"
                          : "divider",
                      bgcolor:
                        taskItem.status === "Done"
                          ? "rgba(34,197,94,0.03)"
                          : "background.paper",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color:
                            taskItem.status === "Done"
                              ? "text.disabled"
                              : "text.primary",
                          textDecoration:
                            taskItem.status === "Done"
                              ? "line-through"
                              : "none",
                        }}
                      >
                        {taskItem.title}
                      </Typography>
                    </Stack>
                    {renderSubtaskStatus(taskItem.status)}
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </Box>

      <AlertDialog
        open={openDeleteDialog}
        variant="warning"
        title="Delete this Subtask?"
        leftButtonText={deleteTaskLoading ? "Deleting..." : "Delete"}
        rightButtonText="Cancel"
        content={
          <Typography
            sx={{
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "text.secondary",
              mb: 5,
              textDecoration: "underline",
            }}
          >
            {task.title}
          </Typography>
        }
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
