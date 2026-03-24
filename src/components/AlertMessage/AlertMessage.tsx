import { Alert } from "@mui/material";

interface AlertMessageProps {
  error?: string;
  success?: string;
}

const AlertMessage = ({ error, success }: AlertMessageProps) => {
  if (!error && !success) {
    return null;
  }

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ borderRadius: 2, py: 0.5 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ borderRadius: 2, py: 0.5 }}>
          {success}
        </Alert>
      )}
    </>
  );
};

export default AlertMessage;