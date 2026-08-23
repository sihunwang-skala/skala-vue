// 100점 지수와 5점 별점에서 같은 의미의 색을 사용한다.
export function scoreTone(score) {
  if (score >= 80) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

// Element Plus 태그의 type도 100점 지수와 같은 구간을 사용한다.
export function scoreTagType(score) {
  const tone = scoreTone(score)
  if (tone === 'high') return 'success'
  if (tone === 'medium') return 'warning'
  return 'danger'
}

// 운세 별점은 1~5점이 각각 구분되도록 단계별 색을 사용한다.
export function fortuneRateColor(rating) {
  const colors = ['#e03131', '#f03e3e', '#f08c00', '#82c91e', '#2f9e44']
  return colors[Math.min(5, Math.max(1, rating)) - 1]
}
