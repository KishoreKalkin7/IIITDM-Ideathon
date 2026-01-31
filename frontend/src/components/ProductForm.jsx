import { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';

export default function ProductForm({
  mode = 'add',
  product = null,
  retailerId,
  onClose,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    discount: '0',
    combo_offer: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Beverages', 'Junk', 'Healthy', 'Essentials',
    'Soft Drinks', 'Juices', 'Chips', 'Biscuits',
    'Personal Care', 'Daily Groceries', 'Packaged Foods'
  ];

  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        price: product.price?.toString() || '',
        stock: product.stock_count?.toString() || '',
        discount: product.discount_pct?.toString() || '0',
        combo_offer: product.combo_offer || '',
        imageUrl: product.imageUrl || ''
      });
      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
        // If it's a URL (not a file path), enable URL input mode
        if (product.imageUrl.startsWith('http')) {
          setUseUrlInput(true);
        }
      }
    }
  }, [mode, product]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setImageFile(file);
      setFormData({ ...formData, imageUrl: '' }); // Clear URL when file is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, imageUrl: url });
    if (url) {
      setImagePreview(url);
      setImageFile(null); // Clear file when URL is entered
    } else {
      setImagePreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.name || !formData.category || !formData.price || !formData.stock) {
        throw new Error('Please fill in all required fields');
      }

      const price = parseFloat(formData.price);
      const stock = parseInt(formData.stock);
      const discount = parseFloat(formData.discount);

      if (isNaN(price) || price < 0) {
        throw new Error('Price must be a valid positive number');
      }
      if (isNaN(stock) || stock < 0) {
        throw new Error('Stock must be a valid positive integer');
      }
      if (isNaN(discount) || discount < 0 || discount > 100) {
        throw new Error('Discount must be between 0 and 100');
      }

      const productData = {
        name: formData.name,
        category: formData.category,
        price: price,
        stock: stock,
        discount: discount,
        combo_offer: formData.combo_offer,
        imageUrl: formData.imageUrl
      };

      const apiUrl = 'http://localhost:8000';
      let productId = product?.product_id;

      // Add or Update product
      if (mode === 'add') {
        const response = await fetch(`${apiUrl}/retailers/${retailerId}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });

        if (!response.ok) {
          throw new Error('Failed to add product');
        }

        const data = await response.json();
        productId = data.product_id;
      } else {
        const response = await fetch(`${apiUrl}/retailers/${retailerId}/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });

        if (!response.ok) {
          throw new Error('Failed to update product');
        }
      }

      // Upload image if selected
      if (imageFile && productId) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        const imageResponse = await fetch(`${apiUrl}/retailers/${retailerId}/products/${productId}/upload-image`, {
          method: 'POST',
          body: imageFormData
        });

        if (!imageResponse.ok) {
          console.error('Image upload failed');
        }
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center sticky top-0 bg-neutral-900">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-2">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Product Image */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Product Image
            </label>

            {/* Toggle between URL and File Upload */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setUseUrlInput(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!useUrlInput
                    ? 'bg-white text-black'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUseUrlInput(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${useUrlInput
                    ? 'bg-white text-black'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
              >
                Image URL
              </button>
            </div>

            <div className="flex items-start gap-4">
              {imagePreview && (
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-neutral-700 flex-shrink-0 bg-neutral-800">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="gray">No Image</text></svg>';
                    }}
                  />
                </div>
              )}

              {useUrlInput ? (
                <div className="flex-1">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white"
                  />
                  <p className="text-xs text-neutral-500 mt-2">Paste a direct image URL</p>
                </div>
              ) : (
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 rounded-lg p-6 cursor-pointer hover:border-neutral-600 transition-colors">
                  <Upload className="text-neutral-500 mb-2" size={32} />
                  <span className="text-sm text-neutral-400">Click to upload image</span>
                  <span className="text-xs text-neutral-600 mt-1">PNG, JPG, GIF up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white"
              placeholder="0"
              min="0"
              max="100"
            />
          </div>

          {/* Combo Offer */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Combo Offer
            </label>
            <input
              type="text"
              value={formData.combo_offer}
              onChange={(e) => setFormData({ ...formData, combo_offer: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white"
              placeholder="e.g., Buy 2 Get 1 Free"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-neutral-700 text-neutral-300 font-medium hover:bg-neutral-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? 'Saving...' : mode === 'add' ? 'Add Product' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
