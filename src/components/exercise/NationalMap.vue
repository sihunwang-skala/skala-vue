<script setup>
import { ref, onMounted, watch } from 'vue'

// [본인 추가] 전국 날씨 대시보드용 지도. PlaceMap과 달리 키워드 검색이 아니라,
// 이미 갖고 있는 5개 도시의 좌표+기온 라벨을 한 지도 위에 전부 찍어서 보여준다.
const props = defineProps({
  // [{ id, name, lat, lon, label }]
  cities: {
    type: Array,
    required: true,
  },
})

const mapContainer = ref(null)
const errorMessage = ref('')
let mapInstance = null
let overlays = []

function clearOverlays() {
  overlays.forEach((overlay) => overlay.setMap(null))
  overlays = []
}

// 도시별 마커 + 이름/기온 라벨(CustomOverlay)을 그리고, 전체가 다 보이게 지도 범위를 맞춘다.
function renderMarkers() {
  if (!mapInstance || props.cities.length === 0) return
  clearOverlays()

  const bounds = new window.kakao.maps.LatLngBounds()
  props.cities.forEach((city) => {
    const position = new window.kakao.maps.LatLng(city.lat, city.lon)
    bounds.extend(position)
    const marker = new window.kakao.maps.Marker({ map: mapInstance, position })
    overlays.push(marker)

    // 수도권의 서울·수원은 지리적으로 가까워 같은 위치에 라벨을 띄우면 겹친다.
    // 서울은 왼쪽 위, 수원은 오른쪽 아래에 두고 나머지는 마커 위 중앙에 둔다.
    const labelPosition =
      city.id === 'city_01'
        ? { xAnchor: 1.08, yAnchor: 2.35 }
        : city.id === 'city_02'
          ? { xAnchor: -0.08, yAnchor: 0.05 }
          : { xAnchor: 0.5, yAnchor: 2.2 }

    const overlay = new window.kakao.maps.CustomOverlay({
      map: mapInstance,
      position,
      ...labelPosition,
      content: `<div class="national-map-label">${city.label}</div>`,
    })
    overlays.push(overlay)
  })
  mapInstance.setBounds(bounds)
}

onMounted(() => {
  if (!window.kakao || !window.kakao.maps) {
    errorMessage.value =
      'Kakao 지도 SDK를 불러오지 못했습니다. .env.local의 VITE_KAKAO_MAP_JS_KEY를 확인해주세요.'
    return
  }

  window.kakao.maps.load(() => {
    // 대한민국 전체가 한눈에 들어오는 중심 좌표에서 시작하고, 마커를 찍은 뒤 bounds로 다시 맞춘다.
    const center = new window.kakao.maps.LatLng(36.2, 127.9)
    mapInstance = new window.kakao.maps.Map(mapContainer.value, { center, level: 13 })
    renderMarkers()
  })
})

// 언어/단위가 바뀌어 라벨 문구(city.label)가 달라지면 마커도 다시 그린다.
watch(() => props.cities, renderMarkers, { deep: true })
</script>

<template>
  <div class="national-map">
    <div ref="mapContainer" class="map-box"></div>
    <p v-if="errorMessage" class="status-text">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.map-box {
  width: 100%;
  height: 420px;
  border-radius: 8px;
}
.status-text {
  font-size: 13px;
  color: #868e96;
  margin-top: 6px;
}
:deep(.national-map-label) {
  background: #fff;
  border: 1px solid #2c3e50;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: bold;
  color: #2c3e50;
  white-space: nowrap;
}
</style>
