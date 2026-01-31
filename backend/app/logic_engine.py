import pandas as pd
import numpy as np
import os
import json
import hashlib
from datetime import datetime, timedelta
from PIL import Image
from .fraud_detection.services.fraud_detection_service import FraudDetectionService
from .firestore_service import FirestoreService

class RecommendationEngine:
    def __init__(self, data_dir='data', use_firestore=True):
        self.data_dir = data_dir
        self.use_firestore = use_firestore
        self.fs = FirestoreService() if use_firestore else None
        
        self.users = pd.DataFrame()
        self.products = pd.DataFrame()
        self.interactions = pd.DataFrame()
        self.returns = pd.DataFrame()
        self.survey_responses = pd.DataFrame()
        self.retailers = pd.DataFrame()
        self.orders = pd.DataFrame()
        self.support_tickets = pd.DataFrame()
        self.categories = ['Beverages', 'Junk', 'Healthy', 'Essentials']
        self.fraud_service = FraudDetectionService()
        self.shelf_layout = []
        
    def load_data(self):
        """Loads data from CSV files."""
        try:
            # Users
            user_path = os.path.join(self.data_dir, 'users.csv')
            if os.path.exists(user_path):
                self.users = pd.read_csv(user_path).fillna("")
                if 'password' not in self.users.columns:
                    self.users['password'] = 'pass123' 
            else:
                self.users = pd.DataFrame(columns=['user_id', 'name', 'password', 'active', 'join_date'])

            # Products
            prod_path = os.path.join(self.data_dir, 'products.csv')
            if os.path.exists(prod_path):
                self.products = pd.read_csv(prod_path).fillna(0)
                if 'active' not in self.products.columns:
                    self.products['active'] = True
            else:
                self.products = pd.DataFrame(columns=['product_id', 'retailer_id', 'name', 'category', 'price', 'stock_count', 'discount_pct', 'active'])
            
            # Interactions
            int_path = os.path.join(self.data_dir, 'interactions.csv')
            if os.path.exists(int_path):
                 self.interactions = pd.read_csv(int_path).fillna("")
                 self.interactions['timestamp'] = pd.to_datetime(self.interactions['timestamp'])
            else:
                 self.interactions = pd.DataFrame(columns=['user_id', 'product_id', 'action', 'timestamp'])

            # Returns (General reference data)
            ret_path = os.path.join(self.data_dir, 'returns.csv')
            if os.path.exists(ret_path):
                self.returns = pd.read_csv(ret_path).fillna(0)
            else:
                self.returns = pd.DataFrame(columns=['product_id', 'return_risk_score'])
            
            # Load retailers
            retailer_path = os.path.join(self.data_dir, 'retailers.csv')
            if os.path.exists(retailer_path):
                self.retailers = pd.read_csv(retailer_path).fillna("")
                if 'status' not in self.retailers.columns:
                    self.retailers['status'] = 'Approved'
            else:
                self.retailers = pd.DataFrame(columns=['retailer_id', 'name', 'location', 'delivery_charge', 'rating', 'status'])
            
            # Load orders
            orders_path = os.path.join(self.data_dir, 'orders.csv')
            if os.path.exists(orders_path):
                self.orders = pd.read_csv(orders_path).fillna(0)
            else:
                self.orders = pd.DataFrame(columns=['order_id', 'user_id', 'retailer_id', 'items_json', 'total_amount', 'status', 'timestamp'])
            
            # Load survey
            survey_path = os.path.join(self.data_dir, 'survey_responses.csv')
            if os.path.exists(survey_path) and os.path.getsize(survey_path) > 0:
                self.survey_responses = pd.read_csv(survey_path).fillna("")
            else:
                self.survey_responses = pd.DataFrame(columns=['user_id', 'preferred_categories', 'shopping_intent', 'return_sensitivity'])
            
            # Load Support Tickets
            sup_path = os.path.join(self.data_dir, 'support_tickets.csv')
            if os.path.exists(sup_path):
                self.support_tickets = pd.read_csv(sup_path).fillna("")
            else:
                self.support_tickets = pd.DataFrame(columns=['ticket_id', 'user_id', 'role', 'issue', 'status', 'response', 'timestamp'])
            
            # Load Shelf Layout from JSON
            shelf_path = os.path.join(self.data_dir, 'shelf_layout.json')
            if os.path.exists(shelf_path):
                with open(shelf_path, 'r') as f:
                    self.shelf_layout = json.load(f)
            
            if self.use_firestore:
                self.sync_to_firestore()

        except Exception as e:
            print(f"Error loading data: {e}")

    def sync_to_firestore(self):
        """Initial sync of local CSV data to Firestore."""
        if not self.fs or not self.fs.db: return
        
        print("Syncing data to Firestore...")
        # ... (implementation remains the same but with safer check)
        
        # Sync Users
        for _, u in self.users.iterrows():
            self.fs.sync_user(str(u['user_id']), u.to_dict())
            
        # Sync Retailers
        for _, r in self.retailers.iterrows():
            self.fs.add_document("retailers", {
                "storeName": r['name'],
                "location": r['location'],
                "approvedStatus": r['status'],
                "createdAt": datetime.now()
            }, doc_id=str(r['retailer_id']))
            
        # Sync Products
        for _, p in self.products.iterrows():
            self.fs.sync_product(str(p['product_id']), p.to_dict())
            
        # Sync Orders
        for _, o in self.orders.iterrows():
            self.fs.add_document("orders", {
                "userId": o['user_id'],
                "retailerId": o['retailer_id'],
                "totalAmount": o['total_amount'],
                "orderDate": o['timestamp'],
                "status": o['status']
            }, doc_id=str(o['order_id']))

        print("Firestore sync complete.")

    def update_cart(self, user_id, store_id, items_dict):
        """Update user's cart in Firestore."""
        if not self.fs: return False
        cart_id = f"CART_{user_id}_{store_id}"
        self.fs.add_document("carts", {
            "userId": user_id,
            "storeId": store_id,
            "items": [{"productId": pid, "quantity": qty} for pid, qty in items_dict.items()],
            "updatedAt": datetime.now()
        }, doc_id=cart_id)
        return True

    def get_cart(self, user_id, store_id):
        """Fetch user's cart from Firestore."""
        if not self.fs: return None
        cart_id = f"CART_{user_id}_{store_id}"
        return self.fs.get_document("carts", cart_id)

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
        
        if self.survey_responses.empty:
             self.survey_responses = pd.DataFrame(columns=new_row.keys())

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
        
        if self.use_firestore:
            self.fs.add_document("survey_responses", {
                "userId": user_id,
                "preferredCategories": preferences,
                "purchaseFrequency": intent,
                "budgetRange": "normal",
                "submittedAt": datetime.now()
            })
            self.fs.log_activity(user_id, "user", "survey_submitted")

    def register_user(self, name, user_id, password, role="customer"):
        """Registers a new user or retailer."""
        if user_id in self.users['user_id'].values:
            return {"status": "error", "message": "Identity already taken"}
            
        new_user = {
            'user_id': user_id,
            'name': name,
            'password': str(password),
            'active': True,
            'join_date': datetime.now().strftime('%Y-%m-%d')
        }
        
        self.users = pd.concat([self.users, pd.DataFrame([new_user])], ignore_index=True)
        self.users.to_csv(os.path.join(self.data_dir, 'users.csv'), index=False)
        
        if self.use_firestore:
            self.fs.sync_user(user_id, new_user)
            self.fs.log_activity(user_id, role, "account_created")
            
        return {"status": "success", "user_id": user_id}

    def create_user(self, name):
        """Legacy helper for internal tests."""
        num = len(self.users) + 100
        user_id = f"U{num:03d}"
        return self.register_user(name, user_id, "pass123")["user_id"]


    def delete_retailer(self, retailer_id):
        self.retailers = self.retailers[self.retailers['retailer_id'] != retailer_id]
        self.retailers.to_csv(os.path.join(self.data_dir, 'retailers.csv'), index=False)
        return True

    def get_platform_stats(self):
        # Default stats from CSV
        returns_count = 0
        fraud_alerts = 0
        req_path = os.path.join(self.data_dir, 'return_requests.csv')
        if os.path.exists(req_path):
            df_ret = pd.read_csv(req_path).fillna(0)
            returns_count = len(df_ret)
            fraud_alerts = len(df_ret[df_ret['fraud_score'] > 60])

        total_vol = float(self.orders['total_amount'].sum()) if not self.orders.empty else 0
        
        stats = {
            'users': len(self.users),
            'retailers': len(self.retailers),
            'orders': len(self.orders),
            'returns': int(returns_count),
            'fraud_alerts': int(fraud_alerts),
            'total_volume': total_vol
        }
        
        # Override with Firestore if available for live accuracy
        if self.use_firestore and self.fs.db:
            try:
                # Mock high level counts from Firestore collections
                # In real scenario we'd use aggregation queries
                pass 
            except: pass
            
        return stats

    def get_user_trust_score(self, user_id):
        """Calculates a trust score based on return history."""
        user_orders = self.orders[self.orders['user_id'] == user_id]
        if user_orders.empty: return 100 
        
        total_orders = len(user_orders)
        
        req_path = os.path.join(self.data_dir, 'return_requests.csv')
        if not os.path.exists(req_path): return 100
        
        all_reqs = pd.read_csv(req_path).fillna(0)
        user_returns = all_reqs[all_reqs['user_id'] == user_id]
        total_returns = len(user_returns)
        
        if total_orders == 0: return 100
        return_rate = total_returns / total_orders
        
        score = max(0, 100 - int(return_rate * 100))
        return score

    def get_retailers(self):
        return self.retailers.fillna("").to_dict(orient='records')

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
        
        self.products.to_csv(os.path.join(self.data_dir, 'products.csv'), index=False)
        
        if self.use_firestore:
            update_data = {}
            if new_stock is not None: update_data["stockQuantity"] = int(new_stock)
            if new_price is not None: update_data["price"] = int(new_price)
            if update_data:
                self.fs.update_document("products", product_id, update_data)
        return True

    def add_product(self, retailer_id, name, category, price, stock, discount=0, combo_offer="", imageUrl=""):
        if not self.products.empty:
            try:
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
            'discount_pct': discount,
            'combo_offer': combo_offer,
            'imageUrl': imageUrl,
            'is_essential': False,
            'active': True
        }
        self.products = pd.concat([self.products, pd.DataFrame([new_prod])], ignore_index=True)
        self.products.to_csv(os.path.join(self.data_dir, 'products.csv'), index=False)
        
        if self.use_firestore:
            self.fs.sync_product(pid, new_prod)
            
        return pid

    def delete_product(self, product_id):
        if product_id in self.products['product_id'].values:
            self.products = self.products[self.products['product_id'] != product_id]
            self.products.to_csv(os.path.join(self.data_dir, 'products.csv'), index=False)
            
            if self.use_firestore and self.fs:
                self.fs.delete_document("products", product_id)
            
            return True
        return False

    def place_order(self, user_id, retailer_id, items_dict):
        if not items_dict: return None
        
        total_amt = 0
        valid_items = {}
        fs_items = []
        for pid, qty in items_dict.items():
            prod = self.products[self.products['product_id'] == pid]
            if not prod.empty:
                price = prod.iloc[0]['price']
                discount = prod.iloc[0]['discount_pct']
                final_price = price * (1 - discount/100)
                total_amt += final_price * qty
                valid_items[pid] = {'qty': qty, 'price': final_price, 'name': prod.iloc[0]['name']}
                fs_items.append({"productId": pid, "quantity": qty, "priceAtPurchase": final_price})
                
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
        
        if self.use_firestore:
            self.fs.add_document("orders", {
                "userId": user_id,
                "retailerId": retailer_id,
                "products": fs_items,
                "totalAmount": round(total_amt, 2),
                "orderDate": datetime.now(),
                "orderType": "online",
                "status": "Placed"
            }, doc_id=order_id)
            self.fs.log_activity(user_id, "user", f"order_placed_{order_id}")

        new_interactions = []
        for pid in valid_items:
            new_interactions.append({
                'user_id': user_id,
                'product_id': pid,
                'action': 'purchase',
                'timestamp': datetime.now()
            })
            if self.use_firestore:
                self.fs.add_document("interactions", {
                    "userId": user_id,
                    "productId": pid,
                    "action": "purchase",
                    "timestamp": datetime.now()
                })
        
        if new_interactions:
            self.interactions = pd.concat([self.interactions, pd.DataFrame(new_interactions)], ignore_index=True)
            self.interactions.to_csv(os.path.join(self.data_dir, 'interactions.csv'), index=False)
            
        return order_id

    def get_user_orders(self, user_id):
        user_orders = self.orders[self.orders['user_id'] == user_id].copy()
        if user_orders.empty: return pd.DataFrame()
        return user_orders.merge(self.retailers[['retailer_id', 'name']], on='retailer_id', how='left')

    def get_user_affinity(self, user_id):
        user_interactions = self.interactions[self.interactions['user_id'] == user_id]
        behavior_affinity = {cat: 0.0 for cat in self.categories}
        
        if not user_interactions.empty:
            user_activity = user_interactions.merge(self.products[['product_id', 'category']], on='product_id', how='left')
            points = {'view': 1, 'click': 2, 'purchase': 3}
            for _, row in user_activity.iterrows():
                if pd.notna(row['category']) and row['category'] in behavior_affinity:
                    behavior_affinity[row['category']] += points.get(row['action'], 0)
            
            total_points = sum(behavior_affinity.values())
            if total_points > 0:
                for cat in behavior_affinity: behavior_affinity[cat] /= total_points

        survey_affinity = {cat: 0.0 for cat in self.categories}
        if not self.survey_responses.empty:
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
        for cat in self.categories:
            final_affinity[cat] = 0.7 * behavior_affinity[cat] + 0.3 * survey_affinity[cat]
        return final_affinity

    # --- Retailer Features ---

    def get_retailer_orders(self, retailer_id):
        """Fetch orders specific to a retailer."""
        if self.orders.empty: return []
        
        # Filter orders
        r_orders = self.orders[self.orders['retailer_id'] == retailer_id].copy()
        if r_orders.empty: return []
        
        return r_orders.to_dict(orient='records')

    def get_retailer_analytics(self, retailer_id):
        """Generate analysis data for charts and inventory tracking."""
        r_orders = self.orders[self.orders['retailer_id'] == retailer_id]
        
        # Calculate sold quantities from orders items_json
        sold_stats = {}
        for _, order in r_orders.iterrows():
            try:
                # Handle single quotes in JSON mock data if needed
                js_str = order['items_json']
                if isinstance(js_str, str):
                    items = json.loads(js_str.replace("'", '"'))
                    for pid, details in items.items():
                        q = details['qty'] if isinstance(details, dict) else details
                        sold_stats[str(pid)] = sold_stats.get(str(pid), 0) + int(q)
            except:
                continue
        
        # Get products with updated stock info
        my_prods_df = self.get_retailer_products(retailer_id)
        inventory = []
        if not my_prods_df.empty:
            for _, p in my_prods_df.iterrows():
                pid = str(p['product_id'])
                p_dict = p.to_dict()
                p_dict['sold_qty'] = sold_stats.get(pid, 0)
                p_dict['remaining_qty'] = p_dict.get('stock_count', 0)
                inventory.append(p_dict)

        sales_data = []
        if not r_orders.empty:
            r_orders = r_orders.copy()
            r_orders['dt'] = pd.to_datetime(r_orders['timestamp'])
            daily = r_orders.groupby(r_orders['dt'].dt.date)['total_amount'].sum().reset_index().fillna(0)
            sales_data = [{"date": str(r['dt']), "sales": float(r['total_amount'])} for _, r in daily.iterrows()]
        
        return {
            "sales_trend": sales_data,
            "inventory": inventory,
            "total_revenue": float(r_orders['total_amount'].sum()) if not r_orders.empty else 0,
            "total_orders": len(r_orders)
        }

    def get_shelf_recommendations(self, retailer_id):
        """Generate shelf optimization recommendations based on sales velocity."""
        # 1. Calculate Sales Velocity
        r_orders = self.orders[self.orders['retailer_id'] == retailer_id]
        sold_stats = {}
        for _, order in r_orders.iterrows():
            try:
                js_str = order['items_json']
                if isinstance(js_str, str):
                    items = json.loads(js_str.replace("'", '"'))
                    for pid, details in items.items():
                        q = details['qty'] if isinstance(details, dict) else details
                        sold_stats[str(pid)] = sold_stats.get(str(pid), 0) + int(q)
            except: continue
            
        # 2. Get Products for this retailer
        my_prods = self.products[self.products['retailer_id'] == retailer_id].copy()
        if my_prods.empty: return []
        
        # Add sold_qty to the products
        my_prods['sold_qty'] = my_prods['product_id'].astype(str).map(sold_stats).fillna(0)
        
        # 3. Determine Thresholds (High, Average, Low)
        # We'll use simple percentiles
        quantiles = my_prods['sold_qty'].quantile([0.33, 0.66]).to_dict()
        low_thresh = quantiles.get(0.33, 0)
        high_thresh = quantiles.get(0.66, 0)
        
        # 4. Map Product to Current Zone
        product_zone_map = {}
        for zone in self.shelf_layout:
            for pid in zone.get('current_product_ids', []):
                product_zone_map[str(pid)] = zone.get('zone_type', 'Unknown')
                
        recs = []
        for _, p in my_prods.iterrows():
            pid = str(p['product_id'])
            name = p['name']
            sales = p['sold_qty']
            current_z = product_zone_map.get(pid, "None")
            
            recommended_z = ""
            reason = ""
            
            if sales > high_thresh:
                recommended_z = "Eye Level"
                reason = f"High Performance ({int(sales)} units sold). Move to Eye Level for maximum engagement."
            elif sales < low_thresh:
                recommended_z = "Stretch Level"
                reason = f"Lower Performance ({int(sales)} units sold). Move to Stretch Level (Top Shelf) to optimize space."
            else:
                recommended_z = "Touch Level"
                reason = f"Moderate Performance ({int(sales)} units sold). Maintain at Touch Level (Middle-Low) parity."
                
            # Only recommend if it's not already in that zone
            if current_z != recommended_z:
                recs.append({
                    "product_id": pid,
                    "product_name": name,
                    "current_zone": current_z,
                    "recommended_zone": recommended_z,
                    "reason": reason
                })
        
        return recs

    def get_retailer_shelf(self, retailer_id):
        """Generates a dynamic shelf layout based on real sales performance metadata."""
        # 1. Calculate Sales
        r_orders = self.orders[self.orders['retailer_id'] == retailer_id]
        sold_stats = {}
        for _, order in r_orders.iterrows():
            try:
                js_str = order['items_json']
                if isinstance(js_str, str):
                    items = json.loads(js_str.replace("'", '"'))
                    for pid, details in items.items():
                        q = details['qty'] if isinstance(details, dict) else details
                        sold_stats[str(pid)] = sold_stats.get(str(pid), 0) + int(q)
            except: continue
            
        # 2. Get Products
        my_prods = self.products[self.products['retailer_id'] == retailer_id].copy()
        if my_prods.empty:
            # Fallback to some generic data if they have no products yet
            return [
                {"zone_type": "Eye Level", "current_product_ids": [], "zone_name": "Eye Level"},
                {"zone_type": "Touch Level", "current_product_ids": [], "zone_name": "Touch Level"},
                {"zone_type": "Stretch Level", "current_product_ids": [], "zone_name": "Stretch Level"}
            ]
            
        my_prods['sold_qty'] = my_prods['product_id'].astype(str).map(sold_stats).fillna(0)
        
        # 3. Sort and Split
        sorted_prods = my_prods.sort_values(by='sold_qty', ascending=False)
        n = len(sorted_prods)
        
        # Determine splits
        high_prods = sorted_prods.head(max(1, n // 3))
        low_prods = sorted_prods.tail(max(1, n // 3))
        
        # Everything else is average/touch level
        high_ids = high_prods['product_id'].tolist()
        low_ids = low_prods['product_id'].tolist()
        mid_ids = sorted_prods[~sorted_prods['product_id'].isin(high_ids + low_ids)]['product_id'].tolist()
        
        return [
            {
                "id": f"{retailer_id}_eye",
                "zone_type": "Eye Level",
                "zone_name": "Premium Eye Level",
                "current_product_ids": high_ids,
                "description": "High sales velocity items"
            },
            {
                "id": f"{retailer_id}_touch",
                "zone_type": "Touch Level",
                "zone_name": "Standard Touch Level",
                "current_product_ids": mid_ids,
                "description": "Average performing items"
            },
            {
                "id": f"{retailer_id}_stretch",
                "zone_type": "Stretch Level",
                "zone_name": "Top Stretch Level",
                "current_product_ids": low_ids,
                "description": "Low frequency items"
            }
        ]

    def login_user(self, user_id, password):
        if user_id in self.users['user_id'].values:
            user = self.users[self.users['user_id'] == user_id].iloc[0]
            if str(user['password']) == str(password):
                return {"status": "success", "user": user.to_dict()}
            return {"status": "error", "message": "Invalid password"}
        return {"status": "error", "message": "User not found"}

    def get_user_recommendations(self, user_id, retailer_id=None):
        # Already handled by get_recommendations
        return self.get_recommendations(user_id, retailer_id)

    def ban_user(self, user_id):
        if user_id in self.users['user_id'].values:
            self.users.loc[self.users['user_id'] == user_id, 'active'] = False
            self.users.to_csv(os.path.join(self.data_dir, 'users.csv'), index=False) # Save the change
            return True
        return False

    # --- Support System ---

    def create_support_ticket(self, user_id, role, issue):
        tid = f"TKT{datetime.now().strftime('%Y%m%d%H%M%S')}"
        new_tkt = {
            'ticket_id': tid,
            'user_id': user_id,
            'role': role,
            'issue': issue,
            'status': 'Open',
            'response': '',
            'timestamp': datetime.now().isoformat()
        }
        self.support_tickets = pd.concat([self.support_tickets, pd.DataFrame([new_tkt])], ignore_index=True)
        self.support_tickets.to_csv(os.path.join(self.data_dir, 'support_tickets.csv'), index=False)
        return tid

    def get_support_tickets(self):
        if self.support_tickets.empty: return []
        return self.support_tickets.to_dict(orient='records')

    def resolve_ticket(self, ticket_id, response):
        if ticket_id in self.support_tickets['ticket_id'].values:
            idx = self.support_tickets[self.support_tickets['ticket_id'] == ticket_id].index[0]
            self.support_tickets.at[idx, 'status'] = 'Resolved'
            self.support_tickets.at[idx, 'response'] = response
            self.support_tickets.to_csv(os.path.join(self.data_dir, 'support_tickets.csv'), index=False)
            return True
        return False

    def get_recommendations(self, user_id, retailer_id=None, top_n=10):
        affinity_scores = self.get_user_affinity(user_id)
        
        candidates = self.products.copy()
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
                'price': float(prod['price']),
                'final_score': float(final_score),
                'explanation': explanation,
                'stock': int(prod['stock_count']),
                'discount': int(prod['discount_pct']),
                'combo_offer': str(prod.get('combo_offer', '')),
                'imageUrl': str(prod.get('imageUrl', ''))
            })
            
        if not scored_products: return pd.DataFrame()
        results = pd.DataFrame(scored_products).fillna(0).sort_values('final_score', ascending=False)
        return results.head(top_n)

    def bulk_process_products(self, retailer_id, df):
        results = {"added": 0, "updated": 0, "deleted": 0, "errors": []}
        for index, row in df.iterrows():
            try:
                pid = str(row.get('product_id', '')).strip()
                if row.get('delete_flag', False) or row.get('delete', False):
                    if pid and self.delete_product(pid):
                        results["deleted"] += 1
                    continue
                    
                name = row.get('name')
                cat = row.get('category')
                price = row.get('price')
                stock = row.get('stock')
                discount = row.get('discount', 0)
                active = row.get('active', True)
                
                if pid and pid in self.products['product_id'].values:
                    current = self.products[self.products['product_id'] == pid].iloc[0]
                    if current['retailer_id'] != retailer_id:
                        results["errors"].append(f"Row {index}: Permission denied for {pid}")
                        continue
                        
                    self.update_product_stock_price(pid, stock, price, discount, active)
                    results["updated"] += 1
                elif name and cat and price is not None:
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
        notifications = []
        my_products = self.get_retailer_products(retailer_id)
        low_stock = my_products[my_products['stock_count'] < 5]
        for _, p in low_stock.iterrows():
            notifications.append({
                "type": "alert",
                "priority": "High",
                "message": f"Low Stock: {p['name']} has only {p['stock_count']} left.",
                "action": "Restock"
            })
            
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

        if not self.users.empty:
            active_uids = self.interactions['user_id'].unique()
            if len(active_uids) > 0:
                target_uid = active_uids[0] 
                affinity = self.get_user_affinity(target_uid)
                fav_cat = max(affinity, key=affinity.get)
                notifications.append({
                    "type": "opportunity",
                    "priority": "Low",
                    "message": f"Customer Insight: User {target_uid} loves '{fav_cat}'.",
                    "action": f"Create {fav_cat} Bundle"
                })
        return notifications

    def calculate_fraud_risk(self, user_id, reason, category, time_hrs, condition):
        """Mock implementation of the Fraud Detection Folder's logic."""
        score = 0
        trust_score = self.get_user_trust_score(user_id)
        
        # Rule 1: Trust Score impact
        if trust_score < 40: score += 20
        
        # Rule 2: Reason 'Damaged Product' requires image check (mocked)
        if reason == "Damaged Product":
            score += 30 # Simulated 'suspicious resolution/metadata' flags
            
        # Rule 3: Timing (from Fraud Folder rules)
        if time_hrs < 2: score += 10
        if category == "Food" and time_hrs > 48: score += 15
        
        # Rule 4: Condition mismatch
        if condition == "Poor" and reason == "Not satisfied": score += 20
        
        return min(score, 100)

    def get_users_list(self):
        if self.users.empty: return []
        return self.users.fillna("").to_dict(orient='records')

    def toggle_user_status(self, user_id):
        if user_id in self.users['user_id'].values:
            idx = self.users[self.users['user_id'] == user_id].index[0]
            current = self.users.at[idx, 'active'] if 'active' in self.users.columns else True
            new_status = not current
            self.users.at[idx, 'active'] = new_status
            self.users.to_csv(os.path.join(self.data_dir, 'users.csv'), index=False)
            
            if self.use_firestore:
                self.fs.update_document("users", user_id, {"active": new_status})
                self.fs.log_activity("admin", "admin", f"user_{user_id}_status_{new_status}")
            return True
        return False

    def get_system_logs(self):
        if self.use_firestore and self.fs and self.fs.db:
            try:
                logs_data = self.fs.query_collection("activity_logs")
                # Sort by timestamp desc
                logs_data.sort(key=lambda x: x.get('timestamp', datetime.min), reverse=True)
                formatted = []
                for l in logs_data[:50]:
                    formatted.append({
                        "level": "INFO", 
                        "event": f"{l.get('actorRole', 'system')}: {l.get('action')}",
                        "time": l.get('timestamp').isoformat() if hasattr(l.get('timestamp'), 'isoformat') else str(l.get('timestamp'))
                    })
                return formatted
            except Exception as e:
                print(f"Firestore log fetch failed: {e}")

        # Fallback to mock
        return [
            {"time": (datetime.now() - timedelta(minutes=i*5)).isoformat(), "event": f"API Request: {e}", "level": "INFO"}
            for i, e in enumerate(["GET /products", "POST /login", "GET /recs", "POST /order", "GET /admin/stats"])
        ]

    def create_return_request(self, user_id, order_id, product_id, reason, condition="Good", image_data=None):
        order = self.orders[(self.orders['order_id'] == order_id) & (self.orders['user_id'] == user_id)]
        if order.empty:
            raise ValueError("Order not found or verification failed.")

        # Handle Image Upload and Extraction
        fraud_score = 10 # Base score
        image_path = ""
        
        if image_data:
            img_dir = os.path.join(self.data_dir, 'return_images')
            os.makedirs(img_dir, exist_ok=True)
            image_filename = f"{order_id}_{product_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
            image_path = os.path.join(img_dir, image_filename)
            
            with open(image_path, "wb") as f:
                f.write(image_data)
                
            # Perform Image Authenticity Check using the integrated Fraud Service
            try:
                img = Image.open(image_path)
                metadata = {
                    "width": img.width,
                    "height": img.height,
                    "format": img.format,
                    "file_size_kb": os.path.getsize(image_path) / 1024,
                    "has_exif": bool(img.getexif())
                }
                
                # Mock delivery hash (in real app we'd compare to original delivery photo)
                delivery_hash = "mock_delivery_hash" 
                with open(image_path, "rb") as f:
                    image_hash = hashlib.md5(f.read()).hexdigest()

                auth_result = self.fraud_service.check_image_authenticity(
                    image_path=image_path,
                    metadata=metadata,
                    image_hash=image_hash,
                    delivery_image_hash=delivery_hash
                )
                
                # Use integrated service to calculate risk
                fraud_score = self.fraud_service.calculate_fraud_risk_score(
                    authenticity_result=auth_result,
                    return_reason=reason,
                    product_category="General", # Could be refined
                    time_since_delivery=5 # Mock
                )
            except Exception as e:
                print(f"Image analysis failed: {e}")
                fraud_score = 50 # Flag for manual review if image is corrupted

        new_req = {
            'request_id': req_id,
            'user_id': user_id,
            'order_id': order_id,
            'product_id': product_id,
            'retailer_id': order.iloc[0]['retailer_id'],
            'reason': reason,
            'condition': condition,
            'fraud_score': fraud_score,
            'image_path': image_path,
            'status': 'Pending', 
            'admin_notes': ''
        }
        
        req_path = os.path.join(self.data_dir, 'return_requests.csv')
        df = pd.DataFrame([new_req])
        df.to_csv(req_path, mode='a', header=not os.path.exists(req_path), index=False)
        
        if self.use_firestore:
            self.fs.add_document("returns", {
                "orderId": order_id,
                "userId": user_id,
                "retailerId": new_req['retailer_id'],
                "productId": product_id,
                "reason": reason,
                "status": "Pending",
                "fraudScore": fraud_score,
                "imagePath": image_path,
                "requestedAt": datetime.now()
            }, doc_id=req_id)
            self.fs.log_activity(user_id, "user", f"return_requested_{req_id}")
            
        return req_id

    def get_pending_returns(self):
        req_path = os.path.join(self.data_dir, 'return_requests.csv')
        if not os.path.exists(req_path): return []
        df = pd.read_csv(req_path).fillna(0)
        if df.empty: return []
        pending = df[df['status'] == 'Pending'].copy()
        return pending.to_dict(orient='records')

    def get_user_returns(self, user_id):
        req_path = os.path.join(self.data_dir, 'return_requests.csv')
        if not os.path.exists(req_path): return []
        df = pd.read_csv(req_path).fillna(0)
        if df.empty: return []
        return df[df['user_id'] == user_id].to_dict(orient='records')

    def get_retailer_returns(self, retailer_id):
        req_path = os.path.join(self.data_dir, 'return_requests.csv')
        if not os.path.exists(req_path): return []
        df = pd.read_csv(req_path).fillna(0)
        if df.empty: return []
        return df[(df['retailer_id'] == retailer_id) & (df['status'] == 'Approved')].to_dict(orient='records')

    def admin_process_return(self, request_id, decision, notes=""):
        req_path = os.path.join(self.data_dir, 'return_requests.csv')
        if not os.path.exists(req_path): return False
        
        df = pd.read_csv(req_path).fillna(0)
        if request_id in df['request_id'].values:
            idx = df[df['request_id'] == request_id].index[0]
            df.at[idx, 'status'] = decision 
            df.at[idx, 'admin_notes'] = notes
            df.to_csv(req_path, index=False)
            
            if self.use_firestore:
                self.fs.update_document("returns", request_id, {
                    "status": decision,
                    "adminNotes": notes
                })
                self.fs.log_activity("admin", "admin", f"return_{request_id}_{decision}")
            return True
        return False

    def toggle_retailer_status(self, retailer_id):
        if retailer_id in self.retailers['retailer_id'].values:
            idx = self.retailers[self.retailers['retailer_id'] == retailer_id].index[0]
            current = self.retailers.at[idx, 'status']
            new_status = 'Banned' if current == 'Approved' else 'Approved'
            self.retailers.at[idx, 'status'] = new_status
            self.retailers.to_csv(os.path.join(self.data_dir, 'retailers.csv'), index=False)
            
            if self.use_firestore:
                self.fs.update_document("retailers", retailer_id, {"approvedStatus": new_status})
                self.fs.log_activity("admin", "admin", f"retailer_{retailer_id}_{new_status}")
            return True
        return False

    def register_retailer(self, name, location, delivery_charge=0):
        rid = f"R{str(len(self.retailers) + 1).zfill(3)}"
        new_retailer = {
            'retailer_id': rid,
            'name': name,
            'location': location,
            'delivery_charge': delivery_charge,
            'rating': 5.0,
            'status': 'Pending' 
        }
        self.retailers = pd.concat([self.retailers, pd.DataFrame([new_retailer])], ignore_index=True)
        self.retailers.to_csv(os.path.join(self.data_dir, 'retailers.csv'), index=False)
        
        if self.use_firestore:
            self.fs.add_document("retailers", {
                "storeName": name,
                "location": location,
                "approvedStatus": "Pending",
                "createdAt": datetime.now()
            }, doc_id=rid)
            self.fs.log_activity("retailer", "retailer_registration", f"retailer_registered_{rid}")
            
        return rid

if __name__ == "__main__":
    print("Logic Engine initialized")
