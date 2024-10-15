import FinanceDataReader as fdr
import pandas as pd

# 나스닥 상장 종목 리스트 가져오기
nasdaq_symbols = fdr.StockListing('NASDAQ')

# 종목 티커만 추출하여 DataFrame으로 변환
ticker_df = nasdaq_symbols[['Symbol']]  # 'Symbol' 열만 선택

# 로컬 디렉토리에 CSV 파일로 저장
ticker_df.to_csv('nasdaq_tickers.csv', index=False, encoding='utf-8-sig')

print("나스닥 종목 티커를 nasdaq_tickers.csv 파일로 저장했습니다.")
