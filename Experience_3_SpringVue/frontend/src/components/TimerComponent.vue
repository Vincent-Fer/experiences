<template>
  <div class="timer-container">
    <div :class="['timer', timerClass]">
      <span class="timer-countdown">{{ formattedTime }}</span>
      <span class="timer-label">{{ timerLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  code: {
    type: String,
    required: true
  }
})

const countdown = ref('00:00')
const phase = ref('initial')
const timerClass = ref('timer-initial')
const error = ref(false)
let timerInterval = null

const timerLabel = computed(() => {
  switch (phase.value) {
    case 'initial': return 'Temps restant pour décision initiale'
    case 'ai': return 'Temps restant pour analyse IA'
    case 'final': return 'Temps restant pour décision finale'
    default: return 'Temps restant'
  }
})

const formattedTime = computed(() => {
  return countdown.value
})

const fetchTimerState = async () => {
  try {
    const response = await axios.get(`/api/timer/state/${props.code}`)
    countdown.value = response.data.countdown
    phase.value = response.data.phase
    timerClass.value = response.data.cssClass || 'timer-initial'
    error.value = response.data.error || false
  } catch (err) {
    error.value = true
    console.error('Failed to fetch timer state:', err)
  }
}

const startTimer = () => {
  // Clear any existing interval
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  
  // Update timer immediately
  fetchTimerState()
  
  // Set up interval to update timer every second
  timerInterval = setInterval(fetchTimerState, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.timer-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 30px;
  border-radius: 10px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.timer-countdown {
  font-size: 2rem;
  margin-bottom: 5px;
}

.timer-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.timer-initial {
  background-color: #007bff;
  color: white;
}

.timer-ai {
  background-color: #ffc107;
  color: #333;
}

.timer-final {
  background-color: #dc3545;
  color: white;
}

.timer-default {
  background-color: #6c757d;
  color: white;
}
</style>