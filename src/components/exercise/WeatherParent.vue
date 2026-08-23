<script setup>
import { ref, reactive, computed, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLanguageStore } from '@/stores/languageStore'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { LABELS, aqiLevelText } from '@/i18n/labels'
import { matchesSearch } from '@/utils/search'
import { convertTemp } from '@/utils/temperature'
import { createDailyMusicRecommendations } from '@/utils/music'
import {
  getForecast,
  normalizeForecastEntry,
  getAirPollution,
  normalizeAirPollution,
  aqiTagType,
} from '@/api/weatherApi'
import {
  findBestOutdoorSlot,
  slotTime,
  slotVerdict,
  placeKeywordFor,
  activityFor,
} from '@/utils/activity'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import SortControls from './SortControls.vue'
import WeatherIndexCard from './WeatherIndexCard.vue'
import PlaceMap from './PlaceMap.vue'
import FortuneCard from './FortuneCard.vue'

const languageStore = useLanguageStore()
const t = computed(() => LABELS[languageStore.language])
// router: 실제 화면 이동에 사용 (route와 다르게 "읽기"가 아니라 "이동"이 목적)
const router = useRouter()
const configStore = useConfigStore()

// 1. [1일차 데이터] 도시 날씨 목록 — [과제 5] 여러 화면이 공유하도록 weatherStore로 이동
// weatherStore.weatherList처럼 직접 접근한다 (구조분해하면 반응성이 깨질 수 있어서 지양)
const weatherStore = useWeatherStore()

// 2. [1일차 데이터] 검색어 및 선택된 도시
const searchQuery = ref('')
// 선택된 도시(= "현재 지역") 자체를 저장한다 (언어가 바뀌어도 상태바 문구가 다시 계산되도록)
const selectedCity = ref(null)

// [본인 추가] 목록이 로드되면 광주를 "현재 지역" 기본값으로 잡는다.
// 광주 데이터가 없을 때만 첫 도시를 안전한 대체값으로 사용한다.
watch(
  () => weatherStore.weatherList,
  (list) => {
    if (!selectedCity.value && list.length > 0) {
      selectedCity.value = list.find((city) => city.id === 'city_04') ?? list[0]
    }
  },
  { immediate: true },
)

const displayName = (item) => (languageStore.language === 'ko' ? item.name : item.nameEn)

// 3. [2일차 추가] computed를 활용한 실시간 검색 필터링 연산기
// 한글/영문/초성 검색을 모두 지원한다.
const filteredWeatherList = computed(() =>
  weatherStore.weatherList.filter((item) => matchesSearch(item, searchQuery.value)),
)

// 검색 결과가 있으면 첫 번째 도시를 현재 지역에도 반영한다.
// 빈 검색어에서는 사용자가 카드로 선택한 지역을 유지한다.
watch(searchQuery, (query) => {
  if (!query.trim()) return
  const matchedCity = filteredWeatherList.value[0]
  if (matchedCity) selectedCity.value = matchedCity
})

// [본인 추가] 즐겨찾기만 보기 토글. 검색 결과 위에 한 번 더 걸러낸다.
const showFavoritesOnly = ref(false)
const visibleWeatherList = computed(() => {
  // 검색은 현재 지역을 선택하는 용도다. 다른 지역 목록은 검색 중에도 전체 도시를 유지한다.
  if (!showFavoritesOnly.value) return weatherStore.weatherList
  return weatherStore.weatherList.filter((item) => weatherStore.isFavorite(item.id))
})

function clearFavoritesConfirm() {
  ElMessageBox.confirm(t.value.favoritesClearConfirmMessage, t.value.favoritesClearConfirmTitle, {
    confirmButtonText: t.value.favoritesClearConfirmOk,
    cancelButtonText: t.value.favoritesClearConfirmCancel,
    type: 'warning',
  })
    .then(() => {
      weatherStore.clearFavorites()
      ElMessage.success(t.value.favoritesClearDone)
    })
    .catch(() => {
      ElMessage.info(t.value.favoritesClearCancelled)
    })
}

