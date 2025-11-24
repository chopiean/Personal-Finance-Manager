import { useState } from "react";
import { apiFetch } from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const nav = useNavigate();
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");

  async function register() {
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      alert("Registration successful");
      nav("/login");
    } catch (err: any) {
      alert("Registration failed: " + err.message);
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Register</h2>
      <input
        placeholder="Email"
        value={username}
        onChange={(e) => setUser(e.target.value)}
      />
      <br />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPass(e.target.value)}
      />
      <br />
      <button onClick={register}>Register</button>
    </div>
  );
}
