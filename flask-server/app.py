from flask import Flask, Blueprint, jsonify, request
import yfinance as yf

app = Flask(__name__)

# 즐겨찾기 주식 정보 엔드포인트 블루프린트
fav_stock_bp = Blueprint('fav_stock_bp', __name__)

# 사용자의 즐겨찾기 주식 정보를 처리하는 엔드포인트
@fav_stock_bp.route('/getFavStock', methods=['POST'])  # POST 요청으로 주식 목록을 받음
def get_favorite_stocks():
    try:
        # Next.js에서 받은 주식 목록을 처리
        data = request.json
        favorites = data.get('favorites', [])

        if not favorites:
            return jsonify({'error': 'No favorites provided'}), 400

        # 각 즐겨찾기 주식 종목의 데이터를 가져옴
        stock_data = []
        for symbol in favorites:
            stock = yf.Ticker(symbol)
            stock_info = stock.history(period="5d")  # 최근 5일간 데이터 가져오기

            # 최소 2일치 데이터가 있어야 전일 대비 변동률을 계산 가능
            if len(stock_info) >= 2:
                current_price = stock_info['Close'].iloc[-1]  # 현재 종가 (가장 최근 값)
                previous_close = stock_info['Close'].iloc[-2]  # 전일 종가 (그 전날 값)

                print(f"Original Current Price: {current_price}")
                print(f"Original Previous Close: {previous_close}")

                # 변동률 계산 (계산 후 소수점 두 자리 유지)
                change_percent = ((current_price - previous_close) / previous_close) * 100
                print(f"Original change_percent: {change_percent}")
                change_percent = round(change_percent, 2)  # 변동률은 소수점 2자리로 제한

                # 변동률 계산 후 종가와 전일 종가는 소수점 1자리로 변환
                current_price = round(current_price, 1)
                previous_close = round(previous_close, 1)

                print(f"Symbol: {symbol}")
                print(f"Current Price: {current_price}")
                print(f"Previous Close: {previous_close}")
                print(f"Change Percent: {change_percent}%")

                stock_data.append({
                    'symbol': symbol,
                    'current_price': current_price,  # 종가는 소수점 1자리
                    'previous_close': previous_close,  # 전일 종가도 소수점 1자리
                    'change_percent': change_percent  # 변동률은 소수점 2자리
                })
            else:
                stock_data.append({
                    'symbol': symbol,
                    'error': 'Not enough data to calculate change percent'
                })

        return jsonify(stock_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# 6개월 주식 정보 엔드포인트 블루프린트
six_month_stock_bp = Blueprint('six_month_stock_bp', __name__)

# 6개월간의 주식 데이터를 처리하는 엔드포인트
@six_month_stock_bp.route('/getSixMonthStock', methods=['POST'])
def get_six_month_stock():
    try:
        data = request.json
        print("Received Data:", data)
        stock_symbol = data.get('symbol', '').upper()

        # 요청에서 주식 심볼이 제공되지 않으면 오류 반환
        if not stock_symbol:
            print("Error: No stock symbol provided")  # 디버그 출력
            return jsonify({'error': 'No stock symbol provided'}), 400

        # yfinance로 주식 정보 가져오기
        stock = yf.Ticker(stock_symbol)
        stock_info = stock.history(period="6mo")  # 최근 6개월 데이터 가져오기

        # 주식 데이터가 없는 경우
        if stock_info.empty:
            print(f"Error: No data found for symbol {stock_symbol}")  # 디버그 출력
            return jsonify({'error': f'No data found for symbol {stock_symbol}'}), 404

        # 데이터 가공: 필요한 정보만 추출하고 소수점 두 자리로 자름
        stock_data = []
        for index, row in stock_info.iterrows():
            stock_data.append({
                'date': index.strftime('%Y-%m-%d'),
                'open': round(row['Open'], 2),
                'high': round(row['High'], 2),
                'low': round(row['Low'], 2),
                'close': round(row['Close'], 2)
            })

        # 주식 데이터 성공적으로 가져온 경우
        print(f"Successfully fetched data for {stock_symbol}")  # 디버그 출력
        return jsonify({'symbol': stock_symbol, 'data': stock_data})

    except Exception as e:
        # 오류 발생 시 오류 내용 출력
        print(f"Exception occurred: {e}")  # 디버그 출력
        return jsonify({'error': str(e)}), 500


# 블루프린트 등록
app.register_blueprint(fav_stock_bp)
app.register_blueprint(six_month_stock_bp)

# Flask 서버 실행
if __name__ == '__main__':
    app.run(debug=True)
