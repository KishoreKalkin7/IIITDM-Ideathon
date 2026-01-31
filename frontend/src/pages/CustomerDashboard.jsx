import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut, Package, Home, Plus, Search, MessageSquare, RefreshCw, Star, Zap, Activity, Camera, Upload, X } from "lucide-react";

export default function CustomerDashboard() {
    const [view, setView] = useState("home");
    const [user, setUser] = useState(null);
    const [recs, setRecs] = useState([]);
    const [cart, setCart] = useState({});
    const [orders, setOrders] = useState([]);
    const [returnRequests, setReturnRequests] = useState([]);
    const [stores, setStores] = useState([]);
    const [showSurvey, setShowSurvey] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnTarget, setReturnTarget] = useState(null);
    const [highContrast, setHighContrast] = useState(false);
    const userId = localStorage.getItem("user_id");
    const navigate = useNavigate();

    useEffect(() => {
        if (highContrast) document.documentElement.classList.add('high-contrast');
        else document.documentElement.classList.remove('high-contrast');
    }, [highContrast]);

    useEffect(() => {
        if (!userId) { navigate("/auth"); return; }
        fetchData();
    }, [userId]);

    const fetchData = () => {
        api.getUserRecs(userId).then(setRecs).catch(console.error);
        api.getUserOrders(userId).then(setOrders).catch(console.error);
        api.getRetailers().then(setStores).catch(console.error);
        api.fetchAPI(`/users/${userId}/returns`).then(setReturnRequests).catch(console.error);
    };

    const submitSurvey = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const cats = [];
        if (data.get('cat_junk')) cats.push('Junk');
        if (data.get('cat_bev')) cats.push('Beverages');
        if (data.get('cat_health')) cats.push('Healthy');
        if (data.get('cat_ess')) cats.push('Essentials');

        await api.fetchAPI("/survey", {
            method: "POST",
            body: JSON.stringify({
                user_id: userId,
                preferences: cats,
                intent: data.get("intent"),
                return_sensitivity: "Normal",
                age: 25,
                gender: "O"
            })
        });
        alert("Discovery Feed Updated!");
        setShowSurvey(false);
        fetchData();
        setView("ai");
    };

    const handleSupport = async () => {
        const issue = prompt("Enter your issue / support request:");
        if (!issue) return;
        await api.fetchAPI("/support/create", {
            method: "POST",
            body: JSON.stringify({ user_id: userId, role: "customer", issue })
        });
        alert("Ticket submitted!");
    };

    const addToCart = (pid) => {
        setCart(prev => ({ ...prev, [pid]: (prev[pid] || 0) + 1 }));
    };

    const placeOrder = async () => {
        if (Object.keys(cart).length === 0) return;
        try {
            await api.placeOrder(userId, "R001", cart);
            alert("Order Placed!");
            setCart({});
            setView("tracker");
            fetchData();
        } catch (e) { alert("Order failed"); }
    };

    const submitReturn = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        data.append("user_id", userId);
        data.append("order_id", returnTarget.orderId);
        data.append("product_id", returnTarget.productId);

        try {
            await api.fetchAPI("/return/request", {
                method: "POST",
                body: data
            });
            alert("Return requested! Our AI Fraud Detection is validating your images and request...");
            setShowReturnModal(false);
            fetchData();
        } catch (err) {
            alert(err.message || "Return request failed.");
        }
    };

    const handleReturn = (orderId, pid) => {
        setReturnTarget({ orderId, productId: pid });
        setShowReturnModal(true);
    };

    const ReturnModal = () => (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-6 z-[130] animate-in fade-in">
            <div className="bg-neutral-900 border border-neutral-800 p-8 md:p-12 rounded-[3.5rem] max-w-xl w-full relative">
                <button onClick={() => setShowReturnModal(false)} className="absolute top-8 right-8 text-neutral-500 hover:text-white"><X size={24} /></button>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-red-500"><Activity size={24} /></div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter text-white">Return Policy Engine</h2>
                        <p className="text-neutral-500 text-sm">Image-based authentication required.</p>
                    </div>
                </div>

                <form onSubmit={submitReturn} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest ml-1">Reason for Return</label>
                        <select name="reason" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-red-500/50 transition-all">
                            <option>Damaged Product</option>
                            <option>Wrong Item</option>
                            <option>Not Satisfied</option>
                            <option>Expired</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest ml-1">Product Condition</label>
                        <select name="condition" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-red-500/50 transition-all">
                            <option>Good (Seal Unbroken)</option>
                            <option>Minor Damage</option>
                            <option>Tampered / Used</option>
                            <option>Critically Damaged</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest ml-1">Upload Photo Proof (Fraud Check)</label>
                        <label className="flex flex-col items-center justify-center w-full h-40 bg-black border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-red-500/30 hover:bg-red-500/5 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Camera className="w-10 h-10 mb-3 text-neutral-600 group-hover:text-red-500 transition-colors" />
                                <p className="text-xs text-neutral-500 font-medium">Click to upload or drag and drop</p>
                                <p className="text-[10px] text-neutral-600 mt-1">PNG, JPG or High-Res Proof</p>
                            </div>
                            <input type="file" name="image" className="hidden" accept="image/*" required />
                        </label>
                    </div>

                    <button className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-red-500 transition-all shadow-[0_20px_40px_rgba(220,38,38,0.2)]">Submit to AI Auditor</button>
                </form>
            </div>
        </div>
    );

    const HomeView = () => (
        <div className="space-y-12">
            <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-12 rounded-[3.5rem] border border-white/10 text-center">
                <h2 className="text-5xl font-black mb-4 tracking-tighter">Welcome back!</h2>
                <p className="text-neutral-400 mb-8 max-w-lg mx-auto">Explore the products curated just for you by our Smart Retail engine.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setView('ai')} className="bg-white text-black px-8 py-3 rounded-2xl font-bold flex items-center gap-2">
                        <Zap size={18} /> Discover AI Picks
                    </button>
                    <button onClick={() => setShowSurvey(true)} className="bg-neutral-900 border border-white/10 px-8 py-3 rounded-2xl font-bold">
                        Personalize Store
                    </button>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-white mb-6">Local Markets</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stores.map(s => (
                        <div key={s.retailer_id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl flex items-center gap-6 hover:bg-neutral-800 cursor-pointer">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold">{s.name[0]}</div>
                            <div>
                                <h3 className="text-white font-bold text-lg">{s.name}</h3>
                                <div className="text-neutral-500 text-sm">{s.location} • Delivery: ₹{s.delivery_charge}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );

    const AIPicksView = () => (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter">AI Discovery</h2>
                    <p className="text-neutral-500">Based on your browsing habits and preferences quiz.</p>
                </div>
                <button onClick={() => setShowSurvey(true)} className="text-sm bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
                    <Star size={16} className="text-yellow-400" /> Retake Quiz
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {recs.map(p => (
                    <div key={p.product_id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl group hover:border-neutral-600 transition-all relative overflow-hidden">
                        <div className="aspect-square bg-neutral-800 rounded-2xl mb-4 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">📦</div>
                        <h3 className="text-white font-bold truncate mb-1">{p.name}</h3>
                        <div className="text-neutral-500 text-sm mb-4">₹{p.price}</div>
                        <button onClick={() => addToCart(p.product_id)} className="w-full bg-white text-black py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-200">
                            <Plus size={18} /> Add
                        </button>
                        {p.explanation && <div className="mt-3 text-[10px] uppercase font-bold text-blue-400 opacity-60 tracking-wider flex items-center gap-1"><Zap size={10} /> {p.explanation}</div>}
                    </div>
                ))}
            </div>
            {recs.length === 0 && <div className="text-center py-20 text-neutral-500 italic">No recommendations yet. Take the quiz!</div>}
        </div>
    );

    const CartView = () => (
        <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
            <h2 className="text-4xl font-black tracking-tighter text-center">My Cart</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 space-y-4">
                {Object.entries(cart).map(([pid, qty]) => (
                    <div key={pid} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 text-white">
                        <div>
                            <div className="font-bold">Product {pid}</div>
                            <div className="text-neutral-500 text-sm">Quantity: {qty}</div>
                        </div>
                        <div className="font-bold whitespace-nowrap">₹{(qty * 100).toFixed(2)}</div>
                    </div>
                ))}
                {Object.keys(cart).length === 0 && <div className="text-center text-neutral-500 py-12 italic">Your cart is currently empty.</div>}
            </div>
            {Object.keys(cart).length > 0 && (
                <button onClick={placeOrder} className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-xl hover:bg-neutral-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]">Complete Checkout</button>
            )}
        </div>
    );

    // ... Tracker and Returns stay similar but could use minor styling tweaks ...
    const TrackerView = () => (
        <div className="space-y-8">
            <h2 className="text-4xl font-black tracking-tighter">Live Tracking</h2>
            <div className="grid gap-6">
                {orders.map(o => (
                    <div key={o.order_id} className="bg-neutral-900/50 backdrop-blur-3xl border border-neutral-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="space-y-2">
                            <div className="text-neutral-500 text-[10px] uppercase font-bold tracking-[0.2em]">Order: {o.order_id}</div>
                            <h3 className="text-white font-bold text-2xl">₹{o.total_amount}</h3>
                            <div className="text-sm text-neutral-400">Merchant: {o.name || 'Store'}</div>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-48 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="w-2/3 h-full bg-blue-500"></div>
                            </div>
                            <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><RefreshCw size={12} className="animate-spin" /> In Transit</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const ReturnsHistory = () => (
        <div className="space-y-12">
            {returnRequests.length > 0 && (
                <section className="space-y-6">
                    <h2 className="text-4xl font-black tracking-tighter">Return Desk</h2>
                    <div className="grid gap-4">
                        {returnRequests.map(req => (
                            <div key={req.request_id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl flex justify-between items-center group hover:border-white/10 transition-all">
                                <div>
                                    <div className="text-[10px] font-black uppercase text-neutral-500 mb-1">REQ: {req.request_id}</div>
                                    <div className="text-white font-bold">Product {req.product_id}</div>
                                    <div className="text-neutral-500 text-xs italic">{req.reason}</div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'Approved' ? 'bg-green-500/10 text-green-500' : req.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        {req.status}
                                    </span>
                                    {req.admin_notes && <div className="text-[10px] text-neutral-600 mt-2 max-w-[200px] truncate">{req.admin_notes}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="space-y-6">
                <h2 className="text-4xl font-black tracking-tighter">Order History</h2>
                <div className="grid gap-4">
                    {orders.map(o => {
                        let items = {};
                        try { items = JSON.parse(o.items_json); } catch (e) { }
                        return (
                            <div key={o.order_id} className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-[2rem]">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-neutral-500 font-mono text-[10px]">#{o.order_id}</span>
                                    <span className="text-[10px] uppercase font-bold text-neutral-600 tracking-widest">{new Date(o.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div className="space-y-4">
                                    {Object.keys(items).map(pid => (
                                        <div key={pid} className="flex justify-between items-center bg-black p-4 rounded-2xl border border-white/5">
                                            <div className="text-white font-medium">Product {pid}</div>
                                            <button onClick={() => handleReturn(o.order_id, pid)} className="text-[10px] text-white bg-white/10 px-4 py-2 rounded-xl font-bold hover:bg-white hover:text-black transition-all uppercase tracking-widest">Request Return</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>
        </div>
    );

    const SurveyModal = () => (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-6 z-[120]">
            <div className="bg-neutral-900 border border-neutral-800 p-12 rounded-[4rem] max-w-2xl w-full text-center">
                <h2 className="text-4xl font-black tracking-tighter text-white mb-4">Discovery Quiz</h2>
                <p className="text-neutral-500 mb-8">Tell us what you love, and our AI will build your custom feed.</p>
                <form onSubmit={submitSurvey} className="space-y-8">
                    <div className="space-y-4 text-left">
                        <label className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Preferences</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['Junk', 'Beverages', 'Healthy', 'Essentials'].map(cat => (
                                <label key={cat} className="flex items-center gap-4 bg-black p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-white/20 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500/10">
                                    <input type="checkbox" name={`cat_${cat.toLowerCase().slice(0, 3)}`} className="hidden" />
                                    <span className="font-bold text-lg">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <button className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-xl hover:bg-neutral-200 transition-all">Optimize My Experience</button>
                    <button type="button" onClick={() => setShowSurvey(false)} className="text-neutral-500 text-sm hover:text-white">Skip for now</button>
                </form>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen bg-black text-white pb-32 ${highContrast ? 'contrast-125 saturate-150' : ''}`}>
            {showSurvey && <SurveyModal />}
            {showReturnModal && <ReturnModal />}

            <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto sticky top-0 bg-black/70 backdrop-blur-2xl z-[100]">
                <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
                    <div className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center italic text-xl">S</div> SmartRetail
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setHighContrast(!highContrast)} className={`p-3 rounded-2xl border transition-all ${highContrast ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-neutral-900 border-white/10 text-neutral-400'}`} title="Accessibility: High Contrast">
                        <Activity size={20} />
                    </button>
                    <button onClick={() => setView('cart')} className="relative p-3 bg-neutral-900 rounded-2xl border border-white/10 hover:bg-neutral-800 transition-all">
                        <ShoppingCart size={22} />
                        {Object.keys(cart).length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-[10px] flex items-center justify-center rounded-full font-black">{Object.keys(cart).length}</span>}
                    </button>
                    <button onClick={handleSupport} className="p-3 bg-neutral-900 rounded-2xl border border-white/10 hover:bg-neutral-800 transition-all">
                        <MessageSquare size={22} />
                    </button>
                    <button onClick={() => { localStorage.clear(); navigate("/auth"); }} className="p-3 bg-neutral-900 rounded-2xl border border-white/10 hover:bg-neutral-800 text-red-500 transition-all">
                        <LogOut size={22} />
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-8 min-h-[60vh]">
                {view === 'home' && <HomeView />}
                {view === 'ai' && <AIPicksView />}
                {view === 'cart' && <CartView />}
                {view === 'tracker' && <TrackerView />}
                {view === 'returns' && <ReturnsHistory />}
            </main>

            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-neutral-900/40 backdrop-blur-3xl border border-white/10 p-2 rounded-[2.5rem] flex gap-2 z-[100] shadow-2xl">
                <button onClick={() => setView('home')} className={`flex items-center gap-2 px-6 py-4 rounded-[2rem] transition-all ${view === 'home' ? 'bg-white text-black shadow-xl' : 'text-neutral-500 hover:text-white'}`}>
                    <Home size={20} /> <span className="font-bold text-sm">Explore</span>
                </button>
                <button onClick={() => setView('ai')} className={`flex items-center gap-2 px-6 py-4 rounded-[2rem] transition-all ${view === 'ai' ? 'bg-white text-black shadow-xl' : 'text-neutral-500 hover:text-white'}`}>
                    <Zap size={20} /> <span className="font-bold text-sm">AI Picks</span>
                </button>
                <button onClick={() => setView('tracker')} className={`flex items-center gap-2 px-6 py-4 rounded-[2rem] transition-all ${view === 'tracker' ? 'bg-white text-black shadow-xl' : 'text-neutral-500 hover:text-white'}`}>
                    <RefreshCw size={20} /> <span className="font-bold text-sm">Track</span>
                </button>
                <button onClick={() => setView('returns')} className={`flex items-center gap-2 px-6 py-4 rounded-[2rem] transition-all ${view === 'returns' ? 'bg-white text-black shadow-xl' : 'text-neutral-500 hover:text-white'}`}>
                    <Package size={20} /> <span className="font-bold text-sm">History</span>
                </button>
            </div>
        </div>
    );
}
