import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck,
    LogOut,
    Users,
    MessageSquare,
    Store,
    Activity,
    AlertTriangle,
    CheckCircle,
    XCircle,
    TrendingUp,
    List,
    RefreshCw,
    ChevronRight,
    Search,
    Bell,
    Database,
    Zap
} from "lucide-react";

export default function AdminDashboard() {
    const [view, setView] = useState("overview");
    const [returns, setReturns] = useState([]);
    const [stats, setStats] = useState({});
    const [retailers, setRetailers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInitialData();
        const interval = setInterval(fetchInitialData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchInitialData = async () => {
        try {
            const [ret, st, retl, tkt, usr, lg] = await Promise.all([
                api.fetchAPI("/admin/returns/pending"),
                api.fetchAPI("/admin/stats"),
                api.fetchAPI("/retailers"),
                api.fetchAPI("/admin/support"),
                api.fetchAPI("/admin/users"),
                api.fetchAPI("/admin/logs")
            ]);
            setReturns(ret || []);
            setStats(st || {});
            setRetailers(retl || []);
            setTickets(tkt || []);
            setUsers(usr || []);
            setLogs(lg || []);
        } catch (e) { console.error(e); }
    };

    const StatusBadge = ({ type, text }) => {
        const styles = {
            success: "bg-[#B9D19E]/10 text-[#426B8E] border-[#B9D19E]/20",
            warning: "bg-[#AFB14A]/10 text-[#AFB14A] border-[#AFB14A]/20",
            error: "bg-red-50 text-red-600 border-red-100",
            info: "bg-[#8FBFF6]/10 text-[#426B8E] border-[#8FBFF6]/20"
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[type] || 'bg-slate-50 text-slate-400'}`}>
                {text}
            </span>
        );
    };

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setView(id)}
            className={`w-full flex items-center gap-4 px-8 py-5 transition-all duration-300 relative group
            ${view === id ? 'text-primary' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
        >
            {view === id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[4px_0_15px_rgba(255,107,0,0.3)]"></div>}
            <Icon size={20} strokeWidth={view === id ? 3 : 2} />
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${view === id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>{label}</span>
        </button>
    );

    const Overview = () => (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2 italic">Platform telemetry</h1>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">System Oversight</h2>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-400">
                        <Bell size={20} />
                    </button>
                    <button onClick={fetchInitialData} className="primary px-8 py-4 flex items-center gap-2">
                        <RefreshCw size={18} /> Refresh State
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Nodes', val: stats.users || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Market Partners', val: stats.retailers || 0, icon: Store, color: 'text-purple-500', bg: 'bg-purple-50' },
                    { label: 'Platform Volume', val: `₹${(stats.total_volume || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Anomaly Count', val: stats.fraud_alerts || 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', alert: stats.fraud_alerts > 0 }
                ].map((s, i) => (
                    <div key={i} className="premium-card p-8 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <s.icon size={28} />
                            </div>
                            {s.alert && <span className="bg-red-500 text-white text-[8px] font-black px-2.5 py-1 rounded-full animate-pulse shadow-lg shadow-red-200">ACTION</span>}
                        </div>
                        <div className="text-[10px] font-black uppercase text-slate-300 tracking-widest mb-1">{s.label}</div>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">{s.val}</div>
                    </div>
                ))}
            </div>

            <section className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Pulse</h2>
                <div className="premium-card p-1">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 font-mono text-xs text-slate-400 max-h-[400px] overflow-y-auto no-scrollbar">
                        {logs.slice(0, 10).map((l, i) => (
                            <div key={i} className="flex gap-6 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg px-4">
                                <span className="text-slate-600 shrink-0">[{new Date(l.time).toLocaleTimeString()}]</span>
                                <span className={`shrink-0 font-black px-2 rounded ${l.level === 'INFO' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>{l.level}</span>
                                <span className="text-slate-300 tracking-tight">{l.event}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );

    const GovernanceView = () => (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div>
                <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2 italic">Audit control</h1>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Governance Desk</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {returns.length === 0 && (
                    <div className="py-24 text-center premium-card">
                        <ShieldCheck size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-300 font-bold italic">No claims awaiting audit.</p>
                    </div>
                )}
                {returns.map(r => (
                    <div key={r.request_id} className="premium-card p-10 flex flex-col lg:flex-row justify-between items-center gap-10 group">
                        <div className="flex flex-col gap-4 flex-1">
                            <div className="flex items-center gap-4">
                                <StatusBadge type="info" text={`ID: ${r.request_id.slice(0, 8)}`} />
                                {r.fraud_score > 40 && (
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.fraud_score > 70 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-orange-50 text-orange-500 border border-orange-100'}`}>
                                        <AlertTriangle size={12} strokeWidth={3} /> {r.fraud_score > 70 ? 'Critical' : 'Suspect'} Risk ({r.fraud_score})
                                    </div>
                                )}
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Audit Request: Product {r.product_id}</h3>
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-black">U</div>
                                <div>
                                    <p className="text-slate-900 font-black">User Reference: {r.user_id}</p>
                                    <p className="text-slate-400 text-sm font-medium italic">"{r.reason}"</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 shrink-0">
                            <button
                                onClick={() => {
                                    const notes = prompt("Audit Notes:");
                                    if (notes !== null) api.fetchAPI("/admin/returns/process", {
                                        method: "POST", body: JSON.stringify({ request_id: r.request_id, decision: 'Approved', notes })
                                    }).then(fetchInitialData);
                                }}
                                className="primary px-10 py-4 shadow-xl shadow-primary/20"
                            >
                                Validate
                            </button>
                            <button
                                onClick={() => {
                                    const notes = prompt("Audit Notes:");
                                    if (notes !== null) api.fetchAPI("/admin/returns/process", {
                                        method: "POST", body: JSON.stringify({ request_id: r.request_id, decision: 'Rejected', notes })
                                    }).then(fetchInitialData);
                                }}
                                className="bg-white text-red-500 border border-red-100 px-10 py-4 rounded-2xl font-black hover:bg-red-50 transition-all"
                            >
                                Counter
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const UsersView = () => (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div>
                <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2 italic">Node directory</h1>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Market Residents</h2>
            </div>

            <div className="premium-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <tr>
                            <th className="px-10 py-6">Resident Identity</th>
                            <th className="px-10 py-6">Authority Status</th>
                            <th className="px-10 py-6">Join Epoch</th>
                            <th className="px-10 py-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map(u => (
                            <tr key={u.user_id} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">{u.name[0]}</div>
                                        <div>
                                            <div className="font-black text-slate-900 text-lg">{u.name}</div>
                                            <div className="text-slate-400 text-xs font-mono uppercase italic tracking-tighter">UID_{u.user_id.slice(-8)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <StatusBadge type={u.active !== false ? 'success' : 'error'} text={u.active !== false ? 'Verified' : 'Banned'} />
                                </td>
                                <td className="px-10 py-8 text-slate-400 font-bold text-sm tracking-tighter">{new Date(u.join_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                <td className="px-10 py-8 text-right">
                                    <button
                                        onClick={() => api.fetchAPI(`/admin/users/${u.user_id}/toggle`, { method: "POST" }).then(fetchInitialData)}
                                        className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl border transition-all ${u.active !== false ? 'border-red-100 text-red-500 hover:bg-red-50' : 'border-emerald-100 text-emerald-500 hover:bg-emerald-50'}`}
                                    >
                                        {u.active !== false ? 'Ban Node' : 'Restore'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const SupportView = () => (
        <div className="space-y-10 animate-in duration-500">
            <div>
                <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2 italic">Support matrix</h1>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Resolution Center</h2>
            </div>
            <div className="grid gap-6">
                {tickets.length === 0 && <div className="py-24 text-center premium-card text-slate-300 font-bold">No operational tickets detected.</div>}
                {tickets.map(t => (
                    <div key={t.ticket_id} className={`premium-card p-10 flex flex-col md:flex-row justify-between items-center transition-all ${t.status === 'Open' ? 'ring-2 ring-primary/5 border-primary/20 shadow-xl shadow-primary/5' : 'opacity-60'}`}>
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Ticket #{t.ticket_id.slice(0, 6)}</span>
                                <StatusBadge type={t.status === 'Open' ? 'warning' : 'success'} text={t.status} />
                            </div>
                            <div className="text-slate-900 font-black text-2xl tracking-tight italic">"{t.issue}"</div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">{t.role[0]}</div>
                                <span className="text-slate-400 text-sm font-black uppercase tracking-widest">{t.role} Perspective</span>
                            </div>
                            {t.response && (
                                <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm text-slate-600 italic relative">
                                    <div className="absolute -top-3 left-6 bg-white px-3 text-[10px] font-black uppercase text-slate-400 tracking-widest border border-slate-100 rounded-full">Official Response</div>
                                    {t.response}
                                </div>
                            )}
                        </div>
                        {t.status === 'Open' && (
                            <button
                                onClick={() => {
                                    const res = prompt("Enter resolution message:");
                                    if (res) api.fetchAPI("/admin/support/resolve", { method: "POST", body: JSON.stringify({ ticket_id: t.ticket_id, response: res }) }).then(fetchInitialData);
                                }}
                                className="primary px-10 py-4 shadow-xl shadow-primary/20 shrink-0 ml-10"
                            >
                                Respond
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const RetailersView = () => (
        <div className="space-y-10 animate-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2 italic">Entity Manager</h1>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Market Partners</h2>
                </div>
                <button onClick={() => {
                    const name = prompt("Retailer Name:");
                    const location = prompt("Location:");
                    if (name && location) api.fetchAPI("/retailers/register", { method: "POST", body: JSON.stringify({ name, location }) }).then(fetchInitialData);
                }} className="primary px-10 py-4 flex items-center gap-3">
                    <Plus size={20} /> Register Fleet
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {retailers.map(r => (
                    <div key={r.retailer_id} className="premium-card p-10 group hover:border-primary/20 transition-all">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all mb-8 shadow-sm">
                            <Store size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 leading-none">{r.name}</h3>
                        <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-10">{r.location}</p>

                        <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                            <StatusBadge type={r.status === 'Approved' ? 'success' : 'warning'} text={r.status} />
                            <button onClick={() => api.fetchAPI(`/admin/retailers/${r.retailer_id}/toggle`, { method: "POST" }).then(fetchInitialData)} className="text-[10px] font-black uppercase text-slate-300 hover:text-primary transition-colors tracking-widest">
                                {r.status === 'Approved' ? 'Revoke' : 'Authorize'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-body">
            {/* Admin Sidebar */}
            <aside className="w-80 border-r border-slate-100 flex flex-col pt-12 sticky top-0 h-screen bg-white shadow-[10px_0_40px_rgba(0,0,0,0.01)] shrink-0 z-50">
                <div className="px-10 mb-16 flex items-center gap-4 group">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-2xl group-hover:rotate-12 transition-transform duration-300">A</div>
                    <div className="text-2xl font-black tracking-tighter text-slate-900">Admin<span className="text-primary italic">Hub</span></div>
                </div>
                <nav className="flex-1">
                    <SidebarItem id="overview" icon={Activity} label="Monitoring" />
                    <SidebarItem id="governance" icon={ShieldCheck} label="Governance" />
                    <SidebarItem id="users" icon={Users} label="Residents" />
                    <SidebarItem id="support" icon={MessageSquare} label="Resolution" />
                    <SidebarItem id="retailers" icon={Store} label="Fleet Hub" />
                </nav>
                <div className="p-10 border-t border-slate-50">
                    <button onClick={() => { localStorage.clear(); navigate("/auth"); }} className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-5 rounded-[2rem] hover:bg-red-500 hover:text-white transition-all font-black uppercase tracking-widest text-[11px] shadow-sm">
                        <LogOut size={20} /> Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-16 overflow-y-auto no-scrollbar scroll-smooth">
                <div className="max-w-6xl mx-auto">
                    {view === 'overview' && <Overview />}
                    {view === 'governance' && <GovernanceView />}
                    {view === 'users' && <UsersView />}
                    {view === 'support' && <SupportView />}
                    {view === 'retailers' && <RetailersView />}
                </div>
            </main>
        </div>
    );
}

const Plus = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
