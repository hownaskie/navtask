import type { User } from "../interfaces/auth";

export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required.";
  if (!/\S+@\S+\.\S+/.test(email))
    return "Enter a valid email address.";
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required.";
  if (password.length < 6)
    return "Password must be at least 6 characters.";
  return null;
};

export const validateUsername = (username: string): string | null => {
  if (!username) return "Username is required.";
  return null;
};

export const validateSignup = (
  username: string,
  password: string
): string | null => {
  if (!username  || !password)
    return "Please fill in all fields.";
  const usernameError = validateUsername(username);
  if (usernameError) return usernameError;
  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;
  return null;
};

export const validateLogin = (
  username: string,
  password: string
): string | null => {
  if (!username || !password)
    return "Please fill in all fields.";
  const usernameError = validateUsername(username);
  if (usernameError) return usernameError;
  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;
  return null;
};

export interface SignupRuleState {
  usernameExists: boolean;
  hasMinLength: boolean;
  hasNumberOrSymbol: boolean;
  excludesNameOrEmail: boolean;
}

export const getSignupRuleState = (
  username: string,
  password: string,
  users: User[]
): SignupRuleState => {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedPassword = password.toLowerCase();

  const usernameExists =
    normalizedUsername.length > 0 &&
    users.some((user) => {
      const firstName = user.firstName.trim().toLowerCase();
      const lastName = user.lastName.trim().toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      const email = (user.email ?? "").trim().toLowerCase();

      return [firstName, lastName, fullName, email].includes(normalizedUsername);
    });

  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[0-9]|[^A-Za-z0-9]/.test(password);

  const excludesNameOrEmail = (() => {
    if (!normalizedPassword) return false;
    if (normalizedUsername && normalizedPassword.includes(normalizedUsername)) {
      return false;
    }

    if (normalizedUsername.includes("@")) {
      const [localPart, domainPart] = normalizedUsername.split("@");
      if (localPart && normalizedPassword.includes(localPart)) return false;
      if (domainPart && normalizedPassword.includes(domainPart)) return false;
    }

    return true;
  })();

  return {
    usernameExists,
    hasMinLength,
    hasNumberOrSymbol,
    excludesNameOrEmail,
  };
};

export const getSignupFieldErrors = (
  username: string,
  touched: { usernameTouched: boolean; passwordTouched: boolean },
  rules: SignupRuleState
): { usernameError: string; passwordError: string } => {
  const usernameError =
    touched.usernameTouched && !username.trim()
      ? "Username is required"
      : touched.usernameTouched && rules.usernameExists
        ? "This username already exists"
        : "";

  const passwordError =
    touched.passwordTouched && (!rules.hasMinLength || !rules.hasNumberOrSymbol)
      ? "Password must be at least 8 characters and include a number or symbol"
      : "";

  return { usernameError, passwordError };
};

export const canSubmitSignup = (
  username: string,
  rules: SignupRuleState
): boolean => {
  return (
    Boolean(username.trim()) &&
    !rules.usernameExists &&
    rules.excludesNameOrEmail &&
    rules.hasMinLength &&
    rules.hasNumberOrSymbol
  );
};
