import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLanguageStore = defineStore('language', () => {
  const language = ref('ko') // 'ko' | 'en'

  function setLanguage(lang) {
    language.value = lang
  }

  return { language, setLanguage }
})
