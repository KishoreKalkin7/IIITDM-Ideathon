import { useNavigate } from "react-router-dom";
import {
    Store, ShoppingBag, ShieldCheck, ArrowRight,
    Activity, Zap, Layers, Sparkles, Box,
    Smartphone, Database, ChevronRight, Globe
} from "lucide-react";

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white text-slate-900 font-body selection:bg-primary/20 overflow-hidden relative">
            {/* Elegant Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/[0.03] blur-[150px] rounded-full -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/[0.03] blur-[150px] rounded-full -z-10 animate-pulse delay-1000"></div>

            {/* Premium Navigation */}
            <nav className="p-8 flex justify-between items-center relative z-50 max-w-7xl mx-auto backdrop-blur-sm sticky top-0">
                <div onClick={() => navigate("/")} className="text-3xl font-black tracking-tighter flex items-center gap-3 cursor-pointer group">
                    <div className="w-12 h-12 bg-[#426B8E] text-white flex items-center justify-center rounded-[1rem] shadow-xl shadow-[#426B8E]/20 group-hover:rotate-12 transition-transform duration-300 italic text-2xl font-black">S</div>
                    <span className="text-slate-900">Smart<span className="text-[#8FBFF6] italic">Retail</span></span>
                </div>
                <div className="hidden lg:flex gap-10 text-slate-400 text-sm font-black uppercase tracking-widest">
                    <a href="#features" className="hover:text-primary transition-colors">Core Systems</a>
                    <a href="#intel" className="hover:text-primary transition-colors">Intelligence</a>
                    <a href="#ecosystem" className="hover:text-primary transition-colors">Ecosystem</a>
                </div>
                <button onClick={() => navigate("/auth")} className="primary px-8 py-3 text-sm">
                    Enter Platform
                </button>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-32">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-40">
                    <div className="animate-in fade-in slide-in-from-left duration-1000">
                        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                            <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                            Quantum Era Retail v2.0
                        </div>
                        <h1 className="text-[5.5rem] leading-[0.85] font-black text-slate-800 tracking-[-0.04em] mb-10">
                            Modernizing <br />
                            <span className="text-[#426B8E] italic">Physical</span> <br />
                            Commerce.
                        </h1>
                        <p className="text-xl text-slate-400 max-w-xl leading-relaxed mb-12 font-medium">
                            A unified intelligent engine designed for the future of retail. Bridging digital precision with physical reality through AI-driven shelf analytics and secure governance.
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <button onClick={() => navigate("/auth")} className="primary px-12 py-5 text-lg">
                                Launch Experience
                            </button>
                            <button className="bg-slate-50 text-slate-900 px-12 py-5 rounded-2xl font-black border border-slate-100 hover:bg-slate-100 transition-all flex items-center gap-3">
                                Watch Architecture <Activity size={18} className="text-primary" />
                            </button>
                        </div>
                    </div>

                    {/* Abstract Visual Asset - Premium CSS Mockup */}
                    <div className="relative animate-in fade-in zoom-in duration-1000 hidden lg:block">
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75 animate-pulse"></div>
                        <div className="relative bg-white border border-slate-100 p-10 rounded-[4rem] shadow-2xl shadow-slate-200/50 overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8">
                                <Sparkles size={40} className="text-[#8FBFF6] animate-bounce" />
                            </div>
                            <div className="space-y-6">
                                <div className="w-2/3 h-4 bg-slate-50 rounded-full"></div>
                                <div className="w-full h-4 bg-slate-100 rounded-full"></div>
                                <div className="w-1/2 h-4 bg-[#8FBFF6]/20 rounded-full"></div>
                                <div className="grid grid-cols-3 gap-4 pt-8">
                                    {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center text-slate-200">
                                        <Box size={24} />
                                    </div>)}
                                </div>
                                <div className="pt-8 flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Shelf Metric</div>
                                        <div className="text-4xl font-black text-slate-900">98.4<span className="text-[#426B8E]">%</span></div>
                                    </div>
                                    <div className="w-24 h-12 bg-slate-50 rounded-2xl border border-slate-100"></div>
                                </div>
                            </div>
                        </div>
                        {/* Floating elements */}
                        <div className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 scale-110 flex items-center gap-4 animate-bounce delay-700">
                            <div className="w-10 h-10 bg-[#B9D19E]/20 rounded-full flex items-center justify-center text-[#B9D19E]"><Zap size={20} /></div>
                            <div className="font-black text-sm text-slate-900">Real-time Sync</div>
                        </div>
                    </div>
                </div>

                {/* Ecosystem Section */}
                <div id="features" className="space-y-24">
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic text-center w-full">Omni-Channel Engine</h2>
                        <h3 className="text-5xl font-black text-slate-900 tracking-tight">Three Pillars of Innovation</h3>
                        <p className="text-slate-400 font-medium">A complete lifecycle management system for retailers, customers, and administrators.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Admin */}
                        <div onClick={() => navigate("/auth")} className="premium-card p-12 group cursor-pointer hover:border-[#426B8E]/20 transition-all">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-[#426B8E] group-hover:text-white transition-all mb-10 shadow-sm">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-3xl font-black mb-4 text-slate-900">Secure Governance</h3>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8">
                                Advanced fraud detection and return verification audits. Keep your platform healthy and trust-high.
                            </p>
                            <div className="flex items-center gap-3 text-[#426B8E] font-black uppercase text-xs tracking-widest">
                                Explore Admin <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>

                        {/* Retailer */}
                        <div onClick={() => navigate("/auth")} className="premium-card p-12 group cursor-pointer hover:border-[#8FBFF6]/20 transition-all">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-[#8FBFF6] group-hover:text-white transition-all mb-10 shadow-sm">
                                <Store size={32} />
                            </div>
                            <h3 className="text-3xl font-black mb-4 text-slate-900">Retailer Intelligence</h3>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8">
                                AI-driven shelf layout optimization and real-time inventory flow. Maximize presence and sales efficiency.
                            </p>
                            <div className="flex items-center gap-3 text-[#8FBFF6] font-black uppercase text-xs tracking-widest">
                                Explore Hub <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>

                        {/* Customer */}
                        <div onClick={() => navigate("/auth")} className="premium-card p-12 group cursor-pointer hover:border-[#B9D19E]/20 transition-all">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-[#B9D19E] group-hover:text-white transition-all mb-10 shadow-sm">
                                <ShoppingBag size={32} />
                            </div>
                            <h3 className="text-3xl font-black mb-4 text-slate-900">Quantum Shopping</h3>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8">
                                Hyper-personalized feeds and friction-less order tracking. A shopping experience built around you.
                            </p>
                            <div className="flex items-center gap-3 text-[#B9D19E] font-black uppercase text-xs tracking-widest">
                                Explore App <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Premium Footer Stats */}
            <footer className="border-t border-slate-50 bg-slate-50/50 backdrop-blur-xl py-12 relative z-10 font-body">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center">
                        <div className="flex items-center gap-3">
                            <Globe size={20} className="text-primary animate-spin-slow" />
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Global Deployment Ready</span>
                        </div>
                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            <Database size={16} /> Secure Infrastructure
                        </div>
                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            <Layers size={16} /> Multi-Role Architecture
                        </div>
                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-end font-mono">
                            IIITDM • IDEATHON 2026
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
