import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { getCurrentWeather, normalizeCurrentWeather } from '@/api/weatherApi'

// 우리 앱이 계속 소유하는 도시 메타데이터 (라우팅/검색이 여기 의존함).
// OpenWeather는 여기 없는 날씨 값(temp/status/humidity 등)만 채워준다.
const CITY_META = [
  { id: 'city_01', name: '서울', nameEn: 'Seoul' },
  { id: 'city_02', name: '수원', nameEn: 'Suwon' },
  { id: 'city_03', name: '부산', nameEn: 'Busan' },
  { id: 'city_04', name: '광주', nameEn: 'Gwangju' },
  { id: 'city_05', name: '제주', nameEn: 'Jeju' },
]

export const useWeatherStore = defineStore('weather', () => {
  // state: 실제 OpenWeather 데이터로 채워지는 도시 날씨 목록 (초기값은 빈 배열)
  const weatherList = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // getter: cityId로 도시 하나를 찾아주는 함수를 리턴
  const getCityById = computed(() => (cityId) => weatherList.value.find((city) => city.id === cityId) ?? null)

  // [본인 추가] 즐겨찾기. 여러 화면(대시보드 카드, 상세 페이지 등)에서 같은 즐겨찾기 목록을
  // 봐야 해서 Pinia에 둔다. 새로고침하면 초기화되는 메모리 상태로 단순하게 유지한다.
  const favoriteCityIds = ref([])
  const isFavorite = computed(() => (cityId) => favoriteCityIds.value.includes(cityId))
  const favoriteCount = computed(() => favoriteCityIds.value.length)

  function toggleFavorite(cityId) {
    if (favoriteCityIds.value.includes(cityId)) {
      favoriteCityIds.value = favoriteCityIds.value.filter((id) => id !== cityId)
    } else {
      favoriteCityIds.value = [...favoriteCityIds.value, cityId]
    }
  }

  function clearFavorites() {
    favoriteCityIds.value = []
  }

  // action: OpenWeather에서 5개 도시의 현재 날씨를 전부 가져와 weatherList를 채운다.
  async function fetchWeatherList() {
    isLoading.value = true
    error.value = null
    try {
      const responses = await Promise.all(CITY_META.map((city) => getCurrentWeather(city.nameEn)))
      weatherList.value = responses.map((data, index) => normalizeCurrentWeather(CITY_META[index], data))
    } catch (err) {
      error.value = '날씨 데이터를 가져오지 못했습니다. API 키와 네트워크 상태를 확인해주세요.'
      // [UI Library] 화면 내 안내 문구와 별개로, 짧은 토스트로도 즉시 알려준다.
      ElMessage.error(error.value)
      console.error('[weatherStore] fetchWeatherList 실패:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    weatherList,
    isLoading,
    error,
    getCityById,
    fetchWeatherList,
    favoriteCityIds,
    isFavorite,
    favoriteCount,
    toggleFavorite,
    clearFavorites,
  }
})
