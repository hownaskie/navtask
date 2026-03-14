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
import SocialButton from "../../components/SocialButton";
import OrDivider from "../../components/OrDivider";
import BrandPanel from "../../components/BrandPanel";
import { useState } from "react";
import { FacebookIcon, GoogleIcon } from "../../assets";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuthContext";
import { validateSignup } from "../../utils";

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

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              mt={3}
            >
              Already have an account?{" "}
              <Button
                variant="text"
                size="small"
                onClick={() => navigate("/login")}
                sx={{ fontWeight: 700, p: 0, minWidth: "auto" }}
              >
                Sign in
              </Button>
            </Typography>

            <OrDivider text="OR" />

            <Stack direction="column" spacing={1.5} mb={0.5}>
              <SocialButton
                icon={<GoogleIcon />}
                label="Continue with Google"
                onClick={() => handleSocial("Google User", "google@user.com")}
              />
              <SocialButton
                icon={<FacebookIcon />}
                label="Continue with Facebook"
                onClick={() => handleSocial("Facebook User", "fb@user.com")}
              />
            </Stack>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default Signup;
