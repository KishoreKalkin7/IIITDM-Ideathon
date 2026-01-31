import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {
    ShoppingCart, LogOut, Package, Home, Plus,
    Search, MessageSquare, RefreshCw, Star, Zap,
    Activity, Camera, Upload, X, ChevronRight,
    Sparkles, Heart, CreditCard, Clock
} from "lucide-react";

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
    const [selectedStore, setSelectedStore] = useState(null);
    const [highContrast, setHighContrast] = useState(false);
    const [storeProducts, setStoreProducts] = useState([]);
    const userId = localStorage.getItem("user_id");
    const navigate = useNavigate();

    const getProductImage = (name, category) => {
        const cat = category?.toLowerCase() || "";
        const n = name?.toLowerCase() || "";
        if (cat.includes("bev") || n.includes("drink") || n.includes("coke") || n.includes("juice") || n.includes("soda"))
            return "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400";
        if (cat.includes("junk") || n.includes("snack") || n.includes("chips") || n.includes("bite") || n.includes("crisps"))
            return "https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&q=80&w=400";
        if (cat.includes("health") || n.includes("fruit") || n.includes("salad") || n.includes("vege") || n.includes("fresh"))
            return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400";
        if (cat.includes("essent") || n.includes("care") || n.includes("hygiene") || n.includes("soap") || n.includes("daily"))
            return "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400";
        return "https://images.unsplash.com/photo-1542838132-92c5332f4915?auto=format&fit=crop&q=80&w=400";
    };

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

    const selectStore = async (store) => {
        setSelectedStore(store);
        try {
            const data = await api.getRetailerProducts(store.retailer_id);
            setStoreProducts(data);
            setView("store_products");
        } catch (e) { console.error(e); }
    };

    const addToCart = (pid) => {
        setCart(prev => ({ ...prev, [pid]: (prev[pid] || 0) + 1 }));
    };

    const placeOrder = async () => {
        if (Object.keys(cart).length === 0) return;
        const rid = selectedStore?.retailer_id || "R001";
        try {
            await api.placeOrder(userId, rid, cart);
            alert(`Order Placed with ${selectedStore?.name || 'Fresh Mart'}!`);
            setCart({});
            setView("tracker");
            fetchData();
        } catch (e) { alert("Order failed: " + e.message); }
    };

    const handleReturn = (orderId, pid) => {
        setReturnTarget({ orderId, productId: pid });
        setShowReturnModal(true);
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
            alert("Return requested! AI Audit in progress...");
            setShowReturnModal(false);
            fetchData();
        } catch (err) { alert(err.message || "Failed."); }
    };

    const StatusBadge = ({ type, text }) => {
        const styles = {
            success: "bg-[#B9D19E]/10 text-[#426B8E] border-[#B9D19E]/20", // Sage Green
            warning: "bg-[#AFB14A]/10 text-[#AFB14A] border-[#AFB14A]/20", // Olive Gold
            error: "bg-red-50 text-red-600 border-red-100",
            info: "bg-[#8FBFF6]/10 text-[#426B8E] border-[#8FBFF6]/20" // Bright Blue
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[type] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                {text}
            </span>
        );
    };

    const HomeView = () => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Hero Section */}
            <section className="premium-card p-12 relative overflow-hidden bg-gradient-to-br from-[#426B8E]/5 to-[#8FBFF6]/5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#8FBFF6]/10 rounded-full blur-3xl -z-10"></div>
                <div className="text-center relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#426B8E]/10 rounded-full shadow-sm">
                        <div className="w-2 h-2 bg-[#B9D19E] rounded-full animate-pulse"></div>
                        <span className="text-xs font-black uppercase tracking-widest text-[#426B8E]">Real-time Sync</span>
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tight">
                        Welcome back!
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                        Explore the products curated just for you by our Smart Retail engine.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={() => setView('ai')} className="px-8 py-4 bg-[#426B8E] text-white rounded-2xl font-black text-sm shadow-xl shadow-[#426B8E]/20 hover:scale-105 transition-transform flex items-center gap-2">
                            <Zap size={18} /> Discover AI Picks
                        </button>
                        <button onClick={() => setShowSurvey(true)} className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-sm hover:scale-105 transition-transform">
                            Personalize Store
                        </button>
                    </div>
                </div>
            </section>

            {/* Nearby Stores */}
            <section>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nearby Outposts</h2>
                    <button className="text-xs font-black text-[#426B8E] uppercase tracking-widest hover:underline">View all</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stores.map(s => (
                        <div
                            key={s.retailer_id}
                            onClick={() => selectStore(s)}
                            className={`premium-card p-6 flex items-center gap-6 cursor-pointer group 
                            ${selectedStore?.retailer_id === s.retailer_id ? 'ring-4 ring-[#426B8E]/10 border-[#426B8E] bg-[#426B8E]/[0.02]' : ''}`}
                        >
                            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl font-black text-slate-400 group-hover:bg-[#426B8E] group-hover:text-white transition-all">
                                {s.name[0]}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-slate-900 group-hover:text-[#426B8E] transition-colors">{s.name}</h3>
                                <p className="text-slate-400 text-sm font-medium mb-2">{s.location}</p>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 bg-slate-50 px-2 py-1 rounded">V-Delivery</span>
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-[#B9D19E] bg-[#B9D19E]/10 px-2 py-1 rounded">Open Now</span>
                                </div>
                            </div>
                            <ChevronRight size={24} className="text-slate-200 group-hover:text-[#426B8E] transition-colors" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );

    const AIPicksView = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2 italic">Curated for you</h1>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Intelligent Discovery</h2>
                </div>
                <button onClick={() => setShowSurvey(true)} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black shadow-sm hover:shadow-md transition-all">
                    <Star size={16} className="text-[#426B8E] fill-[#426B8E]" /> Tune AI
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {recs.map(p => (
                    <div key={p.product_id} className="premium-card p-4 group">
                        <div className="aspect-square bg-slate-50 rounded-2xl mb-5 flex items-center justify-center relative overflow-hidden">
                            <img src={getProductImage(p.name, p.category)} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-slate-300 hover:text-[#426B8E] transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                                <Heart size={20} />
                            </button>
                            {p.explanation && (
                                <div className="absolute bottom-3 left-3 bg-[#426B8E] text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-md bg-[#426B8E]/90">
                                    <Zap size={10} strokeWidth={3} /> {p.explanation}
                                </div>
                            )}
                        </div>
                        <div className="px-2">
                            <h3 className="text-slate-900 font-black text-base truncate mb-1">{p.name}</h3>
                            <p className="text-slate-400 text-sm font-black mb-6">₹{p.price}</p>
                            <button onClick={() => addToCart(p.product_id)} className="w-full primary py-3 text-xs flex items-center justify-center gap-2 opacity-90 hover:opacity-100 bg-[#426B8E]">
                                <Plus size={16} /> Quick Add
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {recs.length === 0 && (
                <div className="text-center py-24 premium-card">
                    <Sparkles size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">No picks yet. Let's build your profile!</p>
                </div>
            )}
        </div>
    );

    const StoreProductsView = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#426B8E] text-white flex items-center justify-center rounded-2xl text-2xl font-black">
                        {selectedStore?.name[0]}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900">{selectedStore?.name}</h2>
                        <p className="text-slate-400 font-medium">{selectedStore?.location} • {storeProducts.length} Products Available</p>
                    </div>
                </div>
                <button onClick={() => setView('home')} className="px-6 py-3 bg-slate-50 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2">
                    <X size={18} /> Exit Store
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {storeProducts.map(p => (
                    <div key={p.product_id} className="premium-card p-4 group">
                        <div className="aspect-square bg-slate-50 rounded-2xl mb-5 flex items-center justify-center relative overflow-hidden">
                            <img src={getProductImage(p.name, p.category)} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-black uppercase text-[#426B8E] shadow-sm border border-slate-100">
                                {p.category}
                            </div>
                        </div>
                        <div className="px-2">
                            <h3 className="text-slate-900 font-black text-base mb-1">{p.name}</h3>
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-[#426B8E] text-xl font-black">₹{p.price}</p>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">{p.stock} in stock</span>
                            </div>
                            <button onClick={() => addToCart(p.product_id)} className="w-full primary py-4 text-sm flex items-center justify-center gap-2 bg-[#426B8E]">
                                <ShoppingCart size={18} /> Store in Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const CartView = () => (
        <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">Your Cart</h2>
                <p className="text-slate-400 font-medium">Verify your items before checkout</p>
            </div>

            <div className="premium-card overflow-hidden">
                <div className="p-8 space-y-6">
                    {Object.entries(cart).map(([pid, qty]) => (
                        <div key={pid} className="flex justify-between items-center group">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden">
                                    <img src={getProductImage("Item")} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 text-lg">Product {pid}</div>
                                    <div className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Quantity: {qty}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-black text-xl text-slate-900">₹{(qty * 100).toFixed(2)}</div>
                                <button className="text-[10px] font-black uppercase text-red-500 hover:underline mt-1">Remove</button>
                            </div>
                        </div>
                    ))}
                    {Object.keys(cart).length === 0 && (
                        <div className="text-center py-12">
                            <ShoppingCart size={48} className="mx-auto text-slate-100 mb-4" />
                            <p className="text-slate-300 font-bold italic">Your basket is currently empty.</p>
                        </div>
                    )}
                </div>
                {Object.keys(cart).length > 0 && (
                    <div className="bg-slate-50 p-8 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-slate-400 font-black uppercase tracking-widest text-sm">Grand Total</span>
                            <span className="text-4xl font-black text-slate-900">₹{Object.entries(cart).reduce((acc, [p, q]) => acc + q * 100, 0).toFixed(2)}</span>
                        </div>
                        <button onClick={placeOrder} className="primary w-full py-5 text-xl flex items-center justify-center gap-4">
                            Proceed to payment <ChevronRight size={24} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const TrackerView = () => (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div>
                <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2 italic">Active Flows</h1>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Order Tracker</h2>
            </div>
            <div className="grid gap-8">
                {orders.map(o => (
                    <div key={o.order_id} className="premium-card p-10 flex flex-col lg:flex-row justify-between items-center gap-12 group">
                        <div className="space-y-4 text-center lg:text-left">
                            <div className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Tracking Batch: {o.order_id.slice(-8)}</div>
                            <h3 className="text-4xl font-black text-slate-900">₹{Math.floor(o.total_amount)}</h3>
                            <div className="flex items-center justify-center lg:justify-start gap-4">
                                <StatusBadge type="info" text="Processing" />
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock size={14} /> {new Date(o.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-md space-y-4">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-300 tracking-tighter">
                                <span>Outpost</span>
                                <span>In-Route</span>
                                <span>Dest.</span>
                            </div>
                            <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                <div className="w-2/3 h-full bg-[#426B8E] shadow-[0_0_15px_rgba(66,107,142,0.5)] transition-all duration-1000"></div>
                            </div>
                            <div className="text-center font-black text-[#426B8E] text-xs tracking-widest animate-pulse flex items-center justify-center gap-2">
                                <RefreshCw size={14} className="animate-spin" /> DISPATCH INITIATED
                            </div>
                        </div>
                        <button className="primary bg-slate-900 text-white hover:bg-slate-800 px-8 py-4">
                            Details
                        </button>
                    </div>
                ))}
                {orders.length === 0 && (
                    <div className="text-center py-24 premium-card">
                        <RefreshCw size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-300 font-bold">No active flows detected.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const HistoryView = () => (
        <div className="space-y-14 animate-in fade-in duration-500">
            {returnRequests.length > 0 && (
                <section className="space-y-8">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Return Claims Pool</h2>
                    <div className="grid gap-4">
                        {returnRequests.map(req => (
                            <div key={req.request_id} className="premium-card p-6 flex justify-between items-center group">
                                <div className="flex items-center gap-6">
                                    <div className={`p-4 rounded-2xl ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'}`}>
                                        <RefreshCw size={24} />
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em] mb-1 italic">REQ: {req.request_id.slice(0, 8)}</div>
                                        <div className="text-slate-900 font-black text-lg">Product {req.product_id}</div>
                                        <div className="text-slate-400 text-xs font-medium italic">"{req.reason}"</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <StatusBadge
                                        type={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'error' : 'warning'}
                                        text={req.status}
                                    />
                                    {req.admin_notes && <div className="text-[10px] font-bold text-slate-300 mt-2 max-w-[200px] truncate">{req.admin_notes}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="space-y-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lifecycle Archive</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {orders.map(o => {
                        let items = {};
                        try { items = JSON.parse(o.items_json); } catch (e) { }
                        return (
                            <div key={o.order_id} className="premium-card overflow-hidden">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <span className="text-slate-900 font-black text-sm">#{o.order_id.slice(-8)}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(o.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div className="p-8 space-y-4">
                                    {Object.keys(items).map(pid => (
                                        <div key={pid} className="flex justify-between items-center p-5 bg-white border border-slate-100 rounded-2xl group hover:border-[#426B8E]/20 hover:bg-slate-50/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-sm">📦</div>
                                                <div className="font-black text-slate-800 tracking-tight">Item {pid}</div>
                                            </div>
                                            <button onClick={() => handleReturn(o.order_id, pid)} className="text-[10px] font-black uppercase text-[#426B8E] border border-[#426B8E]/20 px-5 py-2.5 rounded-xl hover:bg-[#426B8E] hover:text-white transition-all tracking-widest">Initiate Audit</button>
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

    const ModalOverlay = ({ title, desc, children, onClose }) => (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-6 z-[200] animate-in fade-in">
            <div className="bg-white p-10 md:p-14 rounded-[4rem] max-w-2xl w-full relative shadow-2xl">
                <button onClick={onClose} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
                    <X size={28} />
                </button>
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">{title}</h2>
                    <p className="text-slate-400 font-medium">{desc}</p>
                </div>
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-40">
            {/* Nav */}
            <nav className="p-8 pb-4 flex justify-between items-center max-w-7xl mx-auto sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-2xl z-[150]">
                <div onClick={() => setView('home')} className="text-3xl font-black tracking-tighter flex items-center gap-3 cursor-pointer group">
                    <div className="w-12 h-12 bg-[#426B8E] text-white rounded-2xl flex items-center justify-center italic text-2xl shadow-xl shadow-[#426B8E]/20 group-hover:rotate-12 transition-transform duration-300">S</div>
                    <span className="text-slate-900">Smart<span className="text-[#8FBFF6] italic">Retail</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('cart')} className="relative w-14 h-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                        <ShoppingCart size={22} className="text-[#426B8E]" />
                        {Object.keys(cart).length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-slate-900 text-white text-[10px] flex items-center justify-center rounded-xl font-black border-2 border-white">
                                {Object.keys(cart).length}
                            </span>
                        )}
                    </button>
                    <button onClick={() => { localStorage.clear(); navigate("/auth"); }} className="w-14 h-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm hover:scale-105 transition-all">
                        <LogOut size={22} />
                    </button>
                </div>
            </nav>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-8 pt-6 min-h-[60vh]">
                {view === 'home' && <HomeView />}
                {view === 'ai' && <AIPicksView />}
                {view === 'store_products' && <StoreProductsView />}
                {view === 'cart' && <CartView />}
                {view === 'tracker' && <TrackerView />}
                {view === 'returns' && <HistoryView />}
            </main>

            {/* Float Nav */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-3xl border border-slate-100 p-3 rounded-[3rem] flex gap-2 z-[100] shadow-[0_30px_60px_rgba(0,0,0,0.1)]">
                {[
                    { id: 'home', icon: Home, label: 'Explore' },
                    { id: 'ai', icon: Zap, label: 'Discovery' },
                    { id: 'tracker', icon: RefreshCw, label: 'Tracking' },
                    { id: 'returns', icon: Package, label: 'Archive' }
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`flex items-center gap-2 px-8 py-5 rounded-[2rem] transition-all duration-300
                        ${view === item.id
                                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 translate-y-[-4px]'
                                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        <item.icon size={20} className={view === item.id ? 'text-[#426B8E]' : ''} />
                        <span className="font-black text-sm tracking-tight">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Modals */}
            {showSurvey && (
                <ModalOverlay
                    title="Intelligence Quiz"
                    desc="Fine-tune your browsing feed with our algorithm"
                    onClose={() => setShowSurvey(false)}
                >
                    <form onSubmit={(e) => { e.preventDefault(); setShowSurvey(false); setView('ai'); fetchData(); }} className="space-y-10">
                        <div className="grid grid-cols-2 gap-4">
                            {['Junk', 'Beverages', 'Healthy', 'Essentials'].map(cat => (
                                <label key={cat} className="flex items-center gap-4 bg-slate-50 p-8 rounded-[2.5rem] border-2 border-transparent cursor-pointer hover:border-slate-200 transition-all has-[:checked]:border-[#426B8E] has-[:checked]:bg-[#426B8E]/[0.05]">
                                    <input type="checkbox" name={`cat_${cat.toLowerCase().slice(0, 3)}`} className="hidden" />
                                    <span className="font-black text-xl text-slate-800">{cat}</span>
                                </label>
                            ))}
                        </div>
                        <button className="primary w-full py-6 text-xl">Optimize Experience</button>
                    </form>
                </ModalOverlay>
            )}

            {showReturnModal && (
                <ModalOverlay
                    title="Claims Audit"
                    desc="Visual authentication required for return processing"
                    onClose={() => setShowReturnModal(false)}
                >
                    <form onSubmit={submitReturn} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Claim Reason</label>
                                <select name="reason" className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none focus:border-[#426B8E]/30 font-bold">
                                    <option>Damaged Product</option>
                                    <option>Wrong Item Flow</option>
                                    <option>Merchant Error</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Condition Status</label>
                                <select name="condition" className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none focus:border-[#426B8E]/30 font-bold">
                                    <option>Intact / Sealed</option>
                                    <option>Partially Used</option>
                                    <option>Defective</option>
                                </select>
                            </div>
                        </div>
                        <label className="flex flex-col items-center justify-center w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] cursor-pointer hover:border-[#426B8E]/50 hover:bg-[#426B8E]/[0.02] transition-all group">
                            <Camera className="w-12 h-12 mb-3 text-slate-300 group-hover:text-[#426B8E] transition-colors" />
                            <p className="text-xs font-black text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-widest">Submit Visual Proof</p>
                            <input type="file" name="image" className="hidden" accept="image/*" required />
                        </label>
                        <button className="primary w-full py-6 text-xl bg-slate-900 hover:bg-slate-800">Process Audit Request</button>
                    </form>
                </ModalOverlay>
            )}
        </div>
    );
}
