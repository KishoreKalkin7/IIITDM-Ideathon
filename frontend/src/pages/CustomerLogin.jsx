import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { User, ChevronRight, Chrome, ArrowLeft, Sparkles } from "lucide-react";

export default function CustomerLogin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.getUsers().then(data => {
            setUsers(data);
            setLoading(false);
        }).catch(err => setLoading(false));
    }, []);

    const handleGoogleLogin = async () => {
        const targetUser = users.length > 0 ? users[0].user_id : "U001";
        localStorage.setItem("user_id", targetUser);
        navigate("/customer/dashboard");
    };

    const handleLogin = async (uid) => {
        try {
            await api.loginUser(uid);
            localStorage.setItem("user_id", uid);
            navigate("/customer/dashboard");
        } catch (e) {
            alert("Login failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-body flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="w-full max-w-md space-y-10 z-10">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary text-white flex items-center justify-center rounded-[2rem] shadow-2xl shadow-primary/20 italic text-4xl font-black mx-auto mb-6">S</div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">Welcome to <br /><span className="text-primary italic">SmartRetail</span></h2>
                    <p className="text-slate-400 font-medium">Select a profile to begin your intelligent shopping journey.</p>
                </div>

                <div className="premium-card p-4 space-y-6">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full h-16 bg-white border border-slate-100 text-slate-900 font-black rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-50 transition-all text-lg shadow-sm hover:shadow-md"
                    >
                        <Chrome size={24} className="text-primary" />
                        Continue with Identity
                    </button>

                    <div className="relative flex items-center gap-4 px-4">
                        <div className="flex-1 h-[1px] bg-slate-100"></div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">Available Profiles</span>
                        <div className="flex-1 h-[1px] bg-slate-100"></div>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar px-2">
                        {loading ? (
                            <div className="flex flex-col items-center py-10 space-y-4 animate-pulse">
                                <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                                <div className="w-32 h-3 bg-slate-100 rounded-full"></div>
                            </div>
                        ) : (
                            users.map((u) => (
                                <button
                                    key={u.user_id}
                                    onClick={() => handleLogin(u.user_id)}
                                    className="w-full h-20 bg-white border border-slate-50 hover:border-primary/30 hover:bg-primary/[0.01] rounded-2xl flex items-center px-6 transition-all group shadow-sm hover:shadow-md"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all font-black italic text-xl">
                                        {u.name[0]}
                                    </div>
                                    <div className="ml-5 text-left flex-1">
                                        <div className="text-slate-900 font-black text-lg group-hover:text-primary transition-colors">{u.name}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1"> Resident ID: {u.user_id.slice(-6)}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-200 group-hover:text-primary transition-colors">
                                        <ChevronRight size={24} strokeWidth={3} />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-400 text-sm font-black uppercase tracking-widest hover:text-slate-900 transition-colors">
                        <ArrowLeft size={16} /> Change Operation Mode
                    </button>

                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Sparkles size={14} /> Secure Access Active
                    </div>
                </div>
            </div>
        </div>
    );
}
