import streamlit as st
import pandas as pd
import os
import sys
import json
import time

# Add src to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from logic_engine import RecommendationEngine
from ui_components import inject_custom_css, render_product_card, render_retailer_card, get_category_emoji

# --- Config ---
st.set_page_config(layout="wide", page_title="Unified Retail Market", page_icon="🏪")
inject_custom_css()

# --- Initialize Engine ---
@st.cache_resource
def get_engine():
    base = os.getcwd()
    paths = [os.path.join(base, 'data'), os.path.join(base, 'OnlineStoreModule', 'data')]
    data_path = 'data'
    for p in paths:
        if os.path.exists(p):
            data_path = p 
            break
    engine = RecommendationEngine(data_dir=data_path)
    engine.load_data()
    return engine

try:
    engine = get_engine()
    # Auto-reload if code changed and engine is stale
    if not hasattr(engine, 'get_retailer_notifications'):
        st.cache_resource.clear()
        engine = get_engine()
except:
    st.error("Engine failed to load.")
    st.stop()

# --- Session State ---
if 'role' not in st.session_state: st.session_state['role'] = None
if 'user_id' not in st.session_state: st.session_state['user_id'] = None
if 'retailer_id' not in st.session_state: st.session_state['retailer_id'] = None 
if 'active_store_id' not in st.session_state: st.session_state['active_store_id'] = None 
if 'cart' not in st.session_state: st.session_state['cart'] = {}
if 'view' not in st.session_state: st.session_state['view'] = 'home'

def clear_session():
    for key in ['role', 'user_id', 'retailer_id', 'active_store_id', 'cart', 'view']:
        if key in st.session_state: del st.session_state[key]
    st.session_state['role'] = None
    st.session_state['view'] = 'home'
    st.rerun()

