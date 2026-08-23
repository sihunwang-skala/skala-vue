<script setup>
// Code Challenge: Axios JSON Example.
// JSONPlaceholder(연습용 공개 API)로 GET/POST/PUT/DELETE를 각각 실행해본다.
// 날씨 서비스와는 무관한 순수 학습용이라 axios를 직접 쓴다 (api/ 폴더로 분리하지 않음).
import { ref } from 'vue'
import axios from 'axios'

const BASE_URL = 'https://jsonplaceholder.typicode.com/posts'

const posts = ref([])
const newTitle = ref('')
const isLoading = ref(false)
const lastAction = ref('')

// GET: 게시글 목록 조회 (앞 5개만)
const fetchPosts = async () => {
  isLoading.value = true
  try {
    const response = await axios.get(BASE_URL, { params: { _limit: 5 } })
    posts.value = response.data
    lastAction.value = 'GET 조회 완료'
  } catch (error) {
    console.error('GET 실패:', error)
    lastAction.value = 'GET 실패'
  } finally {
    isLoading.value = false
  }
}

// POST: 새 게시글 생성 (JSONPlaceholder는 실제로 저장하지 않고 응답만 흉내낸다)
const createPost = async () => {
  if (!newTitle.value.trim()) return
  try {
    const response = await axios.post(BASE_URL, { title: newTitle.value, body: '', userId: 1 })
    posts.value = [response.data, ...posts.value]
    lastAction.value = `POST 생성 완료 (id: ${response.data.id})`
    newTitle.value = ''
  } catch (error) {
    console.error('POST 실패:', error)
    lastAction.value = 'POST 실패'
  }
}

// PUT: 첫 번째 게시글 제목 수정
const updateFirstPost = async () => {
  if (posts.value.length === 0) return
  const target = posts.value[0]
  try {
    const response = await axios.put(`${BASE_URL}/${target.id}`, { ...target, title: `${target.title} (수정됨)` })
    posts.value[0] = response.data
    lastAction.value = `PUT 수정 완료 (id: ${target.id})`
  } catch (error) {
    console.error('PUT 실패:', error)
    lastAction.value = 'PUT 실패'
  }
}

// DELETE: 첫 번째 게시글 삭제
const deleteFirstPost = async () => {
  if (posts.value.length === 0) return
  const target = posts.value[0]
  try {
    await axios.delete(`${BASE_URL}/${target.id}`)
    posts.value = posts.value.slice(1)
    lastAction.value = `DELETE 완료 (id: ${target.id})`
  } catch (error) {
    console.error('DELETE 실패:', error)
    lastAction.value = 'DELETE 실패'
  }
}
</script>

<template>
  <div class="practice-section">
    <h2>Axios JSON Example (JSONPlaceholder)</h2>
    <p class="hint">GET/POST/PUT/DELETE 연습용. 실제로 서버에 저장되지 않는 연습용 API입니다.</p>

    <div class="btn-row">
      <button @click="fetchPosts" :disabled="isLoading">GET 조회</button>
      <input v-model="newTitle" placeholder="새 게시글 제목" />
      <button @click="createPost">POST 생성</button>
      <button @click="updateFirstPost">PUT 수정</button>
      <button @click="deleteFirstPost">DELETE 삭제</button>
    </div>

    <p v-if="lastAction" class="last-action">{{ lastAction }}</p>

    <ul class="post-list">
      <li v-for="post in posts" :key="post.id">#{{ post.id }} {{ post.title }}</li>
    </ul>
  </div>
</template>

<style scoped>
.practice-section {
  border-top: 1px dashed #dee2e6;
  margin-top: 20px;
  padding-top: 15px;
  font-size: 14px;
}
.practice-section h2 {
  font-size: 1rem;
  margin: 0 0 4px 0;
}
.hint {
  color: #868e96;
  font-size: 12px;
  margin: 0 0 10px 0;
}
.btn-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.btn-row input {
  padding: 4px 8px;
}
.btn-row button {
  padding: 4px 10px;
  cursor: pointer;
}
.last-action {
  color: #2f9e44;
  font-size: 12px;
}
.post-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
}
.post-list li {
  padding: 4px 0;
  border-top: 1px solid #e9ecef;
  font-size: 13px;
}
.post-list li:first-child {
  border-top: none;
}
</style>
