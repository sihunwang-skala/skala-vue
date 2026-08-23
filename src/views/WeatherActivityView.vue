<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/languageStore'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { LABELS, aqiLevelText } from '@/i18n/labels'
import { convertTemp } from '@/utils/temperature'
import {
  getForecast,
  normalizeForecastEntry,
  getAirPollution,
  normalizeAirPollution,
  aqiTagType,
} from '@/api/weatherApi'
import {
  runningScore,
  activityFor,
  findBestOutdoorSlot,
  slotTime,
  placeKeywordFor,
  sportsFor,
} from '@/utils/activity'
import { scoreTagType, scoreTone } from '@/utils/scoreColor'
import PlaceMap from '@/components/exercise/PlaceMap.vue'

// [7번 요구사항] 본인 추가 View. 도시 데이터는 [과제 5]부터 weatherStore를 공유해서 쓴다.
// [과제 6] 현재 날씨(weatherStore)에 더해, 도시별 24시간 예보(Forecast API)를 분석해서
// "오늘 활동하기 좋은 시간"까지 추천한다.
const languageStore = useLanguageStore()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const t = computed(() => LABELS[languageStore.language])

// 도시별 예보를 담아둔다: { [cityId]: normalizeForecastEntry[] }
const forecastByCity = ref({})
const isForecastLoading = ref(false)
// [과제 7 확장] 도시별 대기질을 담아둔다: { [cityId]: normalizeAirPollution 결과 }
const airQualityByCity = ref({})

onMounted(async () => {
  if (weatherStore.weatherList.length === 0) {
    await weatherStore.fetchWeatherList()
  }

  isForecastLoading.value = true
  // allSettled를 써서 도시 하나의 예보 조회가 실패해도 나머지 도시는 정상 표시되게 한다.
  const results = await Promise.allSettled(
    weatherStore.weatherList.map((city) =>
      getForecast(city.nameEn).then((data) => ({
        id: city.id,
        entries: data.list.slice(0, 8).map(normalizeForecastEntry), // 3시간 간격 8개 = 다음 24시간
      })),
    ),
  )
  const map = {}
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      map[result.value.id] = result.value.entries
    } else {
      console.error('[WeatherActivityView] 예보 조회 실패:', result.reason)
    }
  })
  forecastByCity.value = map
  isForecastLoading.value = false

  // 대기질도 예보와 같은 방식(allSettled)으로 5개 도시를 병렬 조회한다.
  const aqiResults = await Promise.allSettled(
    weatherStore.weatherList.map((city) =>
      getAirPollution(city.lat, city.lon).then((data) => ({
        id: city.id,
        aqi: normalizeAirPollution(data),
      })),
    ),
  )
  const aqiMap = {}
  aqiResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      aqiMap[result.value.id] = result.value.aqi
    } else {
      console.error('[WeatherActivityView] 대기질 조회 실패:', result.reason)
    }
  })
  airQualityByCity.value = aqiMap
})

// runningScore/activityFor/findBestOutdoorSlot/slotTime/placeKeywordFor는
// utils/activity.js로 옮겨서 WeatherParent(내 지역 요약)와 같은 계산식을 공유한다.

const recommendations = computed(() =>
  weatherStore.weatherList.map((city) => {
    const bestSlot = findBestOutdoorSlot(forecastByCity.value[city.id])
    const aqi = airQualityByCity.value[city.id] ?? null
    return {
      ...city,
      activity: activityFor(city, aqi)[languageStore.language],
      sports: sportsFor(city, aqi)[languageStore.language],
      displayTemp: convertTemp(city.temp, configStore.unit),
      score: runningScore(city, aqi),
      bestSlotTime: bestSlot ? slotTime(bestSlot) : null,
      placeKeyword: placeKeywordFor(city, aqi),
      aqi,
    }
  }),
)
</script>

