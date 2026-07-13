# Backend Contract Audit

검수일: 2026-07-13

## 1. 조사 결과와 신뢰 수준

실제 Swagger 또는 NestJS 소스로 확인한 endpoint는 **0개**다. 다음 주소를 직접 확인했지만 모두 연결 거부였다.

- `http://127.0.0.1:3000/api/docs`
- `http://127.0.0.1:3000/api/docs-json`
- `http://localhost:3000/api/docs-json`
- `http://localhost:3000/api-json`

현재 frontend workspace와 인접 `work` 폴더에도 NestJS `controller`, DTO, Mongoose schema, service 소스가 없다. 따라서 아래 경로는 사용자가 제공한 조사 후보일 뿐, 실제 구현 계약으로 확정하거나 서비스 코드에 넣지 않았다.

## 2. Endpoint 조사표

표의 모든 항목은 동일한 blocker를 가진다: HTTP method/path, 인증, body/query, 성공·오류 응답, nullable, ID/날짜/enum/pagination을 Swagger나 소스로 검증할 수 없다.

| 모듈 | 조사 후보 | 확인 상태 | 프론트 구현 상태 |
| --- | --- | --- | --- |
| Auth | `POST /auth/signup` | 미확인 | 미구현 |
| Auth | `POST /auth/login` | 미확인 | 미구현 |
| Auth | `POST /auth/refresh` | 미확인 | 미구현 |
| Auth | `POST /auth/logout` | 미확인 | 미구현 |
| Auth | `POST /auth/oauth/kakao` | 미확인 | 미구현 |
| Auth | `POST /auth/join-by-invite` | 미확인 | 미구현 |
| Users | `GET /users/me` | 미확인 | 미구현 |
| Users | `GET /users/me/travel-type` | 미확인 | 미구현 |
| Users | `GET /users/me/trips-summary` | 미확인 | 미구현 |
| Users | `PATCH /users/me/profile` | 미확인 | 미구현 |
| Users | `PATCH /users/me/onboarding-complete` | 미확인 | 미구현 |
| Quiz | `GET /quiz/questions` | 미확인 | 미구현 |
| Quiz | `GET /quiz/status` | 미확인 | 미구현 |
| Quiz | `POST /quiz/submit` | 미확인 | 미구현 |
| Rooms | `POST /rooms` | 미확인 | 미구현 |
| Rooms | `GET /rooms/me` | 미확인 | 미구현 |
| Rooms | `GET /rooms/:roomId` | 미확인 | 미구현 |
| Rooms | `GET /rooms/:roomId/summary` | 미확인 | 미구현 |
| Rooms | `GET /rooms/:roomId/progress` | 미확인 | 미구현 |
| Rooms | `PATCH /rooms/:roomId` | 미확인 | 미구현 |
| Places | `GET /places/search` | 미확인 | 미구현 |
| Places | `GET /places/:placeId` | 미확인 | 미구현 |
| Places | `GET /places/:placeId/similar` | 미확인 | 미구현 |
| Destinations | `GET /destinations/popular` | 미확인 | 미구현 |
| Saves | `GET /users/me/saves` | 미확인 | 미구현 |
| Saves | `POST /users/me/saves` | 미확인 | 미구현 |
| Saves | `DELETE /users/me/saves/:placeId` | 미확인 | 미구현 |
| Candidates | `GET /rooms/:roomId/workspace` | 미확인 | 미구현 |
| Candidates | `GET /rooms/:roomId/candidates` | 미확인 | 미구현 |
| Candidates | `GET /rooms/:roomId/candidates/by-member` | 미확인 | 미구현 |
| Candidates | `GET /rooms/:roomId/candidates/common` | 미확인 | 미구현 |
| Candidates | `POST /rooms/:roomId/candidates` | 미확인 | 미구현 |
| Candidates | `DELETE /rooms/:roomId/candidates/:placeId` | 미확인 | 미구현 |
| Schedule | `GET /rooms/:roomId/schedule` | 미확인 | 미구현 |
| Schedule | `GET /rooms/:roomId/schedule/map` | 미확인 | 미구현 |
| Schedule | `GET /rooms/:roomId/schedule/summary` | 미확인 | 미구현 |
| Schedule | `POST /rooms/:roomId/schedule/items` | 미확인 | 미구현 |
| Schedule | `PATCH /rooms/:roomId/schedule/reorder` | 미확인 | 미구현 |
| Schedule | `PATCH /rooms/:roomId/schedule/items/:itemId` | 미확인 | 미구현 |
| Schedule | `DELETE /rooms/:roomId/schedule/items/:itemId` | 미확인 | 미구현 |
| Schedule | `PUT /rooms/:roomId/schedule` | 미확인 | 미구현 |

