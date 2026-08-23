import { getLocalDateKey } from './fortune'

// 날씨별 후보를 데이터로 분리해 화면 컴포넌트에는 선택 로직만 전달한다.
const WEATHER_PLAYLISTS = {
  rain: [
    { title: '비도 오고 그래서', artist: '헤이즈' },
    { title: '우산', artist: '에픽하이' },
    { title: 'Rain', artist: '태연' },
    { title: '비', artist: '폴킴' },
  ],
  hot: [
    { title: 'Hot Summer', artist: 'f(x)' },
    { title: 'Power Up', artist: 'Red Velvet' },
    { title: 'Touch My Body', artist: '씨스타' },
    { title: '여름여름해', artist: '여자친구' },
  ],
  clear: [
    { title: 'Blueming', artist: '아이유' },
    { title: 'Weekend', artist: '태연' },
    { title: '한 페이지가 될 수 있게', artist: 'DAY6' },
    { title: '여행', artist: '볼빨간사춘기' },
  ],
  cloudy: [
    { title: 'Square (2017)', artist: '백예린' },
    { title: '구름', artist: '윤하' },
    { title: '밤편지', artist: '아이유' },
    { title: 'Instagram', artist: 'DEAN' },
  ],
  snow: [
    { title: '첫 눈', artist: 'EXO' },
    { title: 'Must Have Love', artist: 'SG워너비 & 브라운아이드걸스' },
    { title: '겨울아이', artist: '수지' },
    { title: 'Snowman', artist: 'Sia' },
  ],
  humid: [
    { title: '파도', artist: 'UN' },
    { title: '바다 보러 갈래?', artist: '효린' },
    { title: 'Dolphin', artist: '오마이걸' },
    { title: '바다의 왕자', artist: '박명수' },
  ],
  default: [
    { title: '좋은 날', artist: '아이유' },
    { title: 'Dynamite', artist: 'BTS' },
    { title: 'Hype Boy', artist: 'NewJeans' },
    { title: '사건의 지평선', artist: '윤하' },
  ],
}

function hashSeed(value) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function musicTone(weather) {
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(weather.main)) return 'rain'
  if (weather.main === 'Snow') return 'snow'
  if (weather.temp >= 30) return 'hot'
  if (weather.main === 'Clear') return 'clear'
  if (weather.main === 'Clouds') return 'cloudy'
  if (weather.humidity >= 70) return 'humid'
  return 'default'
}

// 도시·날짜·날씨가 같으면 같은 순서가 나오고 다음 날에는 자동으로 달라진다.
export function createDailyMusicRecommendations(weather, count = 3) {
  const dateKey = getLocalDateKey()
  const candidates = [...WEATHER_PLAYLISTS[musicTone(weather)]]
  let seed = hashSeed(`${weather.id}|${dateKey}|${weather.main}|music`)

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const target = seed % (index + 1)
    ;[candidates[index], candidates[target]] = [candidates[target], candidates[index]]
  }

  return candidates.slice(0, count)
}
