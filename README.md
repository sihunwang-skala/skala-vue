# SKALA-WEATHER

Vue 3와 Vite로 만든 날씨 대시보드입니다. 하나의 화면을 단계적으로 확장하면서 Vue Syntax, Composition API, Components, Vue Router, Pinia, Axios, Element Plus를 적용했습니다.

기본 도시인 서울, 수원, 부산에 광주와 제주를 추가했으며, OpenWeather의 현재 날씨, 예보, 대기질 데이터와 Kakao Map의 주변 장소 검색을 연결했습니다.

## 1. Vue Syntax

### 요구사항 충족

- `v-for`와 `:key`로 도시 카드를 반복 출력하고, `v-if`로 기온별 배지를 구분했습니다.
- 한글 검색 입력은 Element Plus의 `:model-value`와 `@input`으로 처리하고, 상세보기와 즐겨찾기는 `@click.stop`으로 카드 클릭과 분리했습니다.

### 주요 구현

- 날씨 목록, 검색창, 더움/선선함 배지, 카드 클릭으로 현재 지역 선택하기를 하나의 대시보드에 담았습니다.
- 검색어와 일치하는 도시가 있으면 자동으로 현재 지역으로 보여줍니다.

### 추가 구현

- 기본 3개 도시에 광주와 제주를 추가하고, 검색해도 다른 지역 목록이 유지되도록 구성했습니다.
- 처음에는 광주를 현재 지역으로 보여주고, 도시를 검색하면 일치하는 첫 도시가 자동 선택됩니다. 일치하는 도시가 없으면 별도 안내를 표시합니다.
- `utils/search.js`로 한글 포함 검색, 초성 검색(`ㅅㅇ` → 서울), 영문 검색(`Seoul` → 서울)을 지원합니다.
- `languageStore.js` / `labels.js`로 한국어와 English 전환, 이름순과 기온순 정렬을 추가했습니다.

### 구현 판단

- 단계마다 화면을 새로 만들지 않고 같은 대시보드를 계속 확장했습니다.

### 관련 파일

- `src/components/exercise/WeatherParent.vue`
- `src/components/exercise/SearchBar.vue`
- `src/components/exercise/WeatherCard.vue`
- `src/utils/search.js`
- `src/i18n/labels.js`

## 2. Composition API

### 요구사항 충족

- `ref`, `reactive`, `computed`, `watch`, `watchEffect`를 검색, 정렬, 선택 도시와 자동 계산에 적용했습니다.

### 주요 구현

- `ref`는 검색어, 선택 도시, 즐겨찾기 필터, 로딩 상태에, `reactive`는 정렬 기준(`by`)과 방향(`order`)을 묶은 `sortOption`에 사용했습니다.
- `computed`로 검색과 정렬 목록, 생활지수 평균, 현재 지역 요약을 자동 계산합니다.
- `watch`는 `sortOption.by`처럼 필요한 속성만 감시하고, `watchEffect`는 검색어 변화를 자동으로 따라갑니다.

### 추가 구현

- 선택 도시를 "현재 지역"으로 보고 날씨, 생활지수, 종합 추천, 시간대별 러닝 적합도, 주변 장소를 한 화면에 모았습니다.
- 도시ID, 날짜, 날씨상태를 시드로 쓰는 오늘의 날씨 운세를 추가해, 같은 날에는 같은 결과가 유지됩니다.
- 도시, 날짜, 날씨에 따라 추천곡을 자동 선정하고 하루 동안 같은 목록을 보여주는 날씨 음악 추천을 추가했습니다.
- 날씨가 바뀌면 종합 추천, 좋은 시간대, 장소 검색어도 `computed`로 함께 갱신되도록 연결했습니다.

### 구현 판단

- `sortOption` 전체를 deep watch하지 않고 실제로 필요한 속성만 감시했습니다.

### 관련 파일

- `src/components/exercise/WeatherParent.vue`
- `src/utils/activity.js`
- `src/utils/fortune.js`
- `src/utils/music.js`
- `src/stores/languageStore.js`

## 3. Components

### 요구사항 충족

- 부모가 상태를 관리하고 자식은 Props와 Emits로 값을 주고받으며, `BaseDashboardCard`는 Slot으로 내용을 받습니다.

### 주요 구현

- `SearchBar.vue`(검색어 Props + `update-query` emit), `WeatherCard.vue`(`select-card`/`click-detail` emit), `BaseDashboardCard.vue`(공통 슬롯 카드)로 부모와 자식 역할을 나눴습니다.

### 추가 구현

