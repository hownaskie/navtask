import {
  Alert,
  Box,
  Button,
  Fade,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { TaskAlt } from "@mui/icons-material";
import { useState } from "react";
import { Visibility } from "@mui/icons-material";
import SocialButton from "../../components/SocialButton";
import OrDivider from "../../components/OrDivider";
import BrandPanel from "../../components/BrandPanel";
import { FacebookIcon, GoogleIcon } from "../../assets";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/useAuthContext";
import { validateLogin } from "../../utils";
import { authApi } from "../../services/api";

const Login = () => {
  const navigate = useNavigate();
  // const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => authApi.googleLogin();
  const handleFacebook = () => authApi.facebookLogin();

  const handleSubmit = () => {
    setError("");
    const error = validateLogin(username, password);
    if (error) return setError(error);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // login({ name: username, email: "" });
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
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Sign in to your account to continue
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                InputLabelProps={{ shrink: true }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        size="small"
                        sx={{
                          fontSize: "0.72rem",
                          color: "primary.main",
                          p: 0.1,
                          minWidth: "auto",
                          border: "none",
                          "&:focus": { outline: "none" },
                        }}
                        endIcon={<Visibility />}
                      />
                    </InputAdornment>
                  ),
                }}
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
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </Stack>

            {loading && <LinearProgress sx={{ mt: 1.5, borderRadius: 8 }} />}

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              mt={3}
            >
              Don't have an account yet?{" "}
              <Button
                variant="text"
                size="small"
                onClick={() => navigate("/signup")}
                sx={{ fontWeight: 700, p: 0, minWidth: "auto" }}
              >
                Sign up
              </Button>
            </Typography>

            <OrDivider text="OR" />

            <Stack direction="column" spacing={1.5} mb={0.5}>
              <SocialButton
                icon={<GoogleIcon />}
                label="Continue with Google"
                onClick={handleGoogle}
              />
              <SocialButton
                icon={<FacebookIcon />}
                label="Continue with Facebook"
                onClick={handleFacebook}
              />
            </Stack>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default Login;
