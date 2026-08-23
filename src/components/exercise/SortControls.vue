<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/languageStore'
import { LABELS } from '@/i18n/labels'

// 정렬 기준/방향을 Props로만 전달받는다. 여기서 직접 수정하지 않고 emit으로 부모에 요청만 한다.
defineProps({
  sortBy: {
    type: String,
    required: true,
  },
  sortOrder: {
    type: String,
    required: true,
  },
})
const emit = defineEmits(['toggle-by', 'toggle-order'])

const languageStore = useLanguageStore()
const t = computed(() => LABELS[languageStore.language])
</script>

<template>
  <div class="sort-controls">
    <span>{{ t.sortByLabel }}</span>
    <!-- [UI Library] el-button 사용 -->
    <el-button size="small" @click="emit('toggle-by')">
      {{ sortBy === 'name' ? t.sortByName : t.sortByTemp }}
    </el-button>
    <el-button size="small" @click="emit('toggle-order')">
      {{ sortOrder === 'asc' ? t.sortOrderAsc : t.sortOrderDesc }}
    </el-button>
  </div>
</template>

<style scoped>
.sort-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
</style>
