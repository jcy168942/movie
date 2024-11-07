
# 영화 검색 서비스 - Elasticsearch 기반 검색 페이지 구축

## 프로젝트 notion url
https://climbing-consonant-0d5.notion.site/Elasticsearch-6ce03943b83c472380229c6700b746be

---

## 프로젝트 개요

- **프로젝트 기간**: 2022년 9월 5일 ~ 2022년 11월 25일
- **목표**: ElasticSearch를 활용하여 Frontend ↔ Backend 간 검색 기능을 제공하는 간단한 웹 검색 서비스를 구축하는 것.

## 사용 기술 및 도구

- **Frontend**: React, CSS
- **Backend**: Node.js, Express
- **Data Crawling**: Scrapy(python)
- **Deployment**: AWS EC2
- **Containerization**: Docker, Docker-Compose

## 요구사항

1. **검색 기능**: Client의 검색 요청을 받아 검색 결과를 렌더링.
2. **조건별 필터링**: 가격 범위, 카테고리 등 조건에 따른 검색 결과 필터링.
3. **다양한 검색 옵션**: 체크박스와 라디오 버튼을 통한 조건 검색.
4. **상세 페이지로 이동**: 검색 결과 중 하나의 아이템 클릭 시 상세 정보 페이지로 이동.
5. **동의어 검색 및 정교한 검색 기능**.

---

## 데이터 처리 워크플로우

1. **데이터 수집**: KOBIS데이터 기반으로 Naver 영화 수집(크롤링)
2. **데이터 전처리**: NLP로 리뷰 데이터 토큰화 및 인코딩.
3. **모델 학습**: LSTM 모델을 사용하여 긍/부정 리뷰 분류.
4. **분석 데이터 인덱싱**: 예측된 긍/부정 리뷰와 명사 추출 데이터를 Elasticsearch에 인덱싱.

---

## UI / 기능 설명

- **검색 기능**: 검색어 포함 제목 검색.
- **캐러셀**: 장르별 추천 영화 캐러셀.
- **자동 완성 기능**: 검색어 입력 시 자동 완성 및 하이라이트 표시.
- **WordCloud**: 영화의 키워드로 구성된 WordCloud 제공.

---

## Work Flow

### 클라이언트 사용자

![클라이언트 사용자](https://lh7-us.googleusercontent.com/wJLL1Wuv6xCocYX3dbvfKl0LIMvwRy_c3Ngi1QsPMMxVgAC8BU526g82DNq8g-ALlm1JqdZYyCnBjArNyAOVgw5GMCtuQaVL04MTc9_Ujr0nhtW1YbS60QEFf4ciYhXCJto3Vm2hjiyNGxG1_yT1Mb4)

---

## 기능 설명

### 메인 페이지

- **검색 기능**: 검색어가 포함된 제목으로 검색.
- **캐러셀**: 10가지 장르 중 3개를 무작위로 선정해 해당 영화 10개를 캐러셀로 보여줌.
- **검색어 자동완성**: 사용자가 입력한 검색어에 따른 자동완성 구현 및 하이라이팅.
- **반응형 레이아웃**: 다양한 기기에서의 UI 최적화.

![메인 페이지](https://lh7-us.googleusercontent.com/MQqwX8U9raspbMJTBb0IaajJPcjXzvuMQiFzmevTtLJBtaCROz4eYkoGDhB0hLvaNGoGOr6NIjE_rUl_qg4pzr3dhGyFHODsyK7TFVTx_bKsD1c8uEi0oxkGy0tdxI3nc9doNohsvHhxen1lJ06ny_s)

---

### 서치 페이지

- **필터링 기능**: 개봉 날짜, 상영시간, 최신순, 평점순 등의 필터를 지원.
- **무한스크롤**: 스크롤 시 새로운 데이터 로딩.
- **로딩 스켈레톤 UI**: 로딩 중 스켈레톤 화면을 표시.
- **반응형 레이아웃**: 다양한 기기에서의 UI 최적화.

![서치 페이지](https://lh7-us.googleusercontent.com/xbrLMc1YdLdFGRS9ikXTlQoKQfo51k7T8xW4-6ANLN6FqDbywa1Flxe-QeEQ3ZlUwErLw4CDpekJ2mm-UdokqyRpgT9ai7QvUnY7y3KMaoMMU3ibdYUfqB4C97KKRCvSt4z0Bb09wIc5TjJyzxOQajg)

---

### 상세 페이지

- **영화 포스터 및 상세 정보 표시**: 포스터, 감독, 출연진 등 영화 상세 정보 표시.
- **리뷰 박스**: 긍정적/부정적 리뷰를 구분하여 표시.
- **WordCloud**: 해당 영화의 주요 키워드를 WordCloud 형태로 시각화.
- **Modal**: 감독/출연진 이름을 클릭 시 해당 인물의 다른 작품을 모달로 표시.
- **Graph data modeling**: 영화 전체 노드를 중심으로 그룹(장르, 카테고리 등), 하위 그룹, 영화 노드를 연결하여 영화와 관련된 데이터를 시각화
  (해당 부분은 front-end라이브러리 이슈로 화면에는 보여지지 않습니다.)

![상세 페이지](https://lh7-us.googleusercontent.com/3LmQ7bA0ccONhBfX2hc6gYWixzyYOWrudC7FXhuEfxgCcgIhEHdTKdYG9IuoDc8RX4ir0T7nXk1S9EBh7FbhrTMSydmQdBnpDJFYekUsIB9D6CPFlUF4sb31eDlpaLx6plyBo0AbB1xeqSfAtN13t6o)
![상세 페이지](https://lh7-us.googleusercontent.com/n0cdqYc3Tpby_dDDUiWduYJg8d7ICbaIksmj402pk98zcNTzYDxLnIEHSBYuw53V2baCsng-fu3d2jpL-xyeeMXHCDFB0UnrSnqP7QdgzHJpBxWqAuJL9ojHofpNPNUxBLmZluaH8OplXh39vgnEXwQ)

---

## 배포 환경

- **AWS EC2**: 메모리 제한으로 인해 Elasticsearch만 Docker 컨테이너로 배포.
  
![배포 환경](https://lh7-us.googleusercontent.com/M8-DNXPCs9mHwFOo_s4yiztUk4PnATn2LFuiSXEqAR-t7_Qk-6QeRXpqpyoAvSvkRW3MhoQZ4UBsykngVay2zO9xxSHebgrHmIsf63uOb9PAegiW3oSx2UKpFn52isysMCWHKbBagqzfFy4UhhwDphM)

---

이 프로젝트는 전체 Docker 컨테이너 환경을 구축하고 Elasticsearch를 활용해 다양한 조건 필터링, 자동완성 및 키워드 기반 영화 검색 기능을 지원하는 데 중점을 두었습니다.
