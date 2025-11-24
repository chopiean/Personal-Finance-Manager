import { useState } from "react";
import { apiFetch } from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");

  async function login() {
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        headers: { Authorization: "Basic " + btoa(username + ":" + password) },
      });

      localStorage.setItem("username", username);
      nav("/");
    } catch (err: any) {
      alert("Login failed: " + err.message);
    }
  }
  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>
      <input
        placeholder="Email"
        value={username}
        onChange={(e) => setUser(e.target.value)}
      ></input>
      <br />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPass(e.target.value)}
      ></input>
      <br />
      <button onClick={login}>Login</button>
    </div>
  );
}