## 3. 인증 계약 blocker

다음은 모두 확인되지 않았다.

- login request/response 필드와 access token 필드명
- refresh token 필드명, 만료 정보, rotation 여부
- refresh 요청 body와 refresh token의 JSON/cookie 저장 방식
- cookie의 `HttpOnly`, `SameSite`, `Secure`, path/domain 설정
- cross-origin 요청에서 `credentials: include` 필요 여부
- logout body/header/cookie 처리 방식
- 401 오류 payload와 토큰 만료/권한 없음의 구분 code
- guest token의 발급 endpoint, payload, 권한과 만료
- Kakao OAuth의 authorization code/access token/redirect URI 입력 형태
- invite join과 기존/guest 계정의 인증 전환 규칙

프론트는 access token 공급 함수와 401 callback만 주입할 수 있게 준비했다. 토큰을 localStorage/cookie에 저장하지 않으며 refresh 호출, 자동 retry, logout 호출을 구현하지 않았다. 공통 client의 credentials 기본값은 브라우저 기본에 가까운 `same-origin`이고 요청별 override만 허용한다.

## 4. DTO와 mapper 상태

실제 DTO는 작성하지 않았다. Swagger에 없는 필드, ID 타입, enum, nullable을 추측하지 않기 위한 의도적인 차단이다.

계약과 무관한 mapper 기반만 준비했다.

- `DtoMapper<Dto, Domain>`: DTO를 수정하지 않는 mapper 타입
- `nullableString`: null/undefined/공백 안전 문자열 처리
- `finiteNumber`, `stringCoordinate`: 문자열 좌표의 유한 숫자 변환
- `isoDate`: `YYYY-MM-DD`의 실재 날짜 검증
- `enumValue`: 명시된 enum 목록과 fallback 처리
- `arrayOrEmpty`: 배열이 아닌 값과 개별 변환 실패를 안전 처리

Swagger 확보 후 `mapUserDto`, `mapQuizQuestionDto`, `mapTravelTypeDto`, `mapRoomDto`, `mapRoomSummaryDto`, `mapPlaceDto`, `mapCandidateDto`, `mapScheduleItemDto`를 실제 필드 기준으로 추가해야 한다.

## 5. 공통 API client

`ApiClient`는 다음 기반을 제공한다.

- 환경 변수 기반 base URL
- URL-safe query parameter와 배열 query 반복 직렬화
- JSON request body와 JSON/text response parsing
- Bearer access token 주입 지점
- `AbortSignal`, `RequestCredentials`, 추가 header
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- `204 No Content` 처리
- 401 callback 진입점
- network/HTTP/abort 공통 오류 변환

401 callback은 상태 정리나 후속 인증 UI 진입을 위한 hook일 뿐이다. 확인되지 않은 refresh endpoint를 호출하거나 원 요청을 재시도하지 않으므로 refresh loop가 없다.

## 6. 공통 오류 상태

프론트 `ApiError`는 `status`, `kind`, `message`, 선택적 `code`, `details`를 가진다. 구분 가능한 kind는 다음과 같다.

- `network`
- `unauthorized`
- `forbidden`
- `validation`
- `not-found`
- `conflict`
- `rate-limited`
- `server`
- `aborted`

현재 normalizer는 일반적인 NestJS 형태의 문자열/문자열 배열 `message`, `error`, `code`, `details`, `errors`를 방어적으로 처리한다. 실제 ValidationPipe 및 exception filter 응답 구조가 확인된 것은 아니므로, Swagger 예시와 백엔드 전역 filter 소스 확인 후 보정해야 한다.

## 7. 데이터 소스 모드

