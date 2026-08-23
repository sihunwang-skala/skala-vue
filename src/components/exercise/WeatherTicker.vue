<script setup>
defineProps({
  cities: { type: Array, required: true },
  title: { type: String, required: true },
})
</script>

<template>
  <section class="weather-ticker" :aria-label="title">
    <strong class="ticker-title">{{ title }}</strong>
    <div class="ticker-window">
      <div class="ticker-track">
        <div v-for="copy in 8" :key="copy" class="ticker-group" :aria-hidden="copy > 1">
          <span v-for="city in cities" :key="city.id" :class="['ticker-city', city.tone]">
            <strong>{{ city.name }}</strong>
            <span>{{ city.temp }}{{ city.unitSymbol }}</span>
            <small>{{ city.status }}</small>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.weather-ticker {
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(44 62 80 / 6%);
}
.ticker-title {
  z-index: 1;
  align-self: stretch;
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  padding: 0 13px;
  border-right: 1px solid #e9ecef;
  background: #2c3e50;
  color: #fff;
  font-size: 11px;
  white-space: nowrap;
}
.ticker-window {
  min-width: 0;
  overflow: hidden;
  mask-image: linear-gradient(90deg, #000 0%, #000 96%, transparent 100%);
}
.ticker-track {
  display: flex;
  width: max-content;
  animation: ticker-flow 18s linear infinite;
}
.ticker-group {
  display: flex;
  align-items: center;
  flex: none;
  gap: 22px;
  padding: 9px 22px 9px 0;
}
.ticker-city {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  color: #f08c00;
  font-size: 12px;
  white-space: nowrap;
}
.ticker-city::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.ticker-city strong {
  color: #343a40;
}
.ticker-city > span {
  font-weight: 800;
}
.ticker-city small {
  color: #868e96;
  font-size: 10px;
}
.tone-hot {
  color: #fa5252;
}
.tone-mid {
  color: #f08c00;
}
.tone-cool {
  color: #339af0;
}
@keyframes ticker-flow {
  to {
    transform: translateX(-12.5%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ticker-track {
    animation: none;
  }
  .ticker-group:not(:first-child) {
    display: none;
  }
}
</style>
