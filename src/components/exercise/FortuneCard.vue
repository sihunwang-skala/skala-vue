<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useLanguageStore } from '@/stores/languageStore'
import { LABELS } from '@/i18n/labels'
import { createDailyFortune, getLocalDateKey, millisecondsUntilNextDay } from '@/utils/fortune'
import { fortuneRateColor } from '@/utils/scoreColor'

const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },
})

const languageStore = useLanguageStore()
const t = computed(() => LABELS[languageStore.language])
const dateKey = ref(getLocalDateKey())
let midnightTimer = null

const fortune = computed(() => createDailyFortune(props.weather, t.value.fortune, dateKey.value))
const fortuneRows = computed(() => [
  { key: 'love', title: t.value.fortune.loveTitle, ...fortune.value.love },
  { key: 'money', title: t.value.fortune.moneyTitle, ...fortune.value.money },
  { key: 'health', title: t.value.fortune.healthTitle, ...fortune.value.health },
])

function scheduleMidnightRefresh() {
  midnightTimer = window.setTimeout(() => {
    dateKey.value = getLocalDateKey()
    scheduleMidnightRefresh()
  }, millisecondsUntilNextDay())
}

onMounted(scheduleMidnightRefresh)
onUnmounted(() => window.clearTimeout(midnightTimer))
</script>

<template>
  <el-card class="fortune-card" shadow="never">
    <template #header>
      <div class="fortune-header">
        <strong>{{ t.fortune.title }}</strong>
        <span>{{ t.fortune.dateLabel(fortune.dateKey) }}</span>
      </div>
    </template>

    <section class="total-fortune">
      <span class="section-label">{{ t.fortune.totalTitle }}</span>
      <p>{{ fortune.total }}</p>
    </section>

    <div class="fortune-list">
      <section v-for="row in fortuneRows" :key="row.key" class="fortune-row">
        <div class="fortune-row-heading">
          <strong>{{ row.title }}</strong>
          <el-rate
            :model-value="row.rating"
            disabled
            :colors="[
              fortuneRateColor(row.rating),
              fortuneRateColor(row.rating),
              fortuneRateColor(row.rating),
            ]"
            :aria-label="t.fortune.ratingLabel(row.title, row.rating)"
          />
        </div>
        <p>{{ row.message }}</p>
      </section>
    </div>

    <div class="lucky-item">
      <span>{{ t.fortune.luckyItemTitle }}</span>
      <strong>{{ fortune.luckyItem }}</strong>
    </div>
  </el-card>
</template>

<style scoped>
.fortune-card {
  margin-bottom: 15px;
  border-color: #f1e0c8;
  background: #fffaf4;
}
.fortune-header,
.fortune-row-heading,
.lucky-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.fortune-header span {
  color: #868e96;
  font-size: 12px;
}
.total-fortune {
  padding-bottom: 12px;
}
.section-label,
.lucky-item span {
  color: #e8590c;
  font-size: 13px;
  font-weight: 700;
}
.total-fortune p,
.fortune-row p {
  margin: 5px 0 0;
  color: #495057;
  font-size: 14px;
}
.fortune-row {
  padding: 10px 0;
  border-top: 1px solid #f1e0c8;
}
.fortune-row-heading :deep(.el-rate) {
  height: auto;
}
.lucky-item {
  margin-top: 4px;
  padding: 11px 12px;
  border-radius: 6px;
  background: #fff3e6;
}
</style>
