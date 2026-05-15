<template>
  <div class="page-container">
    <h1 class="page-title">Page des choix</h1>

    <div id="divSesExp" class="choice-container">
      <div class="choice-card">
        <h2>Commencer une nouvelle session</h2>
        <form @submit.prevent="startNewSession" class="choice-form">
          <button type="submit" class="page-button">C'est parti !</button>
        </form>
        <span v-if="messageSes" class="error-message">
          {{ messageSes }}
        </span>
        <span v-if="messageTps" class="time-message">
          Revenez dans : {{ messageTps }}
        </span>
      </div>

      <div class="choice-card">
        <h2>Voir les explications</h2>
        <form @submit.prevent="goToExplainations" class="choice-form">
          <button type="submit" class="page-button">Explications</button>
        </form>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Vérifier votre historique de feedback</h2>
      <div id="div_feedback" class="feedback-container">
      </div>
    </div>

    <button id="tutorialToggle" class="page-button tutorial-btn">Démarrer le tutoriel</button>
    <div id="tutorialTooltip" style="display: none;">
      <div id="tutorialContent"></div>
      <div id="tutorialControls">
        <button class="tutorial-control-btn" id="prevStep">←</button>
        <span id="stepCounter" class="step-counter"></span>
        <button class="tutorial-control-btn" id="nextStep">→</button>
        <button class="tutorial-control-btn" id="closeTutorial">✕</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useGameStore } from '../stores/game';

export default {
  name: 'ChoiceView',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const gameStore = useGameStore();
    const messageSes = ref('');
    const messageTps = ref('');

    const startNewSession = async () => {
      try {
        const response = await gameStore.startNewSession();
        if (response.success) {
          router.push('/game');
        } else {
          messageSes.value = response.message || 'Impossible de démarrer une nouvelle session';
          messageTps.value = response.timeRemaining || '';
        }
      } catch (error) {
        messageSes.value = 'Erreur lors du démarrage de la session';
      }
    };

    const goToExplainations = () => {
      router.push('/explainations');
    };

    onMounted(() => {
      // Load feedback history
      gameStore.loadFeedbackHistory();
    });

    return {
      messageSes,
      messageTps,
      startNewSession,
      goToExplainations
    };
  }
};
</script>

<style scoped>
@import '../assets/style/global.css';

/* Style spécifique pour la page de choix */
.choice-container {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 40px;
}

.choice-card {
  flex: 1;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.choice-card h2 {
  color: #004080;
  margin-bottom: 15px;
}

.choice-form {
  margin-bottom: 15px;
}

.error-message {
  color: #dc3545;
  display: block;
  margin-top: 10px;
}

.time-message {
  color: #6c757d;
  display: block;
  margin-top: 10px;
}

.feedback-container {
  min-height: 100px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #f8f9fa;
}

.tutorial-btn {
  margin-top: 20px;
}

#tutorialTooltip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 1px solid #004080;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
}

#tutorialControls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.tutorial-control-btn {
  background-color: #004080;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1rem;
}

.step-counter {
  color: #004080;
  font-weight: bold;
}
</style>