- `SortControls.vue`, `WeatherIndexCard.vue`(러닝, 헤어, 야외활동, 옷차림 지수와 종합 점수)를 추가했습니다.
- 생활지수와 종합 점수는 선택 도시의 기온, 체감온도, 습도, 바람, 날씨상태, 대기질이 바뀌면 자동으로 다시 계산됩니다.
- `PlaceMap.vue` / `CityMiniMap.vue` / `NationalMap.vue`로 Kakao 지도를, `FortuneCard.vue`로 운세를 표시합니다.
- `WeatherTicker.vue`로 모든 화면 상단에 전국 도시 기온이 끊김 없이 흐르는 전광판을 구성했습니다.

### 구현 판단

- 상태와 로직은 `WeatherParent.vue`가 소유하고 자식은 Props/Emits만 처리하도록 유지했습니다.
- Lifecycle Hook은 데이터 조회나 정리가 필요한 컴포넌트에만 적용했습니다.

### 관련 파일

- `src/components/exercise/WeatherParent.vue`
- `src/components/exercise/BaseDashboardCard.vue`
- `src/components/exercise/SearchBar.vue`
- `src/components/exercise/WeatherCard.vue`
- `src/components/exercise/SortControls.vue`
- `src/components/exercise/WeatherIndexCard.vue`
- `src/components/exercise/PlaceMap.vue`
- `src/components/exercise/CityMiniMap.vue`
- `src/components/exercise/FortuneCard.vue`
- `src/components/exercise/WeatherTicker.vue`

## 4. Vue Router

### 요구사항 충족

- Dynamic Route, `useRoute`, `useRouter`, Lazy Loading, Catch-all Route를 실제 화면 이동에 적용했습니다.

### 주요 구현

- `/`(홈), `/weather/:cityId`(Dynamic Route로 도시 상세), `/national`(전국 날씨), `/activities`(활동 추천), `/about`, `/:pathMatch(.*)*`(404)로 라우트를 구성했습니다.
- 모든 View는 `component: () => import(...)`로 Lazy Loading하고, `useRoute`/`useRouter`로 파라미터 읽기와 이동을 처리합니다.

### 추가 구현

- `WeatherActivityView.vue`에서 도시별 활동 적합도와 추천 스포츠, 좋은 시간대, 대기질, 주변 장소를 비교합니다.
- `WeatherNationalView.vue`(`/national`)로 5개 도시 날씨를 지도와 기온 비교 그래프로 함께 보여줍니다.
- 상세 화면은 진입 경로를 기억해 홈에서 들어오면 홈으로, 활동 추천에서 들어오면 활동 추천으로 돌아갑니다.

### 구현 판단

- View는 라우트 단위 화면만 맡고, 홈 화면의 상태와 기능은 `WeatherParent.vue`에 유지했습니다.

### 관련 파일

- `src/router/index.js`
- `src/App.vue`
- `src/views/WeatherHomeView.vue`
- `src/views/WeatherDetailView.vue`
- `src/views/WeatherActivityView.vue`
- `src/views/WeatherNationalView.vue`
- `src/views/WeatherAboutView.vue`
- `src/views/NotFoundView.vue`

## 5. Pinia

### 요구사항 충족

- Pinia Store의 state, getter, action으로 온도 단위, 날씨 목록, 언어와 즐겨찾기를 전역 관리합니다.

### 주요 구현

- `configStore.js`(온도 단위), `weatherStore.js`(날씨 목록, 로딩, 에러, 즐겨찾기), `languageStore.js`(언어)로 여러 화면이 공유하는 상태를 관리합니다.

### 추가 구현

- `weatherStore`로 홈, 상세, 활동 추천 화면에 중복되던 도시 데이터를 한곳에서 관리하도록 정리했습니다.
- 전역 기온 전광판도 같은 Store를 사용해 모든 라우트에서 동일한 날씨와 단위 설정을 보여줍니다.

### 구현 판단

- Store 속성은 구조분해하지 않고 직접 접근해 반응성을 유지했습니다.
- 단순 온도 변환은 Composable 대신 `utils/temperature.js`의 일반 함수로 분리했습니다.

### 관련 파일

- `src/main.js`
- `src/stores/configStore.js`
- `src/stores/weatherStore.js`
- `src/stores/languageStore.js`
- `src/utils/temperature.js`
- `src/components/exercise/UnitToggler.vue`

## 6. Axios / OpenWeather API

### 요구사항 충족

- Axios로 OpenWeather Current Weather API를 호출하고 loading, error, 정상 상태를 나누어 표시합니다.

### 주요 구현

- `weatherApi.js`로 OpenWeather 요청을 모았고, 5개 도시의 Current Weather를 `Promise.all`로 병렬 조회해 `weatherStore`를 채웁니다.
- 실패 시 화면 안내, 다시 시도 버튼과 `ElMessage.error`로 알립니다.

### 추가 구현

