// 섭씨 원본 값을 configStore.unit에 맞춰 변환한다.
// WeatherCard/WeatherDetailView/WeatherParent(평균 기온) 3곳에서 같은 변환식이
// 반복되길래 함수 하나로만 분리했다 (범위 밖인 Composable까지는 안 감).
export function convertTemp(rawTemp, unit) {
  if (unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
}
