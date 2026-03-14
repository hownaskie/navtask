import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { Fade } from "@mui/material";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Fade in timeout={350}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          gap: 2,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: "7rem",
            fontWeight: 800,
            color: "primary.main",
            fontFamily: "'Sora', sans-serif",
            lineHeight: 1,
          }}
        >
          404
        </Typography>
        <Typography variant="h5" color="text.primary">
          Page not found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The page you're looking for doesn't exist.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{ mt: 1 }}
        >
          Go to Login
        </Button>
      </Box>
    </Fade>
  );
};

export default NotFoundPage;
