import { Box, Stack, Typography, CircularProgress } from "@mui/material";
import type { Status } from "../../types/dashboard";

interface TaskProgressStatusProps {
  status: Exclude<Status, "All">;
  completed: number;
  total: number;
  statusDate?: string;
}

const TaskProgressStatus = ({
  status,
  completed,
  total,
  statusDate,
}: TaskProgressStatusProps) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const isCancelled = status === "Cancelled";

  return (
    <Stack direction="row" alignItems="center" spacing={0.75} gap={1.5}>
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        {/* Background track */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={22}
          thickness={4}
          sx={{ color: "#3b82f6" }}
        />
        {/* Foreground value */}
        <CircularProgress
          variant="determinate"
          value={isCancelled ? 0 : progress}
          size={22}
          thickness={22}
          sx={{
            color: "#3b82f6",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        {isCancelled && (
          <Box
            sx={{
              position: "absolute",
              top: 2,
              right: 10,
              width: 2,
              height: 18,
              bgcolor: "#3b82f6",
              borderRadius: 999,
              transform: "rotate(120deg)",
              transformOrigin: "center",
            }}
          />
        )}
      </Box>
      <Typography
        sx={{
          fontSize: "0.78rem",
          fontWeight: 600,
          color: "#727070",
        }}
      >
        {statusDate ? `${status} • ${statusDate}` : status}
      </Typography>
    </Stack>
  );
};

export default TaskProgressStatus;
