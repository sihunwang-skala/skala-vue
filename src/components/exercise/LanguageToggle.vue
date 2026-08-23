<script setup>
import { useLanguageStore } from '@/stores/languageStore'

const languageStore = useLanguageStore()
</script>

<template>
  <div class="language-toggle">
    <!-- [UI Library] el-button 사용, 선택된 쪽만 type="primary"로 강조 -->
    <el-button size="small" :type="languageStore.language === 'ko' ? 'primary' : 'default'" @click="languageStore.setLanguage('ko')">
      한국어
    </el-button>
    <el-button size="small" :type="languageStore.language === 'en' ? 'primary' : 'default'" @click="languageStore.setLanguage('en')">
      English
    </el-button>
  </div>
</template>

<style scoped>
.language-toggle {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
