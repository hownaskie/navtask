import {
  DialogTitle,
  Dialog,
  DialogContent,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import type { ReactNode } from "react";

export interface AlertDialogProps {
  open: boolean;
  title: string;
  content: ReactNode;
  leftButtonText?: string;
  rightButtonText?: string;
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
    onClose,
    onConfirm,
  } = props;

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {typeof content === "string" ? (
          <Typography>{content}</Typography>
        ) : (
          content
        )}
      </DialogContent>
      <Stack
        direction="row"
        justifyContent="end"
        spacing={1}
        sx={{ px: 2, pb: 2 }}
      >
        <Button onClick={onConfirm} size="small" variant="text" color="primary">
          {leftButtonText || "OK"}
        </Button>
        <Button onClick={onClose} size="small" variant="text" color="primary">
          {rightButtonText || "Cancel"}
        </Button>
      </Stack>
    </Dialog>
  );
};

export default AlertDialog;
