// 날씨(+대기질) 기반 활동 추천 로직을 모아둔 파일.
// WeatherIndexCard(생활지수 패널)와 WeatherActivityView(전체 도시 비교), WeatherParent(내 지역
// 요약)가 전부 "같은 기준으로" 점수를 계산하도록 여기 한 곳에서만 관리한다.
// (예전엔 WeatherIndexCard와 WeatherActivityView가 러닝 점수를 각자 다른 공식으로 계산해서
// 같은 도시인데 화면마다 다른 숫자가 나오는 문제가 있었음 — 이 파일로 통합해서 해결)

export const BAD_WEATHER = ['Rain', 'Drizzle', 'Thunderstorm', 'Snow']

// 우리 서비스가 자체적으로 정한 참고용 점수다. 기상학적으로 검증된 지표는 아니다.
export function runningScore(city, aqi) {
  let score = 100
  if (BAD_WEATHER.includes(city.main)) score -= 50
  if (city.feelsLike >= 30) score -= 20
  else if (city.feelsLike <= 5) score -= 15
  if (city.humidity >= 80) score -= 10
  if (city.windSpeed >= 8) score -= 10
  if (aqi && aqi.aqi >= 4) score -= 20
  return Math.max(0, Math.min(100, score))
}

export function activityFor(city, aqi) {
  if (BAD_WEATHER.includes(city.main)) {
    return {
      ko: '☔ 비나 눈이 내려 야외 활동은 주의가 필요해요.',
      en: '☔ Rain or snow makes outdoor activity less suitable.',
    }
  }
  if (aqi && aqi.aqi >= 4) {
    return {
      ko: '😷 미세먼지가 나쁨 수준이라 야외 활동에 주의가 필요해요.',
      en: '😷 Air quality is poor, so extra care is needed outdoors.',
    }
  }
  if (city.feelsLike >= 28) {
    return {
      ko: '🥵 체감 온도가 높아요.',
      en: '🥵 The feels-like temperature is high.',
    }
  }
  if (city.feelsLike <= 15) {
    return {
      ko: '🧥 체감 온도가 낮아 선선해요.',
      en: '🧥 The feels-like temperature is low and cool.',
    }
  }
  return {
    ko: '🌤️ 기온과 체감온도가 활동하기 적당해요.',
    en: '🌤️ The temperature and feels-like temperature are comfortable for activity.',
  }
}

// 카드에 여러 스포츠를 짧은 태그로 함께 보여준다.
export function sportsFor(city, aqi) {
  if (BAD_WEATHER.includes(city.main)) {
    return {
      ko: ['🏊 실내 수영', '🏸 배드민턴', '🎳 볼링'],
      en: ['🏊 Indoor swimming', '🏸 Badminton', '🎳 Bowling'],
    }
  }
  if (aqi && aqi.aqi >= 4) {
    return {
      ko: ['🏊 실내 수영', '🏋️ 헬스', '🎾 스쿼시'],
      en: ['🏊 Indoor swimming', '🏋️ Gym', '🎾 Squash'],
    }
  }
  if (city.feelsLike >= 28) {
    return {
      ko: ['🏊 수영', '🤽 아쿠아로빅', '🎾 저녁 테니스'],
      en: ['🏊 Swimming', '🤽 Aqua aerobics', '🎾 Evening tennis'],
    }
  }
  if (city.feelsLike <= 15) {
    return {
      ko: ['🥾 등산', '🎾 테니스', '🚶 빠른 걷기'],
      en: ['🥾 Hiking', '🎾 Tennis', '🚶 Brisk walking'],
    }
  }
  return {
    ko: ['🏃 러닝', '🚴 자전거', '🎾 테니스'],
    en: ['🏃 Running', '🚴 Cycling', '🎾 Tennis'],
  }
}

// 다음 24시간 예보 중 비/눈이 없고 기온이 무난한(15~27도) 첫 슬롯을 "제일 좋은 시간"으로 뽑는다.
export function findBestOutdoorSlot(entries) {
  if (!entries) return null
  return (
    entries.find(
      (entry) => !BAD_WEATHER.includes(entry.main) && entry.temp >= 15 && entry.temp <= 27,
    ) ?? null
  )
}

// 'YYYY-MM-DD HH:mm:ss' 문자열에서 시:분만 잘라 쓴다 (날짜 라이브러리 없이 간단히 처리)
export function slotTime(entry) {
  return entry.time.slice(11, 16)
}

// [본인 추가] 예보 슬롯(3시간 간격) 하나하나를 러닝 기준으로 짧게 판정한다.
// findBestOutdoorSlot과 같은 기준(비/눈 없음 + 15~27도)을 "좋음"으로 삼아서
// "좋은 시간대"를 하루 전체 흐름으로 펼쳐볼 수 있게 한다.
export function slotVerdict(entry) {
  if (BAD_WEATHER.includes(entry.main)) {
    return { ko: '☔ 실내 활동', en: '☔ Indoor', good: false }
  }
  if (entry.temp >= 15 && entry.temp <= 27) {
    return { ko: '🏃 러닝 추천', en: '🏃 Good for running', good: true }
  }
  if (entry.temp > 27) {
    return { ko: '🥵 더위 주의', en: '🥵 Too hot', good: false }
  }
  return { ko: '🧥 쌀쌀함', en: '🧥 Chilly', good: false }
}

// 추천 활동 유형에 맞춰 Kakao 장소 검색 키워드를 정한다.
export function placeKeywordFor(city, aqi = null) {
  if (BAD_WEATHER.includes(city.main)) return '실내 스포츠 시설'
  if (aqi && aqi.aqi >= 4) return '실내 스포츠 시설'
  if (city.feelsLike >= 28) return '수영장'
  if (city.feelsLike <= 15) return '등산로'
  return '테니스장'
}
