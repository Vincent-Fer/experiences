<template>
  <div class="page-container">
    <h1 class="page-title">Fin de session</h1>

    <div id="divFin" class="section">
      <div class="page-content">
        <p>Félicitations ! Vous avez terminé cette session.</p>
        <p>Vous pouvez maintenant retourner à la page de choix pour consulter votre feedback ou commencer une nouvelle session.</p>
      </div>
    </div>

    <span v-if="message" class="error-message">
      {{ message }}
    </span>

    <form @submit.prevent="goToChoice" class="form-container">
      <button class="page-button" type="submit">Revenir à la page choix</button>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';

export default {
  name: 'EndGameView',
  setup() {
    const router = useRouter();
    const gameStore = useGameStore();
    const message = ref('');
    const sessionId = ref(0);

    const goToChoice = () => {
      router.push('/choice');
    };

    const loadEndGameData = async () => {
      try {
        const response = await gameStore.getEndGameData();
        if (response.success) {
          sessionId.value = response.sessionId + 1;
          // Ici, vous pourriez afficher des statistiques ou des résultats
          // par exemple : score, nombre de décisions correctes, etc.
        } else {
          message.value = response.message || 'Erreur lors du chargement des données de fin de session';
        }
      } catch (error) {
        console.error('Erreur:', error);
        message.value = 'Une erreur est survenue lors du chargement des données';
      }
    };

    onMounted(() => {
      loadEndGameData();
    });

    return {
      message,
      goToChoice
    };
  }
};
</script>

<style scoped>
@import '../assets/style/global.css';

/* Style spécifique pour la page de fin de session */
#divFin {
  min-height: 200px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #f8f9fa;
}
</style>