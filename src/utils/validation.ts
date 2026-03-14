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
