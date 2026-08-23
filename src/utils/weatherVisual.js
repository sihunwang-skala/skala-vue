// OpenWeather의 안정적인 영문 main 값과 세부 상태 문구를 조합해 날씨 이모지를 고른다.
// Clouds는 구름 양에 따라 나누고, Clear는 예보 시각에 따라 낮/밤을 구분한다.
export function weatherEmoji(weather) {
  const main = weather.main ?? ''
  const status = (weather.status ?? '').toLowerCase()
  const hour = Number(weather.time?.slice(11, 13) ?? 12)
  const isDaytime = hour >= 6 && hour < 18

  if (main === 'Clear') return isDaytime ? '☀️' : '🌙'
  if (main === 'Thunderstorm') return '⛈️'
  if (main === 'Drizzle') return '🌦️'
  if (main === 'Rain') return status.includes('소나기') || status.includes('shower') ? '🌦️' : '🌧️'
  if (main === 'Snow') return '🌨️'
  if (['Mist', 'Smoke', 'Haze', 'Dust', 'Fog', 'Sand', 'Ash'].includes(main)) return '🌫️'
  if (main === 'Tornado' || main === 'Squall') return '🌪️'

  if (main === 'Clouds') {
    if (status.includes('구름조금') || status.includes('few')) return '🌤️'
    if (status.includes('흩어진') || status.includes('scattered')) return '⛅'
    if (status.includes('튼구름') || status.includes('broken')) return '🌥️'
    return '☁️'
  }

  return '🌡️'
}
