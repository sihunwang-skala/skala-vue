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
  <div class="about-container">
    <h3>{{ t.aboutTitle }}</h3>
    <hr />

    <div class="description-box">
      <p>{{ t.aboutBody }}</p>
      <ul>
        <li>{{ t.aboutBullet1 }}</li>
        <li>{{ t.aboutBullet2 }}</li>
        <li>{{ t.aboutBullet3 }}</li>
      </ul>
    </div>

    <button class="home-btn" @click="router.push({ name: 'WeatherHome' })">{{ t.aboutHomeButton }}</button>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 600px;
  margin: 0 auto;
}
.description-box {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  line-height: 1.5;
  font-size: 14px;
}
ul {
  padding-left: 20px;
  margin: 8px 0 0 0;
}
li {
  margin-bottom: 6px;
  color: #555;
}
.home-btn {
  width: 100%;
  margin-top: 15px;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
</style>