- Forecast API: 다음 24시간의 3시간 간격 예보를 불러와 상세 페이지의 향후 날씨 카드, 홈의 좋은 시간대, 활동 추천 분석에 사용합니다. 여러 도시는 `Promise.allSettled`로 조회해 한 도시 실패가 나머지를 막지 않게 했습니다.
- Kakao Map은 용도에 따라 세 컴포넌트로 나눴습니다. `PlaceMap.vue`는 주변 장소를 찾고, `CityMiniMap.vue`는 도시 위치를 보여줍니다.
- `NationalMap.vue`는 전국 5개 도시를 한 지도에 표시하고 `LatLngBounds`로 지도의 표시 범위를 맞춥니다.
- Air Pollution API로 대기질을 조회해 상세 페이지에 표시하고 러닝, 야외활동 점수에 자동 반영합니다.
- 도시별 기온 비교는 `TemperatureChart.vue`에서 별도 차트 라이브러리 없이 막대 그래프로 표현했습니다.
- 예보 상태별 이모지와 강수확률을 표시하고, 전국 기온 막대는 실제 화면에 들어왔을 때 천천히 상승하도록 구현했습니다.
- 활동 추천 지도는 카드를 펼칠 때 `ResizeObserver`로 Kakao 지도를 다시 정렬해 빈 지도 영역을 방지합니다.

### 구현 판단

- 실제 날씨 판정은 번역된 문구 대신 OpenWeather의 영문 `main` 카테고리를 기준으로 합니다.
- 지도는 역할(장소 검색/카드 위치/전국 비교)에 따라 컴포넌트를 분리했습니다.

### 관련 파일

- `src/api/weatherApi.js`
- `src/stores/weatherStore.js`
- `src/views/WeatherDetailView.vue`
- `src/views/WeatherActivityView.vue`
- `src/views/WeatherNationalView.vue`
- `src/components/exercise/PlaceMap.vue`
- `src/components/exercise/CityMiniMap.vue`
- `src/components/exercise/NationalMap.vue`
- `src/components/exercise/TemperatureChart.vue`
- `src/utils/activity.js`
- `index.html`

## 7. External UI Library

### 요구사항 충족

- Element Plus를 설치하고 입력, 버튼, 스위치, 태그, 별점, 메시지와 확인창을 실제 서비스 화면에 적용했습니다.

### 주요 구현

- `main.js`에서 Element Plus를 전역 등록하고, `el-input`/`el-button`/`el-switch`/`el-tag`를 검색, 정렬, 대기질 표시 등 실제 화면에 적용했습니다.
- `ElMessage`, `ElMessageBox`로 API 오류, 즐겨찾기 결과, 전체 삭제 확인을 처리합니다.

### 추가 구현

- 즐겨찾기: `weatherStore`에 `favoriteCityIds`/`toggleFavorite()`/`clearFavorites()` 등을 추가하고, 카드의 ⭐ 버튼과 즐겨찾기만 보기 필터로 이어집니다.
- 운세 패널은 `el-card` + `el-rate`로 표시합니다.
- 점수 구간에 따라 생활지수와 활동 카드 색상을 자동 변경하고, 주요 카드에는 접근성을 고려한 호버 애니메이션을 적용했습니다.
- Tailwind CSS를 Vite 플러그인으로 연결하고 서비스 소개 문단에 배경, 테두리, 여백, 그림자 유틸리티 클래스를 적용했습니다.

### 구현 판단

- 기존 카드와 배지 디자인은 유지하고, 입력, 버튼, 피드백처럼 라이브러리 적용 효과가 분명한 부분만 교체했습니다.
- 100점 지수는 80점 이상 초록, 50~79점 주황, 49점 이하 빨강으로 표시하고 운세 별점도 `utils/scoreColor.js`에서 함께 관리합니다.

### 관련 파일

- `src/main.js`
- `src/components/exercise/SearchBar.vue`
- `src/components/exercise/WeatherCard.vue`
- `src/components/exercise/SortControls.vue`
- `src/utils/scoreColor.js`
- `src/stores/weatherStore.js`
- `src/assets/tailwind.css`
- `vite.config.js`

## 주요 기능 요약

- 실시간 날씨, 3시간 예보, 대기질 조회
- 한글, 초성, 영문 도시 검색과 즐겨찾기
- 섭씨와 화씨, 한국어와 English 전환
- 날씨 기반 생활지수, 활동 추천, 오늘의 운세와 음악 추천
- 전국 5개 도시 지도와 기온 비교
- 전국 도시 현재 기온 슬라이드
- 날씨별 주변 스포츠 장소 검색
- 점수별 색상과 날씨별 화면 색상 적용
- 카드 선택에 따른 정보 갱신과 화면 이동

