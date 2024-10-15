import { useEffect, useState } from 'react';
import { useColorModeValue, Box, Text, Spinner } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';  // URL 파라미터를 가져오기 위해 추가
import Card from '@/components/card/Card';
import dynamic from 'next/dynamic';

// ApexChart를 동적으로 로드하고 SSR을 비활성화함
const ApexChart = dynamic(() => import('react-apexcharts').then((mod) => mod.default), { ssr: false });

export default function MessageBox(props: { output: string }) {
  const { output } = props;
  const [showChart, setShowChart] = useState(false); // 차트를 표시 여부
  const [stockData, setStockData] = useState<any[]>([]); // 각 주식 데이터를 배열로 관리
  const [predictionData, setPredictionData] = useState<any[]>([]); // 예측 데이터를 관리
  const [ReactMarkdown, setReactMarkdown] = useState<any>(null); // 동적으로 react-markdown 로드
  const textColor = useColorModeValue('navy.700', 'white');

  // URL에서 주식 심볼을 가져옴
  const searchParams = useSearchParams();
  const stockSymbols = searchParams.get('symbol') || ''; // URL에서 심볼 가져오기

  // 티커를 추출하는 함수 (letMeKnowTicker API 호출)
  const fetchTicker = async (stockSymbols: string) => {
    try {
      const response = await fetch('/api/letMeKnowTicker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputCode: stockSymbols, model: 'gpt-4o' }),  // 심볼을 서버로 전송
      });

      const data = await response.json();

      if (response.ok && data.ticker) {
        return data.ticker;  // 성공적으로 티커를 반환
      } else {
        console.error("Invalid ticker received");
        return null;
      }
    } catch (error) {
      console.error('Error fetching ticker:', error);
      return null;
    }
  };

  // API에서 주식 데이터를 가져오는 함수
  const fetchStockData = async (symbols: string) => {
    try {
      console.log('API 호출 시작, stockSymbols:', symbols);

      const response = await fetch('/api/getStockData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Received stock data:", data);
        setStockData(data); // 주식 데이터를 설정
        console.log("Stock Data:", data);  // 과거 데이터 콘솔 출력
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  // API에서 미래 예측 데이터를 가져오는 함수
  const fetchPredictionData = async (symbols: string) => {
    try {
      const response = await fetch('/api/futureData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols: symbols }),  // 예측 데이터 가져옴
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Received prediction data:', data);
        console.log('Future Data:', data.predictionData);  // 미래 예측 데이터 콘솔 출력
        setPredictionData(data.predictionData); // 예측 데이터를 설정
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching prediction data:', error);
    }
  };

  useEffect(() => {
    // 동적 import로 ReactMarkdown 로드
    import('react-markdown').then((mod) => {
      setReactMarkdown(() => mod.default);
    });
  
    if (stockSymbols) {
      console.log("API 호출 전, stockSymbols:", stockSymbols);  // 이 시점에서 확인
  
      // 1. 먼저 letMeKnowTicker API를 호출하여 유효한 티커를 받음
      fetchTicker(stockSymbols).then((ticker) => {
        if (ticker) {
          console.log("Extracted Ticker:", ticker);  // 추출된 티커 로그
  
          // 2. 티커가 추출되면 주식 데이터를 가져오는 API를 호출
          fetchStockData(ticker);
          
          // 3. 예측 데이터를 가져오는 API 호출
          fetchPredictionData(ticker);
  
          setShowChart(true);
        } else {
          console.error("No valid ticker found");
          setShowChart(false);  // 티커가 없으면 차트 표시 안함
        }
      });
    } else {
      setShowChart(false);  // stockSymbols가 없을 경우 차트 표시 안함
    }
  }, [stockSymbols]);

  const renderWithChart = (content: string) => {
    const parts = content.split('3. Stock price data');

    console.log("renderWithChart Stock Data:", stockData);
    console.log("renderWithChart Prediction Data:", predictionData);

    return (
        <>
            {ReactMarkdown && <ReactMarkdown>{parts[0]}</ReactMarkdown>}
            {parts.length > 1 && (
                <>
                    <Box mt={4}>
                        <p style={{ marginTop: '20px', fontWeight: 'bold' }}>3. Stock price data</p>
                        {showChart && stockData.length > 0 && predictionData.length > 0 ? (
                            stockData.map((stock) => {
                                // predictionData에서 해당 종목의 예측 데이터를 찾음
                                const matchingPrediction = predictionData.find(
                                    (prediction) => prediction.symbol === stock.symbol
                                );
                                
                                // 매칭 결과 로그 출력
                                console.log(`Symbol: ${stock.symbol}`);
                                console.log("Matching Prediction:", matchingPrediction);
                                console.log("Stock Data for Symbol:", stock.data.data);

                                // 매칭되는 예측 데이터를 찾은 경우에만 차트를 그리기
                                return matchingPrediction ? (
                                    <StockChart
                                        key={stock.symbol}
                                        data={stock.data.data}  // 과거 주식 데이터
                                        prediction={matchingPrediction.predictions}  // 예측 데이터
                                        symbol={stock.symbol}
                                    />
                                ) : (
                                    // 매칭되지 않으면 null 반환
                                    <p key={stock.symbol}>No matching prediction data for {stock.symbol}</p>
                                );
                            })
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" height="350px">
                                <Spinner size="xl" />
                            </Box>
                        )}
                    </Box>
                    {ReactMarkdown && <ReactMarkdown>{parts[1]}</ReactMarkdown>}
                </>
            )}
        </>
    );
};


  return (
    <Card
      display={output ? 'flex' : 'none'}
      px="22px !important"
      pl="22px !important"
      color={textColor}
      minH="450px"
      fontSize={{ base: 'sm', md: 'md' }}
      lineHeight={{ base: '24px', md: '26px' }}
      fontWeight="500"
      whiteSpace="pre-line"
      overflowWrap="break-word"
    >
      <Box>{renderWithChart(output)}</Box>
    </Card>
  );
}

// 차트를 표시하는 컴포넌트 (과거 데이터 + 예측 데이터)
const StockChart = ({ data, prediction, symbol }: { data: Array<{ date: string; open: number; high: number; low: number; close: number }>, prediction?: Array<{ target_date: string; predicted_price: number; upper_bound: number; lower_bound: number }>, symbol: string }) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // 원본 데이터를 콘솔에 출력
    console.log("Original Data (Before Transformation):", data);
    console.log("Original Prediction (Before Transformation):", prediction);

    // 과거 데이터 변환
    const seriesData = data.map((day) => ({
      x: new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),  // 날짜 형식 맞춤
      y: [day.open, day.high, day.low, day.close],
    }));

    console.log("Transformed Stock Data:", seriesData); // 변환된 과거 데이터 출력

    let futureData: Array<{ x: string; y: number[] }> = [];  // futureData 타입 명시

    // prediction이 있는 경우에만 변환 진행
    if (prediction && prediction.length > 0) {
      // 전일 종가 가져오기 (과거 데이터 마지막 항목의 close 값)
      let previousClose = seriesData[seriesData.length - 1]?.y[3];

      // 예측 데이터 변환: open은 전일 종가, close는 predicted_price
      futureData = prediction.map((day) => {
        const open = previousClose;  // 전일 종가를 open으로 설정
        const close = parseFloat(day.predicted_price.toFixed(2));  // close를 predicted_price로 설정
        previousClose = close;  // 다음 날의 open에 사용하기 위해 close 값을 업데이트

        return {
          x: new Date(day.target_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          y: [
            open,  // open은 전일 종가
            parseFloat(day.upper_bound.toFixed(2)),  // high는 upper_bound
            parseFloat(day.lower_bound.toFixed(2)),  // low는 lower_bound
            close  // close는 predicted_price
          ]
        };
      });
      
      console.log("Transformed Prediction Data:", futureData); // 예측 데이터 변환 후 출력
    }

    setChartData({
      series: [
        {
          name: 'Price',
          data: seriesData.concat(futureData),  // 과거 데이터와 예측 데이터를 함께 연결 (예측 데이터가 없는 경우 과거 데이터만 연결)
        },
      ],
      options: {
        chart: {
          type: 'candlestick',
          height: 350,
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 2500, // 애니메이션 속도 설정 (2.5초)
            animateGradually: {
              enabled: true,
              delay: 100,
            },
            dynamicAnimation: {
              enabled: true,
              speed: 800, // 데이터가 추가될 때 애니메이션 속도
            },
          },
        },
        xaxis: {
          type: 'datetime',  // x축을 날짜로 설정
        },
        yaxis: {
          tooltip: {
            enabled: true,
          },
        },
      },
    });
  }, [data, prediction]);

  if (!chartData) {
    return <p>Loading chart...</p>;
  }

  return (
    <Box>
      <ApexChart options={chartData.options} series={chartData.series} type="candlestick" height={350} />
      <Text fontSize="md" fontWeight="semibold" mb={2} pl="20px">
        {symbol} Stock Chart
      </Text>
    </Box>
  );
};
