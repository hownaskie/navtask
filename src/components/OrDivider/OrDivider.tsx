import type { FC } from "react";
import { Box, Divider, Typography } from "@mui/material";

interface OrDividerProps {
  text?: string;
}

const OrDivider: FC<OrDividerProps> = ({ text }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 2.5 }}>
    <Divider sx={{ flex: 1 }} />
    <Typography
      variant="caption"
      sx={{ color: "text.secondary", fontWeight: 500 }}
    >
      {text}
    </Typography>
    <Divider sx={{ flex: 1 }} />
  </Box>
);

export default OrDivider;
