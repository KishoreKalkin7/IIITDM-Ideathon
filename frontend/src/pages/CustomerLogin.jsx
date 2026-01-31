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
        <div className="min-h-screen p-8 flex flex-col items-center bg-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h2>
                    <p className="mt-2 text-sm text-neutral-400">Select your profile to continue</p>
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
