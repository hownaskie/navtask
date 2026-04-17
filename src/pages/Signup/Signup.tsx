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
import { useRef, useState } from "react";
import { useAuth } from "../../context/useAuthContext";
import {
  validateUsername,
  getSignupPasswordRuleState,
} from "../../utils";
import { authApi, userApi } from "../../services/api";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [lastCheckedUsername, setLastCheckedUsername] = useState("");
  const usernameCheckRequestIdRef = useRef(0);

  const {
    hasMinLength,
    hasNumberOrSymbol,
    excludesNameOrEmail,
    isStrongPassword,
  } = getSignupPasswordRuleState(username, password);

  const usernameValidationError = validateUsername(username);
  const usernameError =
    usernameTouched && !username.trim()
      ? "Username is required"
      : usernameTouched && usernameExists
        ? "Username already exists"
      : usernameTouched
        ? (usernameValidationError ?? "")
        : "";
  const usernameHelperText =
    checkingUsername && usernameTouched && !usernameError
      ? "Checking username availability..."
      : usernameError;
  const passwordError =
    passwordTouched && (!hasMinLength || !hasNumberOrSymbol || !excludesNameOrEmail)
        ? "Password must be at least 8 characters, include a number or symbol, and not contain your name or email"
      : "";

  const canSubmit =
    Boolean(username.trim()) &&
    !usernameExists &&
    !checkingUsername &&
    !usernameValidationError &&
    hasMinLength &&
    hasNumberOrSymbol &&
    excludesNameOrEmail;

  const checkUsernameUniqueness = async (value: string): Promise<boolean> => {
    const normalizedUsername = value.trim().toLowerCase();
    const validationError = validateUsername(value);

    if (!normalizedUsername || validationError) {
      setUsernameExists(false);
      setLastCheckedUsername("");
      return false;
    }

    const requestId = usernameCheckRequestIdRef.current + 1;
    usernameCheckRequestIdRef.current = requestId;
    setCheckingUsername(true);

    try {
      const response = await userApi.checkUsernameExists(normalizedUsername);
      const exists = Boolean(response.data.data.exists);

      if (usernameCheckRequestIdRef.current === requestId) {
        setUsernameExists(exists);
        setLastCheckedUsername(normalizedUsername);
      }

      return exists;
    } catch {
      if (usernameCheckRequestIdRef.current === requestId) {
        setUsernameExists(false);
        setLastCheckedUsername("");
      }

      return false;
    } finally {
      if (usernameCheckRequestIdRef.current === requestId) {
        setCheckingUsername(false);
      }
    }
  };

  const handleUsernameBlur = async () => {
    setUsernameTouched(true);
    await checkUsernameUniqueness(username);
  };

  const handleGoogle = () => authApi.googleLogin();
  const handleFacebook = () => authApi.facebookLogin();

  const handleSubmit = async () => {
    setUsernameTouched(true);
    setPasswordTouched(true);
    setError("");

    const normalizedUsername = username.trim().toLowerCase();
    const needsUsernameCheck =
      Boolean(normalizedUsername) &&
      !validateUsername(username) &&
      normalizedUsername !== lastCheckedUsername;

    if (needsUsernameCheck) {
      const exists = await checkUsernameUniqueness(username);
      if (exists) {
        setError("Username already exists");
        return;
      }
    }

    if (usernameExists) {
      setError("Username already exists");
      return;
    }

    if (!canSubmit) {
      return setError("Please satisfy all password requirements");
    }

    try {
      setLoading(true);
      await register(username.trim(), password);
      await authApi.logout().catch(() => {});
      navigate("/login", { state: { accountCreated: true } });
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
                helperText={usernameHelperText}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameExists(false);
                  setLastCheckedUsername("");
                  setError("");
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                onBlur={() => {
                  void handleUsernameBlur();
                }}
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

              <AlertMessage error={error} />
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
