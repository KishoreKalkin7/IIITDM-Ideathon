import React, { useEffect, useState } from 'react';

const Overview = () => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetch('http://localhost:8000/analytics/performance')
            .then(res => res.json())
            .then(data => {
                setAnalytics(data);
                setLoading(false);
            })
            .catch(err => console.error("Failed to fetch analytics", err));
    }, []);

    if (loading) return <div className="text-center p-10">Loading Real-time Data...</div>;

    // Calculate Aggregates
    const totalRevenue = analytics.reduce((acc, item) => acc + item.revenue, 0);
    const totalSales = analytics.reduce((acc, item) => acc + item.sales_velocity, 0);

    // Filter Data
    const filteredAnalytics = analytics.filter(item =>
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.micro_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.macro_category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* KPI Cards */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-gray-400 text-sm uppercase">Total Revenue</h3>
                    <p className="text-3xl font-bold text-green-400">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-gray-400 text-sm uppercase">Units Sold (Last 7 Days)</h3>
                    <p className="text-3xl font-bold text-blue-400">{totalSales}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-gray-400 text-sm uppercase">Active Products</h3>
                    <p className="text-3xl font-bold text-purple-400">{analytics.length}</p>
                </div>
            </div>

            {/* Product Performance Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-semibold">Category Performance Breakdown</h2>
                    <input
                        type="text"
                        placeholder="Search products or categories..."
                        className="bg-gray-900 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-64 p-2.5"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-700/50 text-gray-200 uppercase">
                            <tr>
                                <th className="p-4">Product Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Sales Velocity</th>
                                <th className="p-4">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredAnalytics.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 text-white font-medium">{item.product.name}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                                            {item.product.micro_category}
                                        </span>
                                    </td>
                                    <td className="p-4">{item.sales_velocity}</td>
                                    <td className="p-4 text-green-400">₹{item.revenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Overview;
