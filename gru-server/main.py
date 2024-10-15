import FinanceDataReader as fdr
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from keras.models import Sequential
from keras.layers import GRU, Dense, Dropout, Input
from datetime import datetime, timedelta
from mongo_config import get_mongo_connection

# 나스닥 모든 종목 리스트 가져오기
nasdaq_symbols = fdr.StockListing('NASDAQ')['Symbol'].tolist()  # 나스닥 모든 종목 리스트 가져오기
total_stocks = len(nasdaq_symbols)

# MongoDB 연결
db = get_mongo_connection()  # MongoDB 연결 가져오기
collection = db['predictions']  # 사용할 컬렉션 선택

# 2년 전 날짜와 현재 날짜 계산
start = (datetime.now() - timedelta(days=730)).strftime('%Y-%m-%d')
end = datetime.now().strftime('%Y-%m-%d')

# 각 종목 순회
for i, symbol in enumerate(nasdaq_symbols, start=1):
    print(f"Processing {symbol}... ({i}/{total_stocks})")

    # 1. 해당 종목의 데이터를 가져오기
    try:
        df = yf.download(symbol, start=start, end=end)

        # 데이터가 비어있지 않은지 확인
        if df.empty:
            print(f"No data available for {symbol}.")
            continue
    except Exception as e:
        print(f"Error occurred while downloading {symbol} data: {e}")
        continue

    # 2. 데이터 전처리
    data = df['Close'].values.reshape(-1, 1)
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)

    # 훈련 데이터와 테스트 데이터 분리
    train_data, test_data = train_test_split(scaled_data, test_size=0.3, shuffle=False)

    # 충분한 테스트 데이터가 있는지 확인
    if len(test_data) <= 61:
        print(f"Not enough test data for {symbol}. Skipping this stock.")
        continue

    # 데이터셋 생성
    def create_dataset(data, time_step=60):
        X, y = [], []
        for i in range(len(data) - time_step - 1):
            X.append(data[i:(i + time_step), 0])
            y.append(data[i + time_step, 0])
        return np.array(X), np.array(y)

    time_step = 60
    X_train, y_train = create_dataset(train_data, time_step)
    X_test, y_test = create_dataset(test_data, time_step)

    X_train = X_train.reshape(X_train.shape[0], X_train.shape[1], 1)
    X_test = X_test.reshape(X_test.shape[0], X_test.shape[1], 1)

    # 3. GRU 모델 구축
    gru_model = Sequential()
    gru_model.add(Input(shape=(X_train.shape[1], 1)))
    gru_model.add(GRU(units=50, return_sequences=True))
    gru_model.add(Dropout(0.35))
    gru_model.add(GRU(units=50, return_sequences=False))
    gru_model.add(Dropout(0.35))
    gru_model.add(Dense(units=1))
    gru_model.compile(optimizer='adam', loss='mean_squared_error')

    gru_model.fit(X_train, y_train, epochs=300, batch_size=32, verbose=0)

    # 4. 예측 수행
    gru_predicted_prices = gru_model.predict(X_test, verbose=0)
    gru_predicted_prices = scaler.inverse_transform(gru_predicted_prices)

    # 5. RMSE 계산 및 상한/하한 구간
    rmse = np.sqrt(np.mean((data[len(train_data) + time_step + 1:] - gru_predicted_prices) ** 2))
    upper_bound = gru_predicted_prices + rmse
    lower_bound = gru_predicted_prices - rmse

    # 6. 기존 MongoDB 데이터 삭제 후 새로운 데이터 삽입
    collection.delete_many({"ticker": symbol})  # 해당 티커의 기존 데이터 삭제

    # 7. 미래 60일 동안의 예측 데이터 삽입 (오늘부터 시작)
    predictions = []
    today = datetime.now()  # 오늘 날짜

    # 각 날짜별로 예측 데이터를 리스트에 저장
    for i in range(len(gru_predicted_prices)):
        future_date = today + timedelta(days=i + 1)  # 미래 날짜 계산
        predicted_price = float(gru_predicted_prices[i][0])
        upper = float(upper_bound[i][0])
        lower = float(lower_bound[i][0])

        # 예측 데이터를 리스트에 추가
        predictions.append({
            "target_date": future_date.strftime('%Y-%m-%d'),  # 미래 날짜로 설정
            "predicted_price": predicted_price,
            "upper_bound": upper,
            "lower_bound": lower
        })

    # MongoDB에 하나의 문서로 저장할 데이터 생성
    document = {
        "ticker": symbol,
        "Prediction_today": today.strftime('%Y-%m-%d'),  # 예측을 실행한 오늘 날짜 저장
        "predictions": predictions  # 60일치 예측 데이터를 리스트로 저장
    }

    # MongoDB에 데이터 삽입
    collection.insert_one(document)

    print(f"Prediction data for {symbol} has been saved to MongoDB as a single document.\n")



