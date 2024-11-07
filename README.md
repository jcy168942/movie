# 영화 검색 서비스를 위한 Elasticsearch 기반 검색 페이지 구축(미니 프로젝트)

# **ElasticSearch를 활용한 검색 페이지 구축**

**2022년 09월 5일 ~ 2022년 11월 25일**

### **프로젝트 목표**

**Frontend ↔ Backend 간 검색 기능을 ElasticSearch를 활용하여 간단한 웹 검색 서비스를 구축해보는 프로젝트이다.**

**사용 기술 및 도구**

https://lh7-us.googleusercontent.com/rrsUHWkdkz_CbpYkmw5mZ6PzV8GF2mzbAzkSqZD-s3lOG6RCkM5k5C0ArOH2lJ9nrujPWY7lLAUoBsUfXuLv36DK2UrLNVbqfurCA0p7Bec6d-7hYICxhnxhSsESjq5X5srfF2ZnnV_n5gQodcX64rk

https://lh7-us.googleusercontent.com/diaWi-vVbv4LJaP_zM658SRmj6jtqcncbi2aWfAamnFerG9LHDNowqG-rioK1GaJs5I3JGIhkD4aH7DzCfWvYHRfOunb3BlnJN0V6OojjOT-vHpKLHRWClHwDk_VZSUXAaWoGHXdLuQVbkZLQy2kdrU

https://lh7-us.googleusercontent.com/EZZAnF_YcqHLQY68M3yuyoyX3_xU2ltMXPraPWGDMcPRfI--ApXJUf7oQti27x1sDh7DmGpf1WTShbuGTg53C75W9s-cUVNjvLnpTv_c7KZ4xMPqJcItURv59QySH7UwYhvJ1SFV6tsbjCz7aZGztvo

# **요구사항**

1. **Client에서의 검색 요청을 받아 들여서 원하는 검색 결과를 검색하여 화면에 렌더링하는 기능**
2. **데이터에 따른 특정 조건(가격의 범위 , 특정 카테고리의 데이터) 등에 따른 검색 결과들의 리스트를 렌더링하는 기능**
3. **검색어 입력 뿐만 아니라 체크박스나 라디오 버튼 등의 필터들을 이용하여 원하는 조건의 검색 가능하도록 구현**
4. **검색 리스트 중 하나의 아이템을 클릭 하면 그 아이템의 상세 정보 detail 페이지로 이동하여 정보를 제공하는 기능**
5. **동의어 등의 검색어 검색에서의 정교한 서치 기능**
    
    https://lh7-us.googleusercontent.com/WWzFjvD3Wr9GxbC7nqb59IMShKNa_ddl-yRw5M9f79JJIt3OgfKt_i2SLoYYipktf6p1AjsKzenxGxtwwbphnLbF_sfbzdkDXR0T1yQ4GSYyjFZ9ULXOOY8dJrSmA5rYZqJQH4KXMsjGqG7NY0gAQxI
    

https://lh7-us.googleusercontent.com/WWzFjvD3Wr9GxbC7nqb59IMShKNa_ddl-yRw5M9f79JJIt3OgfKt_i2SLoYYipktf6p1AjsKzenxGxtwwbphnLbF_sfbzdkDXR0T1yQ4GSYyjFZ9ULXOOY8dJrSmA5rYZqJQH4KXMsjGqG7NY0gAQxI

# **Work Flow**

## **클라이언트 사용자**

https://lh7-us.googleusercontent.com/wJLL1Wuv6xCocYX3dbvfKl0LIMvwRy_c3Ngi1QsPMMxVgAC8BU526g82DNq8g-ALlm1JqdZYyCnBjArNyAOVgw5GMCtuQaVL04MTc9_Ujr0nhtW1YbS60QEFf4ciYhXCJto3Vm2hjiyNGxG1_yT1Mb4

