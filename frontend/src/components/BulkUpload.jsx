import { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from 'lucide-react';

export default function BulkUpload({ retailerId, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const isValid = selectedFile.name.endsWith('.csv') ||
                selectedFile.name.endsWith('.xlsx') ||
                selectedFile.name.endsWith('.xls');

            if (!isValid) {
                setError('Please select a .csv or .xlsx file');
                setFile(null);
                return;
            }

            setFile(selectedFile);
            setError('');
            setResult(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            const fakeEvent = { target: { files: [droppedFile] } };
            handleFileChange(fakeEvent);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setUploading(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`http://localhost:8000/retailers/${retailerId}/products/bulk-upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Upload failed');
            }

            const data = await response.json();
            setResult(data);

            if (data.added_count > 0) {
                onSuccess?.();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const downloadSampleCSV = () => {
        const csvContent = `name,category,price,stock,discount,combo_offer
Coca Cola,Beverages,40.00,100,5,
Lays Chips,Junk,20.00,150,0,Buy 2 Get 1
Organic Milk,Healthy,60.00,50,10,
Bread Loaf,Essentials,35.00,80,0,`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_products.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-neutral-800 flex justify-between items-center sticky top-0 bg-neutral-900">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Bulk Product Upload</h2>
                        <p className="text-sm text-neutral-400 mt-1">Upload multiple products via CSV or Excel file</p>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white p-2">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Download Sample Template */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                        <FileSpreadsheet className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <h3 className="text-white font-medium mb-1">Need a template?</h3>
                            <p className="text-sm text-neutral-400 mb-2">
                                Download our sample CSV to see the expected format
                            </p>
                            <button
                                onClick={downloadSampleCSV}
                                className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2"
                            >
                                <Download size={16} />
                                Download Sample CSV
                            </button>
                        </div>
                    </div>

                    {/* File Upload Area */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-neutral-700 rounded-lg p-12 text-center hover:border-neutral-600 transition-colors"
                    >
                        {file ? (
                            <div className="flex flex-col items-center">
                                <FileSpreadsheet className="text-emerald-400 mb-4" size={48} />
                                <p className="text-white font-medium mb-1">{file.name}</p>
                                <p className="text-sm text-neutral-400 mb-4">
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-sm text-red-400 hover:text-red-300"
                                >
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer">
                                <Upload className="mx-auto text-neutral-500 mb-4" size={48} />
                                <p className="text-white font-medium mb-2">
                                    Drag and drop or click to browse
                                </p>
                                <p className="text-sm text-neutral-400">
                                    Supports .csv, .xlsx, and .xls files
                                </p>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                            <div className="flex-1">
                                <h3 className="text-red-400 font-medium">Upload Error</h3>
                                <p className="text-sm text-neutral-300 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Upload Results */}
                    {result && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
                                    <div className="text-sm text-neutral-400 mb-1">Total Rows</div>
                                    <div className="text-2xl font-bold text-white">{result.total_rows}</div>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                                    <div className="text-sm text-emerald-400 mb-1">Successfully Added</div>
                                    <div className="text-2xl font-bold text-emerald-400">{result.added_count}</div>
                                </div>
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                    <div className="text-sm text-red-400 mb-1">Errors</div>
                                    <div className="text-2xl font-bold text-red-400">{result.error_count}</div>
                                </div>
                            </div>

                            {/* Success Message */}
                            {result.added_count > 0 && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3">
                                    <CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <h3 className="text-emerald-400 font-medium">Upload Successful</h3>
                                        <p className="text-sm text-neutral-300 mt-1">
                                            {result.added_count} product{result.added_count !== 1 ? 's' : ''} added successfully
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Error Details */}
                            {result.errors && result.errors.length > 0 && (
                                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
                                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                                        <AlertCircle size={18} className="text-red-400" />
                                        Validation Errors
                                    </h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {result.errors.map((err, idx) => (
                                            <div key={idx} className="text-sm text-neutral-300 bg-neutral-900 p-2 rounded">
                                                {err}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-lg border border-neutral-700 text-neutral-300 font-medium hover:bg-neutral-800 transition-colors"
                            disabled={uploading}
                        >
                            {result ? 'Close' : 'Cancel'}
                        </button>
                        {!result && (
                            <button
                                onClick={handleUpload}
                                className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!file || uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload Products'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
