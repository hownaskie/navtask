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

interface Subtask {
  id: number;
  title: string;
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
const AddTask = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createTask, createTaskLoading } = useTask();

  // ── Form state
  const [priority, setPriority] = useState<string | null>("");
  const [status, setStatus] = useState<string | null>("");
  const [title, setTitle] = useState("");
  const [dateCreated, setDateCreated] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [details, setDetails] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // ── Subtask handlers
  const addSubtask = () =>
    setSubtasks((prev) => [...prev, { id: Date.now(), title: "" }]);

  const updateSubtask = (id: number, value: string) =>
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: value } : s)),
    );

  const removeSubtask = (id: number) =>
    setSubtasks((prev) => prev.filter((s) => s.id !== id));

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
  const handleSave = () => {
    if (user?.id) {
      createTask({
        title: title.trim(),
        details: details.trim() || undefined,
        priority: priority?.toUpperCase() as TaskPriority,
        status: status?.toUpperCase() as TaskStatus,
        dueDate: dueDate || undefined,
        subtasks: subtasks
          .filter((s) => s.title.trim())
          .map((s) => ({ name: s.title.trim(), status: "NOT_STARTED" })),
        userId: user?.id,
      }).finally(() => navigate("/dashboard"));
    }
  };

  const handleCancel = () => navigate("/dashboard");

  // ── Shared input sx
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      bgcolor: "white",
      fontSize: "0.9rem",
    },
  };

  return (
    <Container
      sx={{ minHeight: "100vh", bgcolor: "#f8fafc", p: { xs: 2, sm: 4 } }}
    >
      <Box sx={{ mx: "auto" }}>
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "rgba(37,99,235,0.12)",
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
                onChange={(e) => setStatus(e.target.value as Status)}
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
                    { label: "Complete", value: "COMPLETED" },
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
                    : "rgba(37,99,235,0.2)",
                  borderRadius: "12px",
                  bgcolor: dragOver ? "rgba(37,99,235,0.04)" : "white",
                  py: 3,
                  px: 1,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "rgba(37,99,235,0.04)",
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
                        bgcolor: "white",
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
                    bgcolor: "rgba(37,99,235,0.06)",
                    px: 1.5,
                    py: 0.5,
                    "&:hover": { bgcolor: "rgba(37,99,235,0.12)" },
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
                    bgcolor: "white",
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
                        onChange={(e) => updateSubtask(s.id, e.target.value)}
                        sx={inputSx}
                      />
                      <Tooltip title="Remove subtask">
                        <IconButton
                          size="small"
                          onClick={() => removeSubtask(s.id)}
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
          disabled={!title.trim() || createTaskLoading}
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
    </Container>
  );
};

export default AddTask;
