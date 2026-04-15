import { TaskAlt } from "@mui/icons-material";
import {
  Fade,
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  LinearProgress,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import BrandPanel from "../../components/BrandPanel";
import AuthFooter from "../../components/AuthFooter";
import AlertMessage from "../../components/AlertMessage";
import { useState } from "react";
import { useAuth } from "../../context/useAuthContext";
import {
  validateUsername,
  getSignupPasswordRuleState,
} from "../../utils";
import { authApi } from "../../services/api";

const Signup = () => {
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [usernameExists, setUsernameExists] = useState(false);

  const {
    hasMinLength,
    hasNumberOrSymbol,
    excludesNameOrEmail,
    isStrongPassword,
  } = getSignupPasswordRuleState(username, password);

  const usernameError =
    usernameTouched && !username.trim()
      ? "Username is required"
      : usernameTouched && usernameExists
        ? "Username already exists"
      : usernameTouched
        ? (validateUsername(username) ?? "")
        : "";
  const passwordError =
    passwordTouched && (!hasMinLength || !hasNumberOrSymbol)
        ? "Password must be at least 8 characters and include a number or symbol"
      : "";

  const canSubmit =
    Boolean(username.trim()) &&
    !usernameExists &&
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
    setSuccessMessage("");
    if (!canSubmit) {
      return setError("Please satisfy all password requirements");
    }

    try {
      setLoading(true);
      await register(username.trim(), password);
      setSuccessMessage("Account created successfully. Please sign in to continue.");
      setUsername("");
      setPassword("");
      setUsernameTouched(false);
      setPasswordTouched(false);
      setUsernameExists(false);
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : "Unable to create account. Please check your details.";

      if (message.toLowerCase().includes("already exists")) {
        setUsernameExists(true);
        setUsernameTouched(true);
      }

      setError(message);
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
              Create account
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                label="Username"
                type="text"
                fullWidth
                value={username}
                error={Boolean(usernameError)}
                helperText={usernameError}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameExists(false);
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
                type={showPassword ? "text" : "password"}
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
                            showPassword ? <Visibility /> : <VisibilityOff />
                          }
                        />
                      </InputAdornment>
                    ),
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
                    Cannot contain your name or email address
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

              <AlertMessage error={error} success={successMessage} />
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
