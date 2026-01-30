import React, { useEffect, useState } from 'react';

const Recommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/optimization/recommendations')
            .then(res => res.json())
            .then(data => {
                setRecommendations(data);
                setLoading(false);
            })
            .catch(err => console.error("Failed to fetch recommendations", err));
    }, []);

    if (loading) return <div className="text-center p-10">Running Optimization Algorithms...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold mt-4">Shelf Optimization Suggestions</h2>
                    <p className="text-gray-400">AI-driven recommendations to maximize sales per square foot.</p>
                </div>
                <div className="bg-blue-900/30 px-4 py-2 rounded border border-blue-500/30 text-blue-300 text-sm">
                    {recommendations.length} Actions Recommended
                </div>
            </div>

            <div className="grid gap-4">
                {recommendations.length === 0 ? (
                    <div className="p-10 text-center bg-gray-800 rounded-xl border border-gray-700">
                        <p className="text-green-400 text-lg">System Optimized. No changes needed.</p>
                    </div>
                ) : (
                    recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-center shadow-lg hover:border-blue-500 transition-colors group">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                        {rec.product_name}
                                    </h3>
                                    <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                                        ID: {rec.product_id}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm">{rec.reason}</p>
                            </div>

                            <div className="flex items-center gap-6 mt-4 md:mt-0">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 uppercase">Current Zone</p>
                                    <p className="text-red-400 font-mono font-bold">{rec.current_zone}</p>
                                </div>
                                <div className="text-gray-600">→</div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 uppercase">Recommended</p>
                                    <p className="text-green-400 font-mono font-bold text-lg">{rec.recommended_zone}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Recommendations;
