import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Bell, Box, TrendingUp, LogOut, AlertTriangle, CheckCircle, Package, ShoppingCart, MessageSquare, Plus, Trash } from "lucide-react";

export default function RetailerDashboard() {
    const [view, setView] = useState("overview");
    const [notifs, setNotifs] = useState([]);
    const [shelfLayout, setShelfLayout] = useState([]);
    const [analytics, setAnalytics] = useState({ sales_trend: [], category_split: {}, total_revenue: 0, total_orders: 0 });
    const [recommendations, setShelfRecs] = useState([]);
    const [returns, setReturns] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const rid = localStorage.getItem("retailer_id");
    const navigate = useNavigate();

    useEffect(() => {
        if (!rid) { navigate("/auth"); return; }
        fetchInitialData();
    }, [rid]);

    const fetchInitialData = async () => {
        api.getRetailerNotifs(rid).then(setNotifs).catch(console.error);
        api.getShelfLayout(rid).then(setShelfLayout).catch(console.error);
        api.fetchAPI(`/retailers/${rid}/analytics`).then(setAnalytics).catch(console.error);
        api.getShelfRecs(rid).then(setShelfRecs).catch(console.error);
        api.fetchAPI(`/retailers/${rid}/returns`).then(setReturns).catch(console.error);
        api.fetchAPI(`/retailers/${rid}/products`).then(setProducts).catch(console.error);
        api.fetchAPI(`/retailers/${rid}/orders`).then(setOrders).catch(console.error);
    };

    const handleAddProduct = async () => {
        const name = prompt("Product Name:");
        const category = prompt("Category (Beverages, Junk, Healthy, Essentials):");
        const price = prompt("Price:");
        const stock = prompt("Stock:");
        if (!name || !category || !price || !stock) return;

        await api.fetchAPI(`/retailers/${rid}/products`, {
            method: "POST",
            body: JSON.stringify({ name, category, price: parseFloat(price), stock: parseInt(stock) })
        });
        fetchInitialData();
    };

    const handleDeleteProduct = async (pid) => {
        if (!confirm("Delete product?")) return;
        await api.fetchAPI(`/retailers/${rid}/products/${pid}`, { method: "DELETE" });
        fetchInitialData();
    };

    const handleSupport = async () => {
        const issue = prompt("Describe your issue / request support:");
        if (!issue) return;
        await api.fetchAPI("/support/create", {
            method: "POST",
            body: JSON.stringify({ user_id: rid, role: "retailer", issue })
        });
        alert("Support ticket created!");
    };

    const Overview = () => (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-bold text-white mb-6">Smart Intelligence</h2>
                <div className="grid gap-4">
                    {notifs.map((n, i) => (
                        <div key={i} className={`p-4 rounded-xl border ${n.priority === 'High' ? 'bg-red-500/10 border-red-500/20' : 'bg-neutral-900 border-neutral-800'} flex items-start`}>
                            <div className={`mr-4 p-2 rounded-lg ${n.priority === 'High' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                {n.priority === 'High' ? <AlertTriangle size={20} /> : <TrendingUp size={20} />}
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">{n.type.toUpperCase()}: {n.priority} Priority</h4>
                                <p className="text-neutral-400 text-sm mb-2">{n.message}</p>
                                <div className="text-sm font-medium text-emerald-400">Action: {n.action}</div>
                            </div>
                        </div>
                    ))}
                    {notifs.length === 0 && <div className="text-neutral-500 italic">No pending alerts. System optimal.</div>}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-4">Shelf Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendations.map((rec, i) => (
                        <div key={i} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                            <span className="text-emerald-500 text-xs font-bold block mb-2 uppercase">Optimization</span>
                            <h3 className="text-white font-semibold mb-1">{rec.product_name}</h3>
                            <div className="text-sm text-neutral-400 mb-3">
                                Zone change: <span className="text-white">{rec.current_zone}</span> → <span className="text-emerald-400">{rec.recommended_zone}</span>
                            </div>
                            <p className="text-xs text-neutral-500 italic">{rec.reason}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );

    const AnalysisView = () => (
        <div className="space-y-8 animate-in fade-in">
            <h2 className="text-2xl font-bold text-white">Market Intelligence & Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white text-black p-6 rounded-3xl">
                    <div className="text-[10px] uppercase font-black opacity-40">Total Revenue</div>
                    <div className="text-3xl font-black">₹{analytics.total_revenue.toLocaleString()}</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
                    <div className="text-[10px] uppercase font-black text-neutral-500">Orders</div>
                    <div className="text-3xl font-black"># {analytics.total_orders}</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
                    <div className="text-[10px] uppercase font-black text-neutral-500">Inventory Health</div>
                    <div className="text-3xl font-black text-emerald-500">Optimal</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
                    <div className="text-[10px] uppercase font-black text-neutral-500">Return Rate</div>
                    <div className="text-3xl font-black text-blue-400">2.4%</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-800">
                    <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-6">Sales Trajectory</h3>
                    <div className="space-y-4">
                        {analytics.sales_trend.slice(-5).map((s, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="text-[10px] font-bold text-neutral-600 w-16 uppercase">{s.date.split('-').slice(1).join('/')}</span>
                                <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="bg-white h-full transition-all duration-1000" style={{ width: `${Math.min(100, (s.sales / 10000) * 100)}%` }}></div>
                                </div>
                                <span className="text-[10px] font-black text-white">₹{s.sales}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-neutral-900 rounded-[2.5rem] border border-neutral-800 overflow-hidden">
                    <div className="p-8 pb-4">
                        <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Inventory Velocity Tracker</h3>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/40 text-neutral-500 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Item Catalog</th>
                                <th className="px-8 py-4">Sold</th>
                                <th className="px-8 py-4">Stock Left</th>
                                <th className="px-8 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(analytics.inventory || []).slice(0, 5).map(item => (
                                <tr key={item.product_id} className="hover:bg-white/[0.02]">
                                    <td className="px-8 py-4">
                                        <div className="font-bold text-white">{item.name}</div>
                                        <div className="text-[10px] text-neutral-600 font-mono">{item.category}</div>
                                    </td>
                                    <td className="px-8 py-4 text-blue-400 font-black">{item.sold_qty}</td>
                                    <td className="px-8 py-4 text-neutral-400 font-medium">{item.remaining_qty}</td>
                                    <td className="px-8 py-4 text-right">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${item.remaining_qty < 5 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {item.remaining_qty < 5 ? 'Refill Needed' : 'Stable'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const OrdersTracker = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Orders Tracker</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-950 text-neutral-500 uppercase font-medium">
                        <tr>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Time</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {orders.map(o => (
                            <tr key={o.order_id} className="text-neutral-300">
                                <td className="p-4 font-mono">{o.order_id}</td>
                                <td className="p-4">{o.user_id}</td>
                                <td className="p-4">₹{o.total_amount}</td>
                                <td className="p-4 text-xs text-neutral-500">{new Date(o.timestamp).toLocaleString()}</td>
                                <td className="p-4"><span className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded text-xs">Processing</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const ReturnsView = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Returns Governance</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-950 text-neutral-500 uppercase font-medium">
                        <tr>
                            <th className="p-4">Request ID</th>
                            <th className="p-4">Item</th>
                            <th className="p-4">Fraud Risk</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {returns.map(r => (
                            <tr key={r.request_id} className="text-neutral-300">
                                <td className="p-4 font-mono text-xs">{r.request_id}</td>
                                <td className="p-4">
                                    <div className="font-medium text-white">Product {r.product_id}</div>
                                    <div className="text-[10px] text-neutral-500">{r.reason}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-neutral-800 rounded-full max-w-[60px]">
                                            <div
                                                className={`h-full rounded-full ${r.fraud_score > 70 ? 'bg-red-500' : r.fraud_score > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${r.fraud_score}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-[10px] font-bold ${r.fraud_score > 70 ? 'text-red-500' : 'text-neutral-400'}`}>
                                            {r.fraud_score}%
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider 
                                        ${r.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                                            r.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                                                'bg-yellow-500/10 text-yellow-500'}`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button className="text-[10px] font-bold hover:underline">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {returns.length === 0 && <div className="text-center py-20 text-neutral-500 italic">No returns active for your store.</div>}
        </div>
    );

    const ProductsView = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Product Catalog</h2>
                <button onClick={handleAddProduct} className="bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-neutral-200">
                    <Plus size={18} /> Add Product
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                    <div key={p.product_id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-neutral-700 transition-all flex justify-between items-start">
                        <div>
                            <div className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">{p.category}</div>
                            <h3 className="text-white font-bold text-lg mb-2">{p.name}</h3>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-white font-medium">₹{p.price}</span>
                                <span className={p.stock_count < 10 ? 'text-red-400 font-bold' : 'text-neutral-500'}>Stock: {p.stock_count}</span>
                            </div>
                        </div>
                        <button onClick={() => handleDeleteProduct(p.product_id)} className="text-neutral-600 hover:text-red-400 p-2">
                            <Trash size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const ShelfLayoutView = () => {
        const getProductName = (pid) => {
            const p = products.find(prod => String(prod.product_id) === String(pid));
            return p ? p.name : `Product ${pid}`;
        };

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Shelf Arrangement Optimiser</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {shelfLayout.map(zone => (
                        <div key={zone.id || zone.zone_id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white">{zone.zone_name || zone.zone_type}</h3>
                                <span className="text-xs font-bold uppercase bg-neutral-800 px-2 py-1 rounded text-neutral-400">{zone.zone_type}</span>
                            </div>
                            <div className="space-y-2">
                                {zone.current_product_ids.map(pid => {
                                    const pName = getProductName(pid);
                                    // Optionally hide products that don't belong to this retailer if desired, 
                                    // but for now we just show names.
                                    return (
                                        <div key={pid} className="p-3 bg-neutral-950 rounded-lg flex justify-between items-center border border-white/5">
                                            <span className="text-sm">{pName}</span>
                                            <span className="text-xs text-neutral-600">Active</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-black text-white flex">
            <aside className="w-64 border-r border-white/5 p-6 hidden md:flex flex-col bg-neutral-950/50">
                <div className="text-2xl font-bold mb-10 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg"></div> Retail Hub
                </div>

                <nav className="space-y-1 flex-1">
                    <button onClick={() => setView('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'overview' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
                        <LayoutDashboard size={18} /> Overview
                    </button>
                    <button onClick={() => setView('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'products' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
                        <Package size={18} /> Products
                    </button>
                    <button onClick={() => setView('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'orders' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
                        <ShoppingCart size={18} /> Orders Tracker
                    </button>
                    <button onClick={() => setView('analysis')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'analysis' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
                        <TrendingUp size={18} /> Data Analysis
                    </button>
                    <button onClick={() => setView('shelf')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'shelf' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
                        <Box size={18} /> Shelf Optimiser
                    </button>
                    <button onClick={() => setView('returns')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${view === 'returns' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
                        <CheckCircle size={18} /> Returns
                    </button>
                </nav>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <button onClick={handleSupport} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white transition-colors">
                        <MessageSquare size={18} /> Get Support
                    </button>
                    <button onClick={() => { localStorage.clear(); navigate("/auth"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 h-screen overflow-y-auto">
                {view === 'overview' && <Overview />}
                {view === 'products' && <ProductsView />}
                {view === 'orders' && <OrdersTracker />}
                {view === 'analysis' && <AnalysisView />}
                {view === 'shelf' && <ShelfLayoutView />}
                {view === 'returns' && <ReturnsView />}
            </main>
        </div>
    );
}