# --- VIEW: Role Selection ---
def show_role_selection():
    st.markdown("<h1 style='text-align: center;'>🏪 Unified Retail Platform</h1>", unsafe_allow_html=True)
    st.markdown("<h3 style='text-align: center;'>Welcome to the Future of Retail</h3>", unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🛍️ Customer Access\n\nLogin / Register", use_container_width=True):
            st.session_state['role'] = 'Customer'
            st.session_state['view'] = 'login'
            st.rerun()
            
    with col2:
        if st.button("🏪 Retailer Access\n\nManage Store / Register", use_container_width=True):
            st.session_state['role'] = 'Retailer'
            st.session_state['view'] = 'login'
            st.rerun()

# --- VIEW: Customer Login/Register ---
def show_customer_login():
    if st.button("← Back", key="back_cust"):
        clear_session()
        
    st.subheader("🛍️ Customer Access")
    tab1, tab2 = st.tabs(["Login", "Create Account"])
    
    with tab1:
        users = engine.users
        options = {f"{r['name']} ({r['user_id']})": r['user_id'] for _, r in users.iterrows()}
        selected_key = st.selectbox("Select Profile", list(options.keys()))
        if st.button("Login"):
            st.session_state['user_id'] = options[selected_key]
            st.session_state['view'] = 'home'
            st.rerun()
            
    with tab2:
        with st.form("new_user_form"):
            new_name = st.text_input("Full Name")
            submitted = st.form_submit_button("Create Account")
            if submitted and new_name:
                uid = engine.create_user(new_name)
                st.session_state['user_id'] = uid
                st.session_state['view'] = 'survey' # Force Survey
                st.success(f"Account Created! ID: {uid}")
                time.sleep(1)
                st.rerun()

# --- VIEW: Retailer Login/Register ---
def show_retailer_login():
    if st.button("← Back", key="back_ret"):
        clear_session()
        
    st.subheader("🏪 Retailer Access")
    tab1, tab2 = st.tabs(["Login", "Register Store"])
    
    with tab1:
        retailers = engine.get_retailers()
        options = {r['name']: r['retailer_id'] for _, r in retailers.iterrows()}
        selected_name = st.selectbox("Select Store", list(options.keys()))
        if st.button("Unified Login"):
            st.session_state['retailer_id'] = options[selected_name]
            st.session_state['view'] = 'dashboard'
            st.rerun()
            
    with tab2:
        with st.form("new_retailer_form"):
            r_name = st.text_input("Store Name")
            r_loc = st.text_input("Location")
            r_fee = st.number_input("Delivery Fee (₹)", min_value=0)
            submitted = st.form_submit_button("Register Store")
            if submitted and r_name:
                rid = engine.create_retailer(r_name, r_loc, r_fee)
                st.session_state['retailer_id'] = rid
                st.session_state['view'] = 'dashboard'
                st.success(f"Store Registered! ID: {rid}")
                time.sleep(1)
                st.rerun()

# --- VIEW: Customer Survey ---
def show_survey():
    st.markdown("## 📝 Personalize Your Profile")
    st.info("Tell us a bit about yourself so we can curate the best products for you.")
    
    with st.form("survey_form"):
        col1, col2 = st.columns(2)
        with col1:
            age = st.number_input("Age", min_value=10, max_value=100, step=1, value=20)
            gender = st.selectbox("Gender", ["Male", "Female", "Non-binary", "Prefer not to say"])
        with col2:
            dietary = st.multiselect("Dietary Preferences", ["Vegan", "Vegetarian", "Non-Vegetarian", "Gluten-Free", "Sugar-Free"])
            intent = st.multiselect("Typical Shopping Intent", ["Essentials", "Snacks", "Health-focused", "Mixed"])
            
        cats = st.multiselect("Preferred Categories", engine.categories)
        sens = st.select_slider("Return Sensitivity", ["Low", "Medium", "High"])
        
        if st.form_submit_button("Start Shopping"):
            # Multi-select Intent needs join
            intent_str = "|".join(intent) if intent else "Mixed"
            engine.save_survey_response(st.session_state['user_id'], cats, intent_str, sens, age, gender, dietary)
            st.session_state['view'] = 'home'
            st.rerun()

# --- VIEW: Retailer Dashboard ---
def show_retailer_dashboard():
    rid = st.session_state['retailer_id']
    retailer_name = engine.get_retailers().set_index('retailer_id').loc[rid]['name']
    

    st.sidebar.title(f"🏪 {retailer_name}")
    menu = st.sidebar.radio("Menu", ["Smart Insights", "Inventory", "Orders", "Logout"])
    
    if menu == "Logout": clear_session()
        
    elif menu == "Smart Insights":
        st.header("💡 Smart Insights & Notifications")
        st.info("Personalized suggestions to improve your sales based on user behavior.")
        
        notifs = engine.get_retailer_notifications(rid)
        if not notifs:
            st.success("Everything looks good! No pending alerts.")
        else:
            for n in notifs:
                color = "red" if n['priority'] == "High" else "orange" if n['priority'] == "Medium" else "blue"
                with st.container():
                    st.markdown(f"""
                    <div style="padding: 15px; border-left: 5px solid {color}; background-color: #262730; margin-bottom: 10px; border-radius: 5px;">
                        <h4 style="margin:0; color: {color}">{n['priority']} Priority: {n['type'].title()}</h4>
                        <p style="font-size: 1.1em;">{n['message']}</p>
                        <p style="font-weight: bold;">Recommended Action: {n['action']}</p>
                    </div>
                    """, unsafe_allow_html=True)

    elif menu == "Inventory":
        st.header("📦 Inventory Manager")
        
        # --- Bulk Upload ---
        with st.expander("📂 Bulk Upload via Excel", expanded=False):
            st.markdown("Download the template, fill it out, and upload it to update products.")
            
            # Template Generator
            if st.button("📥 Download Template"):
                df_template = pd.DataFrame(columns=['product_id', 'name', 'category', 'price', 'stock', 'discount', 'active', 'delete_flag'])
                df_template.to_excel("template.xlsx", index=False)
                st.success("Template generated! (Normally this would auto-download)")
                # In real Streamlit we'd use st.download_button
                
                # Create a downloadable buffer
                import io
                buffer = io.BytesIO()
                with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
                    df_template.to_excel(writer, index=False)
                    
                st.download_button(
                    label="Download Excel Template",
                    data=buffer.getvalue(),
                    file_name="inventory_template.xlsx",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                )

            uploaded_file = st.file_uploader("Upload Excel File", type=['xlsx'])
            if uploaded_file:
                if st.button("Process Bulk Update"):
                    try:
                        df = pd.read_excel(uploaded_file)
                        res = engine.bulk_process_products(rid, df)
                        st.balloons()
                        st.subheader("Results")
                        st.success(f"✅ Added: {res['added']}")
                        st.info(f"🔄 Updated: {res['updated']}")
                        st.warning(f"❌ Deleted: {res['deleted']}")
                        if res['errors']:
                            st.error("Errors encountered:")
                            for e in res['errors']: st.write(e)
                    except Exception as e:
                        st.error(f"Failed to process file: {str(e)}")

        # --- Add New Product ---
        with st.expander("➕ Add Single Product", expanded=False):
            with st.form("add_prod_form"):
                col1, col2 = st.columns(2)
                with col1:
                    new_p_name = st.text_input("Product Name")
                    new_p_cat = st.selectbox("Category", engine.categories)
                with col2:
                    new_p_price = st.number_input("Price (₹)", min_value=1.0, value=100.0)
                    new_p_stock = st.number_input("Initial Stock", min_value=0, value=10)
                
                if st.form_submit_button("Add Product"):
                    if new_p_name:
                        pid = engine.add_product(rid, new_p_name, new_p_cat, new_p_price, new_p_stock)
                        st.success(f"Added {new_p_name}! (ID: {pid})")
                        time.sleep(1)
                        st.rerun()

        # --- Edit Existing ---
        products = engine.get_retailer_products(rid)
        
        if products.empty:
            st.info("No products yet.")
        else:
            # Ensure columns exist
            if 'active' not in products.columns: products['active'] = True
            products['delete_flag'] = False
            
            edited = st.data_editor(
                products[['product_id', 'name', 'price', 'stock_count', 'discount_pct', 'active', 'delete_flag']],
                column_config={
                    "price": st.column_config.NumberColumn("Price (₹)", min_value=0),
                    "active": st.column_config.CheckboxColumn("Visible?", help="Uncheck to hide from customers"),
                    "delete_flag": st.column_config.CheckboxColumn("Delete?", help="Check to DELETE this product permanently")
                },
                key="inv_edit",
                hide_index=True
            )
            if st.button("Save Updates"):
                for _, row in edited.iterrows():
                    if row['delete_flag']:
                        engine.delete_product(row['product_id'])
                    else:
                        engine.update_product_stock_price(
                            row['product_id'], 
                            row['stock_count'], 
                            row['price'], 
                            row['discount_pct'],
                            row['active']
                        )
                st.success("Saved!")
                time.sleep(1)
                st.rerun()
                
    elif menu == "Orders":
        st.header("📦 Orders")
        orders = engine.orders[engine.orders['retailer_id'] == rid]
        if orders.empty: st.info("No orders yet.")
        else:
            # Show order details
            for _, row in orders.iterrows():
                with st.expander(f"Order #{row['order_id']} - ₹{row['total_amount']} ({row['status']})"):
                    st.write(f"**User:** {row['user_id']}")
                    st.write(f"**Time:** {row['timestamp']}")
                    st.json(json.loads(row['items_json']))


# --- VIEW: Customer Dashboard ---
def show_customer_dashboard():
    uid = st.session_state['user_id']
    st.sidebar.header(f"User: {uid}")
    
    if st.sidebar.button("Logout"): clear_session()
    nav = st.sidebar.radio("Navigation", ["Home / Stores", "Cart", "My Orders"])
    
    if nav == "Cart":
        st.header("🛒 Cart")
        if st.button("← Back to Home"):
            st.session_state['view'] = 'home'
            st.rerun()
            
        cart = st.session_state['cart']
        if not cart: 
            st.info("Empty.")
            return

        # Prepare Order Preview
        p_ids = list(cart.keys())
        first_p = engine.products[engine.products['product_id'] == p_ids[0]].iloc[0]
        rid = first_p['retailer_id'] # Assume single retailer for MVP
        rname = engine.get_retailers().set_index('retailer_id').loc[rid]['name']
        
        st.subheader(f"Ordering from: {rname}")
        total = 0
        for pid, qty in cart.items():
            p = engine.products[engine.products['product_id']==pid].iloc[0]
            line_total = p['price'] * qty
            st.write(f"**{qty}x** {p['name']} - ₹{p['price']} ea = **₹{line_total:.2f}**")
            total += line_total
            
        st.markdown(f"### Total: ₹{total:.2f}")
        
        if st.button("Proceed to Pay"):
            st.session_state['view'] = 'payment'
            st.session_state['checkout_context'] = {'rid': rid, 'total': total}
            st.rerun()
            
    # Payment View Overlay
    if st.session_state.get('view') == 'payment':
        ctx = st.session_state.get('checkout_context', {})
        st.markdown("---")
        st.header("💳 Secure Payment")
        st.info(f"Paying **₹{ctx.get('total', 0):.2f}** to Retailer.")
        
        pay_method = st.radio("Select Payment Method", ["Credit Card", "UPI / QR Code", "Cash on Delivery"])
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("Confirm Payment"):
                with st.spinner("Processing Transaction..."):
                    time.sleep(2)
                    rid = ctx.get('rid')
                    engine.place_order(uid, rid, st.session_state['cart'])
                    st.session_state['cart'] = {}
                    st.session_state['view'] = 'order_success'
                    st.rerun()
        with col2:
            if st.button("Cancel"):
                st.session_state['view'] = 'home'
                st.rerun()
        return

    if st.session_state.get('view') == 'order_success':
        st.balloons()
        st.success("✅ Order Placed Successfully!")
        st.write("Your interaction history has been updated to improve future recommendations.")
        if st.button("Continue Shopping"):
            st.session_state['view'] = 'home'
            st.rerun()
        return

    if nav == "My Orders":
        st.header("📦 History")
        if st.button("← Back to Home", key="back_hist"):
             st.session_state['view'] = 'home'
             st.rerun()
             
        orders = engine.get_user_orders(uid)
        if not orders.empty:
             st.dataframe(orders)
        else:
             st.info("No orders yet.")
        return

    # Home / Storefront Logic
    if st.session_state['view'] == 'storefront':
        rid = st.session_state['active_store_id']
        rname = engine.get_retailers().set_index('retailer_id').loc[rid]['name']
        st.subheader(f"Visiting: {rname}")
        if st.button("← Back to Market"):
            st.session_state['active_store_id'] = None
            st.session_state['view'] = 'home'
            st.rerun()
            
        recs = engine.get_recommendations(uid, retailer_id=rid)
        cols = st.columns(4)
        for idx, (_, row) in enumerate(recs.iterrows()):
            with cols[idx%4]:
                if render_product_card(row):
                    st.session_state['cart'][row['product_id']] = st.session_state['cart'].get(row['product_id'], 0) + 1
                    st.toast("Added!")
    else:
        st.subheader("Find a Store")
        for _, r in engine.get_retailers().iterrows():
            if render_retailer_card(r):
                st.session_state['active_store_id'] = r['retailer_id']
                st.session_state['view'] = 'storefront'
                st.rerun()

# --- MAIN ROUTER ---
if not st.session_state['role']:
    show_role_selection()
elif st.session_state['role'] == 'Customer':
    if not st.session_state['user_id']:
        show_customer_login() # Handles Login & Register -> Survey
    elif st.session_state['view'] == 'survey':
        show_survey()
    else:
        show_customer_dashboard()
elif st.session_state['role'] == 'Retailer':
    if not st.session_state['retailer_id']:
        show_retailer_login()
    else:
        show_retailer_dashboard()
