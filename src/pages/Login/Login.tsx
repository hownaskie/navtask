import {
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
import { Visibility, VisibilityOff } from "@mui/icons-material";
import BrandPanel from "../../components/BrandPanel";
import AuthFooter from "../../components/AuthFooter";
import AlertMessage from "../../components/AlertMessage";
import { useAuth } from "../../context/useAuthContext";
import { validateLogin } from "../../utils";
import { authApi } from "../../services/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => authApi.googleLogin();
  const handleFacebook = () => authApi.facebookLogin();

  const handleSubmit = async () => {
    setError("");
    const error = validateLogin(username, password);
    if (error) return setError(error);

    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
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
                Navtask
              </Typography>
            </Stack>

            <Typography variant="h4" gutterBottom mb={4}>
              Sign In
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
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                  input: {
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
                          onClick={() => setShowPassword((prev) => !prev)}
                          endIcon={
                            showPassword ? <VisibilityOff /> : <Visibility />
                          }
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <AlertMessage error={error} />
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

            <AuthFooter
              title="Don't have an account yet?"
              linkLabel="Sign up"
              linkPath="/signup"
              onGoogle={handleGoogle}
              onFacebook={handleFacebook}
            />
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default Login;