<template>
  <div class="activity-container">
    <h3>{{ t.activitiesTitle }}</h3>
    <p class="subtitle">{{ t.activitiesSubtitle }}</p>
    <hr />

    <p v-if="weatherStore.isLoading">{{ t.loadingWeather }}</p>
    <template v-else>
      <div class="activity-layout">
        <div class="activity-grid">
          <div
            v-for="city in recommendations"
            :key="city.id"
            class="activity-card"
            :class="`activity-${scoreTone(city.score)}`"
          >
            <h4>
              {{ languageStore.language === 'ko' ? city.name : city.nameEn }} ({{ city.displayTemp
              }}{{ configStore.unitSymbol }})
            </h4>
            <p class="score" :class="`score-${scoreTone(city.score)}`">
              {{ t.activityScoreLabel(city.score) }}
            </p>
            <!-- [과제 7 확장] Air Pollution API -->
            <p v-if="city.aqi" class="aqi-line">
              {{ t.aqiLabel }}
              <el-tag :type="aqiTagType(city.aqi.aqi)" size="small">{{
                aqiLevelText(city.aqi.aqi, languageStore.language)
              }}</el-tag>
            </p>
            <p>{{ city.activity }}</p>
            <div class="sports-block">
              <strong>{{ t.recommendedSportsTitle }}</strong>
              <div class="sports-list">
                <el-tag
                  v-for="sport in city.sports"
                  :key="sport"
                  :type="scoreTagType(city.score)"
                  effect="plain"
                >
                  {{ sport }}
                </el-tag>
              </div>
            </div>
            <p v-if="isForecastLoading" class="best-time">{{ t.loadingForecast }}</p>
            <p v-else class="best-time">
              {{ city.bestSlotTime ? t.bestOutdoorTime(city.bestSlotTime) : t.noBestOutdoorTime }}
            </p>
            <div class="card-actions">
              <!-- RouterLink: 도시별 상세 페이지(WeatherDetailView)로 바로 연결 -->
              <RouterLink
                :to="{
                  name: 'WeatherDetail',
                  params: { cityId: city.id },
                  query: { from: 'activities' },
                }"
                class="detail-link"
              >
                {{ t.activitiesDetailLink }}
              </RouterLink>
            </div>

            <!-- [과제 6] 버튼을 누르지 않아도 추천 활동에 맞는 실제 장소를 바로 표시 -->
            <PlaceMap :keyword="city.placeKeyword" :center-lat="city.lat" :center-lng="city.lon" />
          </div>
        </div>

        <aside class="recommendation-guide" tabindex="0">
          <div class="guide-heading">
            <h4>{{ t.activityGuideTitle }}</h4>
            <span aria-hidden="true">⌄</span>
          </div>
          <div class="guide-content">
            <div v-for="rule in t.activityGuideRules" :key="rule.title" class="guide-rule">
              <strong>{{ rule.title }}</strong>
              <span>{{ rule.condition }}</span>
              <p>{{ rule.sports }}</p>
            </div>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.activity-container {
  max-width: 1100px;
  margin: 0 auto;
}
.subtitle {
  color: #868e96;
  font-size: 14px;
  margin-top: -4px;
}
.activity-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 210px;
  gap: 16px;
  align-items: start;
}
.activity-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.activity-card {
  background: #fff;
  border: 1px solid #dee2e6;
  padding: 12px;
  border-radius: 8px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}
.activity-card.activity-high {
  border-color: #8ce99a;
  background: #f4fce3;
}
.activity-card.activity-medium {
  border-color: #ffd43b;
  background: #fff9db;
}
.activity-card.activity-low {
  border-color: #ffa8a8;
  background: #fff5f5;
}
.activity-card :deep(.place-map) {
  margin-top: 8px;
  outline: none;
}
.activity-card :deep(.map-box) {
  height: 105px;
  transition: height 0.45s ease;
}
.activity-card :deep(.place-list) {
  max-height: 0;
  overflow: hidden;
  margin-top: 0;
  opacity: 0;
  transition:
    max-height 0.45s ease,
    margin-top 0.3s ease,
    opacity 0.25s ease;
}
.activity-card:hover :deep(.map-box),
.activity-card:focus-within :deep(.map-box) {
  height: 220px;
}
.activity-card:hover :deep(.place-list),
.activity-card:focus-within :deep(.place-list) {
  max-height: 150px;
  margin-top: 8px;
  opacity: 1;
}
.sports-block {
  margin: 10px 0;
  font-size: 13px;
}
.sports-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;
}
.score {
  font-weight: bold;
  margin: 4px 0;
}
.score-high {
  color: #2f9e44;
}
.score-medium {
  color: #f08c00;
}
.score-low {
  color: #e03131;
}
.aqi-line {
  font-size: 13px;
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.best-time {
  font-size: 13px;
  color: #495057;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}
.detail-link {
  font-size: 13px;
  color: #3498db;
  text-decoration: none;
}
.detail-link:hover {
  text-decoration: underline;
}
.recommendation-guide {
  position: sticky;
  top: 52px;
  padding: 11px 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #f8f9fa;
  outline: none;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}
.guide-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: default;
}
.guide-heading h4 {
  margin: 0;
  font-size: 13px;
}
.guide-heading > span {
  color: #868e96;
  transition: transform 0.3s ease;
}
.guide-content {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition:
    max-height 0.45s ease,
    opacity 0.25s ease,
    margin-top 0.3s ease;
}
.recommendation-guide:hover,
.recommendation-guide:focus-within {
  border-color: #74c0fc;
  box-shadow: 0 8px 20px rgb(44 62 80 / 10%);
}
.recommendation-guide:hover .guide-content,
.recommendation-guide:focus-within .guide-content {
  max-height: 520px;
  margin-top: 7px;
  opacity: 1;
}
.recommendation-guide:hover .guide-heading > span,
.recommendation-guide:focus-within .guide-heading > span {
  transform: rotate(180deg);
}
.guide-rule {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 0;
  border-top: 1px solid #dee2e6;
}
.guide-rule span {
  color: #868e96;
  font-size: 11px;
}
.guide-rule p {
  margin: 0;
  color: #495057;
  font-size: 12px;
}
@media (max-width: 850px) {
  .activity-layout {
    grid-template-columns: 1fr;
  }
  .recommendation-guide {
    position: static;
    grid-row: 1;
  }
  .activity-grid {
    grid-template-columns: 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  .recommendation-guide,
  .guide-content,
  .guide-heading > span {
    transition: none;
  }
  .activity-card :deep(.map-box),
  .activity-card :deep(.place-list) {
    transition: none;
  }
}
</style>
