<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useLanguageStore } from '@/stores/languageStore'
import { LABELS } from '@/i18n/labels'

// [본인 추가] 도시별 기온을 막대 그래프로 비교. 별도 차트 라이브러리 없이
// 순수 CSS(막대 높이 %)만으로 표현한다.
const props = defineProps({
  // [{ id, name, temp }]
  cities: {
    type: Array,
    required: true,
  },
  unitSymbol: {
    type: String,
    required: true,
  },
})

const languageStore = useLanguageStore()
const t = computed(() => LABELS[languageStore.language])
const panelRef = ref(null)
const isChartVisible = ref(false)
let chartObserver = null

watch(panelRef, (element) => {
  if (!element || isChartVisible.value) return
  if (!('IntersectionObserver' in window)) {
    isChartVisible.value = true
    return
  }

  chartObserver?.disconnect()
  chartObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      isChartVisible.value = true
      chartObserver.disconnect()
    },
    { threshold: 0.25 },
  )
  chartObserver.observe(element)
})

onBeforeUnmount(() => chartObserver?.disconnect())

// 막대 높이는 절대 온도 스케일이 아니라, 지금 보이는 도시들 "안에서" 상대적으로 높낮이를
// 비교하기 위한 값이다. 그래서 최소/최대도 이 목록 안에서만 계산한다.
const maxTemp = computed(() => Math.max(...props.cities.map((city) => city.temp)))
const minTemp = computed(() => Math.min(...props.cities.map((city) => city.temp)))
const averageTemp = computed(() => {
  if (props.cities.length === 0) return 0
  const total = props.cities.reduce((sum, city) => sum + city.temp, 0)
  return Math.round((total / props.cities.length) * 10) / 10
})
const hottestCity = computed(() =>
  props.cities.reduce((hottest, city) => (city.temp > hottest.temp ? city : hottest)),
)
const coolestCity = computed(() =>
  props.cities.reduce((coolest, city) => (city.temp < coolest.temp ? city : coolest)),
)

function barHeight(temp) {
  const range = maxTemp.value - minTemp.value
  if (range === 0) return 60 // 도시들 기온이 전부 같으면 절반 높이로 통일
  return 20 + ((temp - minTemp.value) / range) * 80 // 20~100% 사이에서 표시
}

function barTone(temp) {
  if (temp === maxTemp.value) return 'bar-hot'
  if (temp === minTemp.value) return 'bar-cool'
  return 'bar-mid'
}
</script>

<template>
  <div
    v-if="cities.length"
    ref="panelRef"
    class="temperature-panel"
    :class="{ 'is-visible': isChartVisible }"
  >
    <div class="temperature-summary">
      <div class="summary-card summary-average">
        <span>{{ t.nationalAverageLabel }}</span>
        <strong>{{ averageTemp }}{{ unitSymbol }}</strong>
      </div>
      <div class="summary-card summary-hot">
        <span>{{ t.nationalHighestLabel }}</span>
        <strong>{{ hottestCity.name }} {{ hottestCity.temp }}{{ unitSymbol }}</strong>
      </div>
      <div class="summary-card summary-cool">
        <span>{{ t.nationalLowestLabel }}</span>
        <strong>{{ coolestCity.name }} {{ coolestCity.temp }}{{ unitSymbol }}</strong>
      </div>
    </div>

    <div class="temp-chart">
      <div v-for="(city, index) in cities" :key="city.id" class="chart-bar-wrap">
        <span class="chart-value">{{ city.temp }}{{ unitSymbol }}</span>
        <div
          class="chart-bar"
          :class="barTone(city.temp)"
          :style="{
            height: barHeight(city.temp) + '%',
            '--bar-delay': `${index * 220}ms`,
          }"
        ></div>
        <strong class="chart-label">{{ city.name }}</strong>
        <span class="chart-status">{{ city.status }}</span>
        <span class="chart-humidity">{{ t.humidityLabel(city.humidity) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.temperature-panel {
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  background: #f8f9fa;
}
.temperature-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}
.summary-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
}
.summary-card strong {
  font-size: 16px;
}
.summary-average {
  background: #fff3bf;
  color: #e67700;
}
.summary-hot {
  background: #ffe3e3;
  color: #c92a2a;
}
.summary-cool {
  background: #dbe4ff;
  color: #1864ab;
}
.temp-chart {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  height: 220px;
  padding: 10px 0;
}
.chart-bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}
.chart-value {
  font-size: 12px;
  font-weight: bold;
  color: #e8590c;
  margin-bottom: 4px;
}
.chart-bar {
  width: 28px;
  border-radius: 4px 4px 0 0;
  opacity: 0;
  transform: scaleY(0);
  transform-origin: center bottom;
}
.temperature-panel.is-visible .chart-bar {
  animation: bar-rise 2.4s cubic-bezier(0.22, 1, 0.36, 1) var(--bar-delay) both;
}
@keyframes bar-rise {
  from {
    opacity: 0;
    transform: scaleY(0);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}
.bar-hot {
  background: linear-gradient(180deg, #fa5252, #ffc9c9);
}
.bar-mid {
  background: linear-gradient(180deg, #ff922b, #ffe8cc);
}
.bar-cool {
  background: linear-gradient(180deg, #339af0, #d0ebff);
}
.chart-label {
  font-size: 12px;
  color: #495057;
  margin-top: 6px;
}
.chart-status,
.chart-humidity {
  margin-top: 3px;
  color: #868e96;
  font-size: 10px;
  text-align: center;
}
.chart-humidity {
  color: #1971c2;
}
@media (prefers-reduced-motion: reduce) {
  .chart-bar {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
@media (max-width: 560px) {
  .temperature-summary {
    grid-template-columns: 1fr;
  }
  .temp-chart {
    gap: 6px;
  }
}
</style>
