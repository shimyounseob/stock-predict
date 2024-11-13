### 2024 1학기 7조 프로젝트

#### 내 역할
- 프론트 엔드/ 백엔드/ AWS 서버 구성

---

### 주요 기능

1. **주식 종목 검색과 예측 데이터 제공**
   - 사용자는 주식 종목 코드나 종목 추천에 대한 질문을 통해 과거 2년간의 주가 데이터와 GRU 모델을 활용한 향후 2개월 예측 데이터를 확인 가능
   - LLM을 활용하여 기업에 대한 소개, 기업의 장단점, 업계의 전망 등 투자 결정에 필요한 정보를 종합적으로 제공

2. **주가 시각화 및 종목 분석 정보 제공**
   - 주가 흐름과 예측 데이터를 차트로 시각화하여 제공, 사용자에게 주가 변동을 직관적으로 분석할 수 있는 환경 제공

3. **GRU 기반 시계열 분석 및 예측 정확성 보장**
   - GRU 모델을 사용하여 과거 2년간의 주가 데이터를 학습하고 향후 2개월 동안의 주가 변동을 예측함. GRU 모델은 LSTM보다 구조가 단순하여 학습 속도가 빠르고 과적합 위험이 적음
   - 데이터 전처리에서 Min-Max 정규화를 통해 입력 데이터를 0과 1 사이로 스케일링하고, 배치 사이즈 32와 에포크 300으로 학습을 진행하여 예측 성능을 최적화함
   - Dropout(0.35)을 적용하여 과적합을 방지하고, 학습 데이터의 70%와 테스트 데이터의 30%로 모델의 일반화 성능을 평가하여 약 0.065의 손실률을 기록

4. **관심 주식 북마크 및 정보 업데이트**
   - 관심 있는 주식을 북마크하여 관리하며, 북마크된 종목에 대한 예측 정보는 매일 자동으로 업데이트하여 최신 정보 유지
   - 북마크한 주식의 변동 내역과 관련 업계 상황 등을 지속적으로 확인하여 투자 관리에 유용하게 활용 가능


---

#### 기술 스택
- **프레임워크**: Next.js, Flask
- **웹서버**: NGINX
- **운영체제**: AWS Linux 2023
- **개발언어**: Typescript, Python
- **데이터베이스**: MongoDB