import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

# Set random seed
np.random.seed(42)
random.seed(42)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

CATEGORIES = ['Beverages', 'Junk', 'Healthy', 'Essentials']
RETAILER_NAMES = [
    "Fresh Mart", "Daily Needs", "Green Grocer", "Quick Stop", 
    "Super Saver", "Organic Harvest", "City Market", "Corner Store"
]

def generate_retailers():
    retailers = []
    for i, name in enumerate(RETAILER_NAMES):
        retailers.append({
            'retailer_id': f'R{i+1:03d}',
            'name': name,
            'location': f'Sector {random.randint(1, 50)}',
            'delivery_charge': random.choice([0, 40, 50, 80]),
            'rating': round(random.uniform(3.5, 5.0), 1)
        })
    return pd.DataFrame(retailers)

def generate_products(retailers_df, n_per_retailer=20):
    products = []
    pid_counter = 1
    
    for rid in retailers_df['retailer_id']:
        # Each retailer has a mix of products
        for _ in range(n_per_retailer):
            cat = np.random.choice(CATEGORIES)
            price = 0
            name_suffix = random.choice(['Premium', 'Standard', 'Pack', 'Fresh'])
            
            if cat == 'Beverages': 
                price = np.random.randint(40, 300)
                name = f"Drink {pid_counter}"
            elif cat == 'Junk': 
                price = np.random.randint(20, 400)
                name = f"Snack {pid_counter}"
            elif cat == 'Healthy': 
                price = np.random.randint(100, 1500)
                name = f"Salad/Fruit {pid_counter}"
            elif cat == 'Essentials': 
                price = np.random.randint(50, 800)
                name = f"Daily Item {pid_counter}"
            
            # Essentials logic
            is_essential = 1 if cat == 'Essentials' or cat == 'Healthy' else 0
            
            products.append({
                'product_id': f'P{pid_counter:04d}',
                'retailer_id': rid,
                'name': f"{name} ({name_suffix})",
                'category': cat,
                'price': price,
                'stock_count': np.random.randint(0, 50), # Some might be 0 (OOS)
                'discount_pct': 0 if np.random.random() > 0.3 else np.random.randint(5, 30),
                'is_essential': is_essential
            })
            pid_counter += 1
            
    return pd.DataFrame(products)

def generate_users(n=20):
    users = []
    for i in range(1, n + 1):
        users.append({
            'user_id': f'U{i:03d}',
            'name': f'User {i}',
            'join_date': datetime.now() - timedelta(days=np.random.randint(1, 365))
        })
    return pd.DataFrame(users)

# Interactions remain similar but could link to retailer implicitly via product
def generate_interactions(users_df, products_df, n_interactions=500):
    interactions = []
    if products_df.empty: return pd.DataFrame()
    
    user_ids = users_df['user_id'].tolist()
    product_ids = products_df['product_id'].tolist()
    
    for _ in range(n_interactions):
        interactions.append({
            'user_id': np.random.choice(user_ids),
            'product_id': np.random.choice(product_ids),
            'action': np.random.choice(['view', 'click', 'purchase'], p=[0.6, 0.3, 0.1]),
            'timestamp': datetime.now() - timedelta(days=np.random.randint(0, 30))
        })
    return pd.DataFrame(interactions)

def generate_returns(products_df):
    returns = []
    for pid in products_df['product_id']:
        returns.append({
            'product_id': pid,
            'return_risk_score': round(np.random.beta(2, 5), 2)
        })
    return pd.DataFrame(returns)

def generate_orders():
    # Empty initially
    return pd.DataFrame(columns=['order_id', 'user_id', 'retailer_id', 'items_json', 'total_amount', 'status', 'timestamp'])

if __name__ == "__main__":
    print("Generating Multi-Vendor Data...")
    
    df_retailers = generate_retailers()
    df_users = generate_users()
    df_products = generate_products(df_retailers)
    df_interactions = generate_interactions(df_users, df_products)
    df_returns = generate_returns(df_products)
    df_orders = generate_orders()
    
    # Init survey if not exists
    survey_path = os.path.join(DATA_DIR, 'survey_responses.csv')
    if not os.path.exists(survey_path):
        pd.DataFrame(columns=['user_id', 'preferred_categories', 'shopping_intent', 'return_sensitivity']).to_csv(survey_path, index=False)

    df_retailers.to_csv(os.path.join(DATA_DIR, 'retailers.csv'), index=False)
    df_users.to_csv(os.path.join(DATA_DIR, 'users.csv'), index=False)
    df_products.to_csv(os.path.join(DATA_DIR, 'products.csv'), index=False)
    df_interactions.to_csv(os.path.join(DATA_DIR, 'interactions.csv'), index=False)
    df_returns.to_csv(os.path.join(DATA_DIR, 'returns.csv'), index=False)
    df_orders.to_csv(os.path.join(DATA_DIR, 'orders.csv'), index=False)
    
    print(f"Data saved to {DATA_DIR}")
