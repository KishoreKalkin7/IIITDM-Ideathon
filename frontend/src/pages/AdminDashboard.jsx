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
    RefreshCw
} from "lucide-react";

export default function AdminDashboard() {
    const [view, setView] = useState("governance"); // governance, support, retailers, users, fraud, logs
    const [returns, setReturns] = useState([]);
    const [stats, setStats] = useState({});
    const [retailers, setRetailers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInitialData();
        const interval = setInterval(fetchInitialData, 30000); // Auto-refresh every 30s
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
        } catch (e) {
            console.error("Data fetch error:", e);
        }
    };

    const processReturn = async (rid, decision) => {
        const notes = prompt("Admin Decision Notes:");
        if (notes === null) return;
        await api.fetchAPI("/admin/returns/process", {
            method: "POST",
            body: JSON.stringify({ request_id: rid, decision, notes })
        });
        fetchInitialData();
    };

    const resolveTicket = async (tid) => {
        const res = prompt("Enter response to user:");
        if (!res) return;
        await api.fetchAPI("/admin/support/resolve", {
            method: "POST",
            body: JSON.stringify({ ticket_id: tid, response: res })
        });
        fetchInitialData();
    };

    const toggleUser = async (uid) => {
        await api.fetchAPI(`/admin/users/${uid}/toggle`, { method: "POST" });
        fetchInitialData();
    };

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setView(id)}
            className={`w-full flex items-center gap-3 px-6 py-4 transition-all
            ${view === id ? 'bg-white text-black font-black' : 'text-neutral-500 hover:bg-white/5 hover:text-white'}`}
        >
            <Icon size={20} /> <span className="text-sm uppercase tracking-widest">{label}</span>
        </button>
    );

    const Overview = () => (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter">System Health</h2>
                    <p className="text-neutral-500">Live platform telemetry and governance metrics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[2.5rem] hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500"><Users size={24} /></div>
                        <TrendingUp size={20} className="text-emerald-500" />
                    </div>
                    <div className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Total Users</div>
                    <div className="text-4xl font-black">{stats.users || 0}</div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[2.5rem] hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500"><Store size={24} /></div>
                        <div className="text-[10px] font-bold text-emerald-500">100% Active</div>
                    </div>
                    <div className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Market Partners</div>
                    <div className="text-4xl font-black">{stats.retailers || 0}</div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[2.5rem] hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><List size={24} /></div>
                    </div>
                    <div className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Volume handled</div>
                    <div className="text-4xl font-black">₹{(stats.total_volume || 0).toLocaleString()}</div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[2.5rem] hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500"><AlertTriangle size={24} /></div>
                        {stats.fraud_alerts > 0 && <span className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-pulse">ACTION REQ</span>}
                    </div>
                    <div className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Fraud Anomalies</div>
                    <div className="text-4xl font-black">{stats.fraud_alerts || 0}</div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[2.5rem] hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500"><RefreshCw size={24} /></div>
                    </div>
                    <div className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Return Requests</div>
                    <div className="text-4xl font-black">{stats.returns || 0}</div>
                </div>
            </div>
        </div>
    );

    const GovernanceView = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter">Return Desk</h2>
                    <p className="text-neutral-500">Governance & Fraud validation portal.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-neutral-900 border border-white/5 px-6 py-2 rounded-2xl">
                        <div className="text-[10px] text-neutral-500 font-bold uppercase">Pending</div>
                        <div className="text-xl font-bold">{returns.length}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {returns.length === 0 && <div className="py-20 text-center text-neutral-500 italic border border-dashed border-white/10 rounded-3xl">No pending requests for review.</div>}
                {returns.map(r => (
                    <div key={r.request_id} className="bg-neutral-900 border border-neutral-800 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-white/20 transition-all">
                        <div className="flex flex-col gap-2 flex-1">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-neutral-800 rounded-full text-[10px] font-bold">REQ: {r.request_id}</span>
                                {r.fraud_score > 40 && (
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${r.fraud_score > 70 ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        <AlertTriangle size={12} /> {r.fraud_score > 70 ? 'High Risk' : 'Medium Risk'} ({r.fraud_score})
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold">User {r.user_id} requested return for Product {r.product_id}</h3>
                            <p className="text-neutral-400 text-sm">Reason: <span className="text-white italic">"{r.reason}"</span> • Reported Condition: {r.condition}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => processReturn(r.request_id, 'Approved')} className="bg-white text-black px-6 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform">Approve</button>
                            <button onClick={() => processReturn(r.request_id, 'Rejected')} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-red-500 transition-colors">Reject</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const UsersView = () => (
        <div className="space-y-8 animate-in fade-in">
            <h2 className="text-4xl font-black tracking-tighter">User Directory</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black text-[10px] uppercase tracking-widest text-neutral-500">
                        <tr>
                            <th className="px-8 py-4">Identity</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Joined</th>
                            <th className="px-8 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                            <tr key={u.user_id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-white">{u.name}</div>
                                    <div className="text-neutral-500 text-xs font-mono">{u.user_id}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${u.active !== false ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {u.active !== false ? 'Verified' : 'Banned'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-neutral-400 text-sm">{new Date(u.join_date).toLocaleDateString()}</td>
                                <td className="px-8 py-6 text-right">
                                    <button onClick={() => toggleUser(u.user_id)} className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${u.active !== false ? 'border-red-500/20 text-red-500 hover:bg-red-500/10' : 'border-green-500/20 text-green-500 hover:bg-green-500/10'} transition-all`}>
                                        {u.active !== false ? 'Restrict' : 'Restore'}
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
        <div className="space-y-8">
            <h2 className="text-4xl font-black tracking-tighter">Support Hub</h2>
            <div className="grid gap-4">
                {tickets.length === 0 && <div className="py-20 text-center text-neutral-500 italic">No active support tickets.</div>}
                {tickets.map(t => (
                    <div key={t.ticket_id} className={`bg-neutral-900 border p-8 rounded-[2rem] flex justify-between items-center transition-all ${t.status === 'Open' ? 'border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)]' : 'border-neutral-800 opacity-60'}`}>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2">
                                <span>#{t.ticket_id}</span> •
                                <span className={t.status === 'Open' ? 'text-blue-400' : 'text-neutral-500'}>{t.status}</span>
                            </div>
                            <div className="text-white font-bold text-xl mb-1">{t.issue}</div>
                            <div className="text-neutral-500 text-sm italic">User: {t.user_id} ({t.role})</div>
                            {t.response && (
                                <div className="mt-4 p-4 bg-black rounded-2xl border border-white/5 text-sm text-neutral-400">
                                    <span className="text-[10px] font-black uppercase text-neutral-500 block mb-1">Our Response</span>
                                    {t.response}
                                </div>
                            )}
                        </div>
                        {t.status === 'Open' && (
                            <button onClick={() => resolveTicket(t.ticket_id)} className="bg-white text-black px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-transform ml-8 whitespace-nowrap">Send Response</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const LogsView = () => (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black tracking-tighter">System Pulse</h2>
                <div className="text-neutral-500 text-xs flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live Monitor Active
                </div>
            </div>
            <div className="bg-black border border-neutral-800 rounded-[2.5rem] p-10 font-mono text-xs text-neutral-400 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {logs.map((l, i) => (
                    <div key={i} className="flex gap-4 border-b border-white/5 pb-2 last:border-0">
                        <span className="text-neutral-600 shrink-0">[{new Date(l.time).toLocaleTimeString()}]</span>
                        <span className={`shrink-0 font-bold ${l.level === 'INFO' ? 'text-blue-500' : 'text-yellow-500'}`}>[{l.level}]</span>
                        <span className="text-neutral-300">{l.event}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const toggleRetailer = async (rid) => {
        await api.fetchAPI(`/admin/retailers/${rid}/toggle`, { method: "POST" });
        fetchInitialData();
    };

    const addRetailer = async () => {
        const name = prompt("Retailer Name:");
        if (!name) return;
        const location = prompt("Location:");
        await api.fetchAPI("/retailers/register", {
            method: "POST",
            body: JSON.stringify({ name, location })
        });
        fetchInitialData();
    };

    const RetailersView = () => (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black tracking-tighter">Market Governance</h2>
                <button onClick={addRetailer} className="bg-white text-black px-6 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-all">Register New Market</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {retailers.map(r => (
                    <div key={r.retailer_id} className="bg-neutral-900 border border-neutral-800 p-8 rounded-[2rem] hover:border-white/20 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all"><Store size={20} /></div>
                            <h3 className="text-2xl font-bold mb-1">{r.name}</h3>
                            <div className="text-neutral-500 text-sm mb-6">{r.location} • {r.retailer_id}</div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${r.status === 'Approved' ? 'text-green-500' : 'text-yellow-500'}`}>{r.status}</span>
                                <button onClick={() => toggleRetailer(r.retailer_id)} className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
                                    {r.status === 'Approved' ? 'Restrict' : 'Approve'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white flex">
            <aside className="w-72 border-r border-white/5 flex flex-col pt-12 sticky top-0 h-screen">
                <div className="px-8 mb-12 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-2xl italic">A</div>
                    <div className="text-xl font-black tracking-tighter">ADMIN HUB</div>
                </div>
                <nav className="flex-1">
                    <SidebarItem id="governance" icon={ShieldCheck} label="Governance" />
                    <SidebarItem id="users" icon={Users} label="Users" />
                    <SidebarItem id="support" icon={MessageSquare} label="Support" />
                    <SidebarItem id="retailers" icon={Store} label="Retailers" />
                    <SidebarItem id="logs" icon={Activity} label="System Logs" />
                </nav>
                <div className="p-8 border-t border-white/5">
                    <button onClick={() => { localStorage.clear(); navigate("/auth"); }} className="w-full flex items-center gap-3 bg-red-600/10 text-red-500 p-4 rounded-2xl hover:bg-neutral-900 transition-all">
                        <LogOut size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-12 overflow-y-auto">
                {view === 'governance' && <GovernanceView />}
                {view === 'users' && <UsersView />}
                {view === 'support' && <SupportView />}
                {view === 'retailers' && <RetailersView />}
                {view === 'logs' && <LogsView />}
            </main>
        </div>
    );
}
