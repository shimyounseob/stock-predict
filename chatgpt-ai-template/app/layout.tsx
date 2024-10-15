'use client';

import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react'; 
import { StockProvider } from '../context/StockContext'; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: '100%', overflowY: 'auto' }}>
      <head>
        <title>Predict your stock</title> 
        <link rel="icon" href="/img/thumbnail/predict-your-stock.png" />
      </head>
      <body style={{ margin: 0, minHeight: '100%' }}>
        <SessionProvider> 
          <ChakraProvider>
            <StockProvider>
              {children}
            </StockProvider>
          </ChakraProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
