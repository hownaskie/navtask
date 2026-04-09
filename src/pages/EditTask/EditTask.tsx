import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Add,
  AttachFile,
  CalendarToday,
  Close,
  DeleteOutline,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Priority, Status } from "../../types/dashboard";
import { PRIORITY_COLORS, STATUS_COLORS } from "../../constants/colors";
import { useTask } from "../../hooks/useTask";
import {
  priorityLabelMap,
  priorityValueMap,
  statusLabelMap,
  statusValueMap,
} from "../../constants/task";
import {
  MAX_ATTACHMENT_ITEMS,
  MAX_SUBTASK_ITEMS,
  SUBTASK_STATUS_LABELS,
  SUBTASK_STATUS_OPTIONS,
} from "../../constants/taskForm";
import type { TaskStatus } from "../../types/auth";
import {
  TITLE_MAX_LENGTH,
  DETAILS_MAX_LENGTH,
  formatFileSize,
  resolveAttachmentSize,
  getNextDateString,
} from "../../utils";
import AlertDialog from "../../components/AlertDialog";
import { buildBreadcrumbTrail } from "../../components/Breadcrumbs";

interface Subtask {
  key: number;
  id?: number;
  title: string;
  status: TaskStatus;
}

interface Attachment {
  id: number;
  name: string;
  size: string;
  url?: string;
  file?: File;
}