https://lh7-us.googleusercontent.com/WWzFjvD3Wr9GxbC7nqb59IMShKNa_ddl-yRw5M9f79JJIt3OgfKt_i2SLoYYipktf6p1AjsKzenxGxtwwbphnLbF_sfbzdkDXR0T1yQ4GSYyjFZ9ULXOOY8dJrSmA5rYZqJQH4KXMsjGqG7NY0gAQxI

## **데이터 인덱싱**

https://lh7-us.googleusercontent.com/WWzFjvD3Wr9GxbC7nqb59IMShKNa_ddl-yRw5M9f79JJIt3OgfKt_i2SLoYYipktf6p1AjsKzenxGxtwwbphnLbF_sfbzdkDXR0T1yQ4GSYyjFZ9ULXOOY8dJrSmA5rYZqJQH4KXMsjGqG7NY0gAQxI

**영화 정보 데이터를 크롤링 하여 사용하기**

https://lh7-us.googleusercontent.com/E52zvDOod2xYpssGUqp0UAao8uhV1A_bWYl90he_ZR41p0BCISQREnPU1PBwqSkyiZ91jyyX1aCeEnCeKAnQk-sSkuO4mr4OfvO90KGqBm3f9rh6Vx588wvH-rhsEq--iF8usf_5d0hJ9f8krnWyaBg

https://lh7-us.googleusercontent.com/dhOa0D4eT-6gNz6Q2FTSZR_UXEVzSTMUbL6R67ecnw4cMY5613kVXgxD1bYCjeKRyD5MWOEbaUV6yNdWp6sDcfynbBm5DVDC-y1fXW0T1-7H8_ZRNqsqXn8ZvlKUeX1LLthG2Ld_2vARqmDMBsiUlFw

1. **kobis에 있는 기본정보(엑셀파일)을 읽어들여 영화코드를 수집한뒤 crwl index에 저장.**
2. **Server에서 수집하고싶은 영화코드를 crwl index에 저장.**
3. **Crawler프로그램(spider)가 crwl에 있는 영화 code를 가져와 영화 사이트에있는 영화 데이터를 수집.**
4. **수집한 데이터를 Kafka를 통해 Logstash로 데이터를 전송.**
5. **Logstash로 들어온 데이터를 Elasticsearch에 색인.**
- **크롤링 데이터 : 영화 데이터 영화 리뷰 데이터 (movie, review)**
    
    https://lh7-us.googleusercontent.com/WWzFjvD3Wr9GxbC7nqb59IMShKNa_ddl-yRw5M9f79JJIt3OgfKt_i2SLoYYipktf6p1AjsKzenxGxtwwbphnLbF_sfbzdkDXR0T1yQ4GSYyjFZ9ULXOOY8dJrSmA5rYZqJQH4KXMsjGqG7NY0gAQxI
    

https://lh7-us.googleusercontent.com/WWzFjvD3Wr9GxbC7nqb59IMShKNa_ddl-yRw5M9f79JJIt3OgfKt_i2SLoYYipktf6p1AjsKzenxGxtwwbphnLbF_sfbzdkDXR0T1yQ4GSYyjFZ9ULXOOY8dJrSmA5rYZqJQH4KXMsjGqG7NY0gAQxI

https://lh7-us.googleusercontent.com/hYcnWsTawKIPWheGBfR6NlNv-EZRkXianJJUFQ24YQcE9kXgENqkarnW0fgSvVeXoeNDdG9tTMH4PPW3whesqCqpOWbBE-X1nRxoLoWcKKulak2IPcDa6k_foN8yusG20-gn8QcLjuS0SCUVLQ0r_4M

https://lh7-us.googleusercontent.com/TpdJIQmDdLHttdLi2HIFQ7CfRXOcxVX3ESS6veDHzfITwS4tg-XhruJDpnRso-FWXOzz6US4RsuBAzwwk7Fn-CmMEc4TRkTMA2Pq0c1txpAsLJEoz8rqMxZ10TXuH3-ixDrwWBmsIKo8MUr4Tpetay4

