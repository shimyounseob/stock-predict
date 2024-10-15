'use client';
// chakra imports
import {
  Box,
  Button,
  Flex,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc'; // 구글 아이콘 추가
import { signIn, signOut, useSession } from 'next-auth/react'; // next-auth import
import Brand from '@/components/sidebar/components/Brand';
import Links from '@/components/sidebar/components/Links';
import { PropsWithChildren, useEffect } from 'react';
import { IRoute } from '@/types/navigation';
import { useRouter } from 'next/navigation';

// FUNCTIONS

interface SidebarContent extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function SidebarContent(props: SidebarContent) {
  const { routes } = props;
  const textColor = useColorModeValue('navy.700', 'white');
  const { data: session, status } = useSession(); // next-auth 세션 정보 가져오기
  const router = useRouter();

  // 세션이 변경되거나 로그인 상태가 업데이트될 때 사용자의 정보를 MongoDB에 저장하는 함수
  useEffect(() => {
    const saveUserToDB = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          // MongoDB API 호출하여 사용자 정보 저장
          const response = await fetch('/api/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name,
            }),
          });

          if (response.ok) {
            console.log('User information saved successfully.');
          } else {
            console.log('Failed to save user information.');
          }
        } catch (error) {
          console.error('Error saving user to the database:', error);
        }
      }
    };

    saveUserToDB();
  }, [session, status]);

  // 로그인/로그아웃 처리 함수
  const handleAuth = () => {
    if (status === 'authenticated') {
      signOut(); // 로그아웃 처리
    } else {
      signIn('google'); // 구글 로그인
    }
  };

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
      <Brand />

      {/* Google 로그인 버튼을 상단에 배치 */}
      <Box mt="10px" width={'100%'} display={'flex'} justifyContent={'center'}>
        <Button
          leftIcon={<FcGoogle />} // 구글 아이콘
          colorScheme="gray"
          variant="ghost"
          w="100%"
          onClick={handleAuth} // 클릭 시 로그인/로그아웃 처리
        >
          {status === 'authenticated' ? 'Log out' : 'Log in with Google'} {/* 로그인 상태에 따라 텍스트 변경 */}
        </Button>
      </Box>

      {/* 나머지 링크 */}
      <Stack direction="column" mb="auto" mt="8px">
        <Box ps="0px" pe={{ md: '0px', '2xl': '0px' }}>
          <Links routes={routes} />
        </Box>
      </Stack>
    </Flex>
  );
}

export default SidebarContent;
