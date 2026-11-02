import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Support.css";

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    const { data } = await api.get("/admin/support/tickets");
    setTickets(data);
    setDrafts(Object.fromEntries(data.map(t => [t.id, { status: t.status, adminResponse: t.adminResponse || "" }])));
  };

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      navigate("/admin/login");
      return;
    }
    load().catch(() => setError("Unable to load support tickets. Check your Admin session."));
  }, [navigate]);

  const updateDraft = (id, key, value) => setDrafts(current => ({ ...current, [id]: { ...current[id], [key]: value } }));

  const save = async (id) => {
    setBusyId(id);
    setError("");
    try {
      await api.patch(`/admin/support/tickets/${id}`, drafts[id]);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update this ticket.");
    } finally {
      setBusyId(null);
    }
  };

  return <section className="support-shell">
    <div className="support-heading"><div><p className="support-eyebrow">ADMIN WORKSPACE</p><h1>Customer support</h1><p className="support-muted">Review customer requests and send updates.</p></div><button className="support-secondary" onClick={() => navigate("/admin")}>Admin dashboard</button></div>
    {error && <p className="support-error">{error}</p>}
    <div className="admin-ticket-list">{tickets.map(ticket => <article className="support-card admin-ticket" key={ticket.id}>
      <div className="ticket-top"><div><span className="support-eyebrow">TICKET #{ticket.id} · {ticket.category}</span><h2>{ticket.subject}</h2><p className="support-muted">{ticket.customerName} · {ticket.customerEmail}</p></div><span className={`ticket-status ${ticket.status?.toLowerCase()}`}>{ticket.status?.replace("_"," ")}</span></div>
      <p>{ticket.description}</p>
      <div className="support-form admin-reply-form">
        <label>Status<select value={drafts[ticket.id]?.status || ticket.status} onChange={e => updateDraft(ticket.id, "status", e.target.value)}><option>OPEN</option><option>IN_PROGRESS</option><option>RESOLVED</option><option>CLOSED</option></select></label>
        <label>Response to customer<textarea rows="3" value={drafts[ticket.id]?.adminResponse ?? ""} onChange={e => updateDraft(ticket.id, "adminResponse", e.target.value)} maxLength="3000" placeholder="Write an update for the customer…" /></label>
        <button className="support-primary" disabled={busyId === ticket.id} onClick={() => save(ticket.id)}>{busyId === ticket.id ? "Saving…" : "Save response"}</button>
      </div>
    </article>)}</div>
    {tickets.length === 0 && !error && <div className="support-card"><p className="support-muted">No support tickets found.</p></div>}
  </section>;
}
