const jwt = require('jsonwebtoken');

// JWT payload 설정
const payload = {
  sub: '1234567890',
  name: 'John Doe',
  iat: Math.floor(Date.now() / 1000),  // 발급 시간 (초 단위)
};

// JWT 시크릿 키 (환경변수 또는 직접 입력)
const secret = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzI2ODY1MjQ2fQ.aFwT8H0s8hd_p4rorIiznGTdY72i_MCttly5Ik-zByU'; // 여기다 JWT_SECRET 값을 넣으세요

// JWT 토큰 생성
const token = jwt.sign(payload, secret);

// 생성된 토큰 출력
console.log('Generated JWT Token:', token);
