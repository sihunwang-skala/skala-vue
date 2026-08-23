<script setup>
// RouterLink: 클릭해서 이동하는 링크 컴포넌트 / RouterView: URL에 매핑된 View가 그려지는 자리
import { RouterLink, RouterView } from 'vue-router'
import LanguageToggle from './components/exercise/LanguageToggle.vue'
import UnitToggler from './components/exercise/UnitToggler.vue'
import WeatherTicker from './components/exercise/WeatherTicker.vue'
import { useLanguageStore } from './stores/languageStore'
import { useConfigStore } from './stores/configStore'
import { useWeatherStore } from './stores/weatherStore'
import { LABELS, translateStatus } from './i18n/labels'
import { convertTemp } from './utils/temperature'
import { computed, onMounted } from 'vue'

const languageStore = useLanguageStore()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const t = computed(() => LABELS[languageStore.language])

onMounted(() => {
  if (weatherStore.weatherList.length === 0 && !weatherStore.isLoading) {
    weatherStore.fetchWeatherList()
  }
})

const tickerCities = computed(() => {
  const list = weatherStore.weatherList
  if (list.length === 0) return []
  const maxTemp = Math.max(...list.map((city) => city.temp))
  const minTemp = Math.min(...list.map((city) => city.temp))

  return list.map((city) => ({
    id: city.id,
    name: languageStore.language === 'ko' ? city.name : city.nameEn,
    temp: convertTemp(city.temp, configStore.unit),
    unitSymbol: configStore.unitSymbol,
    status: translateStatus(city.status, languageStore.language),
    tone: city.temp === maxTemp ? 'tone-hot' : city.temp === minTemp ? 'tone-cool' : 'tone-mid',
  }))
})
</script>

<template>
  <WeatherTicker
    v-if="tickerCities.length"
    class="global-weather-ticker"
    :cities="tickerCities"
    :title="t.weatherTickerTitle"
  />
  <div class="app-container">
    <div class="top-controls">
      <UnitToggler />
      <LanguageToggle />
    </div>
    <h1 class="site-title">⛅ SKALA-WEATHER</h1>
    <hr />

    <!-- Navigation Bar: 일반 a 태그 대신 RouterLink로 이동 -->
    <nav class="navigation-bar">
      <RouterLink to="/" class="nav-item">{{ t.navHome }}</RouterLink>
      <span class="divider">|</span>
      <RouterLink to="/national" class="nav-item">{{ t.navNational }}</RouterLink>
      <span class="divider">|</span>
      <RouterLink to="/activities" class="nav-item">{{ t.navActivities }}</RouterLink>
      <span class="divider">|</span>
      <RouterLink to="/about" class="nav-item">{{ t.navAbout }}</RouterLink>
    </nav>

    <!-- RouterView: 현재 URL에 매핑된 View 컴포넌트가 여기에 갈아 끼워진다 (SPA의 핵심) -->
    <RouterView />
  </div>
</template>

<style>
/* ⚠️ 외부 스타일 파일(예: 버튼 디자인 뭉치)을 이 방 안으로 쏙 가리켜 가져옵니다 */
@import '@/assets/exercise.css';

.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.global-weather-ticker {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  border-width: 0 0 1px;
  border-radius: 0;
}
.top-controls > * {
  display: inline-flex;
  align-items: center;
}
.app-container .site-title {
  justify-content: center;
  width: 100%;
  font-family: 'Avenir Next', 'Trebuchet MS', sans-serif;
  font-size: 1.95rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-align: center;
}
@media (max-width: 700px) {
  .app-container .site-title {
    font-size: 1.8rem;
  }
}
</style>
