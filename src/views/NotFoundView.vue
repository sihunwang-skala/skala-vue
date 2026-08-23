<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/languageStore'
import { LABELS } from '@/i18n/labels'

const router = useRouter()
const languageStore = useLanguageStore()
const t = computed(() => LABELS[languageStore.language])
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-icon">☀️❓</div>
      <h2>{{ t.notFoundTitle }}</h2>
      <p>{{ t.notFoundBody }}</p>
      <button class="home-button" @click="router.push({ name: 'WeatherHome' })">{{ t.notFoundButton }}</button>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
.not-found-content {
  text-align: center;
  background-color: #ffffff;
  padding: 50px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}
.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}
h2 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 15px;
}
p {
  font-size: 1rem;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 30px;
}
.home-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 30px;
  cursor: pointer;
}
.home-button:hover {
  background-color: #0056b3;
}
</style>
