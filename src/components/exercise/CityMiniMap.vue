<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  city: {
    type: Object,
    required: true,
  },
})

const mapContainer = ref(null)
const errorMessage = ref('')

onMounted(() => {
  if (!window.kakao || !window.kakao.maps) {
    errorMessage.value = '지도를 불러올 수 없습니다.'
    return
  }

  window.kakao.maps.load(() => {
    const position = new window.kakao.maps.LatLng(props.city.lat, props.city.lon)
    const map = new window.kakao.maps.Map(mapContainer.value, {
      center: position,
      // 시 중심만 확대하지 않고 해당 도시와 주변 지역까지 구분할 수 있게 표시한다.
      level: 9,
    })

    // 목록 안의 작은 지도는 위치 구분용이므로 스크롤·드래그 동작을 막는다.
    map.setDraggable(false)
    map.setZoomable(false)
    new window.kakao.maps.Marker({ map, position })

    new window.kakao.maps.CustomOverlay({
      map,
      position,
      yAnchor: 2.2,
      content: `<div class="city-mini-map-label">${props.city.name}</div>`,
    })
  })
})
</script>

<template>
  <div class="mini-map-wrapper" aria-hidden="true">
    <div ref="mapContainer" class="mini-map"></div>
    <span v-if="errorMessage" class="map-error">{{ errorMessage }}</span>
  </div>
</template>

<style scoped>
.mini-map-wrapper {
  position: relative;
  min-height: 145px;
  overflow: hidden;
  background: #eef2f6;
}
.mini-map {
  width: 100%;
  height: 100%;
  min-height: 145px;
  pointer-events: none;
}
.map-error {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #868e96;
  font-size: 12px;
}
:deep(.city-mini-map-label) {
  padding: 3px 7px;
  border: 1px solid #2c3e50;
  border-radius: 5px;
  background: rgb(255 255 255 / 92%);
  color: #2c3e50;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
</style>
