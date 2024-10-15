'use client';
import React, { PropsWithChildren } from 'react';

// chakra imports
import {
  Box,
  Drawer,
  DrawerBody,
  Icon,
  useColorModeValue,
  DrawerOverlay,
  useDisclosure,
  DrawerContent,
  DrawerCloseButton,
  Flex,
} from '@chakra-ui/react';
import Content from '@/components/sidebar/components/HomeContent';
import { IoMenuOutline } from 'react-icons/io5';
import { IRoute } from '@/types/navigation';

export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function Sidebar(props: SidebarProps) {
  const { routes, setApiKey } = props;
  const { isOpen, onOpen, onClose } = useDisclosure(); // Sidebar open/close 상태 관리

  // Logarithmic easing for the transition (more sophisticated motion)
  let variantChange = '0.3s cubic-bezier(0.25, 1.25, 0.5, 1)'; 
  let shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    'unset',
  );
  let sidebarBg = useColorModeValue('white', 'navy.800');
  let sidebarRadius = '14px';

  return (
    <>
      {/* 햄버거 메뉴 아이콘 (하얀색으로 변경) */}
      <Flex position="fixed" top="20px" left="20px" zIndex="1000">
        <Icon
          as={IoMenuOutline}
          w="30px"
          h="30px"
          color="white"  // 햄버거 아이콘을 하얀색으로 변경
          _hover={{ cursor: 'pointer' }}
          onClick={onOpen} // 햄버거 아이콘 클릭 시 Drawer 열기
        />
      </Flex>

      {/* 사이드바 Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        size="xs" // 사이드바 크기 조정
      >
        <DrawerOverlay />
        <DrawerContent
          bg={sidebarBg}
          transition={variantChange} 
          boxShadow={shadow}
          borderRadius={sidebarRadius}
        >
          <DrawerCloseButton
            zIndex="3"
            onClick={onClose}
            _focus={{ boxShadow: 'none' }}
            _hover={{ boxShadow: 'none' }}
          />
          <DrawerBody p="0" overflow="hidden"> {/* 스크롤바 없앰 */}
            {/* 사이드바 내용 */}
            <Box p={4}>
              <Content setApiKey={setApiKey} routes={routes} />
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default Sidebar;
