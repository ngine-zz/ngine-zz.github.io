# 메인 웹사이트 IA (Information Architecture)

> 이 문서만 수정해 메인 웹사이트 구조를 변경합니다.  
> 작성일: 2026-06-18  
> 상태: ⏳ 기획 필요

---

## 1. 개요

- **형태**: 일반 반응형 웹사이트
- **대상**: 외부 방문자 (고객, 투자자, 구직자)
- **특징**: SEO 최적화, 모바일/데스크탑 완전 반응형

---

## 2. GNB (Global Navigation Bar)

> ✅ 확정 (2026-06-18)

```
[로고(홈)]  About  Business  Brand  Impact  Newsroom  Career  Contact  [KOR/ENG]
```

| 항목 | 역할 | 비고 |
|---|---|---|
| 로고 | 홈(/) 이동 버튼 겸용 | |
| About | 회사 소개 | |
| Business | 사업 영역 | |
| Brand | 브랜드/제품 | |
| Impact | ESG · 사회적 가치 등 | |
| Newsroom | 보도자료 · 뉴스 | |
| Career | 채용 | |
| Contact | 문의 / 연락처 | |
| KOR/ENG | 언어 선택 | |

---

## 3. 페이지 구조 (초안)

> ⏳ 상세 구조 기획 필요 (GNB 기준으로 1depth 확정)

```
/                       홈 (메인)
├── /about                    회사 소개
│   ├── /about/intro          소개
│   ├── /about/vision         Vision & Mission
│   ├── /about/history        연혁
│   ├── /about/rnd            R&D
│   ├── /about/affiliates     계열사/관계사
│   ├── /about/factory        Factory
│   └── /about/directions     오시는 길
├── /business                   사업 영역
│   ├── /business/b2b           B2B
│   ├── /business/b2c           B2C
│   ├── /business/odm-oem       ODM/OEM
│   ├── /business/national-brand National Brand
│   ├── /business/food-service  Food Service
│   └── /business/ecommerce     E-Commerce
├── /brand                           브랜드 & 제품 (⚠️ 구조 변경 가능성 있음)
│   ├── /brand/b2b                   B2B
│   │   └── /brand/b2b/:product      제품 상세
│   ├── /brand/b2c                   B2C
│   │   └── /brand/b2c/:product      제품 상세
│   ├── /brand/odm-oem               ODM/OEM
│   │   └── /brand/odm-oem/:product  제품 상세
│   ├── /brand/national-brand        National Brand
│   │   └── /brand/national-brand/:product 제품 상세
│   ├── /brand/food-service          Food Service
│   │   └── /brand/food-service/:product   제품 상세
│   └── /brand/ecommerce             E-Commerce
│       └── /brand/ecommerce/:product      제품 상세
├── /impact                          ESG & 사회적 가치
│   ├── /impact/sustainability       Sustainability
│   ├── /impact/farm-fresh-wave      Farm Fresh Wave
│   └── /impact/esg                  ESG
├── /newsroom                    보도자료 & 뉴스
│   ├── /newsroom/notice         공지사항
│   ├── /newsroom/news           뉴스룸
│   ├── /newsroom/social         사회활동
│   ├── /newsroom/faq            FAQ
│   └── /newsroom/ir             IR
├── /career                          채용
│   ├── /career/talent               인재상
│   ├── /career/hr-policy            인사제도
│   ├── /career/jobs                 채용공고
│   │   └── /career/jobs/:id         채용공고 상세
│   └── /career/meister-academy      마이스터아카데미
├── /contact            문의 / 연락처
└── /village            Pixel Village 진입점
```

---

## 4. Footer

> ✅ 확정 (2026-06-18)

| 요소 | 설명 |
|---|---|
| 회사 로고 | 푸터 상단 또는 좌측 배치 |
| 카피라이트 | © S-Food 등 |
| 주소 | 회사 주소 |
| 사업자등록번호 | 법적 표기 |
| 고객센터 연락처 | 전화번호 등 |
| 대표자명 | 법적 표기 |
| 패밀리사이트 | 셀렉트 박스로 이동 |
| 소셜미디어 채널 | 아이콘 링크 (채널 목록 추후 확정) |

---

## 5. Pixel Village 진입점

메인 웹사이트에서 Village로 연결하는 UI 위치 (확정 필요):

| 위치 | 형태 | 우선순위 |
|---|---|---|
| 홈 메인 히어로 영역 | 풀스크린 배너 버튼 | ⏳ |
| GNB 메뉴 | 메뉴 항목 | ⏳ |
| 홈 중간 섹션 | 소개 배너 | ⏳ |

---

## 5. 미결 사항

| 항목 | 상태 |
|---|---|
| 전체 페이지 구조 확정 | ⏳ 기획 필요 |
| GNB 메뉴 항목 확정 | ✅ 완료 |
| 홈 페이지 섹션 구성 | ⏳ |
| Village 진입 UI 위치 및 디자인 | ⏳ |
| 디자인 레퍼런스 수령 | ⏳ |
