<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/languageStore'
import { LABELS } from '@/i18n/labels'
import { BAD_WEATHER, runningScore, activityFor } from '@/utils/activity'
import { scoreTone } from '@/utils/scoreColor'

// 선택된 도시의 날씨 데이터를 Props로만 전달받는다. 여기서 직접 수정하지 않는다.
const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },
  // 대기질(없을 수도 있어서 optional) — 야외활동 지수 계산에 사용
  aqi: {
    type: Object,
    default: null,
  },
})

const languageStore = useLanguageStore()
const t = computed(() => LABELS[languageStore.language])

// [과제 6] 실제 API 값(humidity/windSpeed)을 그대로 활용 — mock 때는 humidity만 있었지만
// 이제 바람이 심하면 스타일이 더 잘 흐트러진다고 보고 windSpeed도 감점에 반영한다.
const hairIndex = computed(() => {
  const { humidity, windSpeed } = props.weather
  let score = Math.max(0, 100 - humidity)
  if (windSpeed >= 8) score = Math.max(0, score - 15)
  const message =
    humidity >= 70 ? t.value.hairHigh : humidity >= 50 ? t.value.hairMid : t.value.hairLow
  return { title: t.value.hairTitle, score, message }
})

// [본인 추가] 러닝 지수 — WeatherActivityView와 같은 utils/activity.js 함수를 써서
// 두 화면의 점수가 서로 다르게 나오지 않도록 통일했다.
// 제목에 이미 🏃 아이콘이 있어서, activityFor()가 주는 문구 맨 앞 이모지는 중복이라 잘라낸다.
const sportsIndex = computed(() => ({
  title: t.value.sportsTitle,
  score: runningScore(props.weather, props.aqi),
  message: activityFor(props.weather, props.aqi)[languageStore.language].replace(/^\S+\s*/, ''),
}))

// 체감온도 + 강수 여부 기반 옷차림 추천 (점수 없이 문구만 제공)
const outfitTip = computed(() => {
  const { feelsLike, main } = props.weather
  let message =
    feelsLike >= 28 ? t.value.outfitHot : feelsLike >= 20 ? t.value.outfitMild : t.value.outfitCold
  if (BAD_WEATHER.includes(main)) message += t.value.outfitRainNote
  return { title: t.value.outfitTitle, score: null, message }
})

// [본인 추가] 야외활동 지수 — 러닝과 같은 점수(runningScore)를 쓰되, 러닝 전용 문구 대신
// 좋음/보통/나쁨 3단계의 범용적인 문구로 보여준다(계산식을 또 새로 안 만듦).
const outdoorIndex = computed(() => {
  const score = runningScore(props.weather, props.aqi)
  const message =
    score >= 80 ? t.value.outdoorGood : score >= 50 ? t.value.outdoorModerate : t.value.outdoorBad
  return { title: t.value.outdoorTitle, score, message }
})

// 화면엔 네 지수를 v-for로 한 번에 그려서 마크업 중복을 없앤다. (옷차림은 맨 아래로)
const indexList = computed(() => [
  sportsIndex.value,
  hairIndex.value,
  outdoorIndex.value,
  outfitTip.value,
])

// 숫자 점수가 있는 생활지수만 평균낸다. 옷차림은 추천 문구이므로 평균에서 제외한다.
const averageIndexScore = computed(() => {
  const scoredIndexes = indexList.value.filter((index) => index.score !== null)
  const total = scoredIndexes.reduce((sum, index) => sum + index.score, 0)
  return Math.round(total / scoredIndexes.length)
})
</script>

<template>
  <div class="index-card">
    <div class="index-heading">
      <h3>{{ t.indexPanelTitle }}</h3>
      <strong class="average-score" :class="`score-${scoreTone(averageIndexScore)}`">
        {{ t.overallIndexScore(averageIndexScore) }}
      </strong>
    </div>

    <div v-for="index in indexList" :key="index.title" class="index-row">
      <span class="index-title">{{ index.title }}</span>
      <span
        v-if="index.score !== null"
        class="index-score"
        :class="`score-${scoreTone(index.score)}`"
      >
        {{ t.scoreLabel(index.score) }}
      </span>
      <p class="index-message">{{ index.message }}</p>
    </div>

    <p class="disclaimer">{{ t.indexDisclaimer }}</p>
  </div>
</template>

<style scoped>
.index-card {
  box-sizing: border-box;
  height: 100%;
  background: #edf6ff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 0;
  border: 1px solid #a5d8ff;
}
.index-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.index-heading h3 {
  margin-right: 0;
}
.average-score {
  white-space: nowrap;
}
.index-row {
  padding: 8px 0;
  border-top: 1px solid #d0ebff;
}
.index-row:first-of-type {
  border-top: none;
}
.index-title {
  font-weight: bold;
}
.index-score {
  float: right;
  font-weight: bold;
}
.score-high {
  color: #2f9e44;
}
.score-medium {
  color: #f08c00;
}
.score-low {
  color: #e03131;
}
.index-message {
  margin: 4px 0 0;
  color: #495057;
  font-size: 14px;
}
.disclaimer {
  margin: 10px 0 0;
  font-size: 11px;
  color: #adb5bd;
}
</style>
