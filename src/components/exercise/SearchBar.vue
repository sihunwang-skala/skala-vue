<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/languageStore'
import { LABELS } from '@/i18n/labels'

// 부모(WeatherParent)에게서 검색어를 Props로만 전달받는다. 여기서 직접 수정하지 않는다.
const props = defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['update-query'])

const languageStore = useLanguageStore()
const t = computed(() => LABELS[languageStore.language])
</script>

<template>
  <div class="search-inner">
    <!-- [UI Library] 기본 input 대신 el-input 사용. 부모→props로 값 표시, 입력은 emit만(단방향 유지) -->
    <el-input
      :model-value="props.currentQuery"
      @input="(val) => emit('update-query', val)"
      :placeholder="t.searchPlaceholder"
      clearable
      style="max-width: 320px"
    />
    <p class="search-hint">{{ t.searchHint }}</p>
  </div>
</template>

<style scoped>
.search-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #868e96;
}
</style>
