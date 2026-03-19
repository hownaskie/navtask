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
import { useNavigate } from "react-router-dom";
import {
  validateUsername,
} from "../../utils";
import { authApi } from "../../services/api";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const normalizedPassword = password.toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();
  const [localPart = "", domainPart = ""] = normalizedUsername.split("@");

  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[0-9]|[^A-Za-z0-9]/.test(password);
  const excludesNameOrEmail =
    !normalizedPassword.includes(normalizedUsername) &&
    (!localPart || !normalizedPassword.includes(localPart)) &&
    (!domainPart || !normalizedPassword.includes(domainPart));
  const isStrongPassword =
    password.length > 0 &&
    hasMinLength &&
    hasNumberOrSymbol &&
    excludesNameOrEmail;

  const usernameError =
    usernameTouched && !username.trim()
      ? "Username is required"
      : usernameTouched
        ? (validateUsername(username) ?? "")
        : "";
  const passwordError =
    passwordTouched && (!hasMinLength || !hasNumberOrSymbol)
      ? "Password must be at least 8 characters and include a number or symbol"
      : "";

  const canSubmit =
    Boolean(username.trim()) &&
    !validateUsername(username) &&
    hasMinLength &&
    hasNumberOrSymbol &&
    excludesNameOrEmail;

  const handleGoogle = () => authApi.googleLogin();
  const handleFacebook = () => authApi.facebookLogin();

  const handleSubmit = async () => {
    setUsernameTouched(true);
    setPasswordTouched(true);
    setError("");
    if (!canSubmit) {
      return setError("Please satisfy all password requirements");
    }

    try {
      setLoading(true);
      await register(username.trim(), password);
      navigate("/dashboard");
    } catch {
      setError("Unable to create account. Please check your details.");
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

            <Typography variant="h4" gutterBottom>
              Create account
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Start organizing your life today — it's free
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                label="Username"
                type="text"
                placeholder="jane@example.com"
                fullWidth
                value={username}
                error={Boolean(usernameError)}
                helperText={usernameError}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                onBlur={() => setUsernameTouched(true)}
              />
              <TextField
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                fullWidth
                value={password}
                error={Boolean(passwordError)}
                helperText={passwordError}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                onBlur={() => setPasswordTouched(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />

              {password.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    mt: -1,
                    color: isStrongPassword ? "success.main" : "error.main",
                    fontWeight: 600,
                  }}
                >
                  Password strength: {isStrongPassword ? "Strong" : "Weak"}
                </Typography>
              )}

              <Stack spacing={0.5} mt={-0.75}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    component="span"
                    sx={{
                      color: excludesNameOrEmail
                        ? "success.main"
                        : "text.disabled",
                      fontSize: "0.9rem",
                      lineHeight: 1,
                    }}
                  >
                    {excludesNameOrEmail ? "✓" : "•"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Cannot contain your username or email address
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    component="span"
                    sx={{
                      color: hasMinLength
                        ? "success.main"
                        : "text.disabled",
                      fontSize: "0.9rem",
                      lineHeight: 1,
                    }}
                  >
                    {hasMinLength ? "✓" : "•"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Atleast 8 characters
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    component="span"
                    sx={{
                      color: hasNumberOrSymbol
                        ? "success.main"
                        : "text.disabled",
                      fontSize: "0.9rem",
                      lineHeight: 1,
                    }}
                  >
                    {hasNumberOrSymbol ? "✓" : "•"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Contains a number or symbol
                  </Typography>
                </Stack>
              </Stack>

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
              onGoogle={handleGoogle}
              onFacebook={handleFacebook}
            />
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default Signup;
