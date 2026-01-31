import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime

class FirestoreService:
    def __init__(self, service_account_key_path=None):
        if not service_account_key_path:
            # Look for serviceAccountKey.json in the project root
            root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            potential_path = os.path.join(root_path, "serviceAccountKey.json")
            if os.path.exists(potential_path):
                service_account_key_path = potential_path

        if not firebase_admin._apps:
            try:
                if service_account_key_path and os.path.exists(service_account_key_path):
                    cred = credentials.Certificate(service_account_key_path)
                    firebase_admin.initialize_app(cred)
                    print(f"Firestore initialized with key: {service_account_key_path}")
                else:
                    # Fallback to default auth
                    firebase_admin.initialize_app()
                    print("Firestore initialized with default credentials")
            except Exception as e:
                print(f"Warning: Firebase initialization failed. Firestore operations will fail. {e}")
        
        try:
            self.db = firestore.client()
        except Exception as e:
            print(f"Error: Could not obtain Firestore client. {e}")
            self.db = None

    def get_collection(self, collection_name):
        if not self.db: return None
        return self.db.collection(collection_name)

    # Generic CRUD
    def add_document(self, collection, data, doc_id=None):
        try:
            col_ref = self.get_collection(collection)
            if not col_ref: return None
            if doc_id:
                col_ref.document(doc_id).set(data)
                return doc_id
            else:
                _, doc_ref = col_ref.add(data)
                return doc_ref.id
        except Exception as e:
            print(f"Firestore add_document error: {e}")
            return None

    def get_document(self, collection, doc_id):
        col_ref = self.get_collection(collection)
        if not col_ref: return None
        doc = col_ref.document(doc_id).get()
        return doc.to_dict() if doc.exists else None

    def update_document(self, collection, doc_id, data):
        try:
            col_ref = self.get_collection(collection)
            if not col_ref: return False
            col_ref.document(doc_id).update(data)
            return True
        except Exception as e:
            print(f"Firestore update_document error: {e}")
            return False

    def delete_document(self, collection, doc_id):
        """Delete a document from a collection"""
        try:
            col_ref = self.get_collection(collection)
            if not col_ref: return False
            col_ref.document(doc_id).delete()
            return True
        except Exception as e:
            print(f"Firestore delete_document error: {e}")
            return False

    def query_collection(self, collection, filters=None):
        col_ref = self.get_collection(collection)
        if not col_ref: return []
        query = col_ref
        if filters:
            for field, op, value in filters:
                query = query.where(field, op, value)
        docs = query.stream()
        return [doc.to_dict() | {"id": doc.id} for doc in docs]

    # Schema-specific helpers
    def log_activity(self, actor_id, role, action):
        self.add_document("activity_logs", {
            "actorId": actor_id,
            "actorRole": role,
            "action": action,
            "timestamp": datetime.now()
        })

    def sync_user(self, user_id, data):
        # Ensure schema compliance
        schema_data = {
            "name": data.get("name"),
            "email": data.get("email", ""),
            "role": data.get("role", "user"),
            "createdAt": data.get("createdAt", datetime.now()),
            "totalOrders": data.get("totalOrders", 0),
            "totalReturns": data.get("totalReturns", 0)
        }
        self.add_document("users", schema_data, doc_id=user_id)

    def sync_product(self, product_id, data):
        schema_data = {
            "storeId": data.get("storeId", "S001"),
            "retailerId": data.get("retailerId"),
            "productName": data.get("name"),
            "category": data.get("category"),
            "price": data.get("price"),
            "stockQuantity": data.get("stock_count"),
            "imageUrl": data.get("imageUrl", ""),
            "discount": data.get("discount", 0),
            "comboOffer": data.get("combo_offer", ""),
            "salesCount": data.get("salesCount", 0),
            "createdAt": datetime.now()
        }
        self.add_document("products", schema_data, doc_id=product_id)