// 6. [본인 추가] 정렬 기준(name/temp)과 방향(asc/desc)을 하나의 reactive 객체로 관리
// 서로 연관된 값 두 개를 묶어서 다루기 좋은 상태라 reactive를 사용했다.
const sortOption = reactive({ by: 'name', order: 'asc' })

// 7. [본인 추가] 정렬 옵션을 적용한 목록 (visibleWeatherList 위에 얹는 computed)
const sortedWeatherList = computed(() => {
  const list = [...visibleWeatherList.value]
  list.sort((a, b) => {
    const compare = sortOption.by === 'name' ? a.name.localeCompare(b.name) : a.temp - b.temp
    return sortOption.order === 'asc' ? compare : -compare
  })
  return list
})

// 8. [본인 추가] 정렬 기준(sortOption.by)만 콕 집어서 감시하는 특정 속성 watch
watch(
  () => sortOption.by,
  (newBy, oldBy) => {
    console.log(`[watch 감지] 정렬 기준이 변경되었습니다: "${oldBy}" -> "${newBy}"`)
  },
)

function toggleSortBy() {
  sortOption.by = sortOption.by === 'name' ? 'temp' : 'name'
}
function toggleSortOrder() {
  sortOption.order = sortOption.order === 'asc' ? 'desc' : 'asc'
}

// 4. [2일차 추가] watch를 활용한 선택 도시 추적 센서
watch(selectedCity, (city) => {
  if (city) console.log(`[watch 감지] 현재 지역이 변경되었습니다 -> "${city.name}"`)
})

// 5. [2일차 추가] watchEffect를 활용한 자동 의존성 로그
// 타이핑할 때마다 변하는 searchQuery를 자동 추적한다.
watchEffect(() => {
  console.log(
    `[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 데이터를 필터링합니다.`,
  )
})

// [과제 4] WeatherCard의 click-detail emit을 받아서 실행 (부모가 실제 동작을 처리)
// 기존 window.alert() 대신 router.push()로 상세 페이지(/weather/:cityId)로 이동한다.
const showDetail = (item) => {
  router.push({ name: 'WeatherDetail', params: { cityId: item.id } })
}

// ============================================================
// [본인 추가] "현재 지역(Hero)" 요약 — 선택된 도시 하나의 예보/대기질/추천을 모아 보여준다.
// WeatherActivityView는 5개 도시를 한눈에 "비교"하는 페이지로 남겨두고, 여기서는 지금 보고
// 있는 도시 하나에 집중한 요약을 제공한다(같은 계산식은 utils/activity.js로 공유).
// ============================================================
const heroForecast = ref([])
const heroAqi = ref(null)
const isHeroForecastLoading = ref(false)
const isHeroAqiLoading = ref(false)

// selectedCity가 바뀔 때마다(기본 선택 포함) 그 도시의 예보/대기질을 새로 불러온다.
watch(
  selectedCity,
  async (city) => {
    if (!city) return

    isHeroForecastLoading.value = true
    heroForecast.value = []
    try {
      const data = await getForecast(city.nameEn)
      heroForecast.value = data.list.slice(0, 8).map(normalizeForecastEntry) // 다음 24시간
    } catch (err) {
      console.error('[WeatherParent] 현재 지역 예보 조회 실패:', err)
    } finally {
      isHeroForecastLoading.value = false
    }

    isHeroAqiLoading.value = true
    heroAqi.value = null
    try {
      const data = await getAirPollution(city.lat, city.lon)
      heroAqi.value = normalizeAirPollution(data)
    } catch (err) {
      console.error('[WeatherParent] 현재 지역 대기질 조회 실패:', err)
    } finally {
      isHeroAqiLoading.value = false
    }
  },
  { immediate: true },
)

