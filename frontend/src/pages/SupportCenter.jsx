import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Support.css";

export default function SupportCenter() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: "", category: "GENERAL", description: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const loadTickets = async () => {
    const { data } = await api.get("/support/tickets/mine");
    setTickets(data);
  };

  useEffect(() => {
    if (!localStorage.getItem("customerToken")) {
      navigate("/customer/login");
      return;
    }
    loadTickets().catch(() => setError("Could not load your support tickets."));
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/support/tickets", form);
      setForm({ subject: "", category: "GENERAL", description: "" });
      await loadTickets();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create your ticket.");
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerRole");
    localStorage.removeItem("customerName");
    localStorage.removeItem("customerEmail");
    window.dispatchEvent(new Event("basketbro-auth-changed"));
    navigate("/customer/login");
  };

  return (
    <section className="support-shell">
      <div className="support-heading">
        <div><p className="support-eyebrow">CUSTOMER CARE</p><h1>How can we help?</h1><p className="support-muted">Raise a request and track updates from our support team.</p></div>
        <button className="support-secondary" onClick={logout}>Sign out</button>
      </div>
      <div className="support-grid">
        <form className="support-card support-form" onSubmit={submit}>
          <h2>Create a support ticket</h2>
          <label>Subject<input value={form.subject} onChange={e => setForm({...form, subject:e.target.value})} required maxLength="150" placeholder="What do you need help with?" /></label>
          <label>Category<select value={form.category} onChange={e => setForm({...form, category:e.target.value})}><option value="GENERAL">General</option><option value="DELIVERY">Delivery</option><option value="PAYMENT">Payment</option><option value="PRODUCT">Product</option><option value="RETURN">Return</option></select></label>
          <label>Description<textarea rows="5" value={form.description} onChange={e => setForm({...form, description:e.target.value})} required maxLength="3000" placeholder="Describe the issue…" /></label>
          {error && <p className="support-error">{error}</p>}
          <button className="support-primary" disabled={busy}>{busy ? "Submitting…" : "Submit request"}</button>
        </form>
        <div className="support-card">
          <div className="support-list-heading"><h2>Your requests</h2><span>{tickets.length} total</span></div>
          {tickets.length === 0 ? <p className="support-muted">You haven't raised any support requests yet.</p> : <div className="ticket-list">{tickets.map(ticket => <article className="ticket-item" key={ticket.id}><div className="ticket-top"><strong>#{ticket.id} · {ticket.subject}</strong><span className={`ticket-status ${ticket.status?.toLowerCase()}`}>{ticket.status?.replace("_"," ")}</span></div><p>{ticket.description}</p><small>{ticket.category} · {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : ""}</small>{ticket.adminResponse && <div className="ticket-reply"><b>Support team response</b><p>{ticket.adminResponse}</p></div>}</article>)}</div>}
        </div>
      </div>
    </section>
  );
}
