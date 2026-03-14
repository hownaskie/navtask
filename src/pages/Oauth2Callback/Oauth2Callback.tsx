import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuthContext";
import { authApi } from "../../services/api";

export default function OAuth2CallbackPage() {
  const [params] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const err = params.get("error");

    if (!token) {
      navigate(
        `/login?error=${encodeURIComponent(err ?? "OAuth login failed")}`,
        { replace: true },
      );
      return;
    }

    localStorage.setItem("navtask_token", token);

    authApi
      .me()
      .then(() => {
        loginWithToken(token);
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("navtask_token");
        navigate("/login?error=Failed to authenticate", { replace: true });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        Completing sign in…
      </p>
    </div>
  );
}
