import { createTheme } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") => createTheme({
  palette: {
    mode: mode,
    primary: { main: "#2563EB", light: "#3B82F6", dark: "#1D4ED8" },
    ...(mode === "light" ? {
      background: { default: "#EEF2FF", paper: "#FFFFFF" },
      text: { primary: "#0F172A", secondary: "#64748B" },
    } : {}),
    success: { main: "#10B981" },
  },
  typography: {
    fontFamily: "'Outfit', sans-serif",
    h4: { fontFamily: "'Sora', sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Sora', sans-serif", fontWeight: 700 },
    h6: { fontFamily: "'Sora', sans-serif", fontWeight: 600 },
    button: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, padding: "10px 20px" },
        containedPrimary: {
          background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)",
          boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
          "&:hover": { boxShadow: "0 6px 20px rgba(37,99,235,0.4)" },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563EB", borderWidth: 2 },
          },
        },
      },
    },
  },
});
