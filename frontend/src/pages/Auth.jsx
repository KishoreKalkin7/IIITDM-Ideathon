import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Lock, Mail, Chrome, ArrowRight, ShoppingBag, ShieldCheck, Store } from "lucide-react";

export default function AuthPage() {
    const [role, setRole] = useState("customer"); // customer, retailer, admin
    const [mode, setMode] = useState("login"); // login, signup
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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

        setLoading(true);
        try {
            if (role === 'admin') {
                // Admin mock for demo or check
                if (password === 'admin123') {
                    localStorage.setItem("role", "admin");
                    navigate("/admin/dashboard");
                    return;
                }
            }

            const res = await api.fetchAPI("/users/login", {
                method: "POST",
                body: JSON.stringify({ user_id: email, password })
            });

            if (res.status === "success") {
                localStorage.setItem("user_id", email);
                localStorage.setItem("role", role);
                if (role === 'retailer') localStorage.setItem("retailer_id", email);
                navigate(`/${role}/dashboard`);
            }
        } catch (err) {
            alert(err.message || "Login failed. Try U001 / pass123");
        } finally {
            setLoading(false);
        }
    };

    const RoleCard = ({ id, icon: Icon, label, desc }) => (
        <button
            onClick={() => setRole(id)}
            className={`flex flex-col items-center p-6 rounded-2xl border transition-all w-full text-left
           ${role === id
                    ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.3)] transform scale-105'
                    : 'bg-neutral-900/50 text-neutral-400 border-neutral-800 hover:bg-neutral-800'}`}
        >
            <div className={`p-3 rounded-xl mb-4 ${role === id ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                <Icon size={24} />
            </div>
            <h3 className="font-bold text-lg mb-1">{label}</h3>
            <p className="text-xs opacity-70 text-center">{desc}</p>
        </button>
    );

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/30 via-black to-black z-0 pointer-events-none"></div>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
                {/* Intro Side */}
                <div className="flex flex-col justify-center space-y-8 p-4">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
                            Smart Retail.
                        </h1>
                        <p className="text-xl text-neutral-400">The next generation of connected commerce.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <RoleCard id="admin" icon={ShieldCheck} label="Admin" desc="Governance & Control" />
                        <RoleCard id="customer" icon={ShoppingBag} label="Customer" desc="Shop & Personalise" />
                        <RoleCard id="retailer" icon={Store} label="Retailer" desc="Manage & Optimize" />
                    </div>
                </div>

                {/* Auth Form Side */}
                <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">
                            {mode === 'login' ? `Login to ${role.charAt(0).toUpperCase() + role.slice(1)}` : `Join as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                        </h2>
                        <p className="text-neutral-500 text-sm">Access your secure dashboard</p>
                    </div>

                    <button
                        onClick={handleGoogle}
                        className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-neutral-200 transition-colors mb-6"
                    >
                        {loading ? <span className="animate-spin">⌛</span> : <Chrome size={20} />}
                        Continue with Google
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-black px-2 text-neutral-500">Or continue with Email</span></div>
                    </div>

                    <form onSubmit={handleEmail} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-neutral-500 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-neutral-500" size={18} />
                                <input type="email" placeholder="name@example.com" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 ring-white/20 outline-none transition-all placeholder:text-neutral-700" required />
                            </div>
                        </div>
                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <label className="text-xs text-neutral-500 ml-1">Full Name</label>
                                <input type="text" placeholder="John Doe" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 focus:ring-2 ring-white/20 outline-none transition-all placeholder:text-neutral-700" required />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-xs text-neutral-500 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-neutral-500" size={18} />
                                <input type="password" placeholder="••••••••" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 ring-white/20 outline-none transition-all placeholder:text-neutral-700" required />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-neutral-800 text-white border border-neutral-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-700 transition-all mt-4">
                            {loading ? "Verifying..." : (mode === 'login' ? "Sign In" : "Create Account")} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-neutral-500">
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-white hover:underline font-medium">
                            {mode === 'login' ? "Sign up" : "Log in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
