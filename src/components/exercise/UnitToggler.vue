<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useLanguageStore } from '@/stores/languageStore'
import { LABELS } from '@/i18n/labels'

const configStore = useConfigStore()
const languageStore = useLanguageStore()
const t = computed(() => LABELS[languageStore.language])
const unitName = computed(() => (configStore.unit === 'celsius' ? t.value.celsiusName : t.value.fahrenheitName))
</script>

<template>
  <div class="unit-toggler">
    <span
      >{{ t.unitLabel }} <strong>{{ unitName }}</strong></span
    >
    <!-- [UI Library] el-button 사용 -->
    <el-button size="small" type="primary" @click="configStore.toggleUnit">{{ t.toggleUnitButton }}</el-button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
