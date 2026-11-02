import { useEffect, useState } from "react";
import api from "../services/api";

const statuses=["CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];
const money=value=>Number(value||0).toLocaleString("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});

export default function AdminOrders(){
 const [orders,setOrders]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[saving,setSaving]=useState("");
 const load=()=>{setLoading(true);api.get("/admin/orders").then(({data})=>setOrders(data)).catch(e=>setError(e.response?.data?.message||"Unable to load orders.")).finally(()=>setLoading(false));};
 useEffect(()=>{load();},[]);
 const update=async(orderId,status)=>{setSaving(orderId);setError("");try{const {data}=await api.patch(`/admin/orders/${encodeURIComponent(orderId)}/status`,{status});setOrders(prev=>prev.map(o=>o.orderId===orderId?data:o));}catch(e){setError(e.response?.data?.message||"Unable to update order.");}finally{setSaving("");}};
 return <section className="admin-products">
  <header className="admin-page-header"><div><span className="admin-eyebrow">STORE OPERATIONS</span><h1>Manage Orders</h1><p className="admin-page-description">Review customer orders and update fulfilment status.</p></div>
  <button className="admin-button admin-button-secondary" onClick={load}>↻ Refresh</button></header>
  {error&&<p className="admin-alert admin-alert-error">{error}</p>}
  {loading?<p>Loading orders…</p>:orders.length===0?<div className="admin-empty-state"><h2>No orders yet</h2><p>Customer orders will appear here.</p></div>:
  <div className="admin-table-card"><div className="admin-table-wrapper"><table className="admin-products-table">
   <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Update status</th></tr></thead>
   <tbody>{orders.map(o=><tr key={o.orderId}><td><strong>{o.orderId}</strong><br/><small>{new Date(o.createdAt).toLocaleString("en-IN")}</small></td>
    <td>{o.customerName}<br/><small>{o.email}</small><br/><small>{o.phone}</small></td>
    <td>{o.items.map(i=><div key={i.productId}>{i.name} × {i.quantity}</div>)}</td>
    <td><strong>{money(o.total)}</strong></td><td>{o.paymentMethod}<br/><small>{o.paymentStatus}</small></td>
    <td><span className="stock-badge stock-available">{o.orderStatus}</span></td>
    <td><select aria-label={`Update status for ${o.orderId}`} value={o.orderStatus} disabled={saving===o.orderId||["CANCELLED","DELIVERED"].includes(o.orderStatus)} onChange={e=>update(o.orderId,e.target.value)}>
      {statuses.map(s=><option key={s} value={s}>{s}</option>)}</select>{saving===o.orderId&&<small> Saving…</small>}</td>
   </tr>)}</tbody></table></div></div>}
 </section>;
}
