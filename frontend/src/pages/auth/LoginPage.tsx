import { useState, type FormEvent } from "react";
import { apiFetch } from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();

  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const user = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem("user", JSON.stringify(user));

      nav("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown login error";
      alert("Login failed: " + message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 300, margin: "0 auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={username}
          onChange={(e) => setUser(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPass(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 8 }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
