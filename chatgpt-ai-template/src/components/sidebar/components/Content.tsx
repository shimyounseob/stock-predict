'use client';
import React, { useEffect, useState } from 'react';
// chakra imports
import {
  Badge,
  Box,
  Flex,
  Icon,
  Stack,
  Text,
  useColorModeValue,
  Spinner,
  Button,
} from '@chakra-ui/react';
import { IoMdTrendingUp, IoMdTrendingDown } from 'react-icons/io';
import Brand from '@/components/sidebar/components/Brand';
import { CloseIcon } from '@chakra-ui/icons';

function SidebarContent() {
  const [favorites, setFavorites] = useState<string[]>([]); // 티커 목록
  const [stockData, setStockData] = useState<Record<string, any>[]>([]); // 주식 데이터 저장
  const [loading, setLoading] = useState(true); // 로딩 상태 저장

  interface StockData {
    current_price: number;
    change_percent: number;
  }

  // API에서 북마크한 주식 티커 가져오기
  const fetchFavorites = async () => {
    try {
      console.log('Fetching favorites from /api/getFavorite'); // 로그 추가
      const response = await fetch('/api/getFavorite'); // Next.js API 호출 (티커 목록 가져오기)

      // HTTP 응답 상태 코드 확인
      if (!response.ok) {
        throw new Error(`Error fetching favorites: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Favorites fetched successfully:', data); // API에서 받은 데이터 확인
      setFavorites(data.favorites || []); // API에서 받은 데이터 설정

      // 즐겨찾기 주식 데이터를 Flask 서버에서 가져옴
      console.log('Fetching stock data from /api/getFavStock'); // 로그 추가
      const stockResponse = await fetch('/api/getFavStock'); // Flask 서버에서 주식 데이터 가져오기

      // HTTP 응답 상태 코드 확인
      if (!stockResponse.ok) {
        throw new Error(`Error fetching stock data: ${stockResponse.statusText}`);
      }

      const stockData = await stockResponse.json();
      console.log('Stock data fetched successfully:', stockData); // 주식 데이터 확인
      setStockData(stockData); // 주식 데이터 설정
    } catch (error) {
      console.error('Error in fetching favorites or stock data:', error); // 에러 로그 출력
    } finally {
      setLoading(false); // 로딩 완료
    }
  };

  useEffect(() => {
    fetchFavorites(); // 컴포넌트 마운트 시 주식 목록을 가져옴
  }, []);

  // 종목 클릭 시 해당 종목을 검색하는 함수 (window.location 사용)
  const handleStockClick = (symbol: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/chatpage?symbol=${symbol}`;
    }
  };

  // 즐겨찾기에서 주식 삭제하는 함수
  const handleRemoveFavorite = async (symbol: string) => {
    try {
      await fetch('/api/removeFavorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }), // 서버에 삭제할 티커 전달
      });

      // 삭제된 티커를 favorites 배열에서 제거 후 즉시 반영
      setFavorites((prevFavorites) =>
        prevFavorites.filter((fav) => fav !== symbol)
      );

      // 상태 업데이트 후 주식 목록 다시 불러오기
      fetchFavorites(); // 즐겨찾기 목록을 갱신하여 즉시 반영
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  // 주식을 즐겨찾기에 추가한 후 즉시 반영하는 함수 (필요시 추가)
  const handleAddFavorite = async (symbol: string) => {
    try {
      await fetch('/api/addFavorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }), // 서버에 추가할 티커 전달
      });

      // favorites 배열에 새로운 티커 추가 후 즉시 반영
      setFavorites((prevFavorites) => [...prevFavorites, symbol]);

      // 상태 업데이트 후 주식 목록 다시 불러오기
      fetchFavorites(); // 즐겨찾기 목록을 갱신하여 즉시 반영
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const textColor = useColorModeValue('navy.700', 'white');
  const bgColor = useColorModeValue('white', 'navy.700');
  const shadowPillBar = useColorModeValue(
    '4px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    'none'
  );

  return (
    <Flex
      direction="column"
      height="100%"
      pt="20px"
      pb="26px"
      borderRadius="30px"
      maxW="285px"
      px="20px"
    >
      <Brand /> {/* Brand 컴포넌트 유지 */}
      <Stack direction="column" mt="20px" spacing="4">
        {loading ? (
          <Flex justifyContent="center" alignItems="center" height="100%">
            <Spinner size="xl" /> {/* 가운데에서 로딩되게 설정 */}
          </Flex>
        ) : (
          stockData.map((stock) => { // stockData에서 모든 주식 데이터를 순회
            const isPositive = stock.change_percent >= 0; // 주가 변화가 양수인지 확인
            const color = isPositive ? 'green.500' : 'red.500';
            const IconComponent = isPositive
              ? IoMdTrendingUp
              : IoMdTrendingDown;

            return (
              <Flex
                key={stock.symbol} // 주식 심볼을 key로 사용
                justify="space-between"
                align="center"
                p="12px"
                bg={bgColor}
                borderRadius="12px"
                boxShadow={shadowPillBar}
                border={`1px solid ${color}`}
                onClick={() => handleStockClick(stock.symbol)} // 클릭 시 종목 검색
                cursor="pointer" // 클릭 가능하도록 커서 변경
              >
                <Icon as={IconComponent} boxSize={6} color={color} />
                <Box>
                  <Text fontWeight="bold" color={textColor}>
                    {stock.symbol}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {stock.symbol}
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Text fontWeight="bold" color={textColor}>
                    {stock.current_price} USD
                  </Text>
                  <Badge colorScheme={isPositive ? 'green' : 'red'}>
                    {stock.change_percent.toFixed(2)}%
                  </Badge>
                </Box>
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // 삭제 버튼 클릭 시 부모 클릭 이벤트 방지
                    handleRemoveFavorite(stock.symbol);
                  }}
                  variant="ghost"
                  colorScheme="red"
                  size="sm"
                  ml={4}
                >
                  <CloseIcon boxSize={2.5} />
                </Button>
              </Flex>
            );
          })
        )}
      </Stack>
    </Flex>
  );
}

export default SidebarContent;
