import { Box, Typography } from "@mui/material";

interface ColorConfig {
  color: string;
  bg: string;
  dot: string;
}

interface StatusChipProps {
  value: string;
  map: Record<string, ColorConfig>;
}

const StatusChip = ({ value, map }: StatusChipProps) => {
  const s = map[value] ?? {
    color: "#94a3b8",
    bg: "#f8fafc",
    dot: "#e2e8f0",
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

export default StatusChip;
