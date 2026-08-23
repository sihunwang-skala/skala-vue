import axios from 'axios'

// OpenWeatherMap 현재 날씨 + 5일/3시간 예보 API 호출을 모아둔 파일.
// 여러 화면(weatherStore, WeatherDetailView, WeatherActivityView)에서 같은
// 호출/정규화 로직을 반복하지 않도록 여기서만 관리한다.

const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

// 도시 영문명으로 현재 날씨를 조회한다.
export async function getCurrentWeather(cityNameEn) {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: {
      q: cityNameEn,
      appid: API_KEY,
      units: 'metric',
      lang: 'kr',
    },
  })
  return response.data
}

// 도시 영문명으로 3시간 단위 예보(5일치, 총 40개 슬롯)를 조회한다.
export async function getForecast(cityNameEn) {
  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      q: cityNameEn,
      appid: API_KEY,
      units: 'metric',
      lang: 'kr',
    },
  })
  return response.data
}

// OpenWeather 응답을 우리 앱이 쓰기 좋은 형태로 정리한다.
// main: 'Rain'/'Clear'/'Clouds' 같은 영문 대분류 (비/눈 판정 등 로직용)
// status: 한국어 설명 (화면 표시용)
export function normalizeCurrentWeather(cityMeta, data) {
  return {
    id: cityMeta.id,
    name: cityMeta.name,
    nameEn: cityMeta.nameEn,
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    main: data.weather[0].main,
    status: data.weather[0].description,
    lat: data.coord.lat,
    lon: data.coord.lon,
  }
}

// 예보 응답의 한 슬롯(3시간 단위)을 정리한다.
export function normalizeForecastEntry(entry) {
  return {
    time: entry.dt_txt, // 'YYYY-MM-DD HH:mm:ss' (UTC 기준 문자열)
    temp: Math.round(entry.main.temp),
    feelsLike: Math.round(entry.main.feels_like),
    humidity: entry.main.humidity,
    windSpeed: entry.wind.speed,
    main: entry.weather[0].main,
    status: entry.weather[0].description,
    // pop: 강수 확률 (0~1)
    pop: entry.pop ?? 0,
  }
}

// [과제 7 확장] 좌표 기준 대기질(미세먼지) 조회 — OpenWeatherMap 추가 API.
export async function getAirPollution(lat, lon) {
  const response = await axios.get(`${BASE_URL}/air_pollution`, {
    params: { lat, lon, appid: API_KEY },
  })
  return response.data
}

// aqi: OpenWeather 자체 대기질 지수 1(좋음)~5(매우 나쁨). pm2_5/pm10은 실측 농도(µg/m³).
export function normalizeAirPollution(data) {
  const item = data.list[0]
  return {
    aqi: item.main.aqi,
    pm2_5: Math.round(item.components.pm2_5),
    pm10: Math.round(item.components.pm10),
  }
}

// aqi(1~5)를 el-tag 색상으로 매핑한다. WeatherDetailView/WeatherActivityView 둘 다 사용.
const AQI_TAG_TYPE = { 1: 'success', 2: 'success', 3: 'warning', 4: 'warning', 5: 'danger' }
export function aqiTagType(aqi) {
  return AQI_TAG_TYPE[aqi] ?? 'info'
}
