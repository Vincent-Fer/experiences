<template>
  <div id="case">
    <table id="tab_data">
      <tr id="tr_th">
        <th class="th_vesData" id="th_sus">
          Liste Suspect
          <hr/>
        </th>
      </tr>
      <tr id="tr_vesData">
        <td class="vesData" id="tdSus">
          <p v-for="(suspect, index) in suspects" :key="index">{{ suspect }}</p>
          <hr/>
        </td>
      </tr>
    </table>
    <form @submit.prevent="submitListSuspect">
      <button type="submit" class="submit-btn" id="submitMiss">Passer à la mission</button>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';

export default {
  name: 'ListSuspectView',
  setup() {
    const router = useRouter();
    const gameStore = useGameStore();
    const suspects = ref([]);

    const loadSuspects = async () => {
      try {
        const response = await gameStore.getSuspectsList();
        if (response.success) {
          suspects.value = response.suspects || [];
        } else {
          alert('Erreur lors du chargement de la liste des suspects: ' + (response.message || 'Veuillez réessayer'));
          router.push('/choice');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors du chargement de la liste des suspects');
        router.push('/choice');
      }
    };

    const submitListSuspect = async () => {
      try {
        // Désactiver le bouton pendant la soumission
        const submitBtn = document.getElementById('submitMiss');
        if (submitBtn) submitBtn.disabled = true;

        const response = await gameStore.submitSuspectsList();
        if (response.success) {
          router.push('/game');
        } else {
          alert('Erreur lors de la soumission: ' + (response.message || 'Veuillez réessayer'));
          if (submitBtn) submitBtn.disabled = false;
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la soumission');
        const submitBtn = document.getElementById('submitMiss');
        if (submitBtn) submitBtn.disabled = false;
      }
    };

    onMounted(() => {
      loadSuspects();
    });

    return {
      suspects,
      submitListSuspect
    };
  }
};
</script>

<style scoped>
@import '../assets/style/listSuspect.css';
</style>