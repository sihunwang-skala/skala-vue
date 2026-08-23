<script setup>
import { useLanguageStore } from '@/stores/languageStore'

const languageStore = useLanguageStore()
</script>

<template>
  <div class="language-toggle">
    <!-- [UI Library] el-button 사용, 선택된 쪽만 type="primary"로 강조 -->
    <el-button
      size="small"
      :type="languageStore.language === 'ko' ? 'primary' : 'default'"
      @click="languageStore.setLanguage('ko')"
    >
      한국어
    </el-button>
    <el-button
      size="small"
      :type="languageStore.language === 'en' ? 'primary' : 'default'"
      @click="languageStore.setLanguage('en')"
    >
      English
    </el-button>
  </div>
</template>

<style scoped>
.language-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-height: 24px;
  font-size: 12px;
}
.language-toggle :deep(.el-button) {
  width: 68px;
  height: 24px;
  padding: 5px 8px;
  font-size: 12px;
}
.language-toggle :deep(.el-button + .el-button) {
  margin-left: 0;
}
</style>
