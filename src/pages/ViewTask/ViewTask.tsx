import { useState, type ReactNode } from "react";
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

interface ColorConfig {
  color: string;
  bg: string;
  dot: string;
}

const subtasks = [
  { id: 1, title: "Research and gather requirements", status: "Complete" },
  { id: 2, title: "Create wireframes and mockups", status: "Complete" },
  { id: 3, title: "Implement frontend components", status: "In Progress" },
  { id: 4, title: "Write unit tests", status: "Not Started" },
  { id: 5, title: "Deploy to staging environment", status: "Not Started" },
];

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <Typography
    sx={{
      fontSize: "0.62rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: "text.disabled",
      mb: 0.5,
    }}
  >
    {children}
  </Typography>
);

const StatusChip = ({
  value,
  map,
}: {
  value: string;
  map: Record<string, ColorConfig>;
}) => {
  const s = map[value] ?? {
    color: "#94a3b8",
    bg: "#f8fafc",
    border: "#e2e8f0",
  };
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.25,
        py: 0.4,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: s.dot,
        bgcolor: s.bg,
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: s.color,
          flexShrink: 0,
        }}
      />
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: s.color }}>
        {value}
      </Typography>
    </Box>
  );
};

const ViewTask = () => {
  const [tasks, setTasks] = useState(subtasks);

  const toggle = (id: number) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "Complete" ? "Not Started" : "Complete",
            }
          : t,
      ),
    );

  const completed = tasks.filter((t) => t.status === "Complete").length;
  const progress = Math.round((completed / tasks.length) * 100);

  return (
    <Container
      sx={{ minHeight: "100vh", bgcolor: "#f8fafc", p: { xs: 2, sm: 4 } }}
    >
      <Box sx={{ mx: "auto" }}>
        {/* Card */}
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "rgba(37,99,235,0.12)",
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
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <StatusChip value="High" map={PRIORITY_COLORS} />

              {/* Circle progress status */}
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  {/* Background track */}
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={22}
                    thickness={4}
                    sx={{ color: "rgba(37,99,235,0.1)" }}
                  />
                  {/* Foreground value */}
                  <CircularProgress
                    variant="determinate"
                    value={(completed / tasks.length) * 100}
                    size={22}
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
                    color: "#3b82f6",
                  }}
                >
                  In Progress
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Delete">
                <IconButton size="small" sx={{ color: "text.secondary" }}>
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
              color: "#0f172a",
              lineHeight: 1.35,
              mb: 2.5,
            }}
          >
            Redesign the onboarding flow for new users
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
                  Mar 1, 2026
                </Typography>
              </Stack>
            </Box>
            <Box>
              <SectionLabel>Due Date</SectionLabel>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <CalendarToday sx={{ fontSize: 14, color: "#f97316" }} />
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "#f97316",
                    fontWeight: 500,
                  }}
                >
                  Mar 20, 2026
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {/* Details fieldset */}
          <Box
            component="fieldset"
            sx={{
              border: "1px solid rgba(37,99,235,0.2)",
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
              The current onboarding experience has a high drop-off rate after
              step 2. This task involves auditing the existing flow, identifying
              friction points, and redesigning the screens to improve activation
              rates by at least 20%.
            </Typography>
          </Box>

          <Divider sx={{ mb: 3, borderColor: "rgba(37,99,235,0.08)" }} />

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
                {completed}/{tasks.length} complete
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
                bgcolor: "rgba(37,99,235,0.08)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  bgcolor: "#3b82f6",
                },
              }}
            />

            <Stack spacing={0.75}>
              {tasks.map((task) => (
                <Stack
                  key={task.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  onClick={() => toggle(task.id)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor:
                      task.status === "Complete"
                        ? "rgba(34,197,94,0.2)"
                        : "divider",
                    bgcolor:
                      task.status === "Complete"
                        ? "rgba(34,197,94,0.03)"
                        : "white",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    "&:hover": {
                      borderColor: "rgba(37,99,235,0.25)",
                      bgcolor: "rgba(37,99,235,0.02)",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.25}>
                    {task.status === "Complete" ? (
                      <CheckCircle sx={{ fontSize: 18, color: "#22c55e" }} />
                    ) : (
                      <RadioButtonUnchecked
                        sx={{ fontSize: 18, color: "#cbd5e1" }}
                      />
                    )}
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color:
                          task.status === "Complete"
                            ? "text.disabled"
                            : "text.primary",
                        textDecoration:
                          task.status === "Complete" ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </Typography>
                  </Stack>
                  <StatusChip value={task.status} map={STATUS_COLORS} />
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ViewTask;