**1. Elasticsearch에 색인된 리뷰데이터를 가져온다.**

**2. 리뷰데이터를 NLP를 이용하여 데이터를 추출한다.**

**3. Elasticsearch에 NLP에서 나온 데이터를 색인한다.**

https://lh7-us.googleusercontent.com/yeRiWtQxfEQCzLlPbzH9CVF6pNRVIZhMCEhq7MiUubgx2dmlK84ZlWJpitzwM89ufHjzXWNnlFGK-yu1an4AtPJVgx6poB3DdpX8exLBHep1Jlw5NV2fCeAcgS_7r2w6Y0MhIiCqNQI-DVdFNE7RiAU

**1. github에 있는 영화리뷰 학습데이터 를 가져온다.**

**2. 리뷰데이터를 전처리 한다.**

**3. 리뷰데이터를 형태소 분석기를 이용 하여 토큰화 하고 토큰화된 데이터를 학 습할수있게 정수인코딩을 한다.**

**4. 학습하기 위해서는 리뷰텍스트 길이 를 맞춰야하기 때문에 인코딩한 데이터 를 padding한다.**

**5. LSTM을 이용하여 리뷰데이터를 학습하고 모델을 저장한다**

https://lh7-us.googleusercontent.com/WWzFjvD3Wr9GxbC7nqb59IMShKNa_ddl-yRw5M9f79JJIt3OgfKt_i2SLoYYipktf6p1AjsKzenxGxtwwbphnLbF_sfbzdkDXR0T1yQ4GSYyjFZ9ULXOOY8dJrSmA5rYZqJQH4KXMsjGqG7NY0gAQxI

https://lh7-us.googleusercontent.com/YPXdGXxZWhR00XbI4WP5OVIKuF2iujJN9VmCgbhPddS-x9HMxXGZJRXsvEd3IjPFRAvgkOirTqkhMUiJWy-xPza-3BuIdMUc66N1YvgjWdwjN8LYewDzhYKj3ldD3F6YCCRPYNpcAOwlpwSQWwQ3IMM

https://lh7-us.googleusercontent.com/WWzFjvD3Wr9GxbC7nqb59IMShKNa_ddl-yRw5M9f79JJIt3OgfKt_i2SLoYYipktf6p1AjsKzenxGxtwwbphnLbF_sfbzdkDXR0T1yQ4GSYyjFZ9ULXOOY8dJrSmA5rYZqJQH4KXMsjGqG7NY0gAQxI

**1. elasticsearch에서 리뷰 데이터를 가져온다.**

**2. 학습된 모델을 가져와서 리뷰데이터를 예측(긍/부정)한다.**

**3. 예측한데이터를 elasticsearch에 색인한다.**

https://lh7-us.googleusercontent.com/GPjQIMx9oXfJOEHXE1pW3W-abtaYJyYLtY0uyC8OU3ab0CjaKy8AZYf--jUcGboUGrNgcUBuA-NuNUiSu62iWnaZUBPpppIF6Rlj-z7TWGkBhN7BHHfi85UhI451ulb3wnBAA2CAf85s-BDDrplTm7Q

**1. elasticsearch에서 리뷰데이터를 가지고온다.**

**2. 리뷰데이터를 명사추출한다.**

**3. 추출된 명사들을 빈도수로 정렬을한다.**

**4. 정렬된 데이터를 elasticsearch에 인덱싱한다.**

https://lh7-us.googleusercontent.com/WWzFjvD3Wr9GxbC7nqb59IMShKNa_ddl-yRw5M9f79JJIt3OgfKt_i2SLoYYipktf6p1AjsKzenxGxtwwbphnLbF_sfbzdkDXR0T1yQ4GSYyjFZ9ULXOOY8dJrSmA5rYZqJQH4KXMsjGqG7NY0gAQxI

