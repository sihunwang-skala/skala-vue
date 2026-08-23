import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  // state: 단위를 저장하는 변수 (초기값은 'celsius')
  const unit = ref('celsius')

  // getter: 현재 단위 상태에 맞춰 화면에 뿌릴 기호(℃ / ℉)를 리턴
  const unitSymbol = computed(() => (unit.value === 'celsius' ? '℃' : '℉'))

  // action: 'celsius'와 'fahrenheit'를 토글하는 함수
  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return {
    unit,
    unitSymbol,
    toggleUnit,
  }
})
