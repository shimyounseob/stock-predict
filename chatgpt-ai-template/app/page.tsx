'use client';

import {
  Box,
  Text,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  useDisclosure,
  SimpleGrid,
  keyframes,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { FaSearch, FaChartLine, FaRobot, FaBookmark } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/footer/FooterAdmin';
import Sidebar from '@/components/sidebar/SidebarDrawer';

// 모션 효과를 위한 keyframes 설정
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 40px, 0);
    visibility: visible;
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

export default function HomePage() {
  const [stock, setStock] = useState(''); // 검색할 주식 심볼을 저장하는 상태
  const router = useRouter(); // useRouter 사용하여 router 변수 정의
  const featureSectionRef = useRef(null); // 모션을 위한 ref 설정
  const { isOpen: isFeatureVisible, onOpen: showFeature } = useDisclosure(); // 모션 상태 관리
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure(); // 모달 상태 관리
  const [modalMessage, setModalMessage] = useState(''); // 모달 메시지 저장 상태
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null); // 로그인 여부 확인

  useEffect(() => {
    // 로그인 여부 확인 로직 추가 (API 호출로 확인)
    const checkLogin = async () => {
      try {
        const response = await fetch('/api/checkLogin'); // 로그인 여부를 확인하는 API 호출
        const data = await response.json();

        if (data.loggedIn) {
          setLoggedIn(true); // 로그인 상태 확인
        } else {
          setLoggedIn(false); // 로그아웃 상태
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setLoggedIn(false); // 오류 발생 시 로그아웃 상태로 처리
      }
    };

    checkLogin();

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          showFeature(); // 기능 섹션이 화면에 보이면 애니메이션 실행
        }
      },
      { threshold: 0.1 }
    );

    if (featureSectionRef.current) {
      observer.observe(featureSectionRef.current);
    }

    return () => {
      if (featureSectionRef.current) {
        observer.unobserve(featureSectionRef.current);
      }
    };
  }, [featureSectionRef, showFeature]);

  // 검색 버튼 클릭 시 실행되는 함수
  const handleSearch = () => {
    if (loggedIn === null) {
      // 로그인 여부가 확인되지 않은 경우 로딩 중
      return;
    }

    if (!loggedIn) {
      setModalMessage('Please log in to use the search feature.');
      openModal(); // 로그인이 안되어 있으면 모달을 띄움
      return;
    }

    if (stock.trim() === '') {
      setModalMessage('Please enter a stock symbol.');
      openModal(); // 검색어가 없으면 모달을 띄움
    } else {
      const stockSymbol = stock.trim().toUpperCase();
      router.push(`/chatpage?symbol=${stockSymbol}`); // URL에 주식 심볼 전달
    }
  };

  return (
    <Box fontFamily="'DM Sans', sans-serif" position="relative">
      <Sidebar routes={[]} />

      <Box
        textAlign="center"
        py={64}
        color="white"
        position="relative"
        overflow="hidden"
        bgImage="url('/img/chat/png-usstock.png')"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        _after={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bg: 'black',
          opacity: 0.7,
          zIndex: 1,
        }}
      >
        <Box position="relative" zIndex={2}>
          <Heading
            fontSize="6xl"
            animation={`${fadeInUp} 1s ease-out`} // 모션 추가
            mb={4}
            fontFamily="'DM Sans', sans-serif"
          >
            Predict the Future of the Stock Market
          </Heading>
          <Text
            fontSize="xl"
            animation={`${fadeInUp} 1.5s ease-out`} // 모션 추가
            opacity={0.85}
            fontFamily="'DM Sans', sans-serif"
          >
            Optimize your investment strategy with AI-driven predictions.
          </Text>

          {/* 검색창 */}
          <InputGroup
            mt={8}
            size="lg"
            maxW="600px"
            mx="auto"
            animation={`${fadeInUp} 2s ease-out`} // 모션 추가
          >
            <InputLeftElement
              pointerEvents="none"
              children={<Icon as={FaSearch} color="gray.400" />}
            />
            <Input
              placeholder="Search stocks..."
              bg="white"
              color="black"
              borderRadius="full"
              _placeholder={{ color: 'gray.500' }}
              boxShadow="md"
              _hover={{
                bg: '#f0f4f8',
                transition: 'background-color 0.3s ease',
              }}
              onChange={(e) => setStock(e.target.value)} // 입력된 주식 심볼을 상태로 저장
            />
            <InputRightElement width="auto">
              <Button
                variant="primary"
                h="100%"
                borderRadius="0 45px 45px 0"
                fontSize="sm"
                px="30px"
                bg="linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)"
                boxShadow="none"
                color="white"
                onClick={handleSearch} // 검색 버튼 클릭 시 주식 심볼 저장
              >
                Search
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>
      </Box>

      {/* 기능 섹션 */}
      <Box py={20} bg="white" ref={featureSectionRef}>
        <Heading
          textAlign="center"
          mb={10}
          animation={isFeatureVisible ? `${fadeInUp} 1s ease-out` : ''} // 모션 추가
          opacity={isFeatureVisible ? 1 : 0}
          visibility={isFeatureVisible ? 'visible' : 'hidden'}
          color="#1c274c"
          fontFamily="'DM Sans', sans-serif"
        >
          Key Features
        </Heading>

        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          spacing={10}
          maxW="1200px"
          mx="auto"
          px={4}
        >
          {[
            {
              icon: FaRobot,
              title: 'AI Algorithms',
              description: 'Predict stock trends using advanced LSTM and GRU models.',
              delay: '0.2s',
            },
            {
              icon: FaChartLine,
              title: 'Detailed & Accurate Analysis',
              description: 'Get comprehensive insights into stock performance and market trends.',
              delay: '0.4s',
            },
            {
              icon: FaBookmark,
              title: 'Bookmark Management',
              description: 'Easily bookmark and track your favorite stocks with regular updates.',
              delay: '0.6s',
            },
          ].map((feature, index) => (
            <Box
              key={index}
              p={10}
              bg="white"
              borderRadius="md"
              shadow="md"
              textAlign="center"
              animation={isFeatureVisible ? `${fadeInUp} 1s ease-out ${feature.delay}` : ''} // 모션 추가
              opacity={isFeatureVisible ? 1 : 0}
              visibility={isFeatureVisible ? 'visible' : 'hidden'}
              _hover={{
                transform: 'scale(1.05)',
                transition: 'transform 0.4s ease',
              }}
            >
              <Icon
                as={feature.icon}
                w={16}
                h={16}
                color="#4a25e1"
                mb={4}
              />
              <Heading fontSize="xl" mb={2} color="#1c274c" fontFamily="'DM Sans', sans-serif">
                {feature.title}
              </Heading>
              <Text color="#718096" fontFamily="'DM Sans', sans-serif">
                {feature.description}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Footer */}
      <Footer />

      {/* 모달 추가 */}
      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Notification</ModalHeader>
          <ModalBody>
            <Text>{modalMessage}</Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeModal} backgroundColor="#4a25e1" color="white">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
