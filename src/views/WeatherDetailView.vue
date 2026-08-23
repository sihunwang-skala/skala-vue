<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/languageStore'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { LABELS, translateStatus, aqiLevelText } from '@/i18n/labels'
import { convertTemp } from '@/utils/temperature'
import { weatherEmoji } from '@/utils/weatherVisual'
import {
  getForecast,
  normalizeForecastEntry,
  getAirPollution,
  normalizeAirPollution,
  aqiTagType,
} from '@/api/weatherApi'

// route: 현재 URL 정보를 "읽는" 용도 (params.cityId)
const route = useRoute()
// router: 화면을 "이동시키는" 용도 (대시보드로 돌아가기)
const router = useRouter()

const languageStore = useLanguageStore()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const t = computed(() => LABELS[languageStore.language])

const cityData = ref(null)
// [과제 6] 이 도시의 다가오는 예보 (3시간 간격)
const forecastList = ref([])
const isForecastLoading = ref(false)
const forecastError = ref(null)
// [과제 7 확장] 대기질(미세먼지) — OpenWeatherMap 추가 API
const airQuality = ref(null)
const isAirQualityLoading = ref(false)

onMounted(async () => {
  // 이 페이지로 직접(주소창 입력/새로고침) 들어온 경우 weatherStore가 비어있을 수 있어 먼저 채운다.
  if (weatherStore.weatherList.length === 0) {
    await weatherStore.fetchWeatherList()
  }

  // Dynamic Route 파라미터(:cityId)를 읽어서 weatherStore에서 해당 도시를 찾는다.
  // 없으면 null 유지 → 아래 안내 문구 표시.
  cityData.value = weatherStore.getCityById(route.params.cityId)

  if (cityData.value) {
    isForecastLoading.value = true
    forecastError.value = null
    try {
      const data = await getForecast(cityData.value.nameEn)
      // 3시간 간격 슬롯 중 앞 5개만(다음 15시간 정도) 보여준다.
      forecastList.value = data.list.slice(0, 5).map(normalizeForecastEntry)
    } catch (err) {
      forecastError.value = t.value.loadingForecast
      console.error('[WeatherDetailView] 예보 조회 실패:', err)
    } finally {
      isForecastLoading.value = false
    }

    isAirQualityLoading.value = true
    try {
      const data = await getAirPollution(cityData.value.lat, cityData.value.lon)
      airQuality.value = normalizeAirPollution(data)
    } catch (err) {
      console.error('[WeatherDetailView] 대기질 조회 실패:', err)
    } finally {
      isAirQualityLoading.value = false
    }
  }
})

const displayName = computed(() => {
  if (!cityData.value) return ''
  return languageStore.language === 'ko' ? cityData.value.name : cityData.value.nameEn
})
const displayStatus = computed(() =>
  cityData.value ? translateStatus(cityData.value.status, languageStore.language) : '',
)
// 화면 표시용 기온만 단위 변환 (WeatherCard와 같은 convertTemp 사용)
const displayTemp = computed(() =>
  cityData.value ? convertTemp(cityData.value.temp, configStore.unit) : 0,
)

function forecastTemp(entry) {
  return convertTemp(entry.temp, configStore.unit)
}
// 'YYYY-MM-DD HH:mm:ss' 문자열에서 시:분만 잘라 쓴다 (날짜 라이브러리 없이 간단히 처리)
function forecastTime(entry) {
  return entry.time.slice(11, 16)
}
</script>

<template>
  <div class="detail-container">
    <h3>{{ t.detailTitle }}</h3>
    <hr />

    <div v-if="cityData" class="info-card">
      <h4>{{ t.detailLocationLabel }} {{ displayName }}</h4>
      <p>
        {{ t.detailTempLabel }} <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
      </p>
      <p>{{ t.detailStatusLabel }} {{ displayStatus }}</p>
      <p>{{ t.detailHumidityLabel }} {{ cityData.humidity }}%</p>
      <p>{{ t.detailWindLabel }} {{ cityData.windSpeed }}m/s</p>

      <!-- [과제 7 확장] OpenWeather Air Pollution API -->
      <p v-if="isAirQualityLoading">{{ t.aqiLoading }}</p>
      <p v-else-if="airQuality">
        {{ t.aqiLabel }}
        <!-- [UI Library] el-tag로 등급을 색으로 구분 -->
        <el-tag :type="aqiTagType(airQuality.aqi)" size="small">{{
          aqiLevelText(airQuality.aqi, languageStore.language)
        }}</el-tag>
        <span class="aqi-detail">{{ t.aqiDetail(airQuality.pm2_5, airQuality.pm10) }}</span>
      </p>
    </div>
    <div v-else>
      <p>{{ t.detailNotFound(route.params.cityId) }}</p>
    </div>

    <!-- [과제 6] Forecast API 결과 -->
    <div v-if="cityData" class="forecast-box">
      <h4>{{ t.forecastTitle }}</h4>
      <p v-if="isForecastLoading">{{ t.loadingForecast }}</p>
      <p v-else-if="forecastError">{{ forecastError }}</p>
      <ul v-else class="forecast-list">
        <li v-for="entry in forecastList" :key="entry.time">
          <span class="forecast-emoji" aria-hidden="true">{{ weatherEmoji(entry) }}</span>
          <strong class="forecast-time">{{ forecastTime(entry) }}</strong>
          <strong class="forecast-temp">
            {{ forecastTemp(entry) }}{{ configStore.unitSymbol }}
          </strong>
          <span class="forecast-status">
            {{ translateStatus(entry.status, languageStore.language) }}
          </span>
          <div class="forecast-meta">
            <span>💧 {{ t.humidityLabel(entry.humidity) }}</span>
            <span>☂️ {{ t.forecastRainChance(Math.round(entry.pop * 100)) }}</span>
          </div>
        </li>
      </ul>
    </div>

    <button class="back-btn" @click="router.push({ name: 'WeatherHome' })">
      {{ t.detailBackButton }}
    </button>
  </div>
</template>

<style scoped>
.detail-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.info-card {
  background: #f1f2f6;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}
.forecast-box {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}
.forecast-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  font-size: 14px;
}
.forecast-list li {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 12px 6px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fff;
  text-align: center;
}
.forecast-emoji {
  margin: 3px 0 7px;
  font-size: 28px;
  line-height: 1;
}
.forecast-time {
  color: #495057;
  font-size: 12px;
}
.forecast-temp {
  margin-top: 4px;
  color: #e8590c;
  font-size: 17px;
}
.forecast-status {
  min-height: 34px;
  margin-top: 4px;
  color: #495057;
  font-size: 11px;
}
.forecast-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 6px;
  color: #1971c2;
  font-size: 10px;
}
@media (max-width: 620px) {
  .forecast-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.aqi-detail {
  margin-left: 8px;
  font-size: 12px;
  color: #868e96;
}
.back-btn {
  padding: 8px 12px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