점수 반환 방식, 감점 조건, 색상 구간의 상세 기준은 앱의 서비스 소개 화면에서 확인할 수 있습니다.

## 질문하고 조언받은 점

- 공통 라이브러리와 앱 시작에 필요한 모듈은 정적 import하고, 각 View는 동적 import하여 해당 경로에 방문할 때 불러오도록 했습니다.
- Nuxt도 Vue 기반의 공개 프레임워크지만, 이번 프로젝트에서는 Vue Router와 Pinia를 직접 구성한 과정이 보여야 한다고 판단해 사용하지 않았습니다.
- 일반 문자열은 작은따옴표를 사용하고, 변수 삽입이나 여러 줄 문자열이 필요한 경우에만 백틱을 사용하는 방식으로 정리했습니다.
- URL에 `#`이 붙는 해시 방식 대신 `createWebHistory()`를 사용했습니다. GitHub Pages에서 주소를 직접 열거나 새로고침할 때를 위해 `404.html`도 함께 생성합니다.

## 프로젝트 구조

```text
src/
├── api/
│   └── weatherApi.js             # OpenWeather 호출과 응답 정규화
├── components/
│   ├── exercise/
│   │   ├── WeatherParent.vue     # 날씨 대시보드 부모
│   │   ├── BaseDashboardCard.vue # 공통 슬롯 카드
│   │   ├── SearchBar.vue         # 검색 입력
│   │   ├── WeatherCard.vue       # 도시 날씨 카드
│   │   ├── SortControls.vue      # 정렬 컨트롤
│   │   ├── WeatherIndexCard.vue  # 생활지수
│   │   ├── WeatherTicker.vue     # 전국 기온 슬라이드
│   │   ├── UnitToggler.vue       # 온도 단위 전환
│   │   ├── LanguageToggle.vue    # 언어 전환
│   │   ├── FortuneCard.vue       # 오늘의 날씨 운세
│   │   ├── PlaceMap.vue          # Kakao 장소 지도(위성)
│   │   ├── CityMiniMap.vue       # 도시 카드 위치 지도
│   │   ├── NationalMap.vue       # 전국 5개 도시 Kakao 지도
│   │   └── TemperatureChart.vue  # 도시별 기온 비교 막대그래프
├── i18n/
│   └── labels.js                 # 한국어/영어 문구
├── router/
│   └── index.js                  # 라우트와 Lazy Loading
├── stores/
│   ├── configStore.js            # 온도 단위 상태
│   ├── languageStore.js          # 언어 상태
│   └── weatherStore.js           # 날씨와 즐겨찾기 상태
├── utils/
│   ├── activity.js               # 활동 점수와 추천 로직
│   ├── fortune.js                # 날짜 기반 결정론적 운세
│   ├── music.js                  # 날씨별 일일 음악 추천
│   ├── scoreColor.js             # 점수 구간별 공통 색상
│   ├── search.js                 # 초성과 영문 검색
│   ├── weatherVisual.js          # 예보 상태별 날씨 이모지
│   └── temperature.js            # 온도 변환
└── views/
    ├── WeatherHomeView.vue       # 홈
    ├── WeatherDetailView.vue     # 도시 상세
    ├── WeatherActivityView.vue   # 활동 추천
    ├── WeatherNationalView.vue   # 전국 날씨 대시보드
    ├── WeatherAboutView.vue      # 서비스 소개
    └── NotFoundView.vue          # 404
```

## 실행 방법

### API Key 설정

프로젝트 루트에 `.env.local`을 만들고 실제 키를 입력합니다. `.env.example`에는 실제 키를 넣지 않고 변수명만 제공합니다.

```env
VITE_OPENWEATHER_API_KEY=your_openweather_key
VITE_KAKAO_MAP_JS_KEY=your_kakao_javascript_key
```

- 실제 API Key를 소스 코드나 README에 하드코딩하지 않습니다.
- `.gitignore`의 `*.local`이 `.env.local`을 제외하고, `.env`도 별도 패턴으로 제외합니다.
- `VITE_` 환경변수는 빌드 시 브라우저 번들에 포함됩니다. `.env.local`은 Git 커밋을 막기 위한 관리 방식이며 완전한 비밀 저장 방식은 아닙니다.
- Kakao Developers에는 개발 주소(기본값 `http://localhost:5173`)를 JavaScript SDK 도메인으로 등록하고 카카오맵 제품을 활성화해야 합니다.

`.env.example`에는 `VITE_OPENWEATHER_API_KEY`와 `VITE_KAKAO_MAP_JS_KEY` 변수명만 제공합니다.

### 설치

```sh
npm install
```

### 개발 서버

```sh
npm run dev
```

### 빌드

```sh
npm run build
```

### Lint

```sh
npm run lint
```
