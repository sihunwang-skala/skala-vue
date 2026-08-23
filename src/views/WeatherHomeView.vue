<script setup>
// 페이지(View)는 실제 기능을 담고 있지 않다 — Router가 매핑하는 자리만 잡아주고,
// 진짜 대시보드 로직/상태는 components/exercise/WeatherParent.vue가 그대로 가지고 있다.
import WeatherParent from '@/components/exercise/WeatherParent.vue'
</script>

<template>
  <WeatherParent />
</template>
