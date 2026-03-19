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
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Stack,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
} from "@mui/material";
import type { Priority, Status } from "../../types/dashboard";
import { PRIORITY_COLORS, STATUS_COLORS } from "../../constants/colors";
import { useTask } from "../../hooks/useTask";
import {
  priorityLabelMap,
  priorityValueMap,
  statusLabelMap,
  statusValueMap,
} from "../../constants/task";
import type { TaskStatus } from "../../types/auth";

const SUBTASK_STATUS_OPTIONS: TaskStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

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
  const { getTaskById, updateTask, updateTaskLoading } = useTask();
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
  const [initialSubtaskIds, setInitialSubtaskIds] = useState<Set<number>>(
    new Set(),
  );
  const today = new Date().toISOString().slice(0, 10);

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
      setSubtasks(
        data.subtasks.map((s) => ({
          key: s.id,
          id: s.id,
          title: s.name,
          status: s.status,
        })),
      );
      setInitialSubtaskIds(new Set(data.subtasks.map((s) => s.id)));
      setAttachments(
        data.attachments.map((a) => ({
          id: a.id,
          name: decodeURIComponent(
            a.attachmentUrl.split("/").pop() ?? `attachment-${a.id}`,
          ),
          size: "-",
        })),
      );

      setLoading(false);
    };

    void fetchTask();
  }, [getTaskById, id]);

  // ── Subtask handlers
  const addSubtask = () =>
    setSubtasks((prev) => [
      ...prev,
      { key: Date.now(), title: "", status: "NOT_STARTED" },
    ]);

  const updateSubtask = (key: number, value: string) =>
    setSubtasks((prev) =>
      prev.map((s) => (s.key === key ? { ...s, title: value } : s)),
    );

  const updateSubtaskStatus = (key: number, status: TaskStatus) =>
    setSubtasks((prev) =>
      prev.map((s) => (s.key === key ? { ...s, status } : s)),
    );

  const removeSubtask = (key: number) =>
    setSubtasks((prev) => prev.filter((s) => s.key !== key));

  // ── Attachment handlers
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map((f) => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size:
        f.size > 1024 * 1024
          ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
          : `${(f.size / 1024).toFixed(0)} KB`,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: number) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  // ── Submit
  const handleSave = async () => {
    const taskId = Number(id);
    if (!taskId || Number.isNaN(taskId)) {
      setError("Invalid task id.");
      return;
    }

    if (!priority || !status || !title.trim()) {
      setError("Title, priority, and status are required.");
      return;
    }

    const validSubtasks = subtasks
      .map((s) => ({ ...s, title: s.title.trim() }))
      .filter((s) => s.title.length > 0);

    const remainingIds = new Set(
      validSubtasks.map((s) => s.id).filter((sid): sid is number => sid !== undefined),
    );

    const deleteSubtaskIds = Array.from(initialSubtaskIds).filter(
      (sid) => !remainingIds.has(sid),
    );

    const success = await updateTask(taskId, {
      title: title.trim(),
      details: details.trim() || undefined,
      priority: priorityValueMap[priority],
      status: statusValueMap[status],
      dueDate: dueDate || undefined,
      subtasks: validSubtasks.map((s) => ({
        id: s.id,
        name: s.title,
        status: s.status,
      })),
      deleteSubtaskIds,
    });

    if (!success) {
      setError("Failed to update task. Please try again.");
      return;
    }

    navigate("/dashboard");
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
                onChange={(e) =>
                  setStatus(e.target.value as Exclude<Status, "All">)
                }
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
            </Stack>

            {/* ── Title ── */}
            <Box>
              <FormControl fullWidth variant="outlined">
                <InputLabel shrink>Title</InputLabel>
                <OutlinedInput
                  multiline
                  minRows={3}
                  label="Title"
                  notched
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FormControl>
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
                  onChange={(e) => setDateCreated(e.target.value)}
                  slotProps={{
                    htmlInput: {
                      min: today,
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
                      min: today,
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
                <InputLabel shrink>Details (optional)</InputLabel>
                <OutlinedInput
                  multiline
                  minRows={5}
                  label="Details (optional)"
                  notched
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </FormControl>
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
                  Any file type · Max 10 MB each
                </Typography>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </Box>

              {/* Attached file list */}
              {attachments.length > 0 && (
                <Stack spacing={0.75} mt={1.5}>
                  {attachments.map((a) => (
                    <Stack
                      key={a.id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: "10px",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.2}>
                        <AttachFile
                          sx={{ fontSize: 16, color: "primary.main" }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          noWrap
                          sx={{ maxWidth: 300 }}
                        >
                          {a.name}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {a.size}
                        </Typography>
                      </Stack>
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          onClick={() => removeAttachment(a.id)}
                          sx={{
                            color: "text.disabled",
                            "&:hover": { color: "error.main" },
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ))}
                </Stack>
              )}
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
                      alignItems="center"
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
                        sx={inputSx}
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
                            {statusLabelMap[option]}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Tooltip title="Remove subtask">
                        <IconButton
                          size="small"
                          onClick={() => removeSubtask(s.key)}
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
          disabled={!title.trim() || updateTaskLoading}
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
          {updateTaskLoading ? "Saving..." : "Save Task"}
        </Button>
      </Box>
    </Container>
  );
};

export default EditTask;
