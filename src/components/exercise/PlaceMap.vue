<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useLanguageStore } from '@/stores/languageStore'
import { LABELS } from '@/i18n/labels'

// 지도 중심 좌표 + 검색 키워드를 Props로만 전달받는다. 여기서 직접 수정하지 않는다.
const props = defineProps({
  keyword: {
    type: String,
    required: true,
  },
  centerLat: {
    type: Number,
    required: true,
  },
  centerLng: {
    type: Number,
    required: true,
  },
})

const languageStore = useLanguageStore()
const t = computed(() => LABELS[languageStore.language])

const mapContainer = ref(null)
const places = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
let resizeObserver = null

onMounted(() => {
  // index.html에서 autoload=false로 받아둔 SDK를 여기서 실제로 초기화한다.
  if (!window.kakao || !window.kakao.maps) {
    errorMessage.value =
      'Kakao 지도 SDK를 불러오지 못했습니다. .env.local의 VITE_KAKAO_MAP_JS_KEY를 확인해주세요.'
    isLoading.value = false
    return
  }

  window.kakao.maps.load(() => {
    const center = new window.kakao.maps.LatLng(props.centerLat, props.centerLng)
    const map = new window.kakao.maps.Map(mapContainer.value, { center, level: 6 })
    resizeObserver = new ResizeObserver(() => map.relayout())
    resizeObserver.observe(mapContainer.value)
    // [본인 추가] 일반 지도보다 실제 주변 모습이 잘 보이는 위성 지도(라벨 포함)로 표시
    map.setMapTypeId(window.kakao.maps.MapTypeId.HYBRID)

    const placesService = new window.kakao.maps.services.Places()
    placesService.keywordSearch(
      props.keyword,
      (data, status) => {
        isLoading.value = false
        if (status !== window.kakao.maps.services.Status.OK) {
          errorMessage.value = t.value.placesNotFound
          return
        }
        // 가까운 순으로 5곳만 지도에 마커로 표시한다.
        places.value = data.slice(0, 5)
        places.value.forEach((place) => {
          const position = new window.kakao.maps.LatLng(place.y, place.x)
          new window.kakao.maps.Marker({ map, position })
        })
      },
      { location: center, radius: 3000 },
    )
  })
})

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <div class="place-map" tabindex="0">
    <div ref="mapContainer" class="map-box"></div>
    <p v-if="isLoading" class="status-text">{{ t.placesSearching }}</p>
    <p v-else-if="errorMessage" class="status-text">{{ errorMessage }}</p>
    <ul v-else class="place-list">
      <li v-for="place in places" :key="place.id">{{ place.place_name }}</li>
    </ul>
  </div>
</template>

<style scoped>
.map-box {
  width: 100%;
  height: 220px;
  border-radius: 6px;
  margin-top: 8px;
}
.status-text {
  font-size: 13px;
  color: #868e96;
  margin-top: 6px;
}
.place-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  font-size: 13px;
}
.place-list li {
  padding: 2px 0;
}
</style>
