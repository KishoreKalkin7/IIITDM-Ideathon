import React, { useState } from 'react';

const UploadSection = ({ title, endpoint, description }) => {
    const [status, setStatus] = useState(null); // success, error, uploading
    const [message, setMessage] = useState("");

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStatus("uploading");
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`http://localhost:8000/${endpoint}`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(`Successfully uploaded! Processed ${data.count} records.`);
            } else {
                setStatus("error");
                setMessage(`Error: ${data.detail || "Upload failed"}`);
            }
        } catch (err) {
            setStatus("error");
            setMessage("Network error. Ensure backend is running.");
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-4">{description}</p>

            <div className="flex items-center gap-4">
                <input
                    type="file"
                    accept=".csv, .xlsx, .json"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-600 file:text-white
            hover:file:bg-blue-700
          "
                />
            </div>

            {status === 'uploading' && <p className="text-blue-400 mt-2 text-sm">Uploading...</p>}
            {status === 'success' && <p className="text-green-400 mt-2 text-sm">✅ {message}</p>}
            {status === 'error' && <p className="text-red-400 mt-2 text-sm">❌ {message}</p>}
        </div>
    );
};

const ManageData = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mt-4">Manage Data</h2>
            <p className="text-gray-400">Upload your own datasets to override the system defaults. Supports CSV, Excel, and JSON.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UploadSection
                    title="Upload Products"
                    endpoint="upload/products"
                    description="Required columns: name, macro_category, micro_category, price, dimensions, margin"
                />
                <UploadSection
                    title="Upload Sales History"
                    endpoint="upload/sales"
                    description="Required columns: product_id, quantity, timestamp"
                />
            </div>

            <div className="bg-gray-900/50 p-4 rounded border border-gray-700 mt-8">
                <h4 className="font-bold text-gray-300 mb-2">Note on Headers:</h4>
                <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                    <li><strong>Products File:</strong> id, name, macro_category, micro_category, price, dimensions, margin</li>
                    <li><strong>Sales File:</strong> product_id, quantity, timestamp</li>
                </ul>
            </div>
        </div>
    );
};

export default ManageData;
