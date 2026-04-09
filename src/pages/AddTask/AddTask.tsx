import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  FormHelperText,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { PRIORITY_COLORS, STATUS_COLORS } from "../../constants/colors";
import { useTask } from "../../hooks/useTask";
import type { Priority, Status } from "../../types/dashboard";
import type { TaskStatus, TaskPriority } from "../../types/auth";
import { useAuth } from "../../context/useAuthContext";
import AlertDialog from "../../components/AlertDialog";
import {
  MAX_ATTACHMENT_ITEMS,
  MAX_SUBTASK_ITEMS,
} from "../../constants/taskForm";
import {
  validateAddTaskForm,
  TITLE_MAX_LENGTH,
  DETAILS_MAX_LENGTH,
  getMinDueDateString,
  isDueDateAfterToday,
} from "../../utils";

interface Subtask {
  id: number;
  title: string;
}

interface Attachment {
  id: number;
  name: string;
  size: string;
  file: File;
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
const AddTask = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createTask, createTaskLoading } = useTask();

  // ── Form state
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [title, setTitle] = useState("");
  const [dateCreated] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [details, setDetails] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [errorSnackbar, setErrorSnackbar] = useState<string | null>(null);
  const [pendingDeleteSubtaskId, setPendingDeleteSubtaskId] = useState<number | null>(null);
  const [titleHadValue, setTitleHadValue] = useState(false);
  const [dueDateHadValue, setDueDateHadValue] = useState(false);
  const [touchedSubtaskIds, setTouchedSubtaskIds] = useState<Set<number>>(new Set());
  const [subtaskValidationTriggered, setSubtaskValidationTriggered] = useState(false);
  const minDueDate = getMinDueDateString();
  const isTitleEmptyAfterInput = titleHadValue && !title.trim();
  const isDueDateEmptyAfterInput = dueDateHadValue && !dueDate;
  const pendingDeleteSubtaskDescription =
    pendingDeleteSubtaskId === null
      ? ""
      : subtasks.find((subtask) => subtask.id === pendingDeleteSubtaskId)?.title.trim() ?? "";
  const hasInvalidTouchedSubtask = subtasks.some(
    (subtask) =>
      (subtaskValidationTriggered || touchedSubtaskIds.has(subtask.id)) &&
      !subtask.title.trim(),
  );
  const isSaveDisabled =
    !priority ||
    !status ||
    !title.trim() ||
    !isDueDateAfterToday(dueDate) ||
    !details.trim() ||
    hasInvalidTouchedSubtask ||
    createTaskLoading;

  // ── Subtask handlers
  const addSubtask = () => {
    if (status === "COMPLETED") {
      setErrorSnackbar("You cannot add subtasks when the task status is completed.");
      return;
    }

    if (subtasks.length >= MAX_SUBTASK_ITEMS) {
      setErrorSnackbar(`You can only add up to ${MAX_SUBTASK_ITEMS} subtasks.`);
      return;
    }

    setSubtasks((prev) => [...prev, { id: Date.now(), title: "" }]);
  };

  const updateSubtask = (id: number, value: string) => {
    setTouchedSubtaskIds((prev) => new Set(prev).add(id));
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: value } : s)),
    );
  };

  const removeSubtask = (id: number) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
    setTouchedSubtaskIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const isSubtaskTitleInvalid = (id: number, titleValue: string) =>
    (subtaskValidationTriggered || touchedSubtaskIds.has(id)) && !titleValue.trim();

  const requestRemoveSubtask = (id: number) => {
    setPendingDeleteSubtaskId(id);
  };

  const confirmRemoveSubtask = () => {
    if (pendingDeleteSubtaskId === null) {
      return;
    }

    removeSubtask(pendingDeleteSubtaskId);
    setPendingDeleteSubtaskId(null);
  };

  // ── Attachment handlers
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remainingSlots = MAX_ATTACHMENT_ITEMS - attachments.length;

    if (remainingSlots <= 0) {
      setErrorSnackbar(`You can upload up to ${MAX_ATTACHMENT_ITEMS} files only.`);
      return;
    }

    const selectedFiles = Array.from(files);
    const nonImages = selectedFiles.filter((f) => !f.type.startsWith("image/"));
    if (nonImages.length > 0) {
      setErrorSnackbar("Only image files are supported.");
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    if (selectedFiles.length > remainingSlots) {
      setErrorSnackbar(
        `You can upload up to ${MAX_ATTACHMENT_ITEMS} files only. Extra files were not added.`,
      );
    }

    const newAttachments: Attachment[] = filesToAdd.map((f) => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size:
        f.size > 1024 * 1024
          ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
          : `${(f.size / 1024).toFixed(0)} KB`,
      file: f,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: number) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  // ── Submit
  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedDetails = details.trim();

    const validationError = validateAddTaskForm({
      title,
      details,
      priority,
      status,
    });

    if (validationError) {
      setErrorSnackbar(validationError);
      return;
    }

    if (!trimmedDetails) {
      setErrorSnackbar("Priority, status, title, due date, and description are required.");
      return;
    }

    if (!isDueDateAfterToday(dueDate)) {
      setErrorSnackbar("must be later than Date Created");
      return;
    }

    if (subtasks.length > MAX_SUBTASK_ITEMS) {
      setErrorSnackbar(`You can only add up to ${MAX_SUBTASK_ITEMS} subtasks.`);
      return;
    }

    const normalizedSubtasks = subtasks.map((subtask) => ({
      ...subtask,
      title: subtask.title.trim(),
    }));

    const emptySubtaskIds = normalizedSubtasks
      .filter((subtask) => !subtask.title)
      .map((subtask) => subtask.id);

    if (emptySubtaskIds.length > 0) {
      setSubtaskValidationTriggered(true);
      setTouchedSubtaskIds((prev) => {
        const next = new Set(prev);
        emptySubtaskIds.forEach((subtaskId) => next.add(subtaskId));
        return next;
      });
      setErrorSnackbar("Subtask title cannot be empty.");
      return;
    }

    if (user?.id) {
      const imageFiles = attachments.map((attachment) => attachment.file);
      try {
        await createTask({
          title: trimmedTitle,
          details: trimmedDetails || undefined,
          priority: priority as TaskPriority,
          status: status as TaskStatus,
          dueDate: dueDate || undefined,
          subtasks: normalizedSubtasks.map((subtask) => ({
            name: subtask.title,
            status: "NOT_STARTED",
          })),
          userId: user?.id,
        }, imageFiles.length > 0 ? imageFiles : undefined);
        navigate("/dashboard");
      } catch {
        setErrorSnackbar("Failed to save task. Please try again.");
      }
    }
  };

  const handleCancel = () => navigate("/dashboard");

  // ── Shared input sx
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      bgcolor: "background.paper",
      fontSize: "0.9rem",
    },
  };

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
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                sx={{ width: 300 }}
              >
                {(
                  [
                    { label: "Low", value: "LOW" },
                    { label: "High", value: "HIGH" },
                    { label: "Critical", value: "CRITICAL" },
                  ] as { label: string; value: string }[]
                ).map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: PRIORITY_COLORS[p.label as Priority].color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography fontSize="0.875rem" fontWeight={500}>
                        {p.label}
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
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                sx={{ width: 300 }}
              >
                {(
                  [
                    { label: "Not Started", value: "NOT_STARTED" },
                    { label: "In Progress", value: "IN_PROGRESS" },
                    { label: "Completed", value: "COMPLETED" },
                    { label: "Cancelled", value: "CANCELLED" },
                  ] as { label: string; value: string }[]
                ).map((s) => (
                  <MenuItem key={s.label} value={s.value}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: STATUS_COLORS[s.label as Status].color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography fontSize="0.875rem" fontWeight={500}>
                        {s.label}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* ── Title ── */}
            <Box>
              <FormControl fullWidth variant="outlined" error={isTitleEmptyAfterInput}>
                <InputLabel shrink>Title</InputLabel>
                <OutlinedInput
                  multiline
                  minRows={3}
                  label="Title"
                  notched
                  value={title}
                  inputProps={{ maxLength: TITLE_MAX_LENGTH }}
                  onChange={(e) => {
                    const nextValue = e.target.value.slice(0, TITLE_MAX_LENGTH);
                    if (nextValue.trim()) {
                      setTitleHadValue(true);
                    }
                    setTitle(nextValue);
                  }}
                />
              </FormControl>
              {isTitleEmptyAfterInput && (
                <FormHelperText error>must not be empty</FormHelperText>
              )}
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
                  value={dateCreated}
                  disabled
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
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    if (nextValue) {
                      setDueDateHadValue(true);
                    }
                    setDueDate(nextValue);
                  }}
                  error={isDueDateEmptyAfterInput}
                  helperText={isDueDateEmptyAfterInput ? "must be later than Date Created" : " "}
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
                  disabled={subtasks.length >= MAX_SUBTASK_ITEMS || status === "COMPLETED"}
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
                      key={s.id}
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
                        onChange={(e) => updateSubtask(s.id, e.target.value)}
                        error={isSubtaskTitleInvalid(s.id, s.title)}
                        helperText={
                          isSubtaskTitleInvalid(s.id, s.title)
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
                      <Tooltip title="Remove subtask">
                        <IconButton
                          size="small"
                          onClick={() => requestRemoveSubtask(s.id)}
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
          onClick={handleSave}
          disabled={isSaveDisabled}
          startIcon={
            createTaskLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
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
          {createTaskLoading ? "Saving..." : "Save Task"}
        </Button>
      </Box>
      <Snackbar
        open={errorSnackbar !== null}
        autoHideDuration={5000}
        onClose={() => setErrorSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setErrorSnackbar(null)}
          sx={{ width: "100%" }}
        >
          {errorSnackbar}
        </Alert>
      </Snackbar>
      <AlertDialog
        open={pendingDeleteSubtaskId !== null}
        title="Delete this Subtask?"
        content={pendingDeleteSubtaskDescription || "This subtask has no description."}
        variant="warning"
        leftButtonText="Delete"
        rightButtonText="Cancel"
        onClose={() => setPendingDeleteSubtaskId(null)}
        onConfirm={confirmRemoveSubtask}
      />
    </Container>
  );
};

export default AddTask;
