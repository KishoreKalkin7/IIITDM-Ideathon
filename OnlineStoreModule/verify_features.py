import os
import sys
import pandas as pd
from datetime import datetime

# Setup
sys.path.append(os.path.abspath("src"))
from logic_engine import RecommendationEngine

def verify_logic():
    print("--- Starting Verification ---")
    
    # 1. Initialize
    engine = RecommendationEngine(data_dir='data')
    # Use temporary data structures to avoid messing up real DB if possible, 
    # but since this is file-based, we'll just create test entities.
    engine.load_data()
    
    # Create Test Retailer
    rid = engine.create_retailer("Test Retailer", "Test Loc", 10)
    print(f"Created Retailer: {rid}")
    
    # --- Test Bulk Upload ---
    print("\n[Test 1] Bulk Upload")
    data = {
        'name': ['Bulk Item 1', 'Bulk Item 2'],
        'category': ['Essentials', 'Junk'],
        'price': [50, 20],
        'stock': [100, 50],
        'active': [True, True]
    }
    df = pd.DataFrame(data)
    res = engine.bulk_process_products(rid, df)
    print(f"Bulk Add Result: {res}")
    
    # Verify added
    prods = engine.get_retailer_products(rid)
    added = prods[prods['name'].isin(['Bulk Item 1', 'Bulk Item 2'])]
    if len(added) == 2:
        print("[OK] Bulk Add Successful")
    else:
        print("[FAIL] Bulk Add Failed")
        
    # Test Update
    p1_id = added.iloc[0]['product_id']
    update_data = {
        'product_id': [p1_id],
        'name': ['Bulk Item 1'],
        'price': [999], 
        'stock': [10],
        'active': [True]
    }
    df_update = pd.DataFrame(update_data)
    res_upd = engine.bulk_process_products(rid, df_update)
    print(f"Bulk Update Result: {res_upd}")
    
    updated_p = engine.products[engine.products['product_id'] == p1_id].iloc[0]
    if updated_p['price'] == 999:
         print("[OK] Bulk Update Successful")
    else:
         print("[FAIL] Bulk Update Failed")

    # --- Test Insights ---
    print("\n[Test 2] Retailer Insights")
    
    # Create User
    uid = engine.create_user("Insight Tester")
    
    # Simulate Views on "Healthy" category
    # Find a Healthy product
    healthy_p = engine.products[engine.products['category'] == 'Healthy']
    if not healthy_p.empty:
        target_pid = healthy_p.iloc[0]['product_id']
        print(f"Simulating views on {target_pid} (Healthy)")
        
        # Add interaction manually
        new_inter = {
            'user_id': uid,
            'product_id': target_pid,
            'action': 'view',
            'timestamp': datetime.now()
        }
        engine.interactions = pd.concat([engine.interactions, pd.DataFrame([new_inter])], ignore_index=True)
        
        # Test Notifictions
        notifs = engine.get_retailer_notifications(rid)
        print("Generated Notifications:")
        for n in notifs:
            print(f"- [{n['priority']}] {n['message']}")
            
        # Check if we got a Trend or User Insight
        has_trend = any("Market Trend" in n['message'] for n in notifs)
        has_user_insight = any("Customer Insight" in n['message'] for n in notifs)
        
        if has_trend or has_user_insight:
            print("[OK] Insights Generated Successfully")
        else:
            print("[WARN] No specific insights generated (might need more data/mocking)")
            
    else:
        print("[WARN] No Healthy products found to test trends.")

if __name__ == "__main__":
    verify_logic()
