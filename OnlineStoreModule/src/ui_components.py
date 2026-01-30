import streamlit as st

def inject_custom_css():
    st.markdown("""
    <style>
        .stApp { background-color: #0E1117; color: #FAFAFA; }
        
        .product-card {
            background-color: #262730;
            border-radius: 12px;
            padding: 15px;
            border: 1px solid #363B4C;
            margin-bottom: 10px;
            transition: transform 0.2s;
        }
        .product-card:hover { transform: translateY(-2px); border-color: #FF4B4B; }

        .retailer-card {
            background: linear-gradient(135deg, #1f4037, #99f2c8); 
            color: #1a1a1a;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .retailer-card h3 { margin: 0; color: #000; font-weight: 800; }
        .retailer-card p { margin: 0; font-weight: 500; }

        .explanation-tag {
            background-color: rgba(0, 200, 81, 0.2);
            color: #00C851;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            margin-top: 8px;
            display: inline-block;
        }
        
        .discount-badge {
            background-color: #FF4B4B;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: bold;
            margin-right: 5px;
        }
    </style>
    """, unsafe_allow_html=True)

def get_category_emoji(category):
    return {'Beverages': '🥤', 'Junk': '🍔', 'Healthy': '🥗', 'Essentials': '🧴'}.get(category, '📦')

def render_retailer_card(retailer):
    st.markdown(f"""
    <div class="retailer-card">
        <h3>🏪 {retailer['name']}</h3>
        <p>📍 {retailer['location']}</p>
        <p>⭐ {retailer.get('rating', 'New')} | 🚚 ₹{retailer['delivery_charge']}</p>
    </div>
    """, unsafe_allow_html=True)
    if st.button(f"Visit Store", key=f"visit_{retailer['retailer_id']}"):
        return True
    return False

def render_product_card(product, add_btn=True):
    # Discount Logic
    price_html = f"₹{product['price']}"
    if product.get('discount', 0) > 0:
        discounted = product['price'] * (1 - product['discount']/100)
        price_html = f"<span class='discount-badge'>{product['discount']}% OFF</span> <s style='color: #888;'>₹{product['price']}</s> <b>₹{discounted:.1f}</b>"
        
    stock_status = ""
    if product['stock'] <= 0:
        stock_status = "<span style='color: #FF4B4B; font-weight: bold;'>OUT OF STOCK</span>"
    elif product['stock'] < 5:
        stock_status = f"<span style='color: orange;'>Only {product['stock']} left!</span>"

    card_html = f"""
    <div class="product-card">
        <h4 style="margin: 0;">{get_category_emoji(product['category'])} {product['name']}</h4>
        <p style="font-size: 1.1rem; margin: 5px 0;">{price_html}</p>
        <p style="font-size: 0.8rem;">{stock_status}</p>
        <div class="explanation-tag">✨ {product['explanation']}</div>
    </div>
    """
    st.markdown(card_html, unsafe_allow_html=True)
    
    if add_btn and product['stock'] > 0:
        if st.button(f"Add to Cart", key=f"add_{product['product_id']}"):
            return True
    return False
