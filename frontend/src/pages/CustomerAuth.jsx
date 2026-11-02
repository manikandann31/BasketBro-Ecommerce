import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Support.css";

export default function CustomerAuth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const endpoint = mode === "register" ? "/customer/auth/register" : "/customer/auth/login";
      const payload = mode === "register"
        ? form
        : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      localStorage.setItem("customerToken", data.token);
      localStorage.setItem("customerRole", data.role);
      navigate("/support");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to authenticate. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="support-shell auth-shell">
      <div className="support-card auth-card">
        <Link to="/" className="support-back">← Back to BasketBro</Link>
        <p className="support-eyebrow">BASKETBRO ACCOUNT</p>
        <h1>{mode === "register" ? "Create your account" : "Welcome back"}</h1>
        <p className="support-muted">Sign in to manage your support requests and get help.</p>
        <div className="support-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">Sign in</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} type="button">Create account</button>
        </div>
        <form onSubmit={submit} className="support-form">
          {mode === "register" && <>
            <label>Full name<input name="fullName" value={form.fullName} onChange={change} required maxLength="100" /></label>
            <label>Phone number<input name="phone" value={form.phone} onChange={change} required maxLength="100" /></label>
          </>}
          <label>Email address<input type="email" name="email" value={form.email} onChange={change} required /></label>
          <label>Password<input type="password" name="password" value={form.password} onChange={change} required minLength={mode === "register" ? 10 : 1} /></label>
          {error && <p className="support-error">{error}</p>}
          <button className="support-primary" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}</button>
        </form>
      </div>
    </section>
  );
}
