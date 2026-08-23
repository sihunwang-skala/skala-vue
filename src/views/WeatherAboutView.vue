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
      <p class="about-intro">{{ t.aboutBody }}</p>

      <div class="feature-grid">
        <button
          v-for="feature in t.aboutFeatures"
          :key="feature.title"
          type="button"
          class="feature-card"
          @click="router.push({ name: feature.route })"
        >
          <span class="feature-icon" aria-hidden="true">{{ feature.icon }}</span>
          <div>
            <h4>{{ feature.title }}</h4>
            <p>{{ feature.summary }}</p>
            <span class="feature-link">{{ t.aboutOpenPage }} →</span>
          </div>
        </button>
      </div>

      <section class="technology-section">
        <h4>{{ t.aboutTechnologyTitle }}</h4>
        <div class="technology-list">
          <el-tag v-for="technology in t.aboutTechnologies" :key="technology" effect="plain">
            {{ technology }}
          </el-tag>
        </div>
      </section>

      <p class="about-note">{{ t.aboutNote }}</p>
    </div>

    <div class="page-links">
      <el-button type="primary" @click="router.push({ name: 'WeatherHome' })">
        {{ t.aboutHomeButton }}
      </el-button>
      <el-button @click="router.push({ name: 'WeatherNational' })">
        {{ t.aboutNationalButton }}
      </el-button>
      <el-button @click="router.push({ name: 'WeatherActivities' })">
        {{ t.aboutActivitiesButton }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 1000px;
  margin: 0 auto;
}
.description-box {
  background-color: #f8f9fa;
  padding: 22px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  line-height: 1.5;
  font-size: 14px;
}
.about-intro {
  margin: 0 0 18px;
  color: #495057;
  font-size: 15px;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.feature-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fff;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.feature-card:hover {
  border-color: #74b9ff;
  box-shadow: 0 5px 14px rgb(44 62 80 / 10%);
  transform: translateY(-2px);
}
.feature-icon {
  font-size: 24px;
  line-height: 1;
}
.feature-card h4 {
  margin: 0 0 6px;
  color: #2c3e50;
}
.feature-card p {
  margin: 0;
  color: #5c6770;
  font-size: 13px;
}
.feature-link {
  display: inline-block;
  margin-top: 8px;
  color: #228be6;
  font-size: 12px;
  font-weight: 700;
}
.technology-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #dee2e6;
}
.technology-section h4 {
  margin: 0 0 10px;
}
.technology-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.about-note {
  margin: 18px 0 0;
  padding: 10px 12px;
  border-radius: 6px;
  background: #fff3bf;
  color: #795000;
  font-size: 12px;
}
.page-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}
.page-links :deep(.el-button + .el-button) {
  margin-left: 0;
}
@media (max-width: 700px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
