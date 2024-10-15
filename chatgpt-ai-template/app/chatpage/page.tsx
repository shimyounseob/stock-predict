'use client';

import Link from '@/components/link/Link';
import MessageBoxChat from '@/components/MessageBox';
import { ChatBody, OpenAIModel } from '@/types/types';
import {
  Box,
  Button,
  Flex,
  Icon,
  Img,
  Input,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { MdAutoAwesome, MdBookmark, MdPerson } from 'react-icons/md';
import { useRouter, useSearchParams } from 'next/navigation';
import Bg from 'C:/Users/shimyunseop/vsworkspace/chat-stock/chatgpt-ai-template/public/img/chat/bg-image.png';
import { AlertModal } from '@/components/AlertModal'; // 모달 컴포넌트 가져오기

export default function Chat(props: { apiKeyApp: string }) {
  const router = useRouter(); // router 사용
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol') || ''; // URL에서 심볼 가져오기

  const [inputOnSubmit, setInputOnSubmit] = useState<string>(symbol);
  const [inputCode, setInputCode] = useState<string>(symbol);
  const [outputCode, setOutputCode] = useState<string>(''); 
  const [errorCode, setErrorCode] = useState<string>('');   
  const [model, setModel] = useState<OpenAIModel>('gpt-4o');
  const [loading, setLoading] = useState<boolean>(false);
  const [extractedTicker, setExtractedTicker] = useState<string | null>(null); // extractedTicker
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false); // 북마크 상태 

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const buttonBg = useColorModeValue('white', 'whiteAlpha.100');
  const textColor = useColorModeValue('navy.700', 'white');
  const gray = useColorModeValue('gray.500', 'white');

  // 북마크 여부 확인 함수
  const checkIfBookmarked = async () => {
    if (!extractedTicker) return; // extractedTicker가 설정되지 않으면 함수 실행 안함

    try {
      const response = await fetch('/api/getFavorite', {
        method: 'GET',
      });

      const result = await response.json();
      console.log('Favorite stocks:', result.favorites); // 북마크된 주식 목록을 로그로 출력
      console.log('Favorite current symbol:', extractedTicker);

      // 현재 symbol이 favorites 목록에 있는지 확인
      if (result.favorites && Array.isArray(result.favorites) && result.favorites.includes(extractedTicker)) {
        setIsBookmarked(true); // 현재 심볼이 북마크 목록에 있으면 true로 설정
      } else {
        setIsBookmarked(false); // 북마크 목록에 없으면 false로 설정
      }
    } catch (error) {
      console.error('Error checking favorite stocks:', error);
    }
  };

  // 페이지가 로드되었을 때 URL에 심볼이 있으면 chatAPI로 데이터를 요청
  useEffect(() => {
    if (symbol) {
      handleTranslate(); // URL에 심볼이 있으면 API 호출
    }
  }, [symbol]);

  const handleTranslate = async () => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    setInputOnSubmit(symbol); 
  
    const maxCodeLength = model === 'gpt-4o' ? 700 : 700;
  
    if (!apiKey) {
      setModalTitle('API Key Missing');
      setModalMessage('API key is missing. Please check your environment configuration.');
      setIsModalOpen(true);
      return;
    }
  
    if (!symbol) { // URL에 심볼이 없는 경우 처리
      setModalTitle('Input Required');
      setModalMessage('Please enter your message.');
      setIsModalOpen(true);
      return;
    }
  
    setOutputCode('');
    setLoading(true);
  
    try {
      // 1. letMeKnowTicker API를 먼저 호출해서 티커(symbol)를 받아옴

      const tickerResponse = await fetch('/api/letMeKnowTicker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputCode: symbol, model: model}), // 사용자 입력을 보내서 티커 추출
      });
  
      if (!tickerResponse.ok) {
        const errorMessage = `Failed to fetch ticker. Status: ${tickerResponse.status} - ${tickerResponse.statusText}`;
        
        console.error(errorMessage);  // 콘솔에 오류 메시지 출력
        
        throw new Error(errorMessage);  // 오류 메시지를 상태 코드와 함께 던짐
      }
  
      const extractedTicker = await tickerResponse.json();
      console.log("Ticker response received:", extractedTicker); // 응답 데이터 로그
      
  
      if (!extractedTicker || extractedTicker === 'invalid ticker') {
        setModalTitle('Invalid Ticker');
        setModalMessage('The ticker is invalid. Please verify and try again.');
        setIsModalOpen(true);
        setLoading(false);
        return;
      }

      setExtractedTicker(extractedTicker.ticker); // 티커를 상태로 저장
      console.log("setExtractedTicker: ", extractedTicker)
      
  
      // 2. 추출된 티커를 사용하여 chatAPI 호출
      const body: ChatBody = {
        inputCode: extractedTicker, 
        model,
        apiKey,
      };
  
      const chatResponse = await fetch('/api/chatAPI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
  
      if (!chatResponse.ok) {
        throw new Error('API request failed.');
      }
  
      const chatData = chatResponse.body;
  
      if (!chatData) {
        throw new Error('No data received from the API.');
      }
  
      const reader = chatData.getReader();
      const decoder = new TextDecoder();
      let done = false;
  
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setOutputCode((prevCode) => prevCode + chunkValue);
      }
    } catch (error: any) {
      setErrorCode(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (extractedTicker) {
      checkIfBookmarked(); // extractedTicker가 설정된 후에만 함수 실행
    }
  }, [extractedTicker]); // extractedTicker가 변경될 때마다 실행

  // 심볼을 URL에 추가하고 새로고침하는 함수
  const handleGetStockData = () => {
    const newUrl = `/chatpage?symbol=${inputCode}`; 
    router.push(newUrl);
    window.location.href = newUrl; // URL 변경 후 새로고침
  };

  const handleAddToFavorites = async () => {

    // 쉼표로 구분된 티커 문자열을 배열로 변환
    const tickerArray = extractedTicker?.split(',').map((ticker) => ticker.trim().toUpperCase());

    // 여러 개의 티커가 있을 경우 모달로 알림 표시
    if (tickerArray && tickerArray.length > 1) {
      setModalTitle('Multiple Tickers Detected');
      setModalMessage('Adding multiple tickers to favorites at once is not supported. Please add them one by one.');
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await fetch('/api/addFavorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputCode: extractedTicker }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        setModalTitle('Favorite Failed');
        setModalMessage(`Failed to add to favorites: ${result.error}`);
        setIsModalOpen(true);
      } else {
        setModalTitle('Favorite Added');
        setModalMessage('Stock added to favorites.');
        setIsModalOpen(true);
  
        // 북마크 상태 업데이트
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error adding stock to favorites:', error);
      setModalTitle('Error');
      setModalMessage('An error occurred while adding stock to favorites.');
      setIsModalOpen(true);
    }
  };
  
  const handleRemoveFromFavorites = async () => {
    try {
      const response = await fetch('/api/removeFavorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: extractedTicker }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        setModalTitle('Remove Favorite Failed');
        setModalMessage(`Failed to remove from favorites: ${result.error}`);
        setIsModalOpen(true);
      } else {
        setModalTitle('Favorite Removed');
        setModalMessage('Stock removed from favorites.');
        setIsModalOpen(true);
  
        // 북마크 상태 업데이트
        setIsBookmarked(false);
      }
    } catch (error) {
      console.error('Error removing stock from favorites:', error);
      setModalTitle('Error');
      setModalMessage('An error occurred while removing stock from favorites.');
      setIsModalOpen(true);
    }
  };

  return (
    <Flex
      w="100%"
      pt={{ base: '70px', md: '0px' }}
      direction="column"
      position="relative"
    >
      <Img
        src={Bg.src}
        position={'absolute'}
        w="350px"
        left="50%"
        top="50%"
        transform={'translate(-50%, -50%)'}
      />
      <Flex
        direction="column"
        mx="auto"
        w={{ base: '100%', md: '100%', xl: '100%' }}
        minH={{ base: '75vh', '2xl': '85vh' }}
        maxW="1000px"
      >
        {/* 모달 컴포넌트 삽입 */}
        <AlertModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalTitle}
          message={modalMessage}
        />

        <Flex direction={'column'} w="100%" mb={outputCode || errorCode ? '20px' : 'auto'}></Flex>

        {/* Output Message */}
        <Flex direction="column" w="100%" mx="auto" display={outputCode || errorCode ? 'flex' : 'none'} mb={'auto'}>
          <Flex w="100%" align={'center'} mb="10px">
            <Flex
              borderRadius="full"
              justify="center"
              align="center"
              bg={'transparent'}
              border="1px solid"
              borderColor={borderColor}
              me="20px"
              h="40px"
              minH="40px"
              minW="40px"
            >
              <Icon as={MdPerson} width="20px" height="20px" color="navy.700" />
            </Flex>
            <Flex
              p="22px"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="14px"
              w="100%"
              zIndex={'2'}
            >
              <Text
                color={textColor}
                fontWeight="600"
                fontSize={{ base: 'sm', md: 'md' }}
                lineHeight={{ base: '24px', md: '26px' }}
              >
                {inputOnSubmit}
              </Text>
              <Icon as={MdBookmark} 
                cursor="pointer" 
                ms="auto" 
                width="20px" 
                height="20px"  
                color={isBookmarked ? '#4a25e1' : 'gray'} 
                onClick={isBookmarked ? handleRemoveFromFavorites : handleAddToFavorites} />
            </Flex>
          </Flex>

          {/* Stock Data */}
          <Flex w="100%" direction="column">
            {outputCode && (
              <Flex w="100%">
                <Flex
                  borderRadius="full"
                  justify="center"
                  align="center"
                  bg={'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)'}
                  me="20px"
                  h="40px"
                  minH="40px"
                  minW="40px"
                >
                  <Icon as={MdAutoAwesome} width="20px" height="20px" color="white" />
                </Flex>
                <MessageBoxChat output={outputCode} />
              </Flex>
            )}

            {errorCode && (
              <Flex w="100%">
                <Flex
                  borderRadius="full"
                  justify="center"
                  align="center"
                  bg={'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)'}
                  me="20px"
                  h="40px"
                  minH="40px"
                  minW="40px"
                >
                  <Icon as={MdAutoAwesome} width="20px" height="20px" color="white" />
                </Flex>
                <MessageBoxChat output={errorCode} />
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Input */}
        <Flex ms={{ base: '0px', xl: '60px' }} mt="20px" justifySelf={'flex-end'}>
          <Input
            minH="54px"
            h="100%"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="45px"
            p="15px 20px"
            me="10px"
            fontSize="sm"
            fontWeight="500"
            _focus={{ borderColor: 'none' }}
            color={inputColor}
            placeholder="Type your message here..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
          />
          <Button
            variant="primary"
            py="20px"
            px="16px"
            fontSize="sm"
            borderRadius="45px"
            ms="auto"
            w={{ base: '160px', md: '210px' }}
            h="54px"
            _hover={{
              boxShadow: '0px 21px 27px -10px rgba(96, 60, 255, 0.48)',
              bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
              _disabled: { bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)' },
            }}
            onClick={handleGetStockData} // 검색 API 호출 및 URL 업데이트
            isLoading={loading ? true : false}
          >
            Submit
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
