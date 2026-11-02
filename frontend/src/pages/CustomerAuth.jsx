import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "./Support.css";

export default function CustomerAuth() {
  const [searchParams] = useSearchParams();
  const requestedMode = searchParams.get("mode");
  const [mode, setMode] = useState(requestedMode === "register" ? "register" : "login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const requestedReturn = searchParams.get("returnTo") || "/";
  const returnTo = requestedReturn.startsWith("/") && !requestedReturn.startsWith("//")
    ? requestedReturn
    : "/";

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
      sessionStorage.removeItem("basketbroGuest");
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to authenticate. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  return (
    <section className="support-shell auth-shell">
      <div className="support-card auth-card">
        <Link to="/" className="support-back">← Back to BasketBro</Link>
        <p className="support-eyebrow">BASKETBRO ACCOUNT</p>
        <h1>{mode === "register" ? "Create your account" : "Welcome back"}</h1>
        <p className="support-muted">{mode === "register"
          ? "Create an account to make your shopping experience easier and manage support requests."
          : "Sign in to your account to continue shopping and manage support requests."}</p>
        <div className="support-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")} type="button">Sign in</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")} type="button">Create account</button>
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
        <p className="support-muted auth-guest-note">Just browsing? <Link to="/" onClick={() => sessionStorage.setItem("basketbroGuest", "true")}>Continue without profile</Link></p>
      </div>
    </section>
  );
}
