import { useNavigate } from "react-router-dom";
import { Store, ShoppingBag, ShieldCheck, ArrowRight, Activity, Zap, Layers } from "lucide-react";

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-hidden relative">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>

            <nav className="p-8 flex justify-between items-center relative z-10 max-w-7xl mx-auto">
                <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
                    <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg">S</div>
                    SMART RETAIL
                </div>
                <div className="hidden md:flex gap-8 text-neutral-400 text-sm font-medium">
                    <a href="#" className="hover:text-white transition-colors">Architecture</a>
                    <a href="#" className="hover:text-white transition-colors">Intelligence</a>
                    <a href="#" className="hover:text-white transition-colors">Dashboards</a>
                </div>
                <button onClick={() => navigate("/auth")} className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-sm font-bold hover:bg-white hover:text-black transition-all">
                    Get Started
                </button>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-40">
                <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full text-xs font-bold text-neutral-500 mb-8">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        SYSTEM V2.0 LIVE
                    </div>
                    <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                        Future proofing <br />
                        <span className="text-neutral-500">Retail ecosystems.</span>
                    </h1>
                    <p className="text-xl text-neutral-400 max-w-2xl leading-relaxed mb-12">
                        A unified engine for modern commerce. Bridging the gap between online flexibility and offline physical reality through AI-driven shelf intelligence and secure return workflows.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div onClick={() => navigate("/auth")} className="bg-neutral-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-neutral-800 transition-all cursor-pointer group">
                            <ShieldCheck size={32} className="mb-6 text-purple-500" />
                            <h3 className="text-2xl font-bold mb-2">Central Admin</h3>
                            <p className="text-neutral-500 text-sm mb-6">Manage fraud alerts, validate returns, and platform health.</p>
                            <ArrowRight size={20} className="text-white group-hover:translate-x-2 transition-transform" />
                        </div>
                        <div onClick={() => navigate("/auth")} className="bg-neutral-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-neutral-800 transition-all cursor-pointer group">
                            <ShoppingBag size={32} className="mb-6 text-blue-500" />
                            <h3 className="text-2xl font-bold mb-2">Consumer App</h3>
                            <p className="text-neutral-500 text-sm mb-6">Personalized shopping with GPT-based affinities and tracking.</p>
                            <ArrowRight size={20} className="text-white group-hover:translate-x-2 transition-transform" />
                        </div>
                        <div onClick={() => navigate("/auth")} className="bg-neutral-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-neutral-800 transition-all cursor-pointer group">
                            <Store size={32} className="mb-6 text-emerald-500" />
                            <h3 className="text-2xl font-bold mb-2">Retailer Hub</h3>
                            <p className="text-neutral-500 text-sm mb-6">Real-time shelf arrangement guidance and inventory analytics.</p>
                            <ArrowRight size={20} className="text-white group-hover:translate-x-2 transition-transform" />
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Stats Banner */}
            <div className="border-t border-white/5 bg-neutral-950/20 backdrop-blur-xl py-8 mt-auto relative z-10">
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <div className="text-white font-black text-2xl tracking-tighter uppercase whitespace-nowrap overflow-hidden">
                            <Activity className="inline mr-2 text-emerald-500" size={20} /> Realtime Ops
                        </div>
                    </div>
                    <div className="text-neutral-600 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center">
                        Integrated AI Flow
                    </div>
                    <div className="text-neutral-600 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center">
                        Smart Shelf Metrics
                    </div>
                    <div className="text-neutral-600 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-end">
                        IIITDM IDEATHON • 2026
                    </div>
                </div>
            </div>
        </div>
    );
}
