import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ShoppingCart, LogOut, Package, Home, Plus, Search,
    MapPin, ChevronRight, CreditCard, CheckCircle, FileText,
    ArrowLeft, Minus, Trash2, Store, Clock, Bike
} from "lucide-react";

// Mock products in case backend is empty
const MOCK_PRODUCTS = [
    { product_id: "P1", name: "Farm Fresh Milk", price: 32, category: "Dairy", image: "🥛" },
    { product_id: "P2", name: "Whole Wheat Bread", price: 45, category: "Bakery", image: "🍞" },
    { product_id: "P3", name: "Organic Eggs (6pcs)", price: 60, category: "Dairy", image: "🥚" },
    { product_id: "P4", name: "Fresh Bananas (1kg)", price: 50, category: "Fruits", image: "🍌" },
    { product_id: "P5", name: "Coca Cola (750ml)", price: 40, category: "Beverages", image: "🥤" },
    { product_id: "P6", name: "Lays Classic Salted", price: 20, category: "Snacks", image: "🥔" },
];

const BillModal = ({ viewBillOrder, setViewBillOrder }) => {
    if (!viewBillOrder) return null;
    const order = viewBillOrder;

    let items = {};
    if (order.items && typeof order.items === 'object' && !Array.isArray(order.items)) {
        items = order.items;
    }
    else if (order.items_json) {
        try {
            items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;
        } catch (e) { console.error("Error parsing items", e); }
    }

    const subtotal = parseFloat(order.total || order.total_amount || 0);
    const totalTax = subtotal * 0.05;
    const totalAmount = subtotal + totalTax + 25;

    return (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white text-black p-8 rounded-xl max-w-sm w-full font-mono text-sm relative shadow-2xl">
                <button onClick={() => setViewBillOrder(null)} className="absolute top-4 right-4 text-black font-bold p-2 hover:bg-neutral-100 rounded-full"><Trash2 size={20} /></button>

                <div className="text-center mb-6 border-b-2 border-dashed border-black pb-6">
                    <h3 className="text-2xl font-black uppercase tracking-widest">E-BILL</h3>
                    <p className="text-xs text-neutral-500">Smart Retail Systems</p>
                </div>

                <div className="space-y-1 mb-6">
                    <div className="flex justify-between"><span>Date:</span> <span>{new Date(order.timestamp).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Order ID:</span> <span className="text-[10px]">{order.order_id}</span></div>
                    <div className="flex justify-between"><span>Store:</span> <span>{order.store_name || "Retailer " + order.retailer_id}</span></div>
                    <div className="flex justify-between"><span>Payment:</span> <span>{order.payment || "UPI"}</span></div>
                </div>

                <table className="w-full mb-6 text-left">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="pb-2">Item</th>
                            <th className="pb-2 text-right">Qty</th>
                            <th className="pb-2 text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(items).map((item, i) => (
                            <tr key={i}>
                                <td className="py-1">{item.name || "Product"}</td>
                                <td className="py-1 text-right">{item.qty}</td>
                                <td className="py-1 text-right">₹{parseFloat((item.price * item.qty) || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="border-t-2 border-black pt-4 space-y-1 font-bold">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>₹{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tax (5%):</span> <span>₹{totalTax.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Delivery:</span> <span>₹25.00</span></div>
                    <div className="flex justify-between text-xl mt-2 border-t border-dashed border-black pt-2">
                        <span>TOTAL</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-8 text-center text-[10px] text-neutral-500 uppercase">
                    This is a computer generated receipt.<br />Thank you for shopping!
                </div>

                <button
                    onClick={() => alert("Simulating Download/Print...")}
                    className="w-full mt-4 bg-black text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-neutral-800"
                >
                    <FileText size={16} /> Print / Download
                </button>
            </div>
        </div>
    );
};

const StoreSelectionView = ({ stores, handleSelectStore }) => (
    <div className="space-y-6 animate-in fade-in">
        <header className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight">Select a Store</h2>
            <p className="text-neutral-400">Choose a store nearby to start shopping.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map(s => (
                <button
                    key={s.retailer_id}
                    onClick={() => handleSelectStore(s)}
                    className="bg-neutral-900 border border-white/5 p-6 rounded-3xl text-left hover:border-blue-500/50 hover:bg-neutral-800 transition-all group"
                >
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Store size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{s.name}</h3>
                    <p className="text-neutral-500 text-sm flex items-center gap-2">
                        <MapPin size={14} /> {s.location || "Local"}
                    </p>
                </button>
            ))}
        </div>
        {stores.length === 0 && <div className="text-neutral-500 text-center py-10">No stores available right now.</div>}
    </div>
);

const ProductDisplayView = ({ selectedStore, setSelectedStore, setView, products, cart, updateCart, calculateTotal }) => (
    <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-300">
        <div className="flex items-center justify-between sticky top-24 bg-black/90 backdrop-blur-xl p-4 -mx-4 z-10 border-b border-white/5">
            <div>
                <h2 className="text-2xl font-bold text-white">{selectedStore?.name}</h2>
                <p className="text-neutral-500 text-sm">Browsing Products</p>
            </div>
            <button onClick={() => { setSelectedStore(null); setView("home"); }} className="text-xs text-red-500 hover:underline">
                Change Store
            </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => {
                const qty = cart[p.product_id]?.qty || 0;
                return (
                    <div key={p.product_id} className="bg-neutral-900 border border-white/5 p-4 rounded-3xl flex flex-col justify-between">
                        <div className="mb-4">
                            <div className="w-full aspect-square bg-neutral-800 rounded-2xl flex items-center justify-center text-4xl mb-3">
                                {p.image || "📦"}
                            </div>
                            <h3 className="font-bold text-white leading-tight">{p.name}</h3>
                            <div className="text-neutral-500 text-sm mt-1">{p.category}</div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="text-white font-bold">₹{p.price}</div>
                            {qty === 0 ? (
                                <button onClick={() => updateCart(p.product_id, 1, p)} className="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-neutral-200">
                                    ADD
                                </button>
                            ) : (
                                <div className="flex items-center bg-neutral-800 rounded-xl overflow-hidden">
                                    <button onClick={() => updateCart(p.product_id, -1, p)} className="px-3 py-2 text-white hover:bg-neutral-700"><Minus size={14} /></button>
                                    <span className="px-1 text-sm font-bold text-white">{qty}</span>
                                    <button onClick={() => updateCart(p.product_id, 1, p)} className="px-3 py-2 text-white hover:bg-neutral-700"><Plus size={14} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
        {products.length === 0 && <div className="text-neutral-500 text-center py-20">No products found in this store.</div>}

        {Object.keys(cart).length > 0 && (
            <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 md:w-96 z-50">
                <button onClick={() => setView("cart")} className="w-full bg-blue-600 text-white p-4 rounded-2xl shadow-2xl shadow-blue-600/20 flex items-center justify-between font-bold hover:bg-blue-500 transition-all">
                    <div className="flex items-center gap-3">
                        <div className="bg-black/20 px-3 py-1 rounded-lg text-sm">{Object.keys(cart).length} items</div>
                        <span>₹{calculateTotal()}</span>
                    </div>
                    <div className="flex items-center gap-2">View Cart <ChevronRight size={18} /></div>
                </button>
            </div>
        )}
    </div>
);

const CartView = ({ setView, cart, updateCart, calculateTotal }) => (
    <div className="space-y-6 max-w-2xl mx-auto animate-in slide-in-from-bottom-10 fade-in">
        <header className="flex items-center gap-4 mb-8">
            <button onClick={() => setView("store")} className="p-2 bg-neutral-900 rounded-xl hover:bg-neutral-800 text-white"><ArrowLeft size={20} /></button>
            <h2 className="text-3xl font-black text-white">Your Cart</h2>
        </header>

        <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 space-y-6">
            {Object.values(cart).length === 0 ? (
                <div className="text-center py-10 text-neutral-500">Your cart is empty.</div>
            ) : (
                Object.values(cart).map(item => (
                    <div key={item.product_id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center text-xl">{item.image || "📦"}</div>
                            <div>
                                <div className="text-white font-bold">{item.name}</div>
                                <div className="text-neutral-500 text-sm">₹{item.price} x {item.qty}</div>
                            </div>
                        </div>
                        <div className="flex items-center bg-black border border-white/10 rounded-xl">
                            <button onClick={() => updateCart(item.product_id, -1, item)} className="p-3 text-white hover:text-red-500 transition-colors"><Minus size={16} /></button>
                            <span className="w-8 text-center text-sm font-bold text-white">{item.qty}</span>
                            <button onClick={() => updateCart(item.product_id, 1, item)} className="p-3 text-white hover:text-blue-500 transition-colors"><Plus size={16} /></button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {Object.keys(cart).length > 0 && (
            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="space-y-2 pb-4 border-b border-white/10">
                    {Object.values(cart).map(item => (
                        <div key={item.product_id} className="flex justify-between text-neutral-400 text-sm">
                            <span>{item.name} x {item.qty}</span>
                            <span>₹{item.price * item.qty}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-neutral-400 text-sm">
                    <span>Item Total</span>
                    <span>₹{calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-neutral-400 text-sm">
                    <span>Delivery Fee</span>
                    <span>₹25</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between text-white font-bold text-lg">
                    <span>To Pay</span>
                    <span>₹{calculateTotal() + 25}</span>
                </div>
                <button onClick={() => setView('checkout')} className="w-full bg-white text-black py-4 rounded-xl font-black text-lg hover:bg-neutral-200 transition-all mt-4">
                    Proceed to Checkout
                </button>
            </div>
        )}
    </div>
);

const CheckoutView = ({
    setView, addresses, setAddresses, selectedAddress, setSelectedAddress,
    selectedPayment, setSelectedPayment, newAddress, setNewAddress,
    addingAddress, setAddingAddress, handleAddAddress, confirmOrder, loading, calculateTotal
}) => {
    // We can define internal handlers here if needed, but props are fine
    // Since this is outside the main component, it won't unmount on parent state changes unless unmounted by router/view logic

    return (
        <div className="space-y-6 max-w-xl mx-auto animate-in fade-in">
            <header className="flex items-center gap-4 mb-4">
                <button onClick={() => setView("cart")} className="p-2 bg-neutral-900 rounded-xl hover:bg-neutral-800 text-white"><ArrowLeft size={20} /></button>
                <h2 className="text-3xl font-black text-white">Checkout</h2>
            </header>

            <div className="space-y-4">
                {/* Address Section */}
                <section className="bg-neutral-900 p-6 rounded-3xl border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2"><MapPin size={18} className="text-blue-500" /> Delivery Address</h3>
                        <button onClick={() => setAddingAddress(!addingAddress)} className="text-xs bg-white/10 px-3 py-1 rounded-lg hover:bg-white text-white hover:text-black transition-all">
                            {addingAddress ? 'Cancel' : '+ Add New'}
                        </button>
                    </div>

                    {addingAddress && (
                        <div className="mb-4 flex gap-2">
                            <input
                                type="text"
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)}
                                placeholder="Enter full address..."
                                className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none"
                                autoFocus
                            />
                            <button onClick={handleAddAddress} className="bg-blue-500 text-white px-4 rounded-xl font-bold">Save</button>
                        </div>
                    )}

                    <div className="space-y-3">
                        {addresses.map(addr => (
                            <div
                                key={addr.id}
                                onClick={() => setSelectedAddress(addr.id)}
                                className={`p-4 rounded-xl text-sm border cursor-pointer transition-all flex items-start gap-3 ${selectedAddress === addr.id ? 'bg-blue-500/10 border-blue-500' : 'bg-black border-white/5 hover:border-white/20'}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${selectedAddress === addr.id ? 'border-blue-500' : 'border-neutral-600'}`}>
                                    {selectedAddress === addr.id && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-bold ${selectedAddress === addr.id ? 'text-blue-500' : 'text-white'}`}>{addr.type}</p>
                                    <p className="text-neutral-400">{addr.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Payment Section */}
                <section className="bg-neutral-900 p-6 rounded-3xl border border-white/5">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><CreditCard size={18} className="text-green-500" /> Payment Method</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {['UPI', 'Card', 'COD'].map(method => (
                            <div
                                key={method}
                                onClick={() => setSelectedPayment(method)}
                                className={`p-4 rounded-xl min-w-[120px] flex flex-col justify-between h-24 cursor-pointer relative border transition-all ${selectedPayment === method
                                        ? 'bg-black border-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                                        : 'bg-black border-white/5 text-neutral-400 hover:border-white/20'
                                    }`}
                            >
                                {selectedPayment === method && <div className="absolute top-2 right-2 text-green-500"><CheckCircle size={16} /></div>}
                                <span className="font-bold">{method}</span>
                                <span className="text-xs opacity-60">
                                    {method === 'UPI' ? 'Google Pay' : method === 'Card' ? '**** 4242' : 'Cash'}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <button
                    onClick={confirmOrder}
                    disabled={loading}
                    className="w-full bg-green-500 text-black py-4 rounded-2xl font-black text-xl hover:bg-green-400 transition-all shadow-[0_10px_30px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Processing..." : `Pay ₹${calculateTotal() + 25}`}
                </button>
            </div>
        </div>
    );
};

const OrderSuccessView = ({ currentOrder, setViewBillOrder, setView, fetchInitialData }) => (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500 pt-10">
        <header className="text-center">
            <div className="inline-flex w-24 h-24 bg-green-500 rounded-full items-center justify-center text-black mb-4 shadow-[0_0_50px_rgba(34,197,94,0.4)] animate-bounce">
                <CheckCircle size={48} strokeWidth={3} />
            </div>
            <h2 className="text-4xl font-black text-white">Order Placed!</h2>
            <p className="text-neutral-400 max-w-sm mx-auto mt-2">
                Accepted by <span className="text-white font-bold">{currentOrder?.store_name}</span>
            </p>
        </header>

        {/* Delivery Tracking Mock */}
        <div className="w-full max-w-md space-y-4">
            <div className="bg-neutral-900 border border-white/5 p-6 rounded-3xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-left">
                        <div className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Estimated Arrival</div>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            12 Mins <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-full">Live</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white animate-pulse">
                        <Bike size={24} />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-neutral-800 rounded-full mb-8 overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-1/3 bg-blue-500 rounded-full animate-[shimmer_2s_infinite]"></div>
                </div>

                {/* Steps */}
                <div className="space-y-6 relative ml-2 border-l-2 border-dashed border-neutral-800">
                    <div className="relative pl-6">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-black"></div>
                        <h4 className="text-white font-bold text-sm">Order Accepted</h4>
                        <p className="text-neutral-500 text-xs">Restaurant is processing your items.</p>
                    </div>
                    <div className="relative pl-6 opacity-40">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-neutral-700 border-4 border-black"></div>
                        <h4 className="text-white font-bold text-sm">Out for Delivery</h4>
                        <p className="text-neutral-500 text-xs">Partner assigned: Suresh K.</p>
                    </div>
                    <div className="relative pl-6 opacity-40">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-neutral-700 border-4 border-black"></div>
                        <h4 className="text-white font-bold text-sm">Arriving Soon</h4>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
                onClick={() => setViewBillOrder(currentOrder)}
                className="flex items-center justify-center gap-2 bg-neutral-800 text-white px-6 py-4 rounded-xl font-bold hover:bg-neutral-700 transition-all border border-white/10"
            >
                <FileText size={18} /> View E-Bill
            </button>

            <button onClick={() => { setView("orders"); fetchInitialData(); }} className="text-neutral-500 hover:text-white underline text-sm">
                View My Orders
            </button>
        </div>
    </div>
);

const OrdersListView = ({ setView, orders, setViewBillOrder }) => (
    <div className="space-y-6 animate-in fade-in">
        <header className="flex items-center gap-4 mb-8">
            <button onClick={() => setView("home")} className="p-2 bg-neutral-900 rounded-xl hover:bg-neutral-800 text-white"><ArrowLeft size={20} /></button>
            <h2 className="text-3xl font-black text-white">My Orders</h2>
        </header>
        <div className="grid gap-4">
            {orders.map((o, idx) => (
                <div key={idx} className="bg-neutral-900 border border-white/5 p-6 rounded-3xl flex justify-between items-center group hover:border-white/10 transition-all">
                    <div>
                        <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest mb-1">
                            {o.order_id || `ORD-OLD-${idx}`}
                        </div>
                        <div className="text-white font-bold text-lg">₹{o.total_amount || 0}</div>
                        <div className="text-neutral-500 text-sm">{new Date(o.timestamp).toLocaleDateString()}</div>
                        {o.payment && <div className="text-xs text-neutral-600 mt-1">{o.payment}</div>}
                    </div>
                    <div className="text-right">
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase mb-2">
                            {o.status || "Completed"}
                        </div>
                        <button
                            onClick={() => setViewBillOrder(o)}
                            className="block text-sm text-neutral-400 hover:text-white flex items-center justify-end gap-1 px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
                        >
                            <FileText size={14} /> View Bill
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default function CustomerDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentView = searchParams.get("view") || "home";

    const [selectedStore, setSelectedStore] = useState(null);
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState({});
    const [orders, setOrders] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [viewBillOrder, setViewBillOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    // Checkout State
    const [addresses, setAddresses] = useState([
        { id: 1, type: "Home", text: "Block A, IIITDM Campus, Kancheepuram, 600127" }
    ]);
    const [selectedAddress, setSelectedAddress] = useState(1);
    const [selectedPayment, setSelectedPayment] = useState("UPI");
    const [newAddress, setNewAddress] = useState("");
    const [addingAddress, setAddingAddress] = useState(false);

    const userId = localStorage.getItem("user_id");
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) { navigate("/auth"); return; }

        if (["store", "cart", "checkout"].includes(currentView) && !selectedStore) {
            setView("home");
        }

        fetchInitialData();
    }, [userId]);

    const setView = (viewName) => {
        setSearchParams({ view: viewName });
    };

    const fetchInitialData = async () => {
        try {
            const retailers = await api.getRetailers();
            setStores(retailers);
            const userOrders = await api.getUserOrders(userId);
            setOrders(userOrders);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSelectStore = async (store) => {
        setSelectedStore(store);
        setLoading(true);
        try {
            let prods = [];
            try {
                prods = await api.getRetailerProducts(store.retailer_id);
            } catch (e) { console.log("Failed to load retailer products, using mock"); }

            if (!prods || prods.length === 0) prods = MOCK_PRODUCTS;
            setProducts(prods);
            setView("store");
        } catch (e) {
            alert("Failed to enter store");
        } finally {
            setLoading(false);
        }
    };

    const updateCart = (pid, delta, product) => {
        setCart(prev => {
            const currentQty = (prev[pid]?.qty || 0);
            const newQty = currentQty + delta;

            if (newQty <= 0) {
                const { [pid]: _, ...rest } = prev;
                return rest;
            }
            return {
                ...prev,
                [pid]: { qty: newQty, ...product }
            };
        });
    };

    const calculateTotal = () => {
        return Object.values(cart).reduce((acc, item) => acc + (item.price * item.qty), 0);
    };

    const handleAddAddress = () => {
        if (!newAddress.trim()) return;
        const newId = addresses.length + 1;
        setAddresses([...addresses, { id: newId, type: "New", text: newAddress }]);
        setSelectedAddress(newId);
        setNewAddress("");
        setAddingAddress(false);
    };

    const confirmOrder = async () => {
        if (!selectedStore) return;
        setLoading(true);

        const itemsMap = {};
        Object.values(cart).forEach(item => {
            itemsMap[item.product_id] = item.qty;
        });

        try {
            await api.placeOrder(userId, selectedStore.retailer_id, itemsMap);

            const newOrder = {
                order_id: `ORD-${Date.now()}`,
                retailer_id: selectedStore.retailer_id,
                store_name: selectedStore.name,
                items: cart,
                total: calculateTotal(),
                timestamp: new Date().toISOString(),
                status: "Order Placed",
                address: addresses.find(a => a.id === selectedAddress),
                payment: selectedPayment
            };

            setCurrentOrder(newOrder);
            setCart({});
            setView("order-success");
            fetchInitialData();
        } catch (e) {
            alert("Order failed! " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans selection:bg-blue-500 selection:text-white">
            <BillModal viewBillOrder={viewBillOrder} setViewBillOrder={setViewBillOrder} />

            <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3" onClick={() => setView('home')}>
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center font-black italic text-lg shadow-lg shadow-blue-500/20 cursor-pointer">B</div>
                    <span className="font-bold text-xl tracking-tight hidden md:block">BlinkClone</span>
                </div>

                <div className="flex items-center gap-4">
                    {userId && <div className="text-xs text-neutral-500 font-mono hidden md:block">ID: {userId}</div>}
                    <button onClick={() => setView('orders')} className="p-2 hover:bg-neutral-800 rounded-full transition-all"><Package size={20} /></button>
                    <button onClick={() => { localStorage.clear(); navigate("/auth"); }} className="p-2 hover:bg-red-500/20 text-red-500 rounded-full transition-all"><LogOut size={20} /></button>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto p-6 md:p-8">
                {currentView === 'home' && <StoreSelectionView stores={stores} handleSelectStore={handleSelectStore} />}
                {currentView === 'store' && <ProductDisplayView selectedStore={selectedStore} setSelectedStore={setSelectedStore} setView={setView} products={products} cart={cart} updateCart={updateCart} calculateTotal={calculateTotal} />}
                {currentView === 'cart' && <CartView setView={setView} cart={cart} updateCart={updateCart} calculateTotal={calculateTotal} />}
                {currentView === 'checkout' && <CheckoutView
                    setView={setView}
                    addresses={addresses}
                    setAddresses={setAddresses}
                    selectedAddress={selectedAddress}
                    setSelectedAddress={setSelectedAddress}
                    selectedPayment={selectedPayment}
                    setSelectedPayment={setSelectedPayment}
                    newAddress={newAddress}
                    setNewAddress={setNewAddress}
                    addingAddress={addingAddress}
                    setAddingAddress={setAddingAddress}
                    handleAddAddress={handleAddAddress}
                    confirmOrder={confirmOrder}
                    loading={loading}
                    calculateTotal={calculateTotal}
                />}
                {currentView === 'order-success' && <OrderSuccessView currentOrder={currentOrder} setViewBillOrder={setViewBillOrder} setView={setView} fetchInitialData={fetchInitialData} />}
                {currentView === 'orders' && <OrdersListView setView={setView} orders={orders} setViewBillOrder={setViewBillOrder} />}
            </main>

        </div>
    );
}
