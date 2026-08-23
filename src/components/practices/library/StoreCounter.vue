<script setup>
// Code Challenge: Counter Store 활용 실습.
// 정의한 카운터 스토어 플러그인을 가져와서 인스턴스를 가동한다.
import { useCounterStore } from '@/stores/counter.js'

const counterStore = useCounterStore()
</script>

<template>
  <div class="practice-section">
    <h2>Counter Store 활용 실습</h2>

    <p>
      원본 카운트 데이터(state): <strong>{{ counterStore.count }}</strong>
    </p>
    <p>
      2배 연산 데이터(getters): <span>{{ counterStore.doubleCount }}</span>
    </p>

    <button @click="counterStore.increment">숫자 1 증가 (actions)</button>
  </div>
</template>

<style scoped>
.practice-section {
  border-top: 1px dashed #dee2e6;
  margin-top: 20px;
  padding-top: 15px;
  font-size: 14px;
}
.practice-section h2 {
  font-size: 1rem;
  margin: 0 0 8px 0;
}
.practice-section button {
  padding: 6px 12px;
  cursor: pointer;
}
</style>