# **UI/기능**

https://lh7-us.googleusercontent.com/WWzFjvD3Wr9GxbC7nqb59IMShKNa_ddl-yRw5M9f79JJIt3OgfKt_i2SLoYYipktf6p1AjsKzenxGxtwwbphnLbF_sfbzdkDXR0T1yQ4GSYyjFZ9ULXOOY8dJrSmA5rYZqJQH4KXMsjGqG7NY0gAQxI

## **메인 페이지**

https://lh7-us.googleusercontent.com/MQqwX8U9raspbMJTBb0IaajJPcjXzvuMQiFzmevTtLJBtaCROz4eYkoGDhB0hLvaNGoGOr6NIjE_rUl_qg4pzr3dhGyFHODsyK7TFVTx_bKsD1c8uEi0oxkGy0tdxI3nc9doNohsvHhxen1lJ06ny_s

https://lh7-us.googleusercontent.com/YrvlaOpNB6f1KiZNrUxouCXnMp3mZ35W-rLKULY48Jxe0nXWmNNRxfZz8oE5a0OykhHuMp4wPgo3iTrdv09ZB3Ss7xu7X3bNdyNSA0zEneZYBrZTCVB0-k9RL4GolvHjOEEpFMwe9RQ1jhZALVsqEgY

- **검색기능 - 검색어가 포함 되는 제목 검색**
- **캐루셀 - (콘텐츠를 순환시키기 위한 슬라이드쇼) - 10가지 장르 중 3가지를 무작위로 선정하여 그 장르에 해당하는 영화 10개를 보여주는 캐루셀과 슬라이드를 넘기기 위한 버튼**
- **검색어 자동완성 기능 사용자가 입력한 검색어에 따른 검색어 자동완성 구현 & 자동완성된 영화 제목에서 사용자가 입력한 검색어와 동일한 글자 하이라이팅 구현**
- **반응형 레이아웃**

## **서치 페이지**

https://lh7-us.googleusercontent.com/xbrLMc1YdLdFGRS9ikXTlQoKQfo51k7T8xW4-6ANLN6FqDbywa1Flxe-QeEQ3ZlUwErLw4CDpekJ2mm-UdokqyRpgT9ai7QvUnY7y3KMaoMMU3ibdYUfqB4C97KKRCvSt4z0Bb09wIc5TjJyzxOQajg

https://lh7-us.googleusercontent.com/SsX8phOdnTf1P05quPtx-tcnat1ciqBzQMuDVku8PeKejGAXEJJ72yLdKdPXo1GAGrmh6TfGt-A-BIy0TIqaaFcKnqJ6ndci3ZxcPJRRTIj-cOSXvRo0x1oLMGIxR1ibPHJ3kMITPb5TC0wGRMvN86E

- **페이지 상단의 앱바 기능**
- **개봉날짜별 필터 기능 개봉 날짜 , 영화 상영시간 , 최신순 , 평점순 , 국내 해외 영화 등 여러가지 중복 필터링을 하여 검색되도록 구현 & 새로고침 해도 필터값 유지하도록 구현**
- **로딩 스켈레톤 ui 처리**
- **무한스크롤 구현**
- **최신 개봉순, 평점순 캐루셀**
    
    https://lh7-us.googleusercontent.com/WWzFjvD3Wr9GxbC7nqb59IMShKNa_ddl-yRw5M9f79JJIt3OgfKt_i2SLoYYipktf6p1AjsKzenxGxtwwbphnLbF_sfbzdkDXR0T1yQ4GSYyjFZ9ULXOOY8dJrSmA5rYZqJQH4KXMsjGqG7NY0gAQxI
    
- **페이지 상단으로 이동시켜주는 플로팅 버튼**
- **반응형 레이아웃**

## **상세 페이지**

