from pymongo import MongoClient

# MongoDB 연결 설정
def get_mongo_connection():
    client = MongoClient("mongodb://localhost:27017/") 
    db = client['PredictStock']  
    return db
