import type { FC, ReactNode } from "react";
import { Button } from "@mui/material";

interface SocialButtonProps {
  icon?: ReactNode;
  label?: string;
  onClick?: () => void;
}

const SocialButton: FC<SocialButtonProps> = ({ icon, label, onClick }) => (
  <Button
    variant="outlined"
    fullWidth
    startIcon={icon}
    onClick={onClick}
    sx={{
      borderColor: "divider",
      color: "text.primary",
      py: 1.2,
      fontSize: "0.82rem",
      "&:hover": {
        borderColor: "primary.main",
        background: "rgba(201, 203, 209, 0.04)",
      },
    }}
  >
    {label}
  </Button>
);

export default SocialButton;