// ── Section label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ children }: { children: string }) => (
  <Typography
    variant="caption"
    fontWeight={700}
    color="text.secondary"
    sx={{
      textTransform: "uppercase",
      letterSpacing: 0.7,
      display: "block",
      mb: 0.75,
    }}
  >
    {children}
  </Typography>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const EditTask = () => {
  const { id } = useParams();
  const { getTaskById, updateTask, updateTaskLoading, deleteAttachment } = useTask();
  const navigate = useNavigate();

  // ── Form state
  const [priority, setPriority] = useState<Priority | "">("");
  const [status, setStatus] = useState<Exclude<Status, "All"> | "">("");
  const [title, setTitle] = useState("");
  const [dateCreated, setDateCreated] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [details, setDetails] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveErrorSnackbar, setSaveErrorSnackbar] = useState<string | null>(null);
  const [saveSuccessSnackbarOpen, setSaveSuccessSnackbarOpen] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(null);
  const [completionDate, setCompletionDate] = useState<string | null>(null);
  const [pendingCompletionConfirmation, setPendingCompletionConfirmation] = useState(false);
  const [pendingDeleteSubtaskKey, setPendingDeleteSubtaskKey] = useState<number | null>(null);
  const [touchedSubtaskKeys, setTouchedSubtaskKeys] = useState<Set<number>>(new Set());
  const [subtaskValidationTriggered, setSubtaskValidationTriggered] = useState(false);
  const [initialSubtaskIds, setInitialSubtaskIds] = useState<Set<number>>(
    new Set(),
  );
  const [initialAttachmentIds, setInitialAttachmentIds] = useState<Set<number>>(
    new Set(),
  );
  const minDueDate = getNextDateString(dateCreated);
  const isDueDateValid = Boolean(dueDate) && dueDate > dateCreated;
  const hasInvalidTouchedSubtask = subtasks.some(
    (subtask) =>
      (subtaskValidationTriggered || touchedSubtaskKeys.has(subtask.key)) &&
      !subtask.title.trim(),
  );
  const canMarkAsComplete = pendingCompletionConfirmation;
  const isSaveDisabled =
    !isDueDateValid ||
    !details.trim() ||
    hasInvalidTouchedSubtask ||
    updateTaskLoading;

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

      setPriority(priorityLabelMap[data.priority]);
      setStatus(statusLabelMap[data.status]);
      setTitle(data.title);
      setDateCreated(data.createdDate.slice(0, 10));
      setDueDate(data.dueDate ? data.dueDate.slice(0, 10) : "");
      setDetails(data.details ?? "");
      setCompletionDate(data.status === "COMPLETED" ? data.completedDate : null);
      setPendingCompletionConfirmation(false);
      setSubtasks(
        data.subtasks.map((s) => ({
          key: s.id,
          id: s.id,
          title: s.name,
          status: s.status,
        })),
      );
      const loadedAllSubtasksCompleted =
        data.subtasks.length > 0 &&
        data.subtasks.every((subtask) => subtask.status === "COMPLETED");

      if (loadedAllSubtasksCompleted && data.status !== "COMPLETED") {
        setStatus("Completed");
        setCompletionDate(null);
        setPendingCompletionConfirmation(true);
      }
      setInitialSubtaskIds(new Set(data.subtasks.map((s) => s.id)));
      setInitialAttachmentIds(new Set(data.attachments.map((attachment) => attachment.id)));
      const mappedAttachments = data.attachments.map((a) => ({
        id: a.id,
        name: decodeURIComponent(
          a.attachmentUrl.split("/").pop() ?? `attachment-${a.id}`,
        ),
        size: "Loading...",
        url: a.attachmentUrl,
      }));

      setAttachments(mappedAttachments);

      void Promise.all(
        mappedAttachments.map(async (attachment) => {
          if (!attachment.url) {
            return { ...attachment, size: "-" };
          }

          const size = await resolveAttachmentSize(attachment.url);
          return { ...attachment, size };
        }),
      ).then((attachmentsWithSize) => {
        setAttachments(attachmentsWithSize);
      });

      setLoading(false);
    };

    void fetchTask();
  }, [getTaskById, id]);

  // ── Subtask handlers
  const addSubtask = () => {
    if (status === "Completed") {
      setSaveErrorSnackbar("You cannot add subtasks when the task status is completed.");
      return;
    }

    if (subtasks.length >= MAX_SUBTASK_ITEMS) {
      setSaveErrorSnackbar(`You can only add up to ${MAX_SUBTASK_ITEMS} subtasks.`);
      return;
    }

    setSubtasks((prev) => [
      ...prev,
      { key: Date.now(), title: "", status: "NOT_STARTED" },
    ]);
  };

  const updateSubtask = (key: number, value: string) => {
    setTouchedSubtaskKeys((prev) => new Set(prev).add(key));
    setSubtasks((prev) =>
      prev.map((s) => (s.key === key ? { ...s, title: value } : s)),
    );
  };

  const updateSubtaskStatus = (key: number, nextSubtaskStatus: TaskStatus) => {
    const nextSubtasks = subtasks.map((subtask) =>
      subtask.key === key ? { ...subtask, status: nextSubtaskStatus } : subtask,
    );

    setSubtasks(nextSubtasks);

    const nextAllSubtasksCompleted =
      nextSubtasks.length > 0 &&
      nextSubtasks.every((subtask) => subtask.status === "COMPLETED");

    if (nextAllSubtasksCompleted) {
      setStatus("Completed");
      setCompletionDate(null);
      setPendingCompletionConfirmation(true);
    }
  };

  const removeSubtask = (key: number) => {
    setSubtasks((prev) => prev.filter((s) => s.key !== key));
    setTouchedSubtaskKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const isSubtaskTitleInvalid = (key: number, titleValue: string) =>
    (subtaskValidationTriggered || touchedSubtaskKeys.has(key)) && !titleValue.trim();

  const requestRemoveSubtask = (key: number) => {
    setPendingDeleteSubtaskKey(key);
  };

  const confirmRemoveSubtask = () => {
    if (pendingDeleteSubtaskKey === null) {
      return;
    }

    removeSubtask(pendingDeleteSubtaskKey);
    setPendingDeleteSubtaskKey(null);
  };

  // ── Attachment handlers
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remainingSlots = MAX_ATTACHMENT_ITEMS - attachments.length;

    if (remainingSlots <= 0) {
      setSaveErrorSnackbar(`You can upload up to ${MAX_ATTACHMENT_ITEMS} files only.`);
      return;
    }

    const selectedFiles = Array.from(files);
    const nonImages = selectedFiles.filter((f) => !f.type.startsWith("image/"));
    if (nonImages.length > 0) {
      setSaveErrorSnackbar("Only image files are supported.");
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    if (selectedFiles.length > remainingSlots) {
      setSaveErrorSnackbar(
        `You can upload up to ${MAX_ATTACHMENT_ITEMS} files only. Extra files were not added.`,
      );
    }

    const newAttachments: Attachment[] = filesToAdd.map((f) => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: formatFileSize(f.size),
      file: f,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: number) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  // ── Submit
  const handleSave = async (successDestination: "view" | "list" = "list") => {
    const taskId = Number(id);
    if (!taskId || Number.isNaN(taskId)) {
      setError("Invalid task id.");
      return false;
    }

    if (!priority || !status || !title.trim()) {
      setSaveErrorSnackbar("Task data is incomplete. Please refresh and try again.");
      return false;
    }

    if (!details.trim()) {
      setSaveErrorSnackbar("Due date and description are required.");
      return false;
    }

    if (!isDueDateValid) {
      setSaveErrorSnackbar("must be later than Date Created");
      return false;
    }

    if (subtasks.length > MAX_SUBTASK_ITEMS) {
      setSaveErrorSnackbar(`You can only add up to ${MAX_SUBTASK_ITEMS} subtasks.`);
      return false;
    }

    const normalizedSubtasks = subtasks.map((subtask) => ({
      ...subtask,
      title: subtask.title.trim(),
    }));

    const emptySubtaskKeys = normalizedSubtasks
      .filter((subtask) => !subtask.title)
      .map((subtask) => subtask.key);

    if (emptySubtaskKeys.length > 0) {
      setSubtaskValidationTriggered(true);
      setTouchedSubtaskKeys((prev) => {
        const next = new Set(prev);
        emptySubtaskKeys.forEach((subtaskKey) => next.add(subtaskKey));
        return next;
      });
      setSaveErrorSnackbar("Subtask title cannot be empty.");
      return false;
    }

    const remainingIds = new Set(
      normalizedSubtasks.map((s) => s.id).filter((sid): sid is number => sid !== undefined),
    );

    const deleteSubtaskIds = Array.from(initialSubtaskIds).filter(
      (sid) => !remainingIds.has(sid),
    );

    const currentExistingAttachmentIds = new Set(
      attachments
        .map((attachment) => attachment.id)
        .filter((attachmentId) => initialAttachmentIds.has(attachmentId)),
    );

    const deleteAttachmentIds = Array.from(initialAttachmentIds).filter(
      (attachmentId) => !currentExistingAttachmentIds.has(attachmentId),
    );

    const newAttachmentFiles = attachments
      .map((attachment) => attachment.file)
      .filter((file): file is File => Boolean(file));

    const success = await updateTask(taskId, {
      title: title.trim(),
      details: details.trim() || undefined,
      priority: priorityValueMap[priority],
      status: statusValueMap[status],
      dueDate: dueDate || undefined,
      subtasks: normalizedSubtasks.map((s) => ({
        id: s.id,
        name: s.title,
        status: s.status,
      })),
      deleteSubtaskIds,
    }, newAttachmentFiles.length > 0 ? newAttachmentFiles : undefined);

    if (!success) {
      setSaveErrorSnackbar("Failed to save task. Please try again.");
      return false;
    }

    if (deleteAttachmentIds.length > 0) {
      const deletionResults = await Promise.all(
        deleteAttachmentIds.map((attachmentId) => deleteAttachment(taskId, attachmentId)),
      );

      if (deletionResults.some((result) => !result)) {
        setSaveErrorSnackbar("Task saved, but some attachments could not be removed.");
        return false;
      }
    }

    if (successDestination === "list") {
      setPendingNavigationPath("/dashboard");
      setSaveSuccessSnackbarOpen(true);
      return true;
    }

    navigate(`/view/${taskId}`, {
      state: { breadcrumbs: buildBreadcrumbTrail(`/view/${taskId}`) },
    });
    return true;
  };

  const handleCancel = () => navigate("/dashboard");

  const handleMarkAsComplete = async () => {
    const nowIso = new Date().toISOString();
    setCompletionDate(nowIso);
    setPendingCompletionConfirmation(false);
    await handleSave("list");
  };

  const handleSuccessSnackbarClose = () => {
    setSaveSuccessSnackbarOpen(false);

    if (pendingNavigationPath) {
      navigate(pendingNavigationPath);
      setPendingNavigationPath(null);
    }
  };

  // ── Shared input sx
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      bgcolor: "background.paper",
      fontSize: "0.9rem",
    },
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

  if (error) {
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
            {error}
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
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            p: { xs: 2.5, sm: 3.5 },
          }}
        >
          <Stack spacing={3.5}>
            {/* ── Row 1: Priority + Status ── */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ width: "fit-content" }}
            >
              <TextField
                select
                label="Select priority"
                size="small"
                disabled
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                sx={{ width: 300 }}
              >
                {(["Low", "High", "Critical"] as Priority[]).map((p) => (
                  <MenuItem key={p} value={p}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: PRIORITY_COLORS[p].color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography fontSize="0.875rem" fontWeight={500}>
                        {p}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Select status"
                size="small"
                value={status}
                onChange={(e) => {
                  const nextStatus = e.target.value as Exclude<Status, "All">;
                  setStatus(nextStatus);

                  if (nextStatus === "Not Started" || nextStatus === "In Progress") {
                    setSubtasks((prev) =>
                      prev.map((subtask) => ({ ...subtask, status: "NOT_STARTED" })),
                    );
                  }

                  if (nextStatus !== "Completed") {
                    setCompletionDate(null);
                    setPendingCompletionConfirmation(false);
                  } else {
                    setCompletionDate(null);
                    setPendingCompletionConfirmation(true);
                  }
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                sx={{ width: 300 }}
              >
                {(
                  [
                    "Not Started",
                    "In Progress",
                    "Completed",
                    "Cancelled",
                  ] as Status[]
                ).map((s) => (
                  <MenuItem key={s} value={s}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: STATUS_COLORS[s].color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography fontSize="0.875rem" fontWeight={500}>
                        {s}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>

              {status === "Completed" && completionDate && (
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  label="Date of Completion"
                  disabled
                  value={completionDate.slice(0, 10)}
                  slotProps={{
                    htmlInput: {
                      readOnly: true,
                    },
                    input: {
                      startAdornment: (
                        <CalendarToday
                          sx={{
                            fontSize: 16,
                            color: "text.disabled",
                            mr: 0.75,
                          }}
                        />
                      ),
                    },
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  sx={{ width: 300 }}
                />
              )}
            </Stack>

            {/* ── Title ── */}
            <Box>
              <FormControl fullWidth variant="outlined" disabled>
                <InputLabel shrink>Title</InputLabel>
                <OutlinedInput
                  multiline
                  minRows={3}
                  label="Title"
                  notched
                  readOnly
                  value={title}
                />
              </FormControl>
              <Typography
                variant="caption"
                sx={{ mt: 0.5, display: "block", color: "text.secondary" }}
              >
                {title.length}/{TITLE_MAX_LENGTH}
              </Typography>
            </Box>

            {/* ── Row 2: Date Created + Due Date ── */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Box flex={1}>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  label="Date Created"
                  disabled
                  value={dateCreated}
                  slotProps={{
                    htmlInput: {
                      readOnly: true,
                    },
                    input: {
                      startAdornment: (
                        <CalendarToday
                          sx={{
                            fontSize: 16,
                            color: "text.disabled",
                            mr: 0.75,
                          }}
                        />
                      ),
                    },
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  sx={inputSx}
                />
              </Box>

              <Box flex={1}>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  label="Due Date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  slotProps={{
                    htmlInput: {
                      min: minDueDate,
                    },
                    input: {
                      startAdornment: (
                        <CalendarToday
                          sx={{
                            fontSize: 16,
                            color: "text.disabled",
                            mr: 0.75,
                          }}
                        />
                      ),
                      onClick: (e) =>
                        (e.target as HTMLInputElement).showPicker(),
                    },
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  sx={inputSx}
                />
              </Box>
            </Stack>

            {/* ── Details ── */}
            <Box>
              <FormControl fullWidth variant="outlined">
                <InputLabel shrink>Details</InputLabel>
                <OutlinedInput
                  multiline
                  minRows={5}
                  label="Details"
                  notched
                  value={details}
                  inputProps={{ maxLength: DETAILS_MAX_LENGTH }}
                  onChange={(e) =>
                    setDetails(e.target.value.slice(0, DETAILS_MAX_LENGTH))
                  }
                />
              </FormControl>
              <Typography
                variant="caption"
                sx={{ mt: 0.5, display: "block", color: "text.secondary" }}
              >
                {details.length}/{DETAILS_MAX_LENGTH}
              </Typography>
            </Box>

            {/* ── Attachments ── */}
            <Box>
              {/* Drop zone */}
              <Box
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFiles(e.dataTransfer.files);
                }}
                component="fieldset"
                sx={{
                  border: "2px dashed",
                  borderColor: dragOver
                    ? "primary.main"
                    : "divider",
                  borderRadius: "12px",
                  bgcolor: dragOver ? "action.hover" : "background.paper",
                  py: 3,
                  px: 1,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                  pt: 1,
                  pb: 2,
                  mb: 1.5,
                  legend: {
                    px: 0.6,
                    mr: "auto",
                  },
                }}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <legend>
                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      fontWeight: 400,
                      color: "text.secondary",
                    }}
                  >
                    Attachments
                  </Typography>
                </legend>
                <AttachFile
                  sx={{ fontSize: 28, color: "text.disabled", mb: 0.5 }}
                />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.secondary"
                >
                  Drop files here or{" "}
                  <Box
                    component="span"
                    sx={{
                      color: "primary.main",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    browse
                  </Box>
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  display="block"
                  mt={0.5}
                >
                  Images only · Up to {MAX_ATTACHMENT_ITEMS} files · Max 10 MB each
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1.25, mb: attachments.length > 0 ? 1.5 : 0 }}
                >
                  {attachments.length}/{MAX_ATTACHMENT_ITEMS}
                </Typography>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                {attachments.length > 0 && (
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    justifyContent="flex-start"
                    gap={1.5}
                    sx={{ px: { xs: 0, sm: 1 } }}
                  >
                  {attachments.map((a) => (
                    <Stack
                      key={a.id}
                      justifyContent="space-between"
                      sx={{
                        position: "relative",
                        width: { xs: "calc(50% - 6px)", sm: 132 },
                        minHeight: 170,
                        p: 1.25,
                        borderRadius: "12px",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        textAlign: "left",
                        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: 18,
                          height: 18,
                          bgcolor: "action.hover",
                          borderLeft: "1px solid",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        },
                      }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeAttachment(a.id);
                          }}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            width: 24,
                            height: 24,
                            color: "text.disabled",
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            "&:hover": { color: "error.main", bgcolor: "background.paper" },
                          }}
                        >
                          <Close sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>

                      <Stack alignItems="center" justifyContent="center" sx={{ mt: 2.5, mb: 1.5 }}>
                        <AttachFile
                          sx={{ fontSize: 34, color: "primary.main" }}
                        />
                      </Stack>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            color: "text.primary",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                            lineHeight: 1.25,
                          }}
                          title={a.name}
                        >
                          {a.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {a.size}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                  </Stack>
                )}
              </Box>
            </Box>

            {/* ── Divider ── */}
            <Divider />

            {/* ── Subtasks ── */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1.5}
              >
                <Box>
                  <SectionLabel>Subtasks</SectionLabel>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add fontSize="small" />}
                  onClick={addSubtask}
                  disabled={subtasks.length >= MAX_SUBTASK_ITEMS || status === "Completed"}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    color: "primary.main",
                    bgcolor: "action.hover",
                    px: 1.5,
                    py: 0.5,
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                >
                  New Subtask
                </Button>
              </Stack>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                {subtasks.length}/{MAX_SUBTASK_ITEMS}
              </Typography>

              {subtasks.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 3,
                    borderRadius: "12px",
                    border: "1.5px dashed",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Typography variant="body2" color="text.disabled">
                    No subtasks yet — click "Add Subtask" to break this task
                    down
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {subtasks.map((s, idx) => (
                    <Stack
                      key={s.key}
                      direction="row"
                      alignItems="flex-start"
                      spacing={1}
                    >
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ width: 20, textAlign: "right", flexShrink: 0 }}
                      >
                        {idx + 1}.
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={`Subtask ${idx + 1}…`}
                        value={s.title}
                        onChange={(e) => updateSubtask(s.key, e.target.value)}
                        error={isSubtaskTitleInvalid(s.key, s.title)}
                        helperText={
                          isSubtaskTitleInvalid(s.key, s.title)
                            ? "Subtask title is required"
                            : " "
                        }
                        sx={{
                          ...inputSx,
                          "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
                            borderColor: "error.main",
                            borderWidth: 2,
                          },
                        }}
                      />
                      <TextField
                        select
                        size="small"
                        value={s.status}
                        onChange={(e) =>
                          updateSubtaskStatus(s.key, e.target.value as TaskStatus)
                        }
                        sx={{ ...inputSx, minWidth: 170 }}
                      >
                        {SUBTASK_STATUS_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {SUBTASK_STATUS_LABELS[option]}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Tooltip title="Remove subtask">
                        <IconButton
                          size="small"
                          onClick={() => requestRemoveSubtask(s.key)}
                          sx={{
                            color: "text.disabled",
                            flexShrink: 0,
                            "&:hover": { color: "error.main" },
                          }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
      {/* ── Footer actions ── */}
      <Box
        sx={{
          px: { xs: 2.5, sm: 4 },
          py: 2.5,
          borderColor: "divider",
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={handleCancel}
          sx={{
            borderRadius: "25px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            borderColor: "divider",
            color: "text.secondary",
            "&:hover": {
              borderColor: "text.secondary",
              bgcolor: "transparent",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            void (canMarkAsComplete ? handleMarkAsComplete() : handleSave());
          }}
          disabled={isSaveDisabled}
          sx={{
            borderRadius: "25px",
            textTransform: "none",
            fontWeight: 600,
            px: 3.5,
            background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
            boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
            "&:hover": {
              background: "linear-gradient(135deg, #1E40AF, #2563EB)",
            },
            "&.Mui-disabled": { opacity: 0.5 },
          }}
        >
          {updateTaskLoading
            ? "Saving..."
            : canMarkAsComplete
              ? "Mark as Complete"
              : "Save Task"}
        </Button>
      </Box>
      <Snackbar
        open={saveErrorSnackbar !== null}
        autoHideDuration={5000}
        onClose={() => setSaveErrorSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setSaveErrorSnackbar(null)}
          sx={{ width: "100%" }}
        >
          {saveErrorSnackbar}
        </Alert>
      </Snackbar>
      <Snackbar
        open={saveSuccessSnackbarOpen}
        autoHideDuration={1200}
        onClose={handleSuccessSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={handleSuccessSnackbarClose} sx={{ width: "100%" }}>
          Task saved successfully.
        </Alert>
      </Snackbar>
      <AlertDialog
        open={pendingDeleteSubtaskKey !== null}
        title="Delete subtask?"
        content="Are you sure you want to delete this subtask?"
        variant="warning"
        leftButtonText="Delete"
        rightButtonText="Cancel"
        onClose={() => setPendingDeleteSubtaskKey(null)}
        onConfirm={confirmRemoveSubtask}
      />
    </Container>
  );
};

export default EditTask;
