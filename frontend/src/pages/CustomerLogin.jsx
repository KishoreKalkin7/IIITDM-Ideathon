import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { User, ChevronRight } from "lucide-react";

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
        // Mock Google Login - Log in as first available user or create a session
        const targetUser = users.length > 0 ? users[0].user_id : "U001";
        try {
            await api.loginUser(targetUser);
            localStorage.setItem("user_id", targetUser);
            navigate("/customer/dashboard");
        } catch (e) {
            // Even if backend fails (e.g. user doesn't exist), for this mock we allow entry
            localStorage.setItem("user_id", targetUser);
            navigate("/customer/dashboard");
        }
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
        <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="text-4xl font-black tracking-tight text-white mb-2">Get Groceries in Minutes</h2>
                    <p className="text-neutral-400">Log in to start ordering from your local favorites.</p>
                </div>

                <button 
                    onClick={handleGoogleLogin}
                    className="w-full h-14 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all text-lg"
                >
                    <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-black text-neutral-500">Or continue with profile</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center text-neutral-500">Loading profiles...</div>
                    ) : (
                        users.map((u) => (
                            <button
                                key={u.user_id}
                                onClick={() => handleLogin(u.user_id)}
                                className="w-full h-16 bg-neutral-900 border border-white/5 hover:border-blue-500/50 hover:bg-neutral-800 rounded-xl flex items-center px-4 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-colors">
                                    <User size={20} />
                                </div>
                                <div className="ml-4 text-left flex-1">
                                    <div className="text-white font-medium">{u.name}</div>
                                    <div className="text-neutral-500 text-xs">ID: {u.user_id}</div>
                                </div>
                                <ChevronRight className="text-neutral-600 group-hover:text-white transition-colors" size={20} />
                            </button>
                        ))
                    )}
                </div>

                <button onClick={() => navigate("/")} className="w-full text-neutral-500 text-sm hover:text-white transition-colors">
                    ← Return to Role Selection
                </button>
            </div>
        </div>
    );
}
