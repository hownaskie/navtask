import { Box, Stack, Typography, CircularProgress } from "@mui/material";
import type { Status } from "../../types/dashboard";

interface TaskProgressStatusProps {
  status: Exclude<Status, "All">;
  completed: number;
  total: number;
  statusDate?: string;
  dateLayout?: "inline" | "vertical";
}

const TaskProgressStatus = ({
  status,
  completed,
  total,
  statusDate,
  dateLayout = "inline",
}: TaskProgressStatusProps) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const isCancelled = status === "Cancelled";
  const isVerticalDateLayout = dateLayout === "vertical";

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
      <Stack
        direction={isVerticalDateLayout ? "column" : "row"}
        alignItems={isVerticalDateLayout ? "flex-start" : "center"}
        spacing={isVerticalDateLayout ? 0.1 : 1}
      >
        <Typography
          sx={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "text.secondary",
            lineHeight: 1.2,
          }}
        >
          {status}
        </Typography>
        {statusDate && !isVerticalDateLayout && (
          <Typography
            sx={{
              fontSize: "1rem",
              color: "text.secondary",
              fontWeight: 700,
              lineHeight: 1.2,
              mx: 0.2,
            }}
          >
            •
          </Typography>
        )}
        {statusDate && (
          <Typography
            sx={{
              fontSize: "0.72rem",
              color: "text.disabled",
              lineHeight: 1.2,
            }}
          >
            {statusDate}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default TaskProgressStatus;
