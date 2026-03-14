/**
 * Token storage utilities.
 * Uses the same key as useAuthContext (navtask_token).
 */
const TOKEN_KEY = "navtask_token";

export const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