const heroDisplayTemp = computed(() =>
  selectedCity.value ? convertTemp(selectedCity.value.temp, configStore.unit) : 0,
)
const heroFeelsLikeTemp = computed(() =>
  selectedCity.value ? convertTemp(selectedCity.value.feelsLike, configStore.unit) : 0,
)
const heroBestSlot = computed(() => findBestOutdoorSlot(heroForecast.value))
const heroBestSlotTime = computed(() => (heroBestSlot.value ? slotTime(heroBestSlot.value) : null))
// [본인 추가] "좋은 시간대"를 하나만 콕 집지 않고, 다음 24시간(3시간 간격) 전체를 시간대별로
// 러닝하기 좋은지/아닌지 판정해서 쭉 보여준다. slotVerdict는 findBestOutdoorSlot과 같은 기준을 쓴다.
const heroSlotBreakdown = computed(() =>
  heroForecast.value.map((entry) => {
    const verdict = slotVerdict(entry)
    return {
      time: slotTime(entry),
      temp: Math.round(convertTemp(entry.temp, configStore.unit)),
      verdict: verdict[languageStore.language],
      good: verdict.good,
    }
  }),
)
const heroPlaceKeyword = computed(() =>
  selectedCity.value ? placeKeywordFor(selectedCity.value, heroAqi.value) : '',
)
// "종합 추천" = 러닝/야외활동 지수와 같은 계산식(activityFor)의 문구를 그대로 재사용한다.
const heroRecommendation = computed(() =>
  selectedCity.value ? activityFor(selectedCity.value, heroAqi.value)[languageStore.language] : '',
)
const heroMusicRecommendations = computed(() =>
  selectedCity.value ? createDailyMusicRecommendations(selectedCity.value) : [],
)