| 환경값 | 의미 |
| --- | --- |
| `VITE_DATA_SOURCE=mock` | 기존 Zustand와 demo data만 사용하며 네트워크가 없어도 전체 데모 가능 |
| `VITE_DATA_SOURCE=api` | 이후 연결되는 서버 모듈이 API를 사용하고 오류 시 mock으로 자동 fallback하지 않음 |
| `VITE_DATA_SOURCE=hybrid` | Auth/Users/Quiz/Rooms/Places/Saves/Candidates/Schedule은 API 연결 대상, Duri 분석·제안은 기본 local |
| `VITE_DURI_ENGINE=local` | 현재 프론트 그룹 진단·분석·제안 엔진 사용 |
| `VITE_DURI_ENGINE=server` | 서버 Duri 계약이 확인되고 명시적으로 연결될 때만 사용 |

기본값은 `mock`, `local`이다. 이번 단계에서 기존 화면과 Zustand data source는 전환하지 않았다.

## 8. QueryClient 정책

- module scope에서 한 번만 생성
- query stale time 30초, cache GC 5분
- window focus 자동 refetch 비활성화, reconnect refetch 활성화
- network/rate-limited/server query만 최대 2회 시도
- 401/403/validation/not-found/conflict/aborted는 retry하지 않음
- mutation retry 없음
- Query Devtools 미설치

## 9. 서비스 모듈 상태

`authService`, `userService`, `quizService`, `roomService`, `placeService`, `saveService`, `candidateService`, `scheduleService`는 생성하지 않았다. 실제 method/path/DTO가 없는 상태에서 함수 시그니처나 URL을 만들면 존재하지 않는 계약을 구현된 것처럼 보이게 하기 때문이다. Swagger JSON 또는 backend source가 확보되면 공통 `apiClient`만 의존하도록 추가하며 UI, Zustand hook, Router, toast, mock data는 import하지 않는다.

## 10. 프론트 요구사항과 기능 격차

1. **확인된 일치 항목:** 실제 계약을 확인하지 못해 확정할 수 없다.
2. **불일치 항목:** 실제 계약을 확인하지 못해 확정할 수 없다.
3. **장소 batch 조회:** 존재 여부 미확인. 단건 상세를 batch처럼 반복 호출하는 구현도 추가하지 않았다.
4. **전체 여행지 목록 API:** 존재 여부 미확인. `destinations/popular` 후보가 전체 목록을 의미한다고 가정하지 않는다.
5. **일정 batch 저장 원자성:** `PUT /rooms/:roomId/schedule` 후보 endpoint와 transaction/validation 정책 모두 미확인.
6. **후보 scheduled 일관성:** 일정 추가·삭제 시 후보 응답의 scheduled 파생 여부와 동시성 정책 미확인.
7. **2인 compatibility 제한:** 서버 계산의 최소/최대 인원과 N명 지원 여부 미확인. 프론트 local 그룹 엔진을 유지한다.
8. **Duri stub:** 사용자 제공 현황에서 stub으로 언급되었지만 실제 endpoint/응답/상태는 확인하지 못했다. 기본 연결하지 않는다.
9. **공통 오류 응답:** ValidationPipe, global exception filter, Mongoose 오류 변환 구조 미확인.
10. **Places 데이터:** 사용자 제공 현황에는 Kakao + local cache 기반이라고 되어 있으나 Swagger/소스로 독립 검증하지 못했다.
11. **한국관광공사:** 연동된 것으로 기록하거나 프론트에서 직접 호출하지 않는다. 현재 확인 가능한 연동 근거가 없다.
12. **pagination:** page/limit, cursor, metadata 형식 모두 미확인.
13. **ID:** Mongo ObjectId 문자열인지 별도 public ID인지 미확인.
14. **날짜:** ISO date/date-time, timezone, schedule local time 규칙이 미확인.

## 11. 계약 확보 후 확인 순서

1. Swagger JSON과 global prefix/versioning 설정 확보
2. Auth controller/DTO/guard/cookie/refresh rotation 확인
3. 공통 exception filter와 ValidationPipe 설정 확인
4. Users와 Quiz DTO 및 enum 확인
5. Rooms/Places/Saves 목록·상세·pagination 계약 확인
6. Candidates/Schedule의 동시성, batch 원자성, scheduled 파생 규칙 확인
7. 실제 DTO와 domain mapper 작성
8. read-only query부터 화면 단위로 연결하고 mutation은 후속 연결
