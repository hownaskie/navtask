import { type ReactNode } from "react";
import { Typography } from "@mui/material";

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

export default SectionLabel;