# import FinanceDataReader as fdr
# import yfinance as yf
# import pandas as pd
# import numpy as np
# from sklearn.preprocessing import MinMaxScaler
# from sklearn.model_selection import train_test_split
# from keras.models import Sequential
# from keras.layers import GRU, Dense, Dropout, Input
# from datetime import datetime, timedelta
# from mongo_config import get_mongo_connection
# from concurrent.futures import ThreadPoolExecutor, as_completed

# # 나스닥 모든 종목 리스트 가져오기
# nasdaq_symbols = fdr.StockListing('NASDAQ')['Symbol'].tolist()  # 나스닥 모든 종목 리스트 가져오기
# total_stocks = len(nasdaq_symbols)

# # MongoDB 연결
# db = get_mongo_connection()  # MongoDB 연결 가져오기
# collection = db['predictions']  # 사용할 컬렉션 선택

# # 2년 전 날짜와 현재 날짜 계산
# start = (datetime.now() - timedelta(days=730)).strftime('%Y-%m-%d')
# end = datetime.now().strftime('%Y-%m-%d')

# # 각 종목을 병렬로 처리하는 함수
# def process_symbol(symbol):
#     try:
#         print(f"Processing {symbol}...")

#         # 1. 해당 종목의 데이터를 가져오기
#         df = yf.download(symbol, start=start, end=end)

#         if df.empty:
#             print(f"No data available for {symbol}.")
#             return

#         # 2. 데이터 전처리
#         data = df['Close'].values.reshape(-1, 1)
#         scaler = MinMaxScaler(feature_range=(0, 1))
#         scaled_data = scaler.fit_transform(data)

#         train_data, test_data = train_test_split(scaled_data, test_size=0.3, shuffle=False)

#         if len(test_data) <= 61:
#             print(f"Not enough test data for {symbol}. Skipping this stock.")
#             return

#         def create_dataset(data, time_step=60):
#             X, y = [], []
#             for i in range(len(data) - time_step - 1):
#                 X.append(data[i:(i + time_step), 0])
#                 y.append(data[i + time_step, 0])
#             return np.array(X), np.array(y)

#         time_step = 60
#         X_train, y_train = create_dataset(train_data, time_step)
#         X_test, y_test = create_dataset(test_data, time_step)

#         X_train = X_train.reshape(X_train.shape[0], X_train.shape[1], 1)
#         X_test = X_test.reshape(X_test.shape[0], X_test.shape[1], 1)

#         # 3. GRU 모델 구축
#         gru_model = Sequential()
#         gru_model.add(Input(shape=(X_train.shape[1], 1)))
#         gru_model.add(GRU(units=50, return_sequences=True))
#         gru_model.add(Dropout(0.35))
#         gru_model.add(GRU(units=50, return_sequences=False))
#         gru_model.add(Dropout(0.35))
#         gru_model.add(Dense(units=1))
#         gru_model.compile(optimizer='adam', loss='mean_squared_error')

#         gru_model.fit(X_train, y_train, epochs=300, batch_size=32, verbose=0)

#         # 4. 예측 수행
#         gru_predicted_prices = gru_model.predict(X_test, verbose=0)
#         gru_predicted_prices = scaler.inverse_transform(gru_predicted_prices)

#         # 5. RMSE 계산 및 상한/하한 구간
#         rmse = np.sqrt(np.mean((data[len(train_data) + time_step + 1:] - gru_predicted_prices) ** 2))
#         upper_bound = gru_predicted_prices + rmse
#         lower_bound = gru_predicted_prices - rmse

#         # 6. 기존 MongoDB 데이터 삭제 후 새로운 데이터 삽입
#         collection.delete_many({"ticker": symbol})

#         # 7. 미래 60일 동안의 예측 데이터 삽입
#         predictions = []
#         today = datetime.now()

#         for i in range(len(gru_predicted_prices)):
#             future_date = today + timedelta(days=i + 1)
#             predicted_price = float(gru_predicted_prices[i][0])
#             upper = float(upper_bound[i][0])
#             lower = float(lower_bound[i][0])

#             predictions.append({
#                 "target_date": future_date.strftime('%Y-%m-%d'),
#                 "predicted_price": predicted_price,
#                 "upper_bound": upper,
#                 "lower_bound": lower
#             })

#         document = {
#             "ticker": symbol,
#             "Prediction_today": today.strftime('%Y-%m-%d'),
#             "predictions": predictions
#         }

#         collection.insert_one(document)
#         print(f"Prediction data for {symbol} has been saved to MongoDB.")
#     except Exception as e:
#         print(f"Error processing {symbol}: {e}")

# # ThreadPoolExecutor로 병렬 처리
# with ThreadPoolExecutor(max_workers=8) as executor:  # 워커 수는 시스템 성능에 맞게 조정
#     futures = [executor.submit(process_symbol, symbol) for symbol in nasdaq_symbols]

#     for future in as_completed(futures):
#         future.result()
