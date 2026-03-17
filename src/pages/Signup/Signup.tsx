import { TaskAlt } from "@mui/icons-material";
import {
  Fade,
  Box,
  Stack,
  Typography,
  TextField,
  Alert,
  Button,
  LinearProgress,
} from "@mui/material";
import BrandPanel from "../../components/BrandPanel";
import AuthFooter from "../../components/AuthFooter";
import { useState } from "react";
import { useAuth } from "../../context/useAuthContext";
import { validateSignup } from "../../utils";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSocial = (username: string, email: string) => {
    login({ username, email });
    navigate("/dashboard");
  };

  const handleSubmit = () => {
    setError("");
    const error = validateSignup(username, password);
    if (error) return setError(error);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({ username });
      navigate("/dashboard");
    }, 900);
  };

  return (
    <Fade in timeout={350}>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          boxSizing: "border-box",
          position: "fixed",
          top: 0,
          left: 0,
          overflow: "hidden",
        }}
      >
        <BrandPanel subtitle="Stay on top of your tasks, hit your goals, and never drop the ball again." />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            px: { xs: 3, sm: 7 },
            py: 6,
            bgcolor: "background.paper",
            overflowY: "auto",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              mb={3}
              sx={{ display: { md: "none" } }}
            >
              <TaskAlt color="primary" />{" "}
              <Typography variant="h6" color="primary">
                Taskly
              </Typography>
            </Stack>

            <Typography variant="h4" gutterBottom>
              Create account
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Start organizing your life today — it's free
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                label="Username"
                placeholder="Jane Doe"
                fullWidth
                value={name}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
              />
              <TextField
                label="Password"
                type="password"
                placeholder="Min. 6 characters"
                fullWidth
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              {error && (
                <Alert severity="error" sx={{ borderRadius: 2, py: 0.5 }}>
                  {error}
                </Alert>
              )}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? "Creating account…" : "Create Account"}
              </Button>
            </Stack>

            {loading && <LinearProgress sx={{ mt: 1.5, borderRadius: 8 }} />}

            <AuthFooter
              title="Already have an account?"
              linkLabel="Sign in"
              linkPath="/login"
              onGoogle={() => handleSocial("Google User", "google@user.com")}
              onFacebook={() => handleSocial("Facebook User", "fb@user.com")}
            />
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default Signup;
