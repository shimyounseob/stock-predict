import { createContext, useState, ReactNode } from 'react';

// 주식 심볼을 저장하는 컨텍스트 타입 정의
interface StockContextType {
  stockSymbol: string;
  setStockSymbol: (symbol: string) => void;
}

// 초기값을 undefined로 설정하여 컨텍스트 생성
export const StockContext = createContext<StockContextType | undefined>(undefined);

// 컨텍스트 프로바이더 컴포넌트
export const StockProvider = ({ children }: { children: ReactNode }) => {
  const [stockSymbol, setStockSymbol] = useState('');

  return (
    <StockContext.Provider value={{ stockSymbol, setStockSymbol }}>
      {children}
    </StockContext.Provider>
  );
};
