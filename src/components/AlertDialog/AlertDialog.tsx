import {
  Box,
  DialogTitle,
  Dialog,
  DialogContent,
  Typography,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import { Close, WarningAmberRounded } from "@mui/icons-material";
import type { ReactNode } from "react";

export interface AlertDialogProps {
  open: boolean;
  title?: string;
  content: ReactNode;
  leftButtonText?: string;
  rightButtonText?: string;
  variant?: "default" | "warning";
  loading?: boolean;
  confirmButtonPosition?: "left" | "right";
  onClose: () => void;
  onConfirm: () => void;
}

const AlertDialog = (props: AlertDialogProps) => {
  const {
    open,
    title,
    content,
    leftButtonText,
    rightButtonText,
    variant = "default",
    loading = false,
    confirmButtonPosition = "left",
    onClose,
    onConfirm,
  } = props;

  const isWarning = variant === "warning";
  const handleClose = () => {
    if (!loading) onClose();
  };

  const confirmButton = (
    <Button
      onClick={onConfirm}
      size="small"
      disabled={loading}
      variant={isWarning ? "contained" : "text"}
      color="primary"
      sx={
        isWarning
          ? {
              minWidth: 104,
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
            }
          : undefined
      }
    >
      {leftButtonText || "OK"}
    </Button>
  );

  const cancelButton = (
    <Button
      onClick={handleClose}
      size="small"
      disabled={loading}
      variant={isWarning ? "outlined" : "text"}
      color="primary"
      sx={
        isWarning
          ? {
              minWidth: 104,
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 700,
            }
          : undefined
      }
    >
      {rightButtonText || "Cancel"}
    </Button>
  );

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      slotProps={{
        paper: isWarning
          ? {
              sx: {
                borderRadius: "18px",
                px: 2.5,
                py: 2,
              },
            }
          : undefined,
      }}
    >
      {!isWarning && <DialogTitle>{title}</DialogTitle>}
      <DialogContent
        sx={
          isWarning
            ? { p: 0, textAlign: "center", position: "relative", pt: 0.5 }
            : undefined
        }
      >
        {isWarning && (
          <>
            <IconButton
              size="small"
              disabled={loading}
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 0,
                right: -2,
                color: "text.disabled",
              }}
            >
              <Close fontSize="small" />
            </IconButton>

            <WarningAmberRounded
              sx={{
                fontSize: 38,
                color: "error.main",
                mb: 1,
              }}
            />

            <Typography
              sx={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "text.primary",
                mb: 0.75,
              }}
            >
              {title}
            </Typography>
          </>
        )}

        {typeof content === "string" ? (
          <Typography
            sx={
              isWarning
                ? {
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "text.secondary",
                    mb: 5,
                  }
                : undefined
            }
          >
            {content}
          </Typography>
        ) : (
          <Box sx={isWarning ? { mb: 2 } : undefined}>{content}</Box>
        )}
      </DialogContent>
      <Stack
        direction="row"
        justifyContent={isWarning ? "center" : "end"}
        spacing={isWarning ? 1.5 : 1}
        sx={{ px: 2 }}
        gap={5}
      >
        {confirmButtonPosition === "left" ? (
          <>
            {confirmButton}
            {cancelButton}
          </>
        ) : (
          <>
            {cancelButton}
            {confirmButton}
          </>
        )}
      </Stack>
    </Dialog>
  );
};

export default AlertDialog;
