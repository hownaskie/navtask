import { Box, Paper, Stack, Typography } from "@mui/material";

interface StatusCardProps {
  card: Array<{
    label: string;
    value: number | string;
    color: string;
    bg: string;
  }>;
  totalProgress: number;
}

const StatusCard = ({ card, totalProgress }: StatusCardProps) => {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={4}>
      {card.map(({ label, value, color, bg }) => (
        <Paper
          key={label}
          elevation={0}
          sx={{
            flex: 1,
            px: 2.5,
            py: 2,
            borderRadius: "14px",
            border: "1.5px solid",
            borderColor: "divider",
            bgcolor: "white",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            {label}
          </Typography>
          <Typography variant="h4" sx={{ color, fontWeight: 700, mt: 0.5 }}>
            {value}
          </Typography>
          <Box sx={{ mt: 1.5, height: 4, borderRadius: 8, bgcolor: bg }}>
            <Box
              sx={{
                height: "100%",
                width: label === "Progress" ? `${totalProgress}%` : "100%",
                borderRadius: 8,
                bgcolor: color,
                transition: "width 0.4s ease",
              }}
            />
          </Box>
        </Paper>
      ))}
    </Stack>
  );
};

export default StatusCard;
