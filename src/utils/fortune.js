// 도시·날짜·날씨 상태가 같으면 언제 계산해도 같은 결과가 나오도록 만든다.
// 비결정적 난수 함수는 사용하지 않으며, 날짜가 바뀌면 시드도 바뀐다.

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// FNV-1a 방식으로 문자열을 32비트 정수 시드로 바꾼다.
function hashSeed(value) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

// 같은 시드에는 항상 같은 숫자 순서를 반환하는 작은 seeded PRNG.
function mulberry32(seed) {
  return function random() {
    let value = (seed += 0x6d2b79f5)
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function pick(list, random) {
  return list[Math.floor(random() * list.length)]
}

function rating(random) {
  return Math.floor(random() * 5) + 1
}

export function getFortuneTone(weather) {
  if (weather.main === 'Rain') return 'rain'
  if (weather.temp >= 30) return 'hot'
  if (weather.humidity >= 70) return 'humid'
  if (weather.main === 'Clear') return 'clear'
  return 'default'
}

export function createDailyFortune(weather, fortuneLabels, dateKey = getLocalDateKey()) {
  const seedSource = `${weather.id}|${dateKey}|${weather.main}`
  const random = mulberry32(hashSeed(seedSource))
  const tone = getFortuneTone(weather)
  const templates = fortuneLabels.tones[tone]

  return {
    dateKey,
    tone,
    total: pick(templates.total, random),
    love: { rating: rating(random), message: pick(templates.love, random) },
    money: { rating: rating(random), message: pick(templates.money, random) },
    health: { rating: rating(random), message: pick(templates.health, random) },
    luckyItem: pick(templates.items, random),
  }
}

export function millisecondsUntilNextDay(now = new Date()) {
  const nextDay = new Date(now)
  nextDay.setHours(24, 0, 0, 50)
  return nextDay.getTime() - now.getTime()
}
