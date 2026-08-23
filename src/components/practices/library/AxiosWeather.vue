<script setup>
// Code Challenge: Axios Weather Example.
// 우리 weatherStore가 쓰는 것과 같은 api/weatherApi.js 함수를 그대로 재사용한다
// (같은 axios 호출 로직을 여기서 또 새로 짜지 않는다).
import { ref } from 'vue'
import { getCurrentWeather } from '@/api/weatherApi'

const weatherData = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const handleFetchWeather = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    // 비동기 통신 가동: 서버에서 데이터를 다 가져올 때까지 await로 기다린다.
    weatherData.value = await getCurrentWeather('Seoul')
  } catch (error) {
    console.error('통신 중 에러가 발생했습니다:', error)
    errorMessage.value = 'API 키가 없거나 잘못됐을 수 있어요. .env.local의 VITE_OPENWEATHER_API_KEY를 확인해주세요.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="practice-section">
    <h2>Axios Weather Example</h2>
    <button @click="handleFetchWeather" :disabled="isLoading">
      {{ isLoading ? '데이터 로딩 중...' : '서울 실시간 날씨 가져오기' }}
    </button>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div v-if="weatherData" class="result-card">
      <p>
        📍 위치: <strong>{{ weatherData.name }}</strong>
      </p>
      <p>
        🌡️ 현재 기온: <strong>{{ weatherData.main.temp }}°C</strong>
      </p>
      <p>
        ☁️ 날씨 상태: <strong>{{ weatherData.weather[0].description }}</strong>
      </p>
      <p>
        💧 습도: <strong>{{ weatherData.main.humidity }}%</strong>
      </p>
    </div>
  </div>
</template>

<style scoped>
.practice-section {
  border-top: 1px dashed #dee2e6;
  margin-top: 20px;
  padding-top: 15px;
  font-size: 14px;
}
.practice-section h2 {
  font-size: 1rem;
  margin: 0 0 8px 0;
}
.practice-section button {
  padding: 6px 12px;
  cursor: pointer;
}
.error {
  color: #e03131;
  font-size: 13px;
}
.result-card {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin-top: 10px;
  line-height: 1.8;
}
</style>
