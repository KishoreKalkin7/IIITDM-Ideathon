import pandas as pd
import numpy as np
import os
import json
from datetime import datetime

class RecommendationEngine:
    def __init__(self, data_dir='data'):
        self.data_dir = data_dir
        self.users = pd.DataFrame()
        self.products = pd.DataFrame()
        self.interactions = pd.DataFrame()
        self.returns = pd.DataFrame()
        self.survey_responses = pd.DataFrame()
        self.retailers = pd.DataFrame()
        self.orders = pd.DataFrame()
        self.categories = ['Beverages', 'Junk', 'Healthy', 'Essentials']
        
    def load_data(self):
        """Loads data from CSV files."""
        try:
            self.users = pd.read_csv(os.path.join(self.data_dir, 'users.csv'))
            self.products = pd.read_csv(os.path.join(self.data_dir, 'products.csv'))
            if 'active' not in self.products.columns:
                self.products['active'] = True
            self.interactions = pd.read_csv(os.path.join(self.data_dir, 'interactions.csv'))
            self.interactions['timestamp'] = pd.to_datetime(self.interactions['timestamp'])
            self.returns = pd.read_csv(os.path.join(self.data_dir, 'returns.csv'))
            self.retailers = pd.read_csv(os.path.join(self.data_dir, 'retailers.csv'))
            
            orders_path = os.path.join(self.data_dir, 'orders.csv')
            if os.path.exists(orders_path):
                self.orders = pd.read_csv(orders_path)
            else:
                self.orders = pd.DataFrame(columns=['order_id', 'user_id', 'retailer_id', 'items_json', 'total_amount', 'status', 'timestamp'])
            
            # Load survey
            survey_path = os.path.join(self.data_dir, 'survey_responses.csv')
            if os.path.exists(survey_path) and os.path.getsize(survey_path) > 0:
                self.survey_responses = pd.read_csv(survey_path)
            else:
                self.survey_responses = pd.DataFrame(columns=['user_id', 'preferred_categories', 'shopping_intent', 'return_sensitivity'])
                
        except Exception as e:
            print(f"Error loading data: {e}")

    def save_survey_response(self, user_id, preferences, intent, return_sensitivity, age, gender, dietary):
        new_row = {
            'user_id': user_id,
            'preferred_categories': '|'.join(preferences),
            'shopping_intent': intent,
            'return_sensitivity': return_sensitivity,
            'age': age,
            'gender': gender,
            'dietary_preferences': '|'.join(dietary)
        }
        
        # Ensure columns exist if loading old CSV
        for col in new_row.keys():
            if col not in self.survey_responses.columns:
                self.survey_responses[col] = None
                
        if user_id in self.survey_responses['user_id'].values:
            idx = self.survey_responses[self.survey_responses['user_id'] == user_id].index[0]
            for key, val in new_row.items():
                self.survey_responses.at[idx, key] = val
        else:
            self.survey_responses = pd.concat([self.survey_responses, pd.DataFrame([new_row])], ignore_index=True)
        self.survey_responses.to_csv(os.path.join(self.data_dir, 'survey_responses.csv'), index=False)

    def create_user(self, name):
        """Creates a new user and returns user_id."""
        # Generate ID (U + Next Number)
        if not self.users.empty:
            last_id = self.users['user_id'].max() # U020
            try:
                num = int(last_id[1:]) + 1
            except:
                num = len(self.users) + 100
        else:
            num = 1
        
        user_id = f"U{num:03d}"
        new_user = {
            'user_id': user_id,
            'name': name,
            'join_date': datetime.now().strftime('%Y-%m-%d')
        }
        
        self.users = pd.concat([self.users, pd.DataFrame([new_user])], ignore_index=True)
        self.users.to_csv(os.path.join(self.data_dir, 'users.csv'), index=False)
        return user_id

    def create_retailer(self, name, location, delivery_charge):
        """Creates a new retailer and returns retailer_id."""
        if not self.retailers.empty:
            last_id = self.retailers['retailer_id'].max()
            try:
                num = int(last_id[1:]) + 1
            except:
                num = len(self.retailers) + 100
        else:
            num = 1
            
        retailer_id = f"R{num:03d}"
        new_retailer = {
            'retailer_id': retailer_id,
            'name': name,
            'location': location,
            'delivery_charge': delivery_charge,
            'rating': 5.0 # New starts clean
        }
        
        self.retailers = pd.concat([self.retailers, pd.DataFrame([new_retailer])], ignore_index=True)
        self.retailers.to_csv(os.path.join(self.data_dir, 'retailers.csv'), index=False)
        return retailer_id

    def get_retailers(self):
        return self.retailers

    def get_retailer_products(self, retailer_id):
        return self.products[self.products['retailer_id'] == retailer_id].copy()

    def update_product_stock_price(self, product_id, new_stock=None, new_price=None, new_discount=None, active=None):
        """Update product details and save to CSV."""
        idx = self.products.index[self.products['product_id'] == product_id].tolist()
        if not idx: return False
        
        idx = idx[0]
        if new_stock is not None: self.products.at[idx, 'stock_count'] = int(new_stock)
        if new_price is not None: self.products.at[idx, 'price'] = int(new_price)
        if new_discount is not None: self.products.at[idx, 'discount_pct'] = int(new_discount)
        if active is not None: self.products.at[idx, 'active'] = bool(active)
        
        # Persist
        self.products.to_csv(os.path.join(self.data_dir, 'products.csv'), index=False)
        return True

    def add_product(self, retailer_id, name, category, price, stock):
        if not self.products.empty:
            # P1234
            try:
                # robust extraction
                last_id = self.products['product_id'].max()
                num = int(last_id[1:]) + 1
            except:
                num = len(self.products) + 1000
        else:
            num = 1
            
        pid = f"P{num:04d}"
        new_prod = {
            'product_id': pid,
            'retailer_id': retailer_id,
            'name': name,
            'category': category,
            'price': price,
            'stock_count': stock,
            'discount_pct': 0,
            'is_essential': False,
            'active': True
        }
        self.products = pd.concat([self.products, pd.DataFrame([new_prod])], ignore_index=True)
        self.products.to_csv(os.path.join(self.data_dir, 'products.csv'), index=False)
        return pid

    def delete_product(self, product_id):
        """Removes a product from the catalog."""
        if product_id in self.products['product_id'].values:
            self.products = self.products[self.products['product_id'] != product_id]
            self.products.to_csv(os.path.join(self.data_dir, 'products.csv'), index=False)
            return True
        return False

    def place_order(self, user_id, retailer_id, items_dict):
        """
        items_dict: {product_id: quantity}
        """
        if not items_dict: return None
        
        # Calculate Total
        total_amt = 0
        valid_items = {}
        for pid, qty in items_dict.items():
            prod = self.products[self.products['product_id'] == pid]
            if not prod.empty:
                price = prod.iloc[0]['price']
                discount = prod.iloc[0]['discount_pct']
                final_price = price * (1 - discount/100)
                total_amt += final_price * qty
                valid_items[pid] = {'qty': qty, 'price': final_price, 'name': prod.iloc[0]['name']}
                
                # Reduce Stock
                current_stock = prod.iloc[0]['stock_count']
                self.update_product_stock_price(pid, new_stock=max(0, current_stock - qty))
        
        order_id = f"ORD{datetime.now().strftime('%Y%m%d%H%M%S')}"
        new_order = {
            'order_id': order_id,
            'user_id': user_id,
            'retailer_id': retailer_id,
            'items_json': json.dumps(valid_items),
            'total_amount': round(total_amt, 2),
            'status': 'Placed',
            'timestamp': datetime.now().isoformat()
        }
        
        
        self.orders = pd.concat([self.orders, pd.DataFrame([new_order])], ignore_index=True)
        self.orders.to_csv(os.path.join(self.data_dir, 'orders.csv'), index=False)
        
        # KEY FIX: Log these purchases as interactions so they influence recommendations!
        new_interactions = []
        for pid in valid_items:
            new_interactions.append({
                'user_id': user_id,
                'product_id': pid,
                'action': 'purchase',
                'timestamp': datetime.now()
            })
        
        if new_interactions:
            self.interactions = pd.concat([self.interactions, pd.DataFrame(new_interactions)], ignore_index=True)
            self.interactions.to_csv(os.path.join(self.data_dir, 'interactions.csv'), index=False)
            
        return order_id

    def get_user_orders(self, user_id):
        user_orders = self.orders[self.orders['user_id'] == user_id].copy()
        # Merge retailer name for display
        return user_orders.merge(self.retailers[['retailer_id', 'name']], on='retailer_id', how='left')

    def get_user_affinity(self, user_id):
        # ... (Same as before) ...
        user_interactions = self.interactions[self.interactions['user_id'] == user_id]
        behavior_affinity = {cat: 0.0 for cat in self.categories}
        
        if not user_interactions.empty:
            # Note: interactions product_ids must overlap with products. But products might have changed?
            # We assume product_id is stable. 
            user_activity = user_interactions.merge(self.products[['product_id', 'category']], on='product_id', how='left')
            points = {'view': 1, 'click': 2, 'purchase': 3}
            for _, row in user_activity.iterrows():
                if pd.notna(row['category']) and row['category'] in behavior_affinity:
                    behavior_affinity[row['category']] += points.get(row['action'], 0)
            
            total_points = sum(behavior_affinity.values())
            if total_points > 0:
                for cat in behavior_affinity: behavior_affinity[cat] /= total_points

        survey_affinity = {cat: 0.0 for cat in self.categories}
        user_survey = self.survey_responses[self.survey_responses['user_id'] == user_id]
        if not user_survey.empty:
            prefs = user_survey.iloc[0]['preferred_categories']
            if isinstance(prefs, str):
                selected_cats = prefs.split('|')
                for cat in selected_cats:
                    if cat in survey_affinity: survey_affinity[cat] = 1.0
                total_survey = sum(survey_affinity.values())
                if total_survey > 0:
                    for cat in survey_affinity: survey_affinity[cat] /= total_survey
        
        final_affinity = {}
        for cat in self.categories:
            final_affinity[cat] = 0.7 * behavior_affinity[cat] + 0.3 * survey_affinity[cat]
        return final_affinity

    def get_recommendations(self, user_id, retailer_id=None, top_n=10):
        """Generates ranked recommendations. Optionally filtered by retailer."""
        affinity_scores = self.get_user_affinity(user_id)
        
        candidates = self.products.copy()
        
        # Filter active
        if 'active' in candidates.columns:
            candidates = candidates[candidates['active'] == True]
            
        if retailer_id:
            candidates = candidates[candidates['retailer_id'] == retailer_id]
            
        if candidates.empty: return pd.DataFrame()

        candidates = candidates.merge(self.returns, on='product_id', how='left').fillna(0)
        pop_counts = self.interactions['product_id'].value_counts()
        max_pop = pop_counts.max() if not pop_counts.empty else 1
        now = datetime.now()
        
        scored_products = []
        for _, prod in candidates.iterrows():
            # Skip Out of Stock for Recs? Or downrank?
            # Let's Skip OOS for customer experience
            if prod['stock_count'] <= 0: continue
            
            cat = prod['category']
            pid = prod['product_id']
            
            cat_score = affinity_scores.get(cat, 0)
            
            last_inter = self.interactions[(self.interactions['user_id'] == user_id) & (self.interactions['product_id'] == pid)]
            recency_val = 0
            if not last_inter.empty:
                last_time = last_inter['timestamp'].max()
                days_diff = (now - last_time).days
                recency_val = max(0, 1 - (days_diff / 30))
            
            pop_val = pop_counts.get(pid, 0) / max_pop
            risk_val = prod['return_risk_score']
            
            final_score = (0.4 * cat_score) + (0.3 * recency_val) + (0.2 * pop_val) - (0.1 * risk_val)
            
            explanation = "Recommended item"
            if cat_score > 0.5: explanation = f"Because you like {cat}"
            elif pop_val > 0.7: explanation = "Trending now"
            elif prod['discount_pct'] > 10: explanation = f"{prod['discount_pct']}% OFF Deal"
            
            scored_products.append({
                'product_id': pid,
                'name': prod['name'],
                'category': cat,
                'price': prod['price'],
                'final_score': final_score,
                'explanation': explanation,
                'stock': prod['stock_count'],
                'discount': prod['discount_pct']
            })
            
        results = pd.DataFrame(scored_products).sort_values('final_score', ascending=False)
        return results.head(top_n)

    def bulk_process_products(self, retailer_id, df):
        """
        Process a DataFrame for bulk product updates.
        Expected columns: product_id (opt), name, category, price, stock, discount, active, delete_flag
        """
        results = {"added": 0, "updated": 0, "deleted": 0, "errors": []}
        
        for index, row in df.iterrows():
            try:
                pid = str(row.get('product_id', '')).strip()
                # Check for delete flag
                if row.get('delete_flag', False) or row.get('delete', False):
                    if pid and self.delete_product(pid):
                        results["deleted"] += 1
                    continue
                    
                # Prepare values
                name = row.get('name')
                cat = row.get('category')
                price = row.get('price')
                stock = row.get('stock')
                discount = row.get('discount', 0)
                active = row.get('active', True)
                
                # Update existing
                if pid and pid in self.products['product_id'].values:
                    # Validate retailer owns it
                    current = self.products[self.products['product_id'] == pid].iloc[0]
                    if current['retailer_id'] != retailer_id:
                        results["errors"].append(f"Row {index}: Permission denied for {pid}")
                        continue
                        
                    self.update_product_stock_price(pid, stock, price, discount, active)
                    results["updated"] += 1
                    
                # Create new
                elif name and cat and price is not None:
                    # Basic validation
                    if cat not in self.categories:
                        results["errors"].append(f"Row {index}: Invalid category '{cat}'")
                        continue
                        
                    self.add_product(retailer_id, name, cat, float(price), int(stock or 0))
                    results["added"] += 1
                else:
                    results["errors"].append(f"Row {index}: Missing required fields")
                    
            except Exception as e:
                results["errors"].append(f"Row {index}: Error {str(e)}")
                
        return results

    def get_retailer_notifications(self, retailer_id):
        """
        Generates insights/notifications for the retailer based on Intermediary logic.
        Analyzes:
        1. Low Stock
        2. Category Trends (Global vs Local)
        3. High Interest / Low Conversion (Views > Purchase)
        4. Specific User Affinities (Personalized Experience)
        """
        notifications = []
        
        # 1. Low Stock Ratio
        my_products = self.get_retailer_products(retailer_id)
        low_stock = my_products[my_products['stock_count'] < 5]
        for _, p in low_stock.iterrows():
            notifications.append({
                "type": "alert",
                "priority": "High",
                "message": f"Low Stock: {p['name']} has only {p['stock_count']} left.",
                "action": "Restock"
            })
            
        # 2. Demand/Trend Analysis (Simulated Intermediary Logic)
        # Find categories with high views in last 24h
        recent_interactions = self.interactions
        if not recent_interactions.empty:
            cat_views = recent_interactions[recent_interactions['action'] == 'view'].merge(
                self.products[['product_id', 'category']], on='product_id'
            )['category'].value_counts()
            
            if not cat_views.empty:
                top_cat = cat_views.index[0]
                notifications.append({
                    "type": "insight",
                    "priority": "Medium",
                    "message": f"Market Trend: '{top_cat}' is the most viewed category today.",
                    "action": f"Promote {top_cat} items"
                })

        # 3. User Specific Opportunities (The 'Personalized' part)
        # Identify users who frequently view this retailer's category but haven't bought recently
        # Simplify: Pick a random active user and expose their affinity as an 'Lead'
        # In a real app, this would be more complex and privacy-safe.
        if not self.users.empty:
            # Pick a heavy user
            active_uids = self.interactions['user_id'].unique()
            if len(active_uids) > 0:
                target_uid = active_uids[0] # Just pick first for demo
                affinity = self.get_user_affinity(target_uid)
                # Find their top cat
                fav_cat = max(affinity, key=affinity.get)
                
                notifications.append({
                    "type": "opportunity",
                    "priority": "Low",
                    "message": f"Customer Insight: User {target_uid} loves '{fav_cat}'.",
                    "action": f"Create {fav_cat} Bundle"
                })
                
        return notifications

if __name__ == "__main__":
    print("Logic Engine initialized")
