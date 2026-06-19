# SEO · AEO · GEO 구현 체크리스트

> 작업 진척 시마다 해당 항목을 검증하고 상태를 업데이트한다.  
> 작성일: 2026-06-18  
> 범례: ✅ 완료 · 🔄 진행 중 · ⏳ 미착수 · ❌ 해당 없음

---

## 1. SEO (Search Engine Optimization)

### 기본 메타데이터
| 항목 | 설명 | 상태 |
|---|---|---|
| `<title>` 태그 | 페이지별 고유 타이틀 (60자 이내) | ⏳ |
| `<meta description>` | 페이지별 고유 설명 (160자 이내) | ⏳ |
| `<meta robots>` | 크롤링 허용/제한 설정 | ⏳ |
| `canonical` 태그 | 중복 URL 방지 | ⏳ |
| `hreflang` 태그 | 한/영 언어별 URL 지정 | ⏳ |

### 구조화 데이터
| 항목 | 설명 | 상태 |
|---|---|---|
| JSON-LD (Organization) | 회사 기본 정보 구조화 | ⏳ |
| JSON-LD (BreadcrumbList) | 페이지 경로 구조화 | ⏳ |
| JSON-LD (JobPosting) | 채용공고 구조화 | ⏳ |
| JSON-LD (NewsArticle) | 뉴스룸 게시물 구조화 | ⏳ |

### 기술적 SEO
| 항목 | 설명 | 상태 |
|---|---|---|
| `sitemap.xml` | 전체 URL 맵 자동 생성 | ⏳ |
| `robots.txt` | 크롤러 접근 정책 | ⏳ |
| SSR / SSG | Angular 서버사이드 렌더링 적용 | ⏳ |
| Core Web Vitals | LCP · CLS · INP 기준치 충족 | ⏳ |
| 이미지 `alt` 속성 | 모든 이미지 alt 텍스트 작성 | ⏳ |
| 시맨틱 HTML | `<header>`, `<main>`, `<nav>`, `<article>` 등 올바른 태그 사용 | ⏳ |
| Open Graph 태그 | SNS 공유 시 미리보기 설정 | ⏳ |
| Twitter Card | 트위터 공유 미리보기 설정 | ⏳ |

---

## 2. AEO (Answer Engine Optimization)

| 항목 | 설명 | 상태 |
|---|---|---|
| FAQ 페이지 마크업 | FAQPage JSON-LD 구조화 | ⏳ |
| 질문형 헤딩 구조 | 사용자 질문 기반 `<h2>`, `<h3>` 작성 | ⏳ |
| 명확한 답변 구조 | 질문 바로 아래 간결한 답변 배치 | ⏳ |
| Featured Snippet 최적화 | 리스트·표·정의형 콘텐츠 구조화 | ⏳ |
| 회사 정보 일관성 | 회사명·주소·연락처 전 페이지 동일 기재 | ⏳ |

---

## 3. GEO (Generative Engine Optimization)

| 항목 | 설명 | 상태 |
|---|---|---|
| 명확한 Entity 정의 | 브랜드·제품·서비스명 일관되게 사용 | ⏳ |
| 권위 있는 콘텐츠 | 출처·데이터 기반 콘텐츠 작성 | ⏳ |
| 자연어 친화적 구조 | AI가 요약하기 쉬운 문장 구조 | ⏳ |
| `llms.txt` | AI 크롤러용 사이트 요약 파일 제공 | ⏳ |
| 멀티모달 콘텐츠 | 이미지·영상에 충분한 텍스트 설명 병기 | ⏳ |
| 인용 가능한 통계·수치 | AI가 인용할 수 있는 명확한 데이터 제공 | ⏳ |

---

## 검증 이력

| 날짜 | 검증 범위 | 결과 | 비고 |
|---|---|---|---|
| - | - | - | - |
