import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'WeatherHome',
    // Lazy Loading: 방문할 때만 해당 View의 코드를 내려받는다
    component: () => import('../views/WeatherHomeView.vue'),
  },
  {
    // Dynamic Route: /weather/city_01, /weather/city_02 ... 하나의 View가 전부 처리
    path: '/weather/:cityId',
    name: 'WeatherDetail',
    component: () => import('../views/WeatherDetailView.vue'),
  },
  {
    // [본인 추가] 전국 날씨 대시보드 — 5개 도시를 지도 하나 + 기온 비교 그래프로 함께 보여준다.
    path: '/national',
    name: 'WeatherNational',
    component: () => import('../views/WeatherNationalView.vue'),
  },
  {
    path: '/activities',
    name: 'WeatherActivities',
    component: () => import('../views/WeatherActivityView.vue'),
  },
  {
    path: '/about',
    name: 'WeatherAbout',
    component: () => import('../views/WeatherAboutView.vue'),
  },
  {
    // Catch-all Route: 정의되지 않은 모든 경로. 반드시 배열 마지막에 위치해야 한다.
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
