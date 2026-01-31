import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function AdminLogin() {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Simple bypass for MVP
        navigate("/admin/dashboard");
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
                <div className="flex justify-center mb-6">
                    <div className="bg-purple-500/20 p-4 rounded-xl text-purple-500">
                        <ShieldCheck size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-2">Admin Login</h2>
                <p className="text-neutral-400 text-center mb-8 text-sm">Secure access for platform administrators</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-neutral-500 font-bold mb-2">Username</label>
                        <input type="text" className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors" placeholder="admin" />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-neutral-500 font-bold mb-2">Password</label>
                        <input type="password" className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors" placeholder="••••••" />
                    </div>

                    <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition-colors mt-4">
                        Access Dashboard
                    </button>
                </form>

                <button onClick={() => navigate("/")} className="w-full text-center text-neutral-500 text-sm mt-6 hover:text-white">
                    Cancel
                </button>
            </div>
        </div>
    );
}
