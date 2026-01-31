import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Lock, Mail, Chrome, ArrowRight, ShoppingBag, ShieldCheck, Store, Eye, EyeOff, Sparkles } from "lucide-react";

export default function AuthPage() {
    const [role, setRole] = useState("customer");
    const [mode, setMode] = useState("login");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogle = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (role === 'customer') {
                localStorage.setItem("user_id", "U001");
                localStorage.setItem("role", "customer");
                navigate("/customer/dashboard");
            } else if (role === 'retailer') {
                localStorage.setItem("retailer_id", "R001");
                localStorage.setItem("role", "retailer");
                navigate("/retailer/dashboard");
            } else {
                localStorage.setItem("role", "admin");
                navigate("/admin/dashboard");
            }
        }, 1500);
    };

    const handleEmail = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const email = data.get("email");
        const password = data.get("password");
        const name = data.get("name");

        setLoading(true);
        try {
            if (role === 'admin' && mode === 'login') {
                if (password === 'admin123') {
                    localStorage.setItem("role", "admin");
                    navigate("/admin/dashboard");
                    return;
                }
            }

            const endpoint = mode === 'login' ? "/users/login" : "/users/signup";
            const body = mode === 'login'
                ? { user_id: email, password }
                : { name: name || email, user_id: email, password, role };

            const res = await api.fetchAPI(endpoint, {
                method: "POST",
                body: JSON.stringify(body)
            });

            if (res.status === "success") {
                localStorage.setItem("user_id", email);
                localStorage.setItem("role", role);
                if (role === 'retailer') localStorage.setItem("retailer_id", email);
                navigate(`/${role}/dashboard`);
            }
        } catch (err) {
            alert(err.message || "Failed. Try U001 / pass123");
        } finally {
            setLoading(false);
        }
    };

    const RoleCard = ({ id, icon: Icon, label, desc }) => (
        <button
            type="button"
            onClick={() => setRole(id)}
            className={`flex flex-col items-center p-4 rounded-3xl border transition-all duration-300 group
           ${role === id
                    ? 'bg-white border-primary shadow-xl shadow-primary/5 scale-105'
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-slate-200'}`}
        >
            <div className={`p-3 rounded-2xl mb-3 transition-colors ${role === id ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'}`}>
                <Icon size={20} />
            </div>
            <h3 className={`font-bold text-sm mb-1 ${role === id ? 'text-slate-900' : 'text-slate-500'}`}>{label}</h3>
            <p className="text-[10px] opacity-60 text-center leading-tight">{desc}</p>
        </button>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 z-10 items-center">

                {/* Intro Side */}
                <div className="flex flex-col space-y-10 p-4">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest animate-bounce">
                            <Sparkles size={14} /> Intelligence for Retail
                        </div>
                        <h1 className="text-6xl font-black text-slate-800 leading-[1.1] tracking-tight">
                            Smart <br /><span className="text-secondary italic">Retail.</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-md">Experience the future of commerce with AI-driven insights and seamless operations.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <RoleCard id="admin" icon={ShieldCheck} label="Admin" desc="Governance & Control" />
                        <RoleCard id="customer" icon={ShoppingBag} label="Customer" desc="Shop & Discover" />
                        <RoleCard id="retailer" icon={Store} label="Retailer" desc="Growth & Metrics" />
                    </div>
                </div>

                {/* Auth Form Side */}
                <div className="premium-card p-10 lg:p-12">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">
                            {mode === 'login' ? `Welcome Back` : `Getting Started`}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {mode === 'login' ? `Sign in to your ${role} portal` : `Create your ${role} account today`}
                        </p>
                    </div>

                    <button
                        onClick={handleGoogle}
                        className="w-full bg-slate-50 text-slate-700 border border-slate-200 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all mb-8 shadow-sm group"
                    >
                        {loading ? <span className="animate-spin text-primary">⌛</span> : <Chrome size={20} className="text-secondary" />}
                        Continue with Identity
                    </button>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-4 text-slate-300">Or use your email</span></div>
                    </div>

                    <form onSubmit={handleEmail} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 ml-1">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-4 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                <input name="email" type="email" placeholder="name@company.com" className="w-full pl-14" required />
                            </div>
                        </div>

                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 ml-1">Display Name</label>
                                <input name="name" type="text" placeholder="Your full name" className="w-full" required />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 ml-1">Secure Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-4 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-14"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-4 text-slate-400 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="primary w-full mt-6 py-5">
                            {loading ? "Authenticating..." : (mode === 'login' ? "Sign In" : "Get Started Now")} <ArrowRight size={18} className="inline ml-2" />
                        </button>
                    </form>

                    <div className="mt-10 text-center text-sm text-slate-500">
                        {mode === 'login' ? "Don't have an account? " : "Already registered? "}
                        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-primary hover:underline font-bold">
                            {mode === 'login' ? "Join the community" : "Log into account"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