https://lh7-us.googleusercontent.com/WWzFjvD3Wr9GxbC7nqb59IMShKNa_ddl-yRw5M9f79JJIt3OgfKt_i2SLoYYipktf6p1AjsKzenxGxtwwbphnLbF_sfbzdkDXR0T1yQ4GSYyjFZ9ULXOOY8dJrSmA5rYZqJQH4KXMsjGqG7NY0gAQxI

https://lh7-us.googleusercontent.com/3LmQ7bA0ccONhBfX2hc6gYWixzyYOWrudC7FXhuEfxgCcgIhEHdTKdYG9IuoDc8RX4ir0T7nXk1S9EBh7FbhrTMSydmQdBnpDJFYekUsIB9D6CPFlUF4sb31eDlpaLx6plyBo0AbB1xeqSfAtN13t6o

https://lh7-us.googleusercontent.com/n0cdqYc3Tpby_dDDUiWduYJg8d7ICbaIksmj402pk98zcNTzYDxLnIEHSBYuw53V2baCsng-fu3d2jpL-xyeeMXHCDFB0UnrSnqP7QdgzHJpBxWqAuJL9ojHofpNPNUxBLmZluaH8OplXh39vgnEXwQ

- **페이지 상단 앱바**
- **영화 포스터 및 영화 상세정보 서버에서 받아온 데이터를 기반으로 영화포스터, 감독, 출연진, 줄거리 등을 보여주는 기능**
- **리뷰박스 평점을 기준으로 긍정적인 리뷰와 부정적인  리뷰를 구분하여 표시하여 주는 기능**
- **WordCloud  해당 영화의 키워드를 WordCloud 형태로 보여주는 기능**
- **Modal 상세정보박스의 영화 감독, 출연진의 이름을 클릭하면 해당 감독 혹은 배우의 다른 작품을 보여주는 모달을 띄우고 장르의 분포를 나타내주는 그래프 기능**
- **로딩 스켈레톤 ui 처리**

https://lh7-us.googleusercontent.com/CXzrTAGqVh0dOei76Bhb6PAd0A2VGWL_x2TDGGa2LQauf__inxg8EEk4yNW-f3kuPs3Q1-J01q4SteILJChSR9DbTAV5_gcx4dNO4gh5Nrtn5tY7p99LSr5botTV0G5TTOQbq1x3nMW_u2LV63S4mmM

# **구조**

## **개발환경**

## 

https://lh7-us.googleusercontent.com/hk-D4_wMn7M2c136PgQ5ZY7PAHfs_j9yV77zH3h-ZZ0Duz_oKddqjHuE7Um1cLRznl2EofDhshp3uaBz_XXPX1_Zs8FD-aO7PE5ElnYf1U36f3942X_5GYU5BDDcv619AtOhMX_9Jv50QmELK0CoyL8

- **개발환경**

**client , server , nginx , elasticsearch 를 dockerizing 하여 개발환경을 구축하였다.**

**맨 앞단 nginx에서 3000 포트로 받아 api요청이면 4000 서버 포트로 포트 포워딩 해주었다.**

**모든 컨테이너는 docker-compose.dev.yml 파일로 실행하도록 코드를 구현하였다.**

## **배포환경**

https://lh7-us.googleusercontent.com/M8-DNXPCs9mHwFOo_s4yiztUk4PnATn2LFuiSXEqAR-t7_Qk-6QeRXpqpyoAvSvkRW3MhoQZ4UBsykngVay2zO9xxSHebgrHmIsf63uOb9PAegiW3oSx2UKpFn52isysMCWHKbBagqzfFy4UhhwDphM

- **배포환경**

**개발 환경을 그대로 aws에 배포하고자 했으나 기본 프리티어 인스턴스의 메모리 제한으로 인한 메모리 부족 현상 발생**

**→ client , server , nginx , elasticsearch 모두를 dockerizing 하여 배포하려던 계획을 바꾸어서 elasticsearch만 docker container로 만들어서 배포하는것으로 변경하였다.**
