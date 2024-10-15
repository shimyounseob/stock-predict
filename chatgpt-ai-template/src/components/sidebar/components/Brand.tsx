'use client';
// Chakra imports
import { Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { FaChartLine } from 'react-icons/fa'; 

import { HSeparator } from '@/components/separator/Separator';

export function SidebarBrand() {
  //   Chakra color mode
  let logoColor = useColorModeValue('navy.700', 'white');
  let iconColor = useColorModeValue('teal.500', 'orange.300'); 
  return (
    <Flex alignItems="center" flexDirection="column">
      {/* 아이콘과 텍스트를 가로로 배치 */}
      <Flex alignItems="center" my="30px">
        {/* 주식 차트 아이콘 */}
        <FaChartLine size="26px" color="#4a25e1"/>
        {/* 텍스트 */}
        <Text
          fontSize="18px"
          fontWeight="bold"
          color={logoColor}
          ml="10px"
          letterSpacing="wide"
        >
          Predict your stock
        </Text>
      </Flex>
      <HSeparator mb="20px" w="284px" />
    </Flex>
  );
}

export default SidebarBrand;
