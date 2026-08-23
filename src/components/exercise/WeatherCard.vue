<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useLanguageStore } from '@/stores/languageStore'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { LABELS, translateStatus } from '@/i18n/labels'
import { convertTemp } from '@/utils/temperature'
import CityMiniMap from './CityMiniMap.vue'

// 선택된(표시할) 도시 객체를 Props로만 전달받는다. 여기서 직접 수정하지 않는다.
const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['select-card', 'click-detail'])

const languageStore = useLanguageStore()
const configStore = useConfigStore()
// languageStore/configStore처럼 즐겨찾기도 전역 상태라 weatherStore를 직접 사용한다(props로 안 내려받음).
const weatherStore = useWeatherStore()
const t = computed(() => LABELS[languageStore.language])
const displayName = computed(() =>
  languageStore.language === 'ko' ? props.cityItem.name : props.cityItem.nameEn,
)
const displayStatus = computed(() => translateStatus(props.cityItem.status, languageStore.language))
// 화면 표시용 기온만 단위 변환한다. 25도 기준 배지 판정(cityItem.temp)은 원본 섭씨 그대로 사용.
const displayTemp = computed(() => convertTemp(props.cityItem.temp, configStore.unit))

// [본인 추가] 즐겨찾기 토글 + 짧은 피드백. 검색처럼 매번 뜨는 게 아니라 사용자가 직접 누른
// 액션에 대한 결과 확인이라 ElMessage를 써도 "과도한 피드백"에 해당하지 않는다고 판단했다.
function toggleFavorite() {
  const wasFavorite = weatherStore.isFavorite(props.cityItem.id)
  weatherStore.toggleFavorite(props.cityItem.id)
  if (wasFavorite) {
    ElMessage.info(t.value.favoriteRemoved(displayName.value))
  } else {
    ElMessage.success(t.value.favoriteAdded(displayName.value))
  }
}
</script>

<template>
  <div class="weather-card" @click="emit('select-card', props.cityItem)">
    <div class="weather-content">
      <h4>{{ displayName }} ({{ displayStatus }})</h4>
      <p>현재 기온: {{ displayTemp }}{{ configStore.unitSymbol }}</p>

      <span v-if="cityItem.temp >= 25" class="badge hot">{{ t.hotBadge }}</span>
      <span v-else class="badge cool">{{ t.coolBadge }}</span>

      <div class="card-actions">
        <!-- [UI Library] el-button 사용 -->
        <el-button
          type="primary"
          class="detail-button"
          @click.stop="emit('click-detail', props.cityItem)"
        >
          {{ t.detailButton }}
        </el-button>
        <button
          type="button"
          class="favorite-btn"
          :aria-label="weatherStore.isFavorite(cityItem.id) ? t.favoriteRemove : t.favoriteAdd"
          @click.stop="toggleFavorite"
        >
          {{ weatherStore.isFavorite(cityItem.id) ? '⭐' : '☆' }}
        </button>
      </div>
    </div>

    <!-- [본인 추가] 각 카드에서 도시 위치를 바로 구분할 수 있는 Kakao 미니 지도 -->
    <CityMiniMap :city="cityItem" />
  </div>
</template>

<style scoped>
.weather-card {
  background: #fff;
  border: 1px solid #dee2e6;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 46%;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
.weather-card:hover {
  border-color: #74b9ff;
  box-shadow: 0 4px 14px rgb(44 62 80 / 10%);
}
.weather-content {
  padding: 14px 12px;
}
.weather-content h4 {
  margin: 0 0 16px;
}
.weather-content p {
  margin: 0 0 12px;
}
.badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  color: #fff;
}
.hot {
  background-color: #ff7675;
}
.cool {
  background-color: #74b9ff;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
}
.detail-button {
  flex: 1;
  min-height: 38px;
  font-weight: 700;
}
.favorite-btn {
  border: none;
  background: none;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 2px;
}
@media (max-width: 520px) {
  .weather-card {
    grid-template-columns: 1fr;
  }
}
</style>
