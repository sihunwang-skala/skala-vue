<script setup>
import { computed, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/languageStore'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { LABELS, translateStatus } from '@/i18n/labels'
import { convertTemp } from '@/utils/temperature'
import NationalMap from '@/components/exercise/NationalMap.vue'
import TemperatureChart from '@/components/exercise/TemperatureChart.vue'

// [본인 추가] 전국 날씨 대시보드. 새 지도 API 없이, 이미 연동해둔 Kakao Map과
// weatherStore(5개 도시 실시간 날씨)를 그대로 재사용해서 지도 하나에 다 모아 보여준다.
const languageStore = useLanguageStore()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const t = computed(() => LABELS[languageStore.language])

onMounted(() => {
  if (weatherStore.weatherList.length === 0) {
    weatherStore.fetchWeatherList()
  }
})

// 현재 언어/단위 설정에 맞춰 도시 이름과 기온을 화면 표시용으로 변환
const displayCities = computed(() =>
  weatherStore.weatherList.map((city) => ({
    id: city.id,
    name: languageStore.language === 'ko' ? city.name : city.nameEn,
    lat: city.lat,
    lon: city.lon,
    temp: convertTemp(city.temp, configStore.unit),
    humidity: city.humidity,
    status: translateStatus(city.status, languageStore.language),
  })),
)

// NationalMap에 넘길 때는 지도 라벨 문구(이름+기온)까지 미리 합쳐서 전달한다.
const mapMarkers = computed(() =>
  displayCities.value.map((city) => ({
    ...city,
    label: `${city.name} ${city.temp}${configStore.unitSymbol}`,
  })),
)
</script>

<template>
  <div class="national-container">
    <h3>{{ t.nationalTitle }}</h3>
    <p class="subtitle">{{ t.nationalSubtitle }}</p>
    <hr />

    <p v-if="weatherStore.isLoading">{{ t.loadingWeather }}</p>
    <div v-else-if="weatherStore.error">
      <p>{{ weatherStore.error }}</p>
      <el-button size="small" type="primary" @click="weatherStore.fetchWeatherList">{{
        t.retryButton
      }}</el-button>
    </div>
    <template v-else>
      <NationalMap :cities="mapMarkers" />
      <h4 class="chart-title">{{ t.nationalChartTitle }}</h4>
      <TemperatureChart :cities="displayCities" :unit-symbol="configStore.unitSymbol" />
    </template>
  </div>
</template>

<style scoped>
.national-container {
  max-width: 700px;
  margin: 0 auto;
}
.subtitle {
  color: #868e96;
  font-size: 14px;
  margin-top: -4px;
}
.chart-title {
  margin-top: 20px;
}
</style>