// 현재 날씨에 맞춰 대시보드의 바깥 배경 톤을 바꾼다.
const heroWeatherTheme = computed(() => {
  const main = selectedCity.value?.main
  if (main === 'Clear') return 'clear'
  if (main === 'Clouds') return 'cloudy'
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(main)) return 'rainy'
  if (main === 'Snow') return 'snowy'
  return 'default'
})
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- [본인 추가] 도시 검색을 맨 위로 — 서울만 보고 끝나지 않도록 검색을 가장 먼저 보여준다 -->
    <BaseDashboardCard class="search-card">
      <h3>{{ t.searchTitle }}</h3>
      <SearchBar :current-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
      <p v-if="searchQuery.trim() && filteredWeatherList.length === 0" class="search-empty">
        {{ t.noResult }}
      </p>
    </BaseDashboardCard>

    <!-- [본인 추가] 현재 지역(Hero) 요약 -->
    <BaseDashboardCard v-if="selectedCity" :class="['hero-card', `weather-${heroWeatherTheme}`]">
      <h3>{{ t.currentRegionLabel }} {{ displayName(selectedCity) }}</h3>

      <div class="hero-stats">
        <span class="hero-temp">{{ heroDisplayTemp }}{{ configStore.unitSymbol }}</span>
        <span class="feels-like-stat">{{
          t.heroFeelsLike(heroFeelsLikeTemp, configStore.unitSymbol)
        }}</span>
        <span class="humidity-stat">{{ t.humidityLabel(selectedCity.humidity) }}</span>
        <span v-if="isHeroAqiLoading">{{ t.aqiLoading }}</span>
        <el-tag v-else-if="heroAqi" :type="aqiTagType(heroAqi.aqi)" size="small">
          {{ t.aqiLabel }} {{ aqiLevelText(heroAqi.aqi, languageStore.language) }}
        </el-tag>
      </div>

      <!-- 오늘의 생활지수: 러닝/헤어/옷차림/야외활동을 한곳에 모아서 보여준다 -->
      <WeatherIndexCard :weather="selectedCity" :aqi="heroAqi" />

      <!-- 도시ID + 날짜 + 날씨상태 시드로 하루 동안 고정되는 날씨 운세 -->
      <FortuneCard :weather="selectedCity" />

      <div class="hero-section recommendation-time-section">
        <h4>{{ t.recommendationTimeTitle }}</h4>
        <p>{{ heroRecommendation }}</p>
        <h5>{{ t.bestTimeTitle }}</h5>
        <p v-if="isHeroForecastLoading">{{ t.loadingForecast }}</p>
        <template v-else>
          <p>{{ heroBestSlotTime ? t.bestOutdoorTime(heroBestSlotTime) : t.noBestOutdoorTime }}</p>
          <!-- [본인 추가] 시간대별로 러닝하기 좋은지 한눈에 볼 수 있게 다음 24시간을 쭉 나열 -->
          <ul class="slot-list">
            <li
              v-for="slot in heroSlotBreakdown"
              :key="slot.time"
              :class="{ 'slot-good': slot.good }"
            >
              <span class="slot-time">{{ slot.time }}</span>
              <span class="slot-temp">{{ slot.temp }}{{ configStore.unitSymbol }}</span>
              <span class="slot-verdict">{{ slot.verdict }}</span>
            </li>
          </ul>
          <div class="music-recommendation">
            <h5>{{ t.musicRecommendationTitle }}</h5>
            <ul class="music-list">
              <li
                v-for="(song, index) in heroMusicRecommendations"
                :key="`${song.artist}-${song.title}`"
              >
                <span class="track-number">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="track-info">
                  <strong>{{ song.title }}</strong>
                  <small>{{ song.artist }}</small>
                </span>
                <span class="track-wave" aria-hidden="true"> <i></i><i></i><i></i><i></i> </span>
              </li>
            </ul>
          </div>
        </template>
      </div>

      <div class="hero-section places-section">
        <h4>{{ t.nearbyPlacesTitle }}</h4>
        <PlaceMap
          :keyword="heroPlaceKeyword"
          :center-lat="selectedCity.lat"
          :center-lng="selectedCity.lon"
        />
      </div>
    </BaseDashboardCard>
    <p v-else-if="weatherStore.isLoading" class="hero-loading">{{ t.loadingWeather }}</p>

    <!-- 다른 지역 보기: 검색 결과를 반영한 도시 카드 목록(v-for) -->
    <BaseDashboardCard class="regions-card">
      <h3>{{ t.otherRegionsTitle }}</h3>
      <!-- [과제 6] loading / error / 정상 3단계 처리 -->
      <p v-if="weatherStore.isLoading">{{ t.loadingWeather }}</p>
      <div v-else-if="weatherStore.error">
        <p>{{ weatherStore.error }}</p>
        <!-- [UI Library] el-button 사용 -->
        <el-button size="small" type="primary" @click="weatherStore.fetchWeatherList">{{
          t.retryButton
        }}</el-button>
      </div>
      <template v-else>
        <div class="list-toolbar">
          <SortControls
            :sort-by="sortOption.by"
            :sort-order="sortOption.order"
            @toggle-by="toggleSortBy"
            @toggle-order="toggleSortOrder"
          />
        </div>

        <!-- [본인 추가] 즐겨찾기 필터 + 전체 삭제 -->
        <div class="favorites-toolbar">
          <el-switch v-model="showFavoritesOnly" :active-text="t.favoritesOnlyLabel" />
          <el-button
            v-if="weatherStore.favoriteCount > 0"
            size="small"
            type="danger"
            plain
            @click="clearFavoritesConfirm"
          >
            {{ t.favoritesClearButton }}
          </el-button>
        </div>

        <WeatherCard
          v-for="item in sortedWeatherList"
          :key="item.id"
          :city-item="item"
          @select-card="(city) => (selectedCity = city)"
          @click-detail="showDetail"
        />

        <p v-if="showFavoritesOnly && sortedWeatherList.length === 0">{{ t.favoritesEmpty }}</p>
      </template>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(360px, 420px) minmax(0, 1fr);
  grid-template-areas:
    'search hero'
    'regions hero';
  grid-template-rows: auto 1fr;
  gap: 16px;
  align-items: start;
}
.search-card {
  grid-area: search;
  margin-bottom: 0;
}
.regions-card {
  grid-area: regions;
  margin-bottom: 0;
}
.hero-card {
  grid-area: hero;
  margin-bottom: 0;
  border-color: #ced4da;
  transition: background 0.3s ease;
}
.hero-card.weather-clear {
  background: linear-gradient(145deg, #fff9db 0%, #e7f5ff 34%, #ffffff 72%);
}
.hero-card.weather-cloudy {
  background: linear-gradient(145deg, #f1f3f5 0%, #dbe4ff 36%, #ffffff 72%);
}
.hero-card.weather-rainy {
  background: linear-gradient(145deg, #d0ebff 0%, #e7f5ff 38%, #ffffff 74%);
}
.hero-card.weather-snowy {
  background: linear-gradient(145deg, #f8f9fa 0%, #e3fafc 38%, #ffffff 74%);
}
.hero-card.weather-default {
  background: linear-gradient(145deg, #edf2ff 0%, #e7f5ff 38%, #ffffff 74%);
}
.hero-loading {
  grid-area: hero;
}
.search-empty {
  margin: 10px 0 0;
  color: #e03131;
  font-size: 13px;
}
.hero-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  font-size: 14px;
  color: #495057;
}
.hero-temp {
  font-size: 1.6rem;
  font-weight: bold;
  color: #2c3e50;
}
.feels-like-stat {
  color: #e03131;
  font-weight: 600;
}
.humidity-stat {
  color: #1971c2;
  font-weight: 600;
}
.hero-section {
  margin-top: 14px;
  padding: 14px;
  border: 1px solid transparent;
  border-radius: 8px;
}
.recommendation-time-section {
  border-color: #b2f2bb;
  background: linear-gradient(135deg, #ebfbee 0%, #fff9db 100%);
}
.recommendation-time-section h5 {
  margin: 14px 0 6px;
  padding-top: 12px;
  border-top: 1px solid #c3e6cb;
  font-size: 15px;
  font-weight: 700;
  line-height: 22px;
}
.places-section {
  border-color: #96f2d7;
  background: #e6fcf5;
}
.hero-section h4 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  line-height: 24px;
}
.slot-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.slot-list li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #f1f3f5;
  font-size: 12px;
  color: #495057;
}
.slot-list li.slot-good {
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: bold;
}
.slot-time {
  font-weight: bold;
}
.list-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.music-list {
  padding: 0;
  margin: 0;
  list-style: none;
  overflow: hidden;
  border: 1px solid rgb(46 125 50 / 16%);
  border-radius: 8px;
  background: rgb(255 255 255 / 62%);
}
.music-list li {
  display: grid;
  grid-template-columns: 25px minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 5px 9px;
  color: #343a40;
  font-size: 12px;
}
.music-list li + li {
  border-top: 1px solid rgb(46 125 50 / 12%);
}
.track-number {
  color: #868e96;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.track-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.track-info strong {
  font-size: 12px;
}
.track-info small {
  font-size: 10px;
}
.track-info strong,
.track-info small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.track-info small {
  color: #868e96;
}
.track-wave {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 14px;
  padding: 0 2px;
}
.track-wave i {
  width: 2px;
  border-radius: 2px;
  background: #51cf66;
}
.track-wave i:nth-child(1) {
  height: 5px;
}
.track-wave i:nth-child(2) {
  height: 11px;
}
.track-wave i:nth-child(3) {
  height: 8px;
}
.track-wave i:nth-child(4) {
  height: 4px;
}
.favorites-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
@media (max-width: 900px) {
  .dashboard-wrapper {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      'search'
      'hero'
      'regions';
  }
}
</style>
