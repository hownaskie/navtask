import type { User } from "../interfaces/auth";
import type { TaskPriority, TaskStatus } from "../types/auth";

export const TITLE_MAX_LENGTH = 25;
export const DETAILS_MAX_LENGTH = 300;

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getMinDueDateString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = `${tomorrow.getMonth() + 1}`.padStart(2, "0");
  const day = `${tomorrow.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getNextDateString = (isoDate: string): string => {
  if (!isoDate) {
    return getMinDueDateString();
  }

  const [yearStr, monthStr, dayStr] = isoDate.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!year || !month || !day) {
    return getMinDueDateString();
  }

  const next = new Date(year, month - 1, day);
  next.setDate(next.getDate() + 1);

  const nextYear = String(next.getFullYear());
  const nextMonth = String(next.getMonth() + 1).padStart(2, "0");
  const nextDay = String(next.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
};

export const isDueDateAfterToday = (dueDate: string): boolean => {
  if (!dueDate) {
    return false;
  }

  return dueDate > getTodayDateString();
};

export const validateAddTaskForm = ({
  title,
  details,
  priority,
  status,
}: {
  title: string;
  details: string;
  priority: TaskPriority | "";
  status: TaskStatus | "";
}): string | null => {
  const trimmedTitle = title.trim();
  const trimmedDetails = details.trim();

  if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    return `Title can be up to ${TITLE_MAX_LENGTH} characters only.`;
  }

  if (trimmedDetails.length > DETAILS_MAX_LENGTH) {
    return `Details can be up to ${DETAILS_MAX_LENGTH} characters only.`;
  }

  if (!priority || !status) {
    return "Please select both priority and status.";
  }

  return null;
};

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

export interface SignupPasswordRuleState {
  hasMinLength: boolean;
  hasNumberOrSymbol: boolean;
  excludesNameOrEmail: boolean;
  isStrongPassword: boolean;
}

export const getSignupPasswordRuleState = (
  username: string,
  password: string
): SignupPasswordRuleState => {
  const normalizedPassword = password.toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[0-9!#()_-]/.test(password);
  const excludesNameOrEmail = (() => {
    if (!normalizedPassword) return false;

    const parts = normalizedUsername
      .split(/[@.\s_-]+/)
      .map((part) => part.trim())
      .filter((part) => part.length >= 3);

    if (normalizedUsername && normalizedPassword.includes(normalizedUsername)) {
      return false;
    }

    return !parts.some((part) => normalizedPassword.includes(part));
  })();

  return {
    hasMinLength,
    hasNumberOrSymbol,
    excludesNameOrEmail,
    isStrongPassword:
      password.length > 0 &&
      hasMinLength &&
      hasNumberOrSymbol &&
      excludesNameOrEmail,
  };
};

export const validateUsername = (username: string): string | null => {
  if (!username) return "Username is required.";
  if (!/^[A-Za-z0-9 !#()_-]+$/.test(username))
    return "Username may only contain letters, numbers, spaces, and ! # ( ) _ -";
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